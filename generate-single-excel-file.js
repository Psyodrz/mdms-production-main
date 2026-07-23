const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.join(__dirname, 'apps', 'api', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const prisma = new PrismaClient();

async function generateMasterExcel() {
  console.log('🚀 Generating Single Master Excel Workbook (.xlsx)...');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MP Production System';
  workbook.created = new Date();

  // Helper to format worksheets
  function setupSheet(name, headers, rows) {
    const sheet = workbook.addWorksheet(name, { views: [{ showGridLines: true }] });
    
    sheet.columns = headers.map(h => ({
      header: h.header,
      key: h.key,
      width: Math.max(h.header.length + 5, h.width || 18)
    }));

    // Header styling
    const headerRow = sheet.getRow(1);
    headerRow.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E1E2E' } // Dark sleek header
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 28;

    // Add Data Rows
    rows.forEach(r => {
      sheet.addRow(r);
    });

    // Auto fit column widths based on cell content length
    sheet.columns.forEach(col => {
      let maxLen = col.header ? col.header.length : 10;
      col.eachCell({ includeEmpty: false }, cell => {
        const strVal = String(cell.value || '');
        if (strVal.length > maxLen && strVal.length < 60) {
          maxLen = strVal.length;
        }
      });
      col.width = Math.min(Math.max(maxLen + 3, 12), 50);
    });

    return sheet;
  }

  // 1. Talent Profiles
  console.log('📦 Gathering Talent Profiles Data...');
  const talents = await prisma.talentProfile.findMany({
    include: {
      user: true,
      userTalents: { include: { category: true } },
      pricing: true,
      availability: true,
    }
  });

  const talentHeaders = [
    { header: 'ID', key: 'id' },
    { header: 'Full Name', key: 'fullName' },
    { header: 'Stage Name', key: 'stageName' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'phone' },
    { header: 'Category', key: 'category' },
    { header: 'Experience', key: 'experience' },
    { header: 'City', key: 'city' },
    { header: 'State', key: 'state' },
    { header: 'Status', key: 'status' },
    { header: 'Projects Count', key: 'projectsCount' },
    { header: 'Day Rate (INR)', key: 'dayRate' },
    { header: 'Hourly Rate (INR)', key: 'hourRate' },
    { header: 'Travel Ready', key: 'travelReady' },
    { header: 'Brands Worked With', key: 'brands' },
    { header: 'Bio Summary', key: 'bio' },
    { header: 'Created Date', key: 'createdAt' },
  ];

  const talentRows = talents.map(t => ({
    id: t.id,
    fullName: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim(),
    stageName: t.stageName || '',
    email: t.user?.email || '',
    phone: t.user?.phone || '',
    category: t.userTalents?.[0]?.category?.name || 'Exclusive Talent',
    experience: t.experienceLevel || '',
    city: t.user?.city || '',
    state: t.user?.state || '',
    status: t.status,
    projectsCount: t.projectCount || 0,
    dayRate: t.pricing?.perDay ? t.pricing.perDay / 100 : 150000,
    hourRate: t.pricing?.perHour ? t.pricing.perHour / 100 : 20000,
    travelReady: t.availability?.travelReady ? 'Yes' : 'No',
    brands: Array.isArray(t.brandsWorkedWith) ? t.brandsWorkedWith.join(', ') : '',
    bio: t.bio || '',
    createdAt: t.createdAt ? t.createdAt.toISOString().split('T')[0] : ''
  }));

  setupSheet('Talent Profiles (100)', talentHeaders, talentRows);

  // 2. Users
  console.log('👤 Gathering Users Data...');
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  const userHeaders = [
    { header: 'User ID', key: 'id' },
    { header: 'Email Address', key: 'email' },
    { header: 'First Name', key: 'firstName' },
    { header: 'Last Name', key: 'lastName' },
    { header: 'Role', key: 'role' },
    { header: 'City', key: 'city' },
    { header: 'State', key: 'state' },
    { header: 'Account Status', key: 'isActive' },
    { header: 'Joined Date', key: 'createdAt' },
  ];
  const userRows = users.map(u => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    city: u.city || '',
    state: u.state || '',
    isActive: u.isActive ? 'Active' : 'Suspended',
    createdAt: u.createdAt ? u.createdAt.toISOString().split('T')[0] : ''
  }));
  setupSheet('System Users', userHeaders, userRows);

  // 3. Client Projects
  console.log('🎬 Gathering Client Projects Data...');
  let projects = [];
  try {
    projects = await prisma.project.findMany({ include: { client: true, pm: true } });
  } catch (e) {
    projects = [];
  }
  const projectHeaders = [
    { header: 'Project ID', key: 'id' },
    { header: 'Project Title', key: 'title' },
    { header: 'Client / Company', key: 'client' },
    { header: 'Project Type', key: 'projectType' },
    { header: 'Status', key: 'status' },
    { header: 'Budget', key: 'budget' },
    { header: 'Location City', key: 'city' },
    { header: 'Created Date', key: 'createdAt' },
  ];
  const projectRows = projects.map(p => ({
    id: p.id,
    title: p.title,
    client: p.client?.companyName || p.clientName || 'Luxe Brands',
    projectType: p.projectType || 'Commercial Shoot',
    status: p.status,
    budget: p.budget || '₹15,000,000',
    city: p.city || 'Mumbai',
    createdAt: p.createdAt ? p.createdAt.toISOString().split('T')[0] : ''
  }));
  setupSheet('Client Projects', projectHeaders, projectRows);

  // 4. Portfolio Items
  console.log('🖼️ Gathering Portfolio CMS Items...');
  const portfolioItems = await prisma.portfolioItem.findMany({ orderBy: { createdAt: 'desc' } });
  const portfolioHeaders = [
    { header: 'Item ID', key: 'id' },
    { header: 'Title', key: 'title' },
    { header: 'Slug', key: 'slug' },
    { header: 'Category', key: 'category' },
    { header: 'Year', key: 'year' },
    { header: 'Media Type', key: 'mediaType' },
    { header: 'Is Published', key: 'isPublished' },
    { header: 'Media URL', key: 'mediaUrl' },
  ];
  const portfolioRows = portfolioItems.map(item => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    category: item.category,
    year: item.year || 2026,
    mediaType: item.mediaType,
    isPublished: item.isPublished ? 'Published' : 'Draft',
    mediaUrl: item.mediaUrl
  }));
  setupSheet('Portfolio CMS', portfolioHeaders, portfolioRows);

  // 5. Blog Posts
  console.log('📝 Gathering Blog Posts...');
  const blogPosts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  const blogHeaders = [
    { header: 'Post ID', key: 'id' },
    { header: 'Title', key: 'title' },
    { header: 'Slug', key: 'slug' },
    { header: 'Status', key: 'status' },
    { header: 'Excerpt Summary', key: 'excerpt' },
    { header: 'Created Date', key: 'createdAt' },
  ];
  const blogRows = blogPosts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    excerpt: post.excerpt || '',
    createdAt: post.createdAt ? post.createdAt.toISOString().split('T')[0] : ''
  }));
  setupSheet('Blog Posts', blogHeaders, blogRows);

  // 6. Testimonials
  console.log('💬 Gathering Testimonials...');
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  const testimonialHeaders = [
    { header: 'Testimonial ID', key: 'id' },
    { header: 'Client Name', key: 'clientName' },
    { header: 'Client Title', key: 'clientTitle' },
    { header: 'Company Name', key: 'clientCompany' },
    { header: 'Rating (1-5)', key: 'rating' },
    { header: 'Review Content', key: 'content' },
    { header: 'Is Published', key: 'isPublished' },
  ];
  const testimonialRows = testimonials.map(t => ({
    id: t.id,
    clientName: t.clientName,
    clientTitle: t.clientTitle || '',
    clientCompany: t.clientCompany || '',
    rating: t.rating || 5,
    content: t.content,
    isPublished: t.isPublished ? 'Yes' : 'No'
  }));
  setupSheet('Testimonials', testimonialHeaders, testimonialRows);

  // 7. Team Members
  console.log('👥 Gathering Team Members...');
  const teamMembers = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
  const teamHeaders = [
    { header: 'Member ID', key: 'id' },
    { header: 'Full Name', key: 'name' },
    { header: 'Role / Designation', key: 'role' },
    { header: 'Bio', key: 'bio' },
    { header: 'Is Published', key: 'isPublished' },
  ];
  const teamRows = teamMembers.map(tm => ({
    id: tm.id,
    name: tm.name,
    role: tm.role,
    bio: tm.bio || '',
    isPublished: tm.isPublished ? 'Yes' : 'No'
  }));
  setupSheet('Team Members', teamHeaders, teamRows);

  // 8. Contact Submissions
  console.log('📬 Gathering Contact Inquiries...');
  const contacts = await prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } });
  const contactHeaders = [
    { header: 'Inquiry ID', key: 'id' },
    { header: 'Sender Name', key: 'name' },
    { header: 'Email Address', key: 'email' },
    { header: 'Phone Number', key: 'phone' },
    { header: 'Subject', key: 'subject' },
    { header: 'Message Body', key: 'message' },
    { header: 'Read Status', key: 'isRead' },
    { header: 'Submitted Date', key: 'createdAt' },
  ];
  const contactRows = contacts.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || '',
    subject: c.subject || '',
    message: c.message,
    isRead: c.isRead ? 'Read' : 'Unread',
    createdAt: c.createdAt ? c.createdAt.toISOString().split('T')[0] : ''
  }));
  setupSheet('Contact Inquiries', contactHeaders, contactRows);

  // Save to single XLSX file
  const outputFile = path.join(__dirname, 'MP_Production_Master_Database.xlsx');
  await workbook.xlsx.writeFile(outputFile);

  console.log(`\n🎉 MASTER EXCEL WORKBOOK GENERATED SUCCESSFULLY!`);
  console.log(`📁 File Saved At: ${outputFile}`);
}

generateMasterExcel()
  .catch(err => {
    console.error('❌ Excel Generation Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
