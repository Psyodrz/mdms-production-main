import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2] || 'admin@mpproduction.com';
  const newPassword = process.argv[3];

  if (!newPassword) {
    console.log('Usage: npx ts-node scripts/reset-password.ts <email> <newPassword>');
    console.log('Example: npx ts-node scripts/reset-password.ts admin@mpproduction.com MyNewSecurePass123!');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log(`Successfully updated password for ${updatedUser.email}`);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
