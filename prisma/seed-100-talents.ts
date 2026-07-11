import { PrismaClient, Role, TalentProfileStatus, MediaType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'model', name: 'Model', description: 'Fashion, Editorial, Commercial, and Fitness Models' },
  { slug: 'actor', name: 'Actor', description: 'Film, TV, Theater, and Voice Actors' },
  { slug: 'musician', name: 'Musician', description: 'Vocalists, Instrumentalists, and Music Producers' },
  { slug: 'dancer', name: 'Dancer', description: 'Professional Dancers and Choreographers' },
  { slug: 'voice', name: 'Voice Over', description: 'Voice Over Artists and Dubbing Talents' },
  { slug: 'creator', name: 'Content Creator', description: 'Influencers and Digital Content Creators' },
  { slug: 'director', name: 'Director & Crew', description: 'Cinematographers, Directors, and Writers' },
  { slug: 'other', name: 'Other Talent', description: 'Versatile and Multi-disciplinary Artists' }
];

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Amit', 'Aditi', 'Arjun', 'Aisha', 'Dev', 'Diya', 'Ishaan', 'Ira',
  'Kabir', 'Kavya', 'Nikhil', 'Neha', 'Pranav', 'Pooja', 'Rohan', 'Riya', 'Siddharth', 'Shreya',
  'Vikram', 'Veena', 'Yash', 'Zara', 'Rahul', 'Sneha', 'Ranveer', 'Deepika', 'Varun', 'Alia',
  'Karan', 'Kareena', 'Sid', 'Kiara', 'Kartik', 'Sara', 'Ayushmann', 'Taapsee', 'Rajkummar', 'Bhumi',
  'Vicky', 'Katrina', 'Ranbir', 'Anushka', 'Hrithik', 'Priyanka', 'Salman', 'Shahrukh', 'Aamir', 'Kajol'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Mehta', 'Sen', 'Roy', 'Patel', 'Shah', 'Joshi', 'Rao',
  'Nair', 'Menon', 'Reddy', 'Choudhury', 'Singh', 'Kaur', 'Kapoor', 'Khan', 'Deshmukh', 'Kulkarni',
  'Bhatt', 'Malhotra', 'Sinha', 'Kapoor', 'Dhawan', 'Johar', 'Advani', 'Aryan', 'Dutt', 'Khanna',
  'Pandey', 'Mishra', 'Trivedi', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Das', 'Basu', 'Ghoshal', 'Shreya',
  'Dubey', 'Yadav', 'Prasad', 'Rana', 'Chauhan', 'Thakur', 'Grover', 'Bhasin', 'Oberoi', 'Suri'
];

const EXPERIENCE_LEVELS = ['Fresher', '1-3 Years', '3-5 Years', '5+ Years'];

const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi NCR', state: 'Delhi' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Kolkata', state: 'West Bengal' }
];

const PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1489980508314-941910ded1f4?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop'
];

const BANNERS = [
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
];

const BRANDS = ['Nike', 'Adidas', 'Zara', 'H&M', 'Samsung', 'Apple', 'Sabyasachi', 'Manish Malhotra', 'BMW', 'L\'Oreal', 'OnePlus', 'Netflix', 'Amazon Prime', 'GQ India', 'Vogue India'];

const BIOS = [
  'Passionate storyteller and creative artist with a focus on high-impact visual representation. Over the years, I have worked with multiple national and international fashion houses.',
  'Extremely versatile performance artist with extensive experience in theatrical productions, commercial advertising, and independent feature films. Love experimenting with new styles.',
  'Digital content creator and influencer focusing on sustainable lifestyle, fashion, and travel. Dedicated to engaging audiences with authentic narratives and premium aesthetics.',
  'Cinematographer and director specialized in narrative storytelling, anamorphic lens work, and high-energy music videos. Excited to collaborate on cutting-edge digital campaigns.',
  'Voice over artist and dubbing specialist with a deep vocal range. Proficient in multiple languages and accents, ideal for premium corporate documentaries and character animation.'
];

