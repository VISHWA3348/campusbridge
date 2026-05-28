const { PrismaClient } = require('../node_modules/@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Vishwa%408105@db.oukaipvuibsgchpwkwzu.supabase.co:5432/postgres?sslmode=require'
    }
  }
});

async function run() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log(users);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
