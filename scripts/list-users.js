const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, isActive: true, createdAt: true },
    orderBy: { role: 'asc' },
  });
  console.log(`Total users: ${users.length}\n`);
  for (const u of users) {
    console.log(`${u.role.padEnd(16)} | ${u.email.padEnd(35)} | active=${u.isActive}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
