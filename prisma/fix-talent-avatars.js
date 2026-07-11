/**
 * Reassigns gender-matched, distinct portrait avatars to all TALENT users so
 * the name and face genders line up (e.g. Aarav = male, Aditi = female).
 * Uses randomuser.me gender-labeled portraits (men/0-99, women/0-99).
 * Run: node prisma/fix-talent-avatars.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Common Indian female first names used in the seed + a few extras.
const FEMALE = new Set([
  'ananya','aditi','aisha','diya','ira','kavya','neha','pooja','riya','shreya',
  'veena','zara','sneha','deepika','alia','kareena','kiara','sara','taapsee',
  'bhumi','katrina','anushka','priyanka','kajol','tara','meera','maya','elena',
  'nisha','isha','tanya','simran','divya','sanya','ridhi','naina',
]);

function isFemale(firstName) {
  return FEMALE.has((firstName || '').trim().toLowerCase());
}

// High-resolution Unsplash portrait pools (sharp square face crops), split by
// gender so names and faces line up. Cycled for variety across many talents.
const CROP = '?q=80&w=600&h=600&fit=crop&crop=faces';
const WOMEN_PORTRAITS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb',
].map((u) => u + CROP);
const MEN_PORTRAITS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce',
  'https://images.unsplash.com/photo-1463453091185-61582044d556',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
].map((u) => u + CROP);

async function main() {
  const talents = await prisma.user.findMany({
    where: { role: 'TALENT' },
    select: { id: true, firstName: true, email: true },
    orderBy: { createdAt: 'asc' },
  });

  let men = 0, women = 0, updated = 0;
  for (const t of talents) {
    const female = isFemale(t.firstName);
    const avatarUrl = female
      ? WOMEN_PORTRAITS[women++ % WOMEN_PORTRAITS.length]
      : MEN_PORTRAITS[men++ % MEN_PORTRAITS.length];
    await prisma.user.update({ where: { id: t.id }, data: { avatarUrl } });
    updated++;
  }

  console.log(`✅ Updated ${updated} talent avatars (women: ${women}, men: ${men}).`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
