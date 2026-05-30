import prisma from '../prisma/db.js';

async function main() {
  console.log('--- DATABASE COUNT DIAGNOSTIC ---');
  try {
    const users = await prisma.user.count();
    const students = await prisma.student.count();
    const alumni = await prisma.alumni.count();
    const referrals = await prisma.referral.count();
    const placements = await prisma.placement.count();
    const jobs = await prisma.job.count();
    const webinars = await prisma.webinar.count();
    const mentorshipRequests = await prisma.mentorshipRequest.count();
    const mentorshipSlots = await prisma.mentorshipSlot.count();
    const announcements = await prisma.announcement.count();
    const gamification = await prisma.gamification.count();

    console.log(`Users: ${users}`);
    console.log(`Students: ${students}`);
    console.log(`Alumni: ${alumni}`);
    console.log(`Referrals: ${referrals}`);
    console.log(`Placements: ${placements}`);
    console.log(`Jobs: ${jobs}`);
    console.log(`Webinars: ${webinars}`);
    console.log(`Mentorship Requests: ${mentorshipRequests}`);
    console.log(`Mentorship Slots: ${mentorshipSlots}`);
    console.log(`Announcements: ${announcements}`);
    console.log(`Gamification records: ${gamification}`);

    // Print all users to see roles and emails
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        verificationStatus: true,
        isVerified: true
      }
    });
    console.log('All Users:', allUsers);

  } catch (error) {
    console.error('Error running count diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
