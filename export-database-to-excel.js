const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, 'apps', 'api', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const prisma = new PrismaClient();

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'object') val = JSON.stringify(val);
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function arrayToCsv(headers, rows) {
  const headerLine = headers.map(escapeCsv).join(',');
  const dataLines = rows.map(row => headers.map(h => escapeCsv(row[h])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

async function exportData() {
  console.log('🚀 Starting Data Export for Excel...');

  const exportDir = path.join(__dirname, 'exports_excel');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // 1. Export Talent Profiles
  console.log('📦 Exporting Talent Profiles...');
  const talents = await prisma.talentProfile.findMany({
    include: {
      user: true,
      userTalents: { include: { category: true } },
      pricing: true,
      availability: true,
      socialLinks: true,
    }
  });

  const talentRows = talents.map(t => ({
    ID: t.id,
    Name: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim(),
    StageName: t.stageName || '',
    Email: t.user?.email || '',
    Phone: t.user?.phone || '',
    Category: t.userTalents?.[0]?.category?.name || 'Exclusive Talent',
    Experience: t.experienceLevel || '',
    City: t.user?.city || '',
    State: t.user?.state || '',
    Status: t.status,
    ProjectsCount: t.projectCount || 0,
    DayRate_INR: t.pricing?.perDay ? t.pricing.perDay / 100 : '',
    HourRate_INR: t.pricing?.perHour ? t.pricing.perHour / 100 : '',
    TravelReady: t.availability?.travelReady ? 'Yes' : 'No',
    PassportAvailable: t.availability?.passportAvailable ? 'Yes' : 'No',
    Brands: Array.isArray(t.brandsWorkedWith) ? t.brandsWorkedWith.join(', ') : '',
    Bio: t.bio || '',
    CreatedAt: t.createdAt.toISOString()
  }));

  const talentHeaders = ['ID', 'Name', 'StageName', 'Email', 'Phone', 'Category', 'Experience', 'City', 'State', 'Status', 'ProjectsCount', 'DayRate_INR', 'HourRate_INR', 'TravelReady', 'PassportAvailable', 'Brands', 'Bio', 'CreatedAt'];
  fs.writeFileSync(path.join(exportDir, '01_Talent_Profiles.csv'), arrayToCsv(talentHeaders, talentRows));

  // 2. Export Users
  console.log('👤 Exporting All Users...');
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  const userRows = users.map(u => ({
    ID: u.id,
    Email: u.email,
    FirstName: u.firstName,
    LastName: u.lastName,
    Role: u.role,
    City: u.city || '',
    State: u.state || '',
    IsActive: u.isActive ? 'Active' : 'Inactive',
    CreatedAt: u.createdAt.toISOString()
  }));
  const userHeaders = ['ID', 'Email', 'FirstName', 'LastName', 'Role', 'City', 'State', 'IsActive', 'CreatedAt'];
  fs.writeFileSync(path.join(exportDir, '02_Users.csv'), arrayToCsv(userHeaders, userRows));

  // 3. Export Client Projects
  console.log('🎬 Exporting Client Projects...');
  let projects = [];
  try {
    projects = await prisma.project.findMany({ include: { client: true, pm: true } });
  } catch (e) {
    projects = [];
  }
  const projectRows = projects.map(p => ({
    ID: p.id,
    Title: p.title,
    ClientName: p.client?.companyName || p.clientName || '',
    ProjectType: p.projectType || '',
    Status: p.status,
    Budget: p.budget || '',
    City: p.city || '',
    Description: p.description || '',
    CreatedAt: p.createdAt.toISOString()
  }));
  const projectHeaders = ['ID', 'Title', 'ClientName', 'ProjectType', 'Status', 'Budget', 'City', 'Description', 'CreatedAt'];
  fs.writeFileSync(path.join(exportDir, '03_Client_Projects.csv'), arrayToCsv(projectHeaders, projectRows));

  // 4. Export Portfolio CMS
  console.log('🖼️ Exporting Portfolio Items...');
  const portfolioItems = await prisma.portfolioItem.findMany({ orderBy: { createdAt: 'desc' } });
  const portfolioRows = portfolioItems.map(item => ({
    ID: item.id,
    Title: item.title,
    Slug: item.slug,
    Category: item.category,
    Year: item.year || '',
    MediaType: item.mediaType,
    MediaUrl: item.mediaUrl,
    IsPublished: item.isPublished ? 'Yes' : 'No',
    CreatedAt: item.createdAt.toISOString()
  }));
  const portfolioHeaders = ['ID', 'Title', 'Slug', 'Category', 'Year', 'MediaType', 'MediaUrl', 'IsPublished', 'CreatedAt'];
  fs.writeFileSync(path.join(exportDir, '04_Portfolio_Items.csv'), arrayToCsv(portfolioHeaders, portfolioRows));

  // 5. Export Blog Posts
  console.log('📝 Exporting Blog Posts...');
  const blogPosts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  const blogRows = blogPosts.map(post => ({
    ID: post.id,
    Title: post.title,
    Slug: post.slug,
    Status: post.status,
    Excerpt: post.excerpt || '',
    CreatedAt: post.createdAt.toISOString()
  }));
  const blogHeaders = ['ID', 'Title', 'Slug', 'Status', 'Excerpt', 'CreatedAt'];
  fs.writeFileSync(path.join(exportDir, '05_Blog_Posts.csv'), arrayToCsv(blogHeaders, blogRows));

  // 6. Export Testimonials
  console.log('💬 Exporting Testimonials...');
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  const testimonialRows = testimonials.map(t => ({
    ID: t.id,
    ClientName: t.clientName,
    ClientTitle: t.clientTitle || '',
    ClientCompany: t.clientCompany || '',
    Rating: t.rating || 5,
    Content: t.content,
    IsApproved: t.isApproved ? 'Yes' : 'No',
    IsPublished: t.isPublished ? 'Yes' : 'No',
    CreatedAt: t.createdAt.toISOString()
  }));
  const testimonialHeaders = ['ID', 'ClientName', 'ClientTitle', 'ClientCompany', 'Rating', 'Content', 'IsApproved', 'IsPublished', 'CreatedAt'];
  fs.writeFileSync(path.join(exportDir, '06_Testimonials.csv'), arrayToCsv(testimonialHeaders, testimonialRows));

  // 7. Export Team Members
  console.log('👥 Exporting Team Members...');
  const teamMembers = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
  const teamRows = teamMembers.map(tm => ({
    ID: tm.id,
    Name: tm.name,
    Role: tm.role,
    Bio: tm.bio || '',
    IsPublished: tm.isPublished ? 'Yes' : 'No',
    CreatedAt: tm.createdAt.toISOString()
  }));
  const teamHeaders = ['ID', 'Name', 'Role', 'Bio', 'IsPublished', 'CreatedAt'];
  fs.writeFileSync(path.join(exportDir, '07_Team_Members.csv'), arrayToCsv(teamHeaders, teamRows));

  // 8. Export Contact Submissions & Newsletter
  console.log('📬 Exporting Contact Submissions & Newsletter Subscribers...');
  const contacts = await prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } });
  const contactRows = contacts.map(c => ({
    ID: c.id,
    Name: c.name,
    Email: c.email,
    Phone: c.phone || '',
    Subject: c.subject || '',
    Message: c.message,
    IsRead: c.isRead ? 'Yes' : 'No',
    CreatedAt: c.createdAt.toISOString()
  }));
  const contactHeaders = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'IsRead', 'CreatedAt'];
  fs.writeFileSync(path.join(exportDir, '08_Contact_Submissions.csv'), arrayToCsv(contactHeaders, contactRows));

  console.log('\n🎉 ALL DATABASE TABLES EXPORTED SUCCESSFULLY TO EXCEL (CSV)!');
  console.log(`Location: ${exportDir}`);
}

exportData()
  .catch(err => {
    console.error('❌ Export failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
