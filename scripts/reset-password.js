const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2] || 'admin@mpproduction.com';
  const newPassword = process.argv[3];
  const role = process.argv[4] || 'SUPER_ADMIN';

  if (!newPassword) {
    console.log('Usage: node scripts/reset-password.js <email> <newPassword> [role]');
    console.log('Example: node scripts/reset-password.js admin@mpproduction.com MyNewSecurePass123! SUPER_ADMIN');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Upsert: Create user if not exists, update passwordHash if exists
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword,
        isActive: true,
      },
      create: {
        email,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: role,
        isActive: true,
      },
    });

    console.log(`\n✅ Password successfully updated for: ${user.email} (Role: ${user.role})`);
  } catch (error) {
    console.error('\n❌ Error updating password:', error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
