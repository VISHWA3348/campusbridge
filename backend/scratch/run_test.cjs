const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const codes = await prisma.signupCode.findMany();
  console.log('Signup Codes:', codes);
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  console.log('Users:', users);
}

main().finally(() => prisma.$disconnect());
