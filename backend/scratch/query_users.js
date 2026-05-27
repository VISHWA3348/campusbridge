import prisma from '../prisma/db.js';

async function main() {
  const users = await prisma.user.findMany({
    include: {
      student: true,
      alumni: true,
      college: true
    }
  });
  console.log(`Total users: ${users.length}`);
  for (const u of users) {
    console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | Verified: ${u.isVerified} | Status: ${u.verificationStatus} | College: ${u.college?.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
