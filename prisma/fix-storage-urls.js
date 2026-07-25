/**
 * Repairs Supabase Storage URLs that are missing the `/public/` segment.
 *
 * Broken:  https://<ref>.supabase.co/storage/v1/object/mp-cms/gallery/x.png
 * Fixed:   https://<ref>.supabase.co/storage/v1/object/public/mp-cms/gallery/x.png
 *
 * Idempotent — only rewrites URLs that lack public/sign/authenticated/render
 * right after `/storage/v1/object/`. Safe to run multiple times.
 *
 * Run: node prisma/fix-storage-urls.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BAD = /\/storage\/v1\/object\/(?!public\/|sign\/|authenticated\/|render\/)/g;
const fixUrl = (u) => (typeof u === 'string' ? u.replace(BAD, '/storage/v1/object/public/') : u);

// model delegate name -> string fields that may hold storage URLs
const TARGETS = {
  mediaAsset: ['url'],
  course: ['image', 'instructorAvatar', 'trailerVideoUrl'],
  portfolioItem: ['mediaUrl', 'thumbnailUrl'],
  blogPost: ['coverImageUrl'],
  teamMember: ['photoUrl'],
  testimonial: ['clientPhoto'],
  service: ['imageUrl'],
};

async function fixModel(model, fields) {
  let scanned = 0;
  let fixed = 0;
  try {
    const rows = await prisma[model].findMany();
    scanned = rows.length;
    for (const row of rows) {
      const patch = {};
      for (const f of fields) {
        const before = row[f];
        const after = fixUrl(before);
        if (typeof before === 'string' && after !== before) patch[f] = after;
      }
      if (Object.keys(patch).length > 0) {
        await prisma[model].update({ where: { id: row.id }, data: patch });
        fixed++;
      }
    }
    console.log(`  ${model}: scanned ${scanned}, fixed ${fixed}`);
  } catch (e) {
    console.warn(`  ${model}: skipped (${e.message.split('\n')[0]})`);
  }
}

async function main() {
  console.log('Repairing Supabase storage URLs missing /public/ ...');
  for (const [model, fields] of Object.entries(TARGETS)) {
    await fixModel(model, fields);
  }
  console.log('✅ Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
