import { PrismaClient, Role, TalentProfileStatus, MediaType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const FEATURED_TALENTS = [
  {
    slug: 'aarya-k',
    firstName: 'Aarya',
    lastName: 'Kapoor',
    email: 'aarya.k@mpproduction.com',
    phone: '9999900001',
    categorySlug: 'model',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    coverBannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800',
    bio: 'International fashion and commercial model with extensive runway and brand editorial shoot experience across Paris, Milan, and Mumbai.',
    experienceLevel: '5+ Years',
    instagramFollowers: 128000,
    portfolio: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600'
    ]
  },
  {
    slug: 'rohan-m',
    firstName: 'Rohan',
    lastName: 'Malhotra',
    email: 'rohan.m@mpproduction.com',
    phone: '9999900002',
    categorySlug: 'director',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    coverBannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800',
    bio: 'Cinema director and narrative storyteller focused on creating luxury visual advertisements and high-end cinematic commercials.',
    experienceLevel: '5+ Years',
    instagramFollowers: 540000,
    portfolio: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600'
    ]
  },
  {
    slug: 'isha-s',
    firstName: 'Isha',
    lastName: 'Sharma',
    email: 'isha.s@mpproduction.com',
    phone: '9999900003',
    categorySlug: 'actor',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
    coverBannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800',
    bio: 'Lead theatrical and commercial actress. Known for expressive character acting, voice versatility, and prominent brand collaborations.',
    experienceLevel: '3-5 Years',
    instagramFollowers: 72000,
    portfolio: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600'
    ]
  },
  {
    slug: 'devansh-p',
    firstName: 'Devansh',
    lastName: 'Patel',
    email: 'devansh.p@mpproduction.com',
    phone: '9999900004',
    categorySlug: 'director',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    coverBannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=800',
    bio: 'Award-winning DOP & Cinematographer with deep expertise in camera movement choreography, high-speed camera control, and anamorphic aesthetics.',
    experienceLevel: '5+ Years',
    instagramFollowers: 38000,
    portfolio: [
      'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?q=80&w=600',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600'
    ]
  },
  {
    slug: 'karan-j',
    firstName: 'Karan',
    lastName: 'Joshi',
    email: 'karan.j@mpproduction.com',
    phone: '9999900005',
    categorySlug: 'other',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    coverBannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800',
    bio: 'Executive Producer specializing in large-scale visual campaigns, talent curation, production management, and brand positioning strategy.',
    experienceLevel: '5+ Years',
    instagramFollowers: 195000,
    portfolio: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600'
    ]
  }
];

async function main() {
  console.log('🌱 Seeding specific Featured Talents matching homepage links...\n');

  const passwordHash = await bcrypt.hash('Featured@123', 12);

  for (const t of FEATURED_TALENTS) {
    console.log(`  Upserting featured talent: ${t.firstName} ${t.lastName} (${t.slug})`);

    // Clean up existing user if any
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: t.email },
          { phone: t.phone }
        ]
      }
    });

    if (existingUser) {
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    // Find category
    let category = await prisma.talentCategory.findUnique({
      where: { slug: t.categorySlug }
    });

    if (!category) {
      category = await prisma.talentCategory.create({
        data: {
          slug: t.categorySlug,
          name: t.categorySlug.toUpperCase(),
          description: `${t.categorySlug} category`
        }
      });
    }

    // Create User
    const user = await prisma.user.create({
      data: {
        email: t.email,
        phone: t.phone,
        passwordHash,
        role: Role.TALENT,
        firstName: t.firstName,
        lastName: t.lastName,
        city: 'Mumbai',
        state: 'Maharashtra',
        avatarUrl: t.avatarUrl,
        isActive: true,
      }
    });

    // Create TalentProfile
    const profile = await prisma.talentProfile.create({
      data: {
        userId: user.id,
        slug: t.slug,
        stageName: `${t.firstName} ${t.lastName}`,
        bio: t.bio,
        experienceLevel: t.experienceLevel,
        status: TalentProfileStatus.ACTIVE,
        coverBannerUrl: t.coverBannerUrl,
        coverBannerType: 'image',
        introductionVideoUrl: '/videos/reel_1.mp4',
        projectCount: 42,
        profileViews: t.instagramFollowers * 2,
        brandsWorkedWith: ['Nike', 'Apple', 'Zara', 'GQ India'],
        approvedAt: new Date(),
        onboardingStep: 7,
        onboardingCompleted: true,
        availability: {
          create: {
            travelReady: true,
            passportAvailable: true,
            ownVehicle: true,
            freelancer: true,
            availableFullTime: true
          }
        },
        pricing: {
          create: {
            perHour: 250000, // ₹2,500
            perDay: 2000000, // ₹20,000
            currency: 'INR',
            isNegotiable: true
          }
        }
      }
    });

    // Link Category
    await prisma.userTalent.create({
      data: {
        talentProfileId: profile.id,
        categoryId: category.id,
        isPrimary: true
      }
    });

    // Create Portfolio Media
    for (let j = 0; j < t.portfolio.length; j++) {
      await prisma.portfolioMedia.create({
        data: {
          talentProfileId: profile.id,
          type: MediaType.PORTFOLIO_IMAGE,
          url: t.portfolio[j],
          title: `${t.firstName} ${t.lastName} Portfolio Shot ${j + 1}`,
          order: j
        }
      });
    }

    console.log(`    ✅ Successfully seeded ${t.slug}`);
  }

  console.log('\n🎉 Featured homepage talents seeded successfully without 404s!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding featured talents failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
