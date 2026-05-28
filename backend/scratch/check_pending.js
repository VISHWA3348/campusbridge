import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const pending = await prisma.pendingUser.findUnique({
    where: { email: 'test_student_1779947702147@test.com' }
  });
  console.log(pending ? 'Pending user inserted!' : 'Not inserted.');
  await prisma.$disconnect();
}
main();
