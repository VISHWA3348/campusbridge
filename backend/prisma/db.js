import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

process.on("beforeExit", async () => {
   await prisma.$disconnect();
});

// Auto-reconnect on connection drop (important for Render + Supabase)
async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await prisma.$connect();
      console.log('◇ Prisma connected to database');
      return;
    } catch (err) {
      console.error(`◆ DB connection attempt ${i}/${retries} failed:`, err.message);
      if (i < retries) await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Could not connect to database after multiple retries.');
}

export { connectWithRetry };
export default prisma;

