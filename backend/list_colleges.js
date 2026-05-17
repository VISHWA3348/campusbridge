import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const colleges = await prisma.college.findMany();
  console.log(JSON.stringify(colleges, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
