import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SocialPlatform, HireRequestStatus, MediaType } from '@prisma/client';
import { TalentProfileStatus } from '@mdms/types';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateHireRequestDto } from './dto/create-hire-request.dto';

@Injectable()
export class TalentService {
  private readonly logger = new Logger(TalentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService
  ) {}

  async findAllPublic(query: { search?: string; type?: string; location?: string }) {
    return this.prisma.talentProfile.findMany({
      where: {
        status: { in: [TalentProfileStatus.ACTIVE, TalentProfileStatus.PENDING_REVIEW] },
        ...(query.search && {
          OR: [
            { bio: { contains: query.search, mode: 'insensitive' } },
            { stageName: { contains: query.search, mode: 'insensitive' } },
            { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
            { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
          ],
        }),
        ...(query.location && {
          user: { city: { contains: query.location, mode: 'insensitive' } },
        }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            city: true,
            state: true,
          },
        },
        userTalents: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePublic(idOrSlug: string) {
    const profile = await this.prisma.talentProfile.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        userTalents: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        userLanguages: {
          include: {
            language: true,
          },
        },
        userSkills: {
          include: {
            skill: true,
          },
        },
        portfolioMedia: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Talent profile not found');
    }

    return profile;
  }

  private async ensureUserExists(userId: string) {
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId.toLowerCase().replace(/[^a-z0-9]/g, '') || 'talent'}@mdms.com`,
        firstName: 'Talent',
        lastName: 'User',
        role: 'TALENT',
        phone: null,
        isActive: true,
      },
    });
  }

  async saveDraft(userId: string, data: any) {
    await this.ensureUserExists(userId);
    const { currentStep, wizardData } = data;
    
    // UPSERT a draft profile for the user
    return this.prisma.talentProfile.upsert({
      where: { userId },
      update: {
        onboardingStep: currentStep,
        draftData: wizardData,
      },
      create: {
        userId,
        slug: `draft-${userId}-${Date.now()}`,
        status: TalentProfileStatus.DRAFT,
        onboardingStep: currentStep,
        draftData: wizardData,
      },
    });
  }

  async submitProfile(userId: string, data: any, options: { markForReview?: boolean } = {}) {
    await this.ensureUserExists(userId);
    const { 
      primaryTalentId, secondaryTalentIds, attributes,
      bio, stageName, experienceLevel,
      profilePhotoPreview, coverBannerPreview, introductionVideoPreview,
      resumeName, compCardName, resumeUrl, compCardUrl, galleryImages,
      achievements, education, brandsWorkedWith,
      languages, skills,
      pricingType, pricingAmount,
      isAvailableForTravel, isAvailableForRemote, isAvailableImmediate,
      instagram, youtube, linkedin, portfolio, facebook, imdb, website, behance, pinterest, spotify, tiktok,
      ...rest 
    } = data;

    // Onboarding submission (markForReview !== false) sends the profile for
    // admin review. A plain edit of an existing profile preserves the current
    // status so an already-approved talent is not hidden from the public site
    // on every save.
    const markForReview = options.markForReview !== false;
    let updateStatus = TalentProfileStatus.PENDING_REVIEW;
    if (!markForReview) {
      const existing = await this.prisma.talentProfile.findUnique({
        where: { userId },
        select: { status: true },
      });
      updateStatus = (existing?.status as TalentProfileStatus) ?? TalentProfileStatus.PENDING_REVIEW;
    }

    // 1. Upsert profile with all the structured data
    const profile = await this.prisma.talentProfile.upsert({
      where: { userId },
      update: {
        bio,
        stageName,
        experienceLevel,
        status: updateStatus,
        onboardingStep: 7,
        onboardingCompleted: true,
        coverBannerUrl: coverBannerPreview,
        introductionVideoUrl: introductionVideoPreview,
        resumeUrl: resumeUrl || (resumeName ? `documents/${resumeName}` : null),
        compCardUrl: compCardUrl || (compCardName ? `documents/${compCardName}` : null),
        achievements: achievements ? (achievements as any) : Prisma.DbNull,
        education: education ? (education as any) : Prisma.DbNull,
        brandsWorkedWith,
        draftData: Prisma.DbNull, // clear draft data
      },
      create: {
        userId,
        slug: stageName ? stageName.toLowerCase().replace(/\s+/g, '-') : `talent-${Date.now()}`,
        bio,
        stageName,
        experienceLevel,
        status: TalentProfileStatus.PENDING_REVIEW,
        onboardingStep: 7,
        onboardingCompleted: true,
        coverBannerUrl: coverBannerPreview,
        introductionVideoUrl: introductionVideoPreview,
        resumeUrl: resumeUrl || (resumeName ? `documents/${resumeName}` : null),
        compCardUrl: compCardUrl || (compCardName ? `documents/${compCardName}` : null),
        achievements: achievements ? (achievements as any) : Prisma.DbNull,
        education: education ? (education as any) : Prisma.DbNull,
        brandsWorkedWith,
      },
    });

    // 2. Set categories (primary + secondary)
    await this.prisma.userTalent.deleteMany({
      where: { talentProfileId: profile.id }
    });

    const categoryInserts = [];
    if (primaryTalentId) {
      categoryInserts.push({
        talentProfileId: profile.id,
        categoryId: primaryTalentId,
        isPrimary: true,
        attributes: attributes || {},
      });
    }
    
    if (secondaryTalentIds && Array.isArray(secondaryTalentIds)) {
      secondaryTalentIds.forEach(id => {
        categoryInserts.push({
          talentProfileId: profile.id,
          categoryId: id,
          isPrimary: false,
          attributes: {},
        });
      });
    }

    if (categoryInserts.length > 0) {
      await this.prisma.userTalent.createMany({ data: categoryInserts });
    }

    // Persist the uploaded profile photo (permanent URL) onto the user record so
    // it survives a reload and shows across the app.
    if (profilePhotoPreview && typeof profilePhotoPreview === 'string' && !profilePhotoPreview.startsWith('blob:')) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: profilePhotoPreview },
      });
    }

    // Persist the portfolio gallery images. Replace the existing set so removals
    // in the editor are honoured. Only accept permanent URLs (never blob:).
    if (Array.isArray(galleryImages)) {
      const media = galleryImages
        .filter((g: any) => g?.url && typeof g.url === 'string' && !g.url.startsWith('blob:'))
        .map((g: any, index: number) => ({
          talentProfileId: profile.id,
          type: MediaType.PORTFOLIO_IMAGE,
          url: g.url as string,
          order: index,
        }));
      await this.prisma.portfolioMedia.deleteMany({
        where: { talentProfileId: profile.id, type: MediaType.PORTFOLIO_IMAGE },
      });
      if (media.length > 0) {
        await this.prisma.portfolioMedia.createMany({ data: media });
      }
    }

    // 3. Set Social Links
    await this.prisma.socialLink.deleteMany({
      where: { talentProfileId: profile.id }
    });
    
    const socialLinks = [];
    if (instagram) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.INSTAGRAM, url: instagram });
    if (youtube) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.YOUTUBE, url: youtube });
    if (linkedin) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.LINKEDIN, url: linkedin });
    if (facebook) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.FACEBOOK, url: facebook });
    if (imdb) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.IMDB, url: imdb });
    if (website || portfolio) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.WEBSITE, url: website || portfolio });
    if (behance) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.BEHANCE, url: behance });
    if (pinterest) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.PINTEREST, url: pinterest });
    if (spotify) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.SPOTIFY, url: spotify });
    if (tiktok) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.TIKTOK, url: tiktok });
    
    if (socialLinks.length > 0) {
      await this.prisma.socialLink.createMany({ data: socialLinks });
    }

    // 4. Languages — resolve/create by name, then link (replace existing set).
    if (Array.isArray(languages)) {
      await this.prisma.userLanguage.deleteMany({ where: { talentProfileId: profile.id } });
      for (const raw of languages) {
        const name = typeof raw === 'string' ? raw.trim() : '';
        if (!name) continue;
        const language = await this.prisma.language.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        await this.prisma.userLanguage
          .create({ data: { talentProfileId: profile.id, languageId: language.id } })
          .catch(() => null); // ignore duplicate links
      }
    }

    // 5. Skills — resolve/create by name, then link (replace existing set).
    if (Array.isArray(skills)) {
      await this.prisma.userSkill.deleteMany({ where: { talentProfileId: profile.id } });
      for (const raw of skills) {
        const name = typeof raw === 'string' ? raw.trim() : '';
        if (!name) continue;
        const skill = await this.prisma.skill.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        await this.prisma.userSkill
          .create({ data: { talentProfileId: profile.id, skillId: skill.id } })
          .catch(() => null);
      }
    }

    // 6. Pricing (stored in paise; rupees × 100).
    if (pricingType || pricingAmount) {
      const parsed = pricingAmount ? Math.round(parseFloat(String(pricingAmount)) * 100) : null;
      const amount = parsed !== null && !Number.isNaN(parsed) ? parsed : null;
      await this.prisma.talentPricing.upsert({
        where: { talentProfileId: profile.id },
        update: {
          perDay: pricingType === 'per-day' ? amount : null,
          perHour: pricingType === 'per-hour' ? amount : null,
        },
        create: {
          talentProfileId: profile.id,
          perDay: pricingType === 'per-day' ? amount : null,
          perHour: pricingType === 'per-hour' ? amount : null,
        },
      });
    }

    // 7. Availability flags (mapping mirrors the edit form's read mapping).
    if (
      isAvailableForTravel !== undefined ||
      isAvailableForRemote !== undefined ||
      isAvailableImmediate !== undefined
    ) {
      const availabilityData = {
        travelReady: !!isAvailableForTravel,
        availablePartTime: !!isAvailableForRemote,
        availableFullTime: !!isAvailableImmediate,
      };
      await this.prisma.talentAvailability.upsert({
        where: { talentProfileId: profile.id },
        update: availabilityData,
        create: { talentProfileId: profile.id, ...availabilityData },
      });
    }

    return profile;
  }

  async getPendingProfiles() {
    return this.prisma.talentProfile.findMany({
      where: { status: TalentProfileStatus.PENDING_REVIEW },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async moderateProfile(id: string, status: TalentProfileStatus, reviewNote?: string) {
    const profile = await this.prisma.talentProfile.update({
      where: { id },
      data: { status, reviewNote, approvedAt: status === TalentProfileStatus.ACTIVE ? new Date() : null },
      include: { user: true },
    });

    if (profile.user.phone) {
      if (status === TalentProfileStatus.ACTIVE) {
        this.whatsappService.sendMessage(
          profile.user.phone,
          `Congratulations ${profile.user.firstName}! Your MP Production talent profile has been approved and is now live.`
        );
      } else if (status === TalentProfileStatus.DEACTIVATED || status === TalentProfileStatus.SUSPENDED) {
        this.whatsappService.sendMessage(
          profile.user.phone,
          `MP Production: Your talent profile application update. Note: ${reviewNote || 'Please contact support.'}`
        );
      }
    }

    return profile;
  }

  async getMe(userId: string) {
    if (!userId) {
      throw new NotFoundException('Talent profile not found');
    }
    try {
      const profile = await this.prisma.talentProfile.findUnique({
        where: { userId },
        include: {
          user: true,
          userTalents: {
            include: {
              category: true,
            },
          },
          userLanguages: { include: { language: true } },
          userSkills: { include: { skill: true } },
          socialLinks: true,
          portfolioMedia: true,
          pricing: true,
          availability: true,
          hireRequests: true,
          castingApplications: { include: { castingCall: true } },
        },
      });
      if (!profile) throw new NotFoundException('Talent profile not found');
      return profile;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      console.error('Error in TalentService.getMe:', err);
      throw new NotFoundException('Talent profile not found');
    }
  }

  async updateMe(userId: string, data: any) {
    // A profile edit must not silently send an approved talent back to review.
    return this.submitProfile(userId, data, { markForReview: false });
  }

  async getFeatured() {
    return this.prisma.talentProfile.findMany({
      where: { status: TalentProfileStatus.ACTIVE },
      take: 12,
      orderBy: { profileViews: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  // async addPortfolioPhotos(userId: string, urls: string[]) {
  //   const profile = await this.prisma.talentProfile.findUnique({ where: { userId } });
  //   if (!profile) throw new NotFoundException('Talent profile not found');
  //   
  //   return this.prisma.talentProfile.update({
  //     where: { userId },
  //     data: {
  //       portfolioPhotos: {
  //         push: urls
  //       }
  //     }
  //   });
  // }

  // async removePortfolioPhoto(userId: string, urlToRemove: string) {
  //   const profile = await this.prisma.talentProfile.findUnique({ where: { userId } });
  //   if (!profile) throw new NotFoundException('Talent profile not found');
  //   
  //   const photos = profile.portfolioPhotos as string[];
  //   const updatedPhotos = photos.filter((url: string) => url !== urlToRemove);
  //   
  //   return this.prisma.talentProfile.update({
  //     where: { userId },
  //     data: {
  //       portfolioPhotos: updatedPhotos
  //     }
  //   });
  // }

  async createHireRequest(talentId: string, data: CreateHireRequestDto) {
    const profile = await this.prisma.talentProfile.findUnique({
      where: { id: talentId },
      include: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Talent profile not found');
    }

    const request = await this.prisma.hireRequest.create({
      data: {
        talentId,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        requesterPhone: data.requesterPhone,
        projectType: data.projectType,
        city: data.city,
        dateNeeded: data.dateNeeded ? new Date(data.dateNeeded) : null,
        budgetRange: data.budgetRange,
        briefDescription: data.briefDescription,
        status: HireRequestStatus.NEW,
      },
    });

    // Auto-create SalesLead for sales pipeline tracking
    try {
      let estimatedValuePaise = 1500000; // Default ₹15,000 in paise
      if (data.budgetRange) {
        const nums = data.budgetRange.replace(/\D/g, '');
        if (nums) {
          const parsed = parseInt(nums, 10);
          if (!isNaN(parsed) && parsed > 0) estimatedValuePaise = parsed * 100;
        }
      }
      await this.prisma.salesLead.create({
        data: {
          clientName: data.requesterName || 'Talent Booking Client',
          email: data.requesterEmail || null,
          phone: data.requesterPhone || null,
          source: 'WEBSITE',
          stage: 'NEW',
          estimatedValue: estimatedValuePaise,
          notes: `[Talent Hire Inquiry for ${profile.user.firstName || 'Talent'}]\nProject: ${data.projectType || 'N/A'}\nCity: ${data.city || 'N/A'}\nBudget: ${data.budgetRange || 'N/A'}\nBrief: ${data.briefDescription || 'N/A'}`,
        }
      });
    } catch (err) {
      this.logger.error('Failed to auto-create SalesLead from HireRequest:', err);
    }

    // Notify the talent (optional) or admins
    if (profile.user.phone) {
      this.whatsappService.sendMessage(
        profile.user.phone,
        `Hi ${profile.user.firstName}, you have a new booking inquiry for a ${data.projectType} project. MP Productions team will contact you shortly with details.`
      );
    }

    return request;
  }

  /**
   * A talent accepts / declines / marks-in-discussion one of their own inbound
   * hire requests. Ownership is enforced by matching the request's talentId to
   * the caller's talent profile.
   */
  async respondToHireRequest(userId: string, requestId: string, status: HireRequestStatus) {
    const profile = await this.prisma.talentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Talent profile not found');
    }

    const request = await this.prisma.hireRequest.findUnique({
      where: { id: requestId },
      select: { id: true, talentId: true },
    });
    if (!request || request.talentId !== profile.id) {
      throw new NotFoundException('Hire request not found');
    }

    return this.prisma.hireRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }
}
