/**
 * Seeds real CMS content into Supabase so the public site and the admin CMS
 * are both DB-driven and consistent. Idempotent: uses upsert by slug / stable id.
 * Run: node prisma/seed-cms-content.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'superadmin@mpproduction.com' }, select: { id: true } });
  if (!admin) throw new Error('Seed the superadmin account first.');
  const authorId = admin.id;

  // ── Portfolio ──────────────────────────────────────────────
  const portfolio = [
    { slug: 'neon-city', title: 'Neon Silk · The Metamorphosis', category: 'Fashion Film', year: 2026, mediaUrl: '/images/portfolio-hero.jpg', description: 'High-fashion cinematic editorial shot across cyberpunk neon alleyways in Mumbai and nocturnal studios in London.', tags: ['fashion', 'cinema'] },
    { slug: 'midnight-run', title: 'Midnight Anthem · VOLT Music', category: 'Music Video', year: 2026, mediaUrl: '/images/about-bts.jpg', description: 'A surrealist exploration of haute couture against brutalist architecture. Shot entirely on 35mm film stock.', tags: ['music', 'film'] },
    { slug: 'vantage-point', title: "Curinel's Reserve · Timeless Heritage", category: 'Commercial', year: 2025, mediaUrl: '/images/careers-meeting.jpg', description: 'An atmospheric brand commercial across secluded coastal cliffs in South Goa and heritage Scottish distilleries.', tags: ['commercial', 'luxury'] },
    { slug: 'heritage-foundation', title: 'Skyline Suits · Executive Mastery', category: 'Brand Campaign', year: 2025, mediaUrl: '/images/services-lighting.jpg', description: 'Dynamic editorial campaign blending 16mm film grit with hyper-polished digital intermediate finishing.', tags: ['campaign', 'fashion'] },
    { slug: 'echoes-of-silence', title: 'Echoes of Silence · Contemporary Ballet', category: 'Art & Theatre', year: 2026, mediaUrl: '/images/bg-abstract.jpg', description: 'An immersive 360-degree sensory exploration of human movement and architectural acoustic spaces.', tags: ['art', 'theatre'] },
    { slug: 'solstice-chronicles', title: 'Solstice · The Electric Odyssey', category: 'Commercial', year: 2025, mediaUrl: '/images/bg-luxury.jpg', description: 'High-speed precision tracking shots across salt flats at dawn with custom FPV cinema drone cinematography.', tags: ['automotive', 'commercial'] },
  ];
  for (let i = 0; i < portfolio.length; i++) {
    const p = portfolio[i];
    await prisma.portfolioItem.upsert({
      where: { slug: p.slug },
      update: { title: p.title, category: p.category, year: p.year, mediaUrl: p.mediaUrl, mediaType: 'image', description: p.description, tags: p.tags, isPublished: true, sortOrder: i, deletedAt: null },
      create: { slug: p.slug, title: p.title, category: p.category, year: p.year, mediaUrl: p.mediaUrl, mediaType: 'image', description: p.description, tags: p.tags, isPublished: true, sortOrder: i },
    });
  }
  console.log(`✅ Portfolio: ${portfolio.length}`);

  // ── Blog ───────────────────────────────────────────────────
  const blog = [
    { slug: 'evolution-of-virtual-production', title: 'The Evolution of Virtual Production in 2026', category: 'Technology', coverImageUrl: '/images/services-lighting.jpg', excerpt: 'How LED volumes and real-time engines reshaped our shoots.', content: '<p>Virtual production has moved from novelty to core pipeline. In 2026, LED volumes let us light, shoot and finalize backgrounds in-camera.</p>' },
    { slug: 'casting-for-global-brands', title: 'Casting for Global Brands', category: 'Casting', coverImageUrl: '/images/careers-meeting.jpg', excerpt: 'Our approach to building diverse, on-brand talent rosters.', content: '<p>Great casting is strategy, not luck. We build shortlists around brand values, market fit and on-set chemistry.</p>' },
    { slug: 'color-grading-secrets', title: 'Color Grading Secrets of Cinematic Brands', category: 'Post-Production', coverImageUrl: '/images/bg-luxury.jpg', excerpt: 'The grade is where a film finds its soul.', content: '<p>From Kodak print emulation to Dolby Vision HDR, the grade defines mood. Here is how we approach a luxury spot.</p>' },
  ];
  for (const b of blog) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: { title: b.title, category: b.category, coverImageUrl: b.coverImageUrl, excerpt: b.excerpt, content: b.content, status: 'PUBLISHED', publishedAt: new Date(), deletedAt: null },
      create: { slug: b.slug, title: b.title, category: b.category, coverImageUrl: b.coverImageUrl, excerpt: b.excerpt, content: b.content, status: 'PUBLISHED', publishedAt: new Date(), authorId },
    });
  }
  console.log(`✅ Blog: ${blog.length}`);

  // ── Services ───────────────────────────────────────────────
  const services = [
    { slug: 'commercial-cinema', name: 'Commercial Cinema', category: 'Video', shortDesc: 'Premium brand commercials', description: 'Full-scale cinematic brand film production with storytelling, 4K cinematography, and professional color grading.', basePrice: 50000000, imageUrl: '/assets/service_pre_production.png' },
    { slug: 'corporate-documentary', name: 'Corporate Documentary', category: 'Video', shortDesc: 'Interviews & narrative', description: 'Professional corporate documentary production — interviews, B-roll, narrative scripting, and post-production.', basePrice: 30000000, imageUrl: '/assets/service_production.png' },
    { slug: 'high-fashion-lookbooks', name: 'High-Fashion Lookbooks', category: 'Photography', shortDesc: 'Editorial & runway', description: 'Editorial and runway campaigns for luxury fashion ateliers with full art direction.', basePrice: 40000000, imageUrl: '/assets/service_post_production.png' },
    { slug: 'post-color-grade', name: 'Post & Color Grade', category: 'Post-Production', shortDesc: 'Dolby Vision grading', description: 'Dolby Vision color grading, offline editing, and bespoke sound design.', basePrice: 20000000, imageUrl: '/assets/service_casting.png' },
    { slug: 'casting-roster', name: 'Casting & Roster', category: 'Talent', shortDesc: '1,200+ verified talent', description: 'Direct access to over 1,200 verified models and dramatic actors across India.', basePrice: 15000000, imageUrl: '/assets/service_production.png' },
    { slug: 'digital-campaigns', name: 'Digital Campaigns', category: 'Marketing', shortDesc: 'Social-first content', description: 'Reels, shorts and social-first campaign content built for reach and conversion.', basePrice: 25000000, imageUrl: '/assets/service_pre_production.png' },
  ];
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: { name: s.name, category: s.category, shortDesc: s.shortDesc, description: s.description, basePrice: s.basePrice, imageUrl: s.imageUrl, isActive: true, sortOrder: i, deletedAt: null },
      create: { slug: s.slug, name: s.name, category: s.category, shortDesc: s.shortDesc, description: s.description, basePrice: s.basePrice, imageUrl: s.imageUrl, isActive: true, sortOrder: i },
    });
  }
  console.log(`✅ Services: ${services.length}`);

  // ── Testimonials / Team / FAQ / Announcements (stable ids) ──
  const testimonials = [
    { id: 'seed-tst-1', clientName: 'Vikram Singhania', clientCompany: 'Vogue India', clientTitle: 'Creative Director', content: 'MP Production transformed our visual identity with a film that felt effortlessly premium.', rating: 5 },
    { id: 'seed-tst-2', clientName: 'Aria Mehta', clientCompany: 'Nike APAC', clientTitle: 'Brand Lead', content: 'The most seamless production partner we have worked with. On time, on brand, on budget.', rating: 5 },
    { id: 'seed-tst-3', clientName: 'Rohan Kapoor', clientCompany: 'Urban Footwear', clientTitle: 'CMO', content: 'Their casting and color work elevated our campaign far beyond expectations.', rating: 5 },
    { id: 'seed-tst-4', clientName: 'Neha Sharma', clientCompany: 'Harper Bazaar', clientTitle: 'Editor', content: 'A rare mix of artistry and reliability. We keep coming back.', rating: 5 },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: { clientName: t.clientName, clientCompany: t.clientCompany, clientTitle: t.clientTitle, content: t.content, rating: t.rating, isApproved: true, isPublished: true, sortOrder: i, deletedAt: null },
      create: { id: t.id, clientName: t.clientName, clientCompany: t.clientCompany, clientTitle: t.clientTitle, content: t.content, rating: t.rating, isApproved: true, isPublished: true, sortOrder: i },
    });
  }
  console.log(`✅ Testimonials: ${testimonials.length}`);

  const team = [
    { id: 'seed-team-1', name: 'Alok Verma', role: 'Executive Producer & Founder', photoUrl: '/images/careers-meeting.jpg', bio: 'Two decades of cinematic storytelling for global brands.', socialLinks: { linkedin: 'https://linkedin.com' } },
    { id: 'seed-team-2', name: 'Siddharth Roy', role: 'Lead Creative Director', photoUrl: '/images/about-bts.jpg', bio: 'Award-winning director across fashion and automotive.', socialLinks: { instagram: 'https://instagram.com' } },
    { id: 'seed-team-3', name: 'Ananya Iyer', role: 'Lead Casting Director', photoUrl: '/images/services-lighting.jpg', bio: 'Builds diverse, on-brand talent rosters.', socialLinks: {} },
    { id: 'seed-team-4', name: 'Vikramaditya Bose', role: 'Head of VFX & Color', photoUrl: '/images/bg-abstract.jpg', bio: 'Dolby Vision colorist and VFX supervisor.', socialLinks: {} },
  ];
  for (let i = 0; i < team.length; i++) {
    const m = team[i];
    await prisma.teamMember.upsert({
      where: { id: m.id },
      update: { name: m.name, role: m.role, photoUrl: m.photoUrl, bio: m.bio, socialLinks: m.socialLinks, isPublished: true, sortOrder: i, deletedAt: null },
      create: { id: m.id, name: m.name, role: m.role, photoUrl: m.photoUrl, bio: m.bio, socialLinks: m.socialLinks, isPublished: true, sortOrder: i },
    });
  }
  console.log(`✅ Team: ${team.length}`);

  const faq = [
    { id: 'seed-faq-1', question: 'How do I book a studio shoot?', answer: 'Submit an inquiry through the contact form or client portal and our producers will respond within 24 hours.', category: 'Booking' },
    { id: 'seed-faq-2', question: 'What is your revision policy?', answer: 'Every package includes two rounds of revisions; additional rounds are billed hourly.', category: 'Post-Production' },
    { id: 'seed-faq-3', question: 'Do you provide talent casting?', answer: 'Yes, we have a verified roster of 1,200+ models and actors available for any project.', category: 'Talent' },
    { id: 'seed-faq-4', question: 'What are typical timelines?', answer: 'Commercials run 3–6 weeks from brief to delivery depending on scope.', category: 'General' },
    { id: 'seed-faq-5', question: 'Do you shoot outside India?', answer: 'Yes, we regularly produce internationally with local fixer partners.', category: 'General' },
  ];
  for (let i = 0; i < faq.length; i++) {
    const f = faq[i];
    await prisma.faqItem.upsert({
      where: { id: f.id },
      update: { question: f.question, answer: f.answer, category: f.category, isPublished: true, sortOrder: i, deletedAt: null },
      create: { id: f.id, question: f.question, answer: f.answer, category: f.category, isPublished: true, sortOrder: i },
    });
  }
  console.log(`✅ FAQ: ${faq.length}`);

  const announcements = [
    { id: 'seed-ann-1', text: 'Summer 2026 booking slots are now open — reserve your production date today.', type: 'promo' },
    { id: 'seed-ann-2', text: 'New: Talent registration is live. Join our verified roster.', type: 'info' },
  ];
  for (let i = 0; i < announcements.length; i++) {
    const a = announcements[i];
    await prisma.announcement.upsert({
      where: { id: a.id },
      update: { text: a.text, type: a.type, isActive: true, sortOrder: i, deletedAt: null },
      create: { id: a.id, text: a.text, type: a.type, isActive: true, sortOrder: i },
    });
  }
  console.log(`✅ Announcements: ${announcements.length}`);

  // ── Site Config (hero, stats, pricing, seo, intro) ─────────
  const configs = {
    hero: { heading: 'Crafting Cinematic Excellence', subheading: 'A full-service creative house — high-fashion campaigns, cinematic commercials, and exclusive talent representation.', ctaText: 'Explore Portfolio', ctaUrl: '/portfolio', backgroundImage: '/images/portfolio-hero.jpg' },
    stats: [ { label: 'Productions Delivered', value: '480+' }, { label: 'Verified Talent', value: '1,200+' }, { label: 'Global Brands', value: '90+' }, { label: 'Awards Won', value: '35' } ],
    pricing: { tiers: [ { name: 'Essential', price: '₹1.5L', features: ['Half-day shoot', '1 edit', 'Basic grade'] }, { name: 'Signature', price: '₹5L', features: ['Full-day shoot', '3 edits', 'Dolby Vision grade'] }, { name: 'Bespoke', price: 'Custom', features: ['Multi-day', 'Unlimited edits', 'Full post suite'] } ] },
    seo: { title: 'MP Production — Cinematic Media House', description: 'High-fashion campaigns, cinematic commercials and exclusive talent representation.', image: '/images/portfolio-hero.jpg' },
    intro: { heading: 'A creative house built for the frame', imageUrl: '/images/portfolio-equipment.jpg' },
  };
  for (const [key, value] of Object.entries(configs)) {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(value), type: 'json' },
      create: { key, value: JSON.stringify(value), type: 'json' },
    });
  }
  console.log(`✅ Site configs: ${Object.keys(configs).length}`);

  console.log('\n🎉 CMS content seeded to Supabase.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