async function main() {
  console.log('🌱 Seeding 100 Talent Profiles with premium details...\n');

  // Clear existing seeded talent users to avoid unique constraint collisions
  await prisma.user.deleteMany({
    where: { email: { endsWith: '@mpproduction.com' } }
  });

  // Password for all seeded accounts
  const passwordHash = await bcrypt.hash('Talent@123', 12);

  // 1. Ensure all categories exist
  const dbCategories: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const dbCat = await prisma.talentCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
      },
    });
    dbCategories[cat.slug] = dbCat.id;
  }
  console.log('✅ 8 Talent categories verified.');

  // 2. Generate and Seed 100 Talents
  for (let i = 1; i <= 100; i++) {
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i - 1) % LAST_NAMES.length];
    const categorySlug = CATEGORIES[(i - 1) % CATEGORIES.length].slug;
    const categoryId = dbCategories[categorySlug];
    const cityObj = CITIES[(i - 1) % CITIES.length];
    const email = `talent.${i}@mpproduction.com`;
    const phone = `98765432${i.toString().padStart(2, '0')}`;
    const stageName = `${firstName} ${lastName}`;
    const slug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${i}`;
    const portrait = PORTRAITS[(i - 1) % PORTRAITS.length];
    const banner = BANNERS[(i - 1) % BANNERS.length];
    const exp = EXPERIENCE_LEVELS[(i - 1) % EXPERIENCE_LEVELS.length];
    const bio = BIOS[(i - 1) % BIOS.length];

    // Pick 2-3 random brands
    const shuffledBrands = [...BRANDS].sort(() => 0.5 - Math.random());
    const brandsWorkedWith = shuffledBrands.slice(0, Math.floor(Math.random() * 2) + 2);

    console.log(`  [${i}/100] Creating Talent: ${stageName} (${categorySlug})`);

    // Create User + Profile in transaction
    await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          role: Role.TALENT,
          firstName,
          lastName,
          city: cityObj.city,
          state: cityObj.state,
          avatarUrl: portrait,
          isActive: true,
        }
      });

      // Create profile
      const profile = await tx.talentProfile.create({
        data: {
          userId: user.id,
          slug,
          stageName,
          bio,
          experienceLevel: exp,
          status: TalentProfileStatus.ACTIVE,
          coverBannerUrl: banner,
          coverBannerType: 'image',
          introductionVideoUrl: `/videos/reel_${((i - 1) % 4) + 1}.mp4`,
          projectCount: Math.floor(Math.random() * 25) + 3,
          profileViews: Math.floor(Math.random() * 500) + 50,
          brandsWorkedWith,
          onboardingStep: 7,
          onboardingCompleted: true,
          approvedAt: new Date(),
          availability: {
            create: {
              travelReady: Math.random() > 0.3,
              passportAvailable: Math.random() > 0.4,
              ownVehicle: Math.random() > 0.5,
              agencyRepresented: false,
              freelancer: true,
              availableFullTime: Math.random() > 0.4,
              availablePartTime: Math.random() > 0.6,
            }
          },
          pricing: {
            create: {
              perHour: (Math.floor(Math.random() * 10) + 10) * 10000,
              perDay: (Math.floor(Math.random() * 15) + 15) * 100000,
              currency: 'INR',
              isNegotiable: true
            }
          }
        }
      });

      // Add Category linkage
      await tx.userTalent.create({
        data: {
          talentProfileId: profile.id,
          categoryId,
          isPrimary: true,
        }
      });

      // Create 3 portfolio media items
      for (let j = 1; j <= 3; j++) {
        const portImage = PORTRAITS[(i + j) % PORTRAITS.length];
        await tx.portfolioMedia.create({
          data: {
            talentProfileId: profile.id,
            type: MediaType.PORTFOLIO_IMAGE,
            url: portImage,
            title: `${stageName} Portfolio Shot ${j}`,
            order: j,
          }
        });
      }
    });
  }

  console.log('\n🎉 Successfully seeded 100 Talent Profiles!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
