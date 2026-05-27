import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- PASSWORD INTEGRITY DIAGNOSTIC ---');
  try {
    const users = await prisma.user.findMany();
    for (const user of users) {
      console.log(`User ID: ${user.id} | Email: ${user.email} | Role: ${user.role}`);
      if (!user.password) {
        console.log(`  ⚠️  Password is null/empty!`);
      } else {
        console.log(`  Password field length: ${user.password.length}`);
        // Test if bcrypt.compare throws an error
        try {
          const isMatch = await bcrypt.compare('123456', user.password);
          console.log(`  ✔ bcrypt.compare completed successfully (Match: ${isMatch})`);
        } catch (bcryptError) {
          console.error(`  ✘ bcrypt.compare FAILED:`, bcryptError.message);
        }
      }
    }
  } catch (error) {
    console.error('Diagnostic error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
