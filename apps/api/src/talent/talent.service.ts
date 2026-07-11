import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SocialPlatform, HireRequestStatus } from '@prisma/client';
import { TalentProfileStatus } from '@mdms/types';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateHireRequestDto } from './dto/create-hire-request.dto';

@Injectable()
export class TalentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService
  ) {}

  async findAllPublic(query: { search?: string; type?: string; location?: string }) {
    return this.prisma.talentProfile.findMany({
      where: {
        status: TalentProfileStatus.ACTIVE,
        // ...(query.type && { talentTypes: { has: query.type as any } }),
        ...(query.search && {
          OR: [
            { bio: { contains: query.search, mode: 'insensitive' } },
            { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
            { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
          ],
        }),
        ...(query.location && { city: { contains: query.location, mode: 'insensitive' } }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
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
        phone: `+9199999${Math.floor(10000 + Math.random() * 90000)}`,
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

  async submitProfile(userId: string, data: any) {
    await this.ensureUserExists(userId);
    const { 
      primaryTalentId, secondaryTalentIds, attributes,
      bio, stageName, experienceLevel,
      profilePhotoPreview, coverBannerPreview, introductionVideoPreview,
      resumeName, compCardName, galleryImages,
      achievements, education, brandsWorkedWith,
      instagram, youtube, linkedin, portfolio,
      ...rest 
    } = data;

    // 1. Upsert profile with all the structured data
    const profile = await this.prisma.talentProfile.upsert({
      where: { userId },
      update: {
        bio,
        stageName,
        experienceLevel,
        status: TalentProfileStatus.PENDING_REVIEW,
        onboardingStep: 7,
        onboardingCompleted: true,
        coverBannerUrl: coverBannerPreview,
        introductionVideoUrl: introductionVideoPreview,
        resumeUrl: resumeName ? `documents/${resumeName}` : null,
        compCardUrl: compCardName ? `documents/${compCardName}` : null,
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
        resumeUrl: resumeName ? `documents/${resumeName}` : null,
        compCardUrl: compCardName ? `documents/${compCardName}` : null,
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

    // 3. Set Social Links
    await this.prisma.socialLink.deleteMany({
      where: { talentProfileId: profile.id }
    });
    
    const socialLinks = [];
    if (instagram) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.INSTAGRAM, url: instagram });
    if (youtube) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.YOUTUBE, url: youtube });
    if (linkedin) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.LINKEDIN, url: linkedin });
    if (portfolio) socialLinks.push({ talentProfileId: profile.id, platform: SocialPlatform.WEBSITE, url: portfolio });
    
    if (socialLinks.length > 0) {
      await this.prisma.socialLink.createMany({ data: socialLinks });
    }

    return profile;
  }

  async getPendingProfiles() {
    return this.prisma.talentProfile.findMany({
      where: { status: TalentProfileStatus.PENDING_REVIEW },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async moderateProfile(id: string, status: TalentProfileStatus, reviewNote?: string) {
    const profile = await this.prisma.talentProfile.update({
      where: { id },
      data: { status, reviewNote, approvedAt: status === TalentProfileStatus.ACTIVE ? new Date() : null },
      include: { user: true }
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
    const profile = await this.prisma.talentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        userTalents: true,
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
  }

  async updateMe(userId: string, data: any) {
    return this.prisma.talentProfile.update({
      where: { userId },
      data,
    });
  }

  async getFeatured() {
    return this.prisma.talentProfile.findMany({
      where: { status: TalentProfileStatus.ACTIVE },
      take: 4,
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

    // Notify the talent (optional) or admins
    if (profile.user.phone) {
      this.whatsappService.sendMessage(
        profile.user.phone,
        `Hi ${profile.user.firstName}, you have a new booking inquiry for a ${data.projectType} project. MP Productions team will contact you shortly with details.`
      );
    }

    return request;
  }
}
