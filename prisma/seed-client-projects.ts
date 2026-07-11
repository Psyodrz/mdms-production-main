import { PrismaClient, Role, BookingStatus, ProjectStatus, PaymentStatus, PaymentType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── 10 Real Production Projects ──────────────────────────

const PROJECT_DATA = [
  {
    clientEmail: 'rahul.sharma@luxebrands.in',
    clientFirst: 'Rahul',
    clientLast: 'Sharma',
    company: 'Luxe Brands India',
    city: 'Mumbai',
    state: 'Maharashtra',
    service: {
      name: 'Premium Brand Film',
      slug: 'premium-brand-film',
      description: 'Full-scale cinematic brand film production with storytelling, 4K cinematography, and professional color grading.',
      shortDesc: 'Cinematic brand film production',
      category: 'Production',
      basePrice: 25000000, // ₹2,50,000
      features: ['4K RED Camera', 'Professional Crew', 'Color Grading', 'Sound Design', '2 Revision Rounds'],
    },
    booking: {
      date: new Date('2026-06-15'),
      startTime: '09:00',
      endTime: '18:00',
      projectBrief: 'A luxury fashion brand film showcasing our new Summer 2026 collection across Mumbai heritage locations.',
      quoteAmount: 25000000,
      advanceAmount: 7500000,
    },
    project: {
      name: 'Luxe Brands — Summer 2026 Campaign',
      status: ProjectStatus.EDITING,
      shootDate: new Date('2026-06-20'),
      shootLocation: 'Taj Mahal Palace, Mumbai',
      editDeadline: new Date('2026-07-10'),
      reviewDeadline: new Date('2026-07-15'),
      deliveryDate: new Date('2026-07-20'),
      equipmentNotes: 'RED Komodo 6K, Cooke S7/i Anamorphic Lenses, ARRI SkyPanel S60, DJI RS3 Pro',
      internalNotes: 'High-priority client. CEO attending shoot day.',
    },
    milestones: [
      { title: 'Pre-Production Locked', dueDate: new Date('2026-06-18'), completed: true },
      { title: 'Shoot Day Complete', dueDate: new Date('2026-06-20'), completed: true },
      { title: 'Rough Cut Delivery', dueDate: new Date('2026-07-05'), completed: true },
      { title: 'Color Graded Final', dueDate: new Date('2026-07-12'), completed: false },
      { title: 'Final Delivery', dueDate: new Date('2026-07-20'), completed: false },
    ],
  },
  {
    clientEmail: 'priya.kapoor@vividmedia.com',
    clientFirst: 'Priya',
    clientLast: 'Kapoor',
    company: 'Vivid Media',
    city: 'Delhi',
    state: 'Delhi NCR',
    service: {
      name: 'Corporate Documentary',
      slug: 'corporate-documentary',
      description: 'Professional corporate documentary production — interviews, B-roll, narrative scripting, and post-production.',
      shortDesc: 'Corporate documentary production',
      category: 'Production',
      basePrice: 15000000,
      features: ['Multi-camera Setup', 'Interview Lighting', 'Script Supervision', 'Motion Graphics'],
    },
    booking: {
      date: new Date('2026-05-20'),
      startTime: '10:00',
      endTime: '17:00',
      projectBrief: 'A 15-minute corporate documentary showcasing our CSR initiatives across rural India.',
      quoteAmount: 18000000,
      advanceAmount: 5400000,
    },
    project: {
      name: 'Vivid Media — CSR Documentary',
      status: ProjectStatus.COMPLETED,
      shootDate: new Date('2026-05-25'),
      shootLocation: 'Connaught Place, New Delhi & Rural Haryana',
      editDeadline: new Date('2026-06-10'),
      reviewDeadline: new Date('2026-06-15'),
      deliveryDate: new Date('2026-06-20'),
      completedAt: new Date('2026-06-18'),
      equipmentNotes: 'Sony FX6 x2, Sennheiser MKH416, ARRI SkyPanel S30, Ronin 4D',
      internalNotes: 'Client loved the cut. Potential repeat business for annual report video.',
    },
    milestones: [
      { title: 'Script Approval', dueDate: new Date('2026-05-22'), completed: true },
      { title: 'Shoot Complete', dueDate: new Date('2026-05-28'), completed: true },
      { title: 'Assembly Edit', dueDate: new Date('2026-06-05'), completed: true },
      { title: 'Final Delivery', dueDate: new Date('2026-06-20'), completed: true },
    ],
  },
  {
    clientEmail: 'ankit.verma@techforge.io',
    clientFirst: 'Ankit',
    clientLast: 'Verma',
    company: 'TechForge Solutions',
    city: 'Bangalore',
    state: 'Karnataka',
    service: {
      name: 'Product Launch Video',
      slug: 'product-launch-video',
      description: 'Dynamic product launch video with 3D animations, lifestyle footage, and social media cutdowns.',
      shortDesc: 'Product launch video production',
      category: 'Production',
      basePrice: 12000000,
      features: ['3D Product Animation', 'Lifestyle B-Roll', 'Social Cutdowns (9:16, 1:1)', 'Voice Over'],
    },
    booking: {
      date: new Date('2026-07-01'),
      startTime: '08:00',
      endTime: '16:00',
      projectBrief: 'Launch video for our AI-powered SaaS platform. Modern, tech-forward aesthetic. 60s hero + 15s social cuts.',
      quoteAmount: 14000000,
      advanceAmount: 4200000,
    },
    project: {
      name: 'TechForge — AI Platform Launch',
      status: ProjectStatus.PRE_PRODUCTION,
      shootDate: new Date('2026-07-18'),
      shootLocation: 'WeWork Embassy, Bangalore',
      editDeadline: new Date('2026-08-01'),
      reviewDeadline: new Date('2026-08-05'),
      deliveryDate: new Date('2026-08-10'),
      equipmentNotes: 'ARRI Alexa Mini LF, Zeiss Supreme Primes, Kino Flo Celeb 850',
      internalNotes: 'Client wants Apple-style product reveal. Need motion graphics artist booked.',
    },
    milestones: [
      { title: 'Storyboard Approved', dueDate: new Date('2026-07-10'), completed: false },
      { title: 'Talent Finalized', dueDate: new Date('2026-07-14'), completed: false },
      { title: 'Shoot Day', dueDate: new Date('2026-07-18'), completed: false },
      { title: 'Final Delivery', dueDate: new Date('2026-08-10'), completed: false },
    ],
  },
  {
    clientEmail: 'meera.iyer@sparklecos.com',
    clientFirst: 'Meera',
    clientLast: 'Iyer',
    company: 'Sparkle Cosmetics',
    city: 'Hyderabad',
    state: 'Telangana',
    service: {
      name: 'Social Media Reels Package',
      slug: 'social-media-reels',
      description: 'A pack of 10 professionally shot and edited social media reels for Instagram, YouTube Shorts, and TikTok.',
      shortDesc: '10x social media reels',
      category: 'Content',
      basePrice: 8000000,
      features: ['10 Reels (15-60s)', 'Trending Audio Integration', 'On-screen Text & Captions', 'Hashtag Strategy'],
    },
    booking: {
      date: new Date('2026-06-25'),
      startTime: '10:00',
      endTime: '18:00',
      projectBrief: '10 beauty product reels for our Monsoon Glow collection. Aesthetic, ASMR-style with close-up product shots.',
      quoteAmount: 8500000,
      advanceAmount: 2550000,
    },
    project: {
      name: 'Sparkle Cosmetics — Monsoon Reels',
      status: ProjectStatus.REVIEW,
      shootDate: new Date('2026-06-28'),
      shootLocation: 'HITEC City Studio, Hyderabad',
      editDeadline: new Date('2026-07-08'),
      reviewDeadline: new Date('2026-07-12'),
      deliveryDate: new Date('2026-07-15'),
      equipmentNotes: 'Sony A7S III, Sigma Art 35mm, Aputure 300d Mark II, Godox VL200',
      internalNotes: 'Client is influencer-savvy. Wants vertical-first content with trending transitions.',
    },
    milestones: [
      { title: 'Mood Board Approved', dueDate: new Date('2026-06-26'), completed: true },
      { title: 'All 10 Reels Shot', dueDate: new Date('2026-06-28'), completed: true },
      { title: 'First Batch (5 Reels)', dueDate: new Date('2026-07-05'), completed: true },
      { title: 'Full Delivery', dueDate: new Date('2026-07-15'), completed: false },
    ],
  },
  {
    clientEmail: 'vikram.singh@atlasrealty.in',
    clientFirst: 'Vikram',
    clientLast: 'Singh',
    company: 'Atlas Realty Group',
    city: 'Gurugram',
    state: 'Haryana',
    service: {
      name: 'Real Estate Cinematic Tour',
      slug: 'real-estate-cinematic-tour',
      description: 'Aerial + ground-level cinematic property tour with drone footage, interior walkthroughs, and lifestyle vignettes.',
      shortDesc: 'Cinematic property tour',
      category: 'Production',
      basePrice: 10000000,
      features: ['Drone Aerial Shots', 'Gimbal Interior Tours', 'Twilight Photography', 'Floor Plan Animation'],
    },
    booking: {
      date: new Date('2026-07-05'),
      startTime: '06:00',
      endTime: '19:00',
      projectBrief: 'Cinematic walkthrough of our new 50-floor luxury tower "Atlas Pinnacle" in Sector 65, Gurugram. Must include twilight drone shots.',
      quoteAmount: 12000000,
      advanceAmount: 3600000,
    },
    project: {
      name: 'Atlas Realty — Pinnacle Tower Launch',
      status: ProjectStatus.SHOOT,
      shootDate: new Date('2026-07-12'),
      shootLocation: 'Atlas Pinnacle, Sector 65, Gurugram',
      editDeadline: new Date('2026-07-22'),
      reviewDeadline: new Date('2026-07-25'),
      deliveryDate: new Date('2026-07-30'),
      equipmentNotes: 'DJI Inspire 3, RED V-Raptor, DJI RS4 Pro, Aputure LS 1200d Pro',
      internalNotes: 'Twilight slot is 6:30-7:15 PM. Must nail the golden hour drone sequence.',
    },
    milestones: [
      { title: 'Location Recce Done', dueDate: new Date('2026-07-08'), completed: true },
      { title: 'Shoot Day 1 (Interiors)', dueDate: new Date('2026-07-12'), completed: false },
      { title: 'Shoot Day 2 (Exteriors + Drone)', dueDate: new Date('2026-07-13'), completed: false },
      { title: 'Final Edit Delivery', dueDate: new Date('2026-07-30'), completed: false },
    ],
  },
  {
    clientEmail: 'sneha.nair@blossomweddings.com',
    clientFirst: 'Sneha',
    clientLast: 'Nair',
    company: 'Blossom Weddings',
    city: 'Kochi',
    state: 'Kerala',
    service: {
      name: 'Wedding Film',
      slug: 'wedding-film-premium',
      description: 'Premium cinematic wedding film covering all ceremonies with drone, multi-cam, and a highlight reel.',
      shortDesc: 'Cinematic wedding film',
      category: 'Events',
      basePrice: 20000000,
      features: ['3-Day Coverage', 'Multi-Camera (4 Angles)', 'Drone Footage', 'Highlight Reel + Full Film'],
    },
    booking: {
      date: new Date('2026-04-10'),
      startTime: '07:00',
      endTime: '23:00',
      projectBrief: 'Destination wedding at Kumarakom Lake Resort. 3-day coverage: Mehendi, Sangeet, and Main Ceremony. Cinematic highlight reel needed in 2 weeks.',
      quoteAmount: 22000000,
      advanceAmount: 6600000,
    },
    project: {
      name: 'Blossom Weddings — Kumarakom Destination',
      status: ProjectStatus.DELIVERED,
      shootDate: new Date('2026-04-15'),
      shootLocation: 'Kumarakom Lake Resort, Kerala',
      editDeadline: new Date('2026-05-01'),
      reviewDeadline: new Date('2026-05-05'),
      deliveryDate: new Date('2026-05-10'),
      completedAt: new Date('2026-05-08'),
      equipmentNotes: 'Sony FX3 x4, DJI Mavic 3 Pro, Sigma 35mm f/1.4, Rode Wireless GO II x6',
      internalNotes: 'Client gave a 5-star review. Include in portfolio showcase.',
    },
    milestones: [
      { title: 'Shot List Finalized', dueDate: new Date('2026-04-12'), completed: true },
      { title: 'All 3 Days Filmed', dueDate: new Date('2026-04-17'), completed: true },
      { title: 'Highlight Reel Delivered', dueDate: new Date('2026-04-30'), completed: true },
      { title: 'Full Film Delivered', dueDate: new Date('2026-05-10'), completed: true },
    ],
  },
  {
    clientEmail: 'arjun.desai@pulsefit.in',
    clientFirst: 'Arjun',
    clientLast: 'Desai',
    company: 'PulseFit Athletics',
    city: 'Pune',
    state: 'Maharashtra',
    service: {
      name: 'Brand Commercial (TVC)',
      slug: 'brand-commercial-tvc',
      description: 'Television-grade commercial production with casting, scripting, and broadcast-ready deliverables.',
      shortDesc: 'TV commercial production',
      category: 'Production',
      basePrice: 35000000,
      features: ['Script & Direction', 'Professional Casting', 'Broadcast-Ready Master', 'Multi-Format Delivery'],
    },
    booking: {
      date: new Date('2026-05-10'),
      startTime: '06:00',
      endTime: '20:00',
      projectBrief: '30-second TVC for our new athleisure line launch. High-energy, gym + urban outdoor aesthetic. Needs Bollywood-level production value.',
      quoteAmount: 38000000,
      advanceAmount: 11400000,
    },
    project: {
      name: 'PulseFit — Athleisure TVC Campaign',
      status: ProjectStatus.COMPLETED,
      shootDate: new Date('2026-05-18'),
      shootLocation: 'Film City, Mumbai & Lavasa',
      editDeadline: new Date('2026-06-01'),
      reviewDeadline: new Date('2026-06-05'),
      deliveryDate: new Date('2026-06-10'),
      completedAt: new Date('2026-06-08'),
      equipmentNotes: 'ARRI Alexa Mini LF, Cooke Anamorphic /i Full Frame, 20-Ton Lighting Package, Phantom VEO 4K',
      internalNotes: 'Includes slow-motion sequences at 1000fps. Phantom camera rented for Day 2.',
    },
    milestones: [
      { title: 'Script Lock', dueDate: new Date('2026-05-12'), completed: true },
      { title: 'Casting Confirmed', dueDate: new Date('2026-05-15'), completed: true },
      { title: 'Principal Photography', dueDate: new Date('2026-05-18'), completed: true },
      { title: 'Online + DI', dueDate: new Date('2026-06-03'), completed: true },
      { title: 'Broadcast Delivery', dueDate: new Date('2026-06-10'), completed: true },
    ],
  },
  {
    clientEmail: 'nisha.gupta@zenithfashion.com',
    clientFirst: 'Nisha',
    clientLast: 'Gupta',
    company: 'Zenith Fashion House',
    city: 'Jaipur',
    state: 'Rajasthan',
    service: {
      name: 'Lookbook & E-Commerce Shoot',
      slug: 'lookbook-ecommerce-shoot',
      description: 'High-fashion lookbook photography and e-commerce product shots with professional styling and retouching.',
      shortDesc: 'Fashion lookbook & product shoot',
      category: 'Photography',
      basePrice: 9000000,
      features: ['100+ Final Images', 'Professional Model', 'Styling & Makeup', 'White BG + Lifestyle'],
    },
    booking: {
      date: new Date('2026-06-05'),
      startTime: '08:00',
      endTime: '17:00',
      projectBrief: 'Lookbook for our Heritage Weave collection. Need 120+ retouched images — studio white BG for e-commerce + 30 lifestyle shots in Hawa Mahal area.',
      quoteAmount: 9500000,
      advanceAmount: 2850000,
    },
    project: {
      name: 'Zenith Fashion — Heritage Weave Lookbook',
      status: ProjectStatus.REVISION,
      shootDate: new Date('2026-06-08'),
      shootLocation: 'Jaipur Studio + Hawa Mahal Location',
      editDeadline: new Date('2026-06-20'),
      reviewDeadline: new Date('2026-06-25'),
      deliveryDate: new Date('2026-06-30'),
      equipmentNotes: 'Canon EOS R5, RF 85mm f/1.2L, Profoto B10 Plus x4, Elinchrom ELC 500',
      internalNotes: 'Client requested re-retouching on 15 images. Skin tones need to be warmer.',
    },
    milestones: [
      { title: 'Wardrobe & Model Confirmed', dueDate: new Date('2026-06-06'), completed: true },
      { title: 'Studio Shoot Day', dueDate: new Date('2026-06-08'), completed: true },
      { title: 'Location Shoot Day', dueDate: new Date('2026-06-09'), completed: true },
      { title: 'Retouched Gallery V1', dueDate: new Date('2026-06-18'), completed: true },
      { title: 'Final Retouched Gallery', dueDate: new Date('2026-06-30'), completed: false },
    ],
  },
  {
    clientEmail: 'rohan.malhotra@infinityauto.in',
    clientFirst: 'Rohan',
    clientLast: 'Malhotra',
    company: 'Infinity Automotive',
    city: 'Chennai',
    state: 'Tamil Nadu',
    service: {
      name: 'Automotive Ad Film',
      slug: 'automotive-ad-film',
      description: 'High-octane automotive ad film with tracking shots, drone chases, and CGI-enhanced environments.',
      shortDesc: 'Automotive ad film production',
      category: 'Production',
      basePrice: 45000000,
      features: ['Tracking Vehicle Rig', 'CGI Environment Extensions', 'Phantom Slow-Motion', 'Helicopter Aerial'],
    },
    booking: {
      date: new Date('2026-07-08'),
      startTime: '05:00',
      endTime: '20:00',
      projectBrief: '45-second hero film for our new EV sedan launch. Need desert highway + urban night sequences. Think Audi meets Tesla.',
      quoteAmount: 48000000,
      advanceAmount: 14400000,
    },
    project: {
      name: 'Infinity Auto — EV Sedan Launch Film',
      status: ProjectStatus.BOOKED,
      shootDate: new Date('2026-07-25'),
      shootLocation: 'Rann of Kutch + Chennai ECR',
      editDeadline: new Date('2026-08-15'),
      reviewDeadline: new Date('2026-08-20'),
      deliveryDate: new Date('2026-08-25'),
      equipmentNotes: 'RED V-Raptor XL, Russian Arm Vehicle, DJI Inspire 3, Phantom Flex4K, Bolt Cinebot',
      internalNotes: 'Massive production. 35-person crew. Accommodation + logistics for Kutch shoot to be arranged.',
    },
    milestones: [
      { title: 'Creative Brief Alignment', dueDate: new Date('2026-07-12'), completed: false },
      { title: 'Location Scout Complete', dueDate: new Date('2026-07-18'), completed: false },
      { title: 'Shoot Block (3 Days)', dueDate: new Date('2026-07-27'), completed: false },
      { title: 'VFX & Post', dueDate: new Date('2026-08-12'), completed: false },
      { title: 'Final Delivery', dueDate: new Date('2026-08-25'), completed: false },
    ],
  },
  {
    clientEmail: 'kavita.reddy@auraevents.co',
    clientFirst: 'Kavita',
    clientLast: 'Reddy',
    company: 'Aura Events & PR',
    city: 'Ahmedabad',
    state: 'Gujarat',
    service: {
      name: 'Event Coverage & Aftermovie',
      slug: 'event-coverage-aftermovie',
      description: 'Multi-camera live event coverage with same-day highlights and a polished aftermovie.',
      shortDesc: 'Event coverage & aftermovie',
      category: 'Events',
      basePrice: 7000000,
      features: ['Multi-Cam (3 Angles)', 'Same-Day Social Cuts', 'Aftermovie (3-5 min)', 'Photo Gallery (200+)'],
    },
    booking: {
      date: new Date('2026-06-30'),
      startTime: '16:00',
      endTime: '23:00',
      projectBrief: 'Annual Aura Awards Gala 2026 at Sabarmati Riverfront. Need live social cuts for Instagram during the event + a 4-minute cinematic aftermovie.',
      quoteAmount: 7500000,
      advanceAmount: 2250000,
    },
    project: {
      name: 'Aura Events — Annual Gala 2026',
      status: ProjectStatus.EDITING,
      shootDate: new Date('2026-07-02'),
      shootLocation: 'Sabarmati Riverfront Event Centre, Ahmedabad',
      editDeadline: new Date('2026-07-10'),
      reviewDeadline: new Date('2026-07-14'),
      deliveryDate: new Date('2026-07-18'),
      equipmentNotes: 'Sony FX6 x3, Canon C70 (roaming), Rode NTG5, Sennheiser EW 100 G4, DJI Ronin RS4',
      internalNotes: 'Same-day cuts were posted during the event and got great engagement. Client very happy.',
    },
    milestones: [
      { title: 'Event Brief & Run Sheet', dueDate: new Date('2026-06-30'), completed: true },
      { title: 'Event Day Coverage', dueDate: new Date('2026-07-02'), completed: true },
      { title: 'Same-Day Social Cuts', dueDate: new Date('2026-07-02'), completed: true },
      { title: 'Aftermovie Draft', dueDate: new Date('2026-07-08'), completed: true },
      { title: 'Final Aftermovie', dueDate: new Date('2026-07-18'), completed: false },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding 10 client projects with real data...\n');

  const passwordHash = await bcrypt.hash('Client@123', 12);

  for (let i = 0; i < PROJECT_DATA.length; i++) {
    const p = PROJECT_DATA[i];
    console.log(`  [${i + 1}/10] ${p.project.name}`);

    // 1. Create or find User
    const user = await prisma.user.upsert({
      where: { email: p.clientEmail },
      update: {},
      create: {
        email: p.clientEmail,
        firstName: p.clientFirst,
        lastName: p.clientLast,
        passwordHash,
        role: Role.CLIENT,
        isActive: true,
        city: p.city,
        state: p.state,
        client: {
          create: {
            companyName: p.company,
            city: p.city,
            state: p.state,
          },
        },
      },
      include: { client: true },
    });

    const clientId = user.client?.id;
    if (!clientId) {
      console.log(`    ⚠️  Skipped — no client record for ${p.clientEmail}`);
      continue;
    }

    // 2. Create Service (upsert by slug)
    const service = await prisma.service.upsert({
      where: { slug: p.service.slug },
      update: {},
      create: {
        name: p.service.name,
        slug: p.service.slug,
        description: p.service.description,
        shortDesc: p.service.shortDesc,
        category: p.service.category,
        basePrice: p.service.basePrice,
        features: p.service.features,
        isActive: true,
      },
    });

    // 3. Create Booking
    const booking = await prisma.booking.create({
      data: {
        clientId,
        serviceId: service.id,
        date: p.booking.date,
        startTime: p.booking.startTime,
        endTime: p.booking.endTime,
        status: BookingStatus.CONFIRMED,
        projectBrief: p.booking.projectBrief,
        quoteAmount: p.booking.quoteAmount,
        advanceAmount: p.booking.advanceAmount,
        confirmedAt: p.booking.date,
      },
    });

    // 4. Create Project
    const project = await prisma.project.create({
      data: {
        bookingId: booking.id,
        name: p.project.name,
        status: p.project.status,
        shootDate: p.project.shootDate,
        shootLocation: p.project.shootLocation,
        editDeadline: p.project.editDeadline,
        reviewDeadline: p.project.reviewDeadline,
        deliveryDate: p.project.deliveryDate,
        completedAt: (p.project as any).completedAt || null,
        equipmentNotes: p.project.equipmentNotes,
        internalNotes: p.project.internalNotes,
      },
    });

    // 5. Create Milestones
    for (let mi = 0; mi < p.milestones.length; mi++) {
      const m = p.milestones[mi];
      await prisma.milestone.create({
        data: {
          projectId: project.id,
          title: m.title,
          dueDate: m.dueDate,
          completed: m.completed,
          sortOrder: mi,
        },
      });
    }

    // 6. Create Advance Payment
    await prisma.payment.create({
      data: {
        projectId: project.id,
        amount: p.booking.advanceAmount,
        type: PaymentType.ADVANCE,
        status: PaymentStatus.COMPLETED,
        paidAt: p.booking.date,
      },
    });

    console.log(`    ✅ Done — ${p.project.status}`);
  }

  console.log('\n🎉 All 10 projects seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
