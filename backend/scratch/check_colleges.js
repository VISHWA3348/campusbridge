import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkColleges() {
  try {
    const colleges = await prisma.college.findMany();
    console.log('Total Colleges:', colleges.length);
    colleges.forEach(c => {
      console.log(`- ${c.name} (Code: ${c.collegeCode}, Status: ${c.status})`);
    });
  } catch (error) {
    console.error('Error checking colleges:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkColleges();
