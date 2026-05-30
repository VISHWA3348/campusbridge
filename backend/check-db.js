import prisma from './prisma/db.js';

async function checkConnection() {
  try {
    console.log('Checking database connection...');
    await prisma.$connect();
    console.log('✔ Database connection successful.');
    process.exit(0);
  } catch (error) {
    console.error('✘ Database connection failed!');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
