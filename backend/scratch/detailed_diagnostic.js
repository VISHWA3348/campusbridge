import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('=== DETAILED DIAGNOSTIC ===');
  const models = [
    'college', 'department', 'user', 'verificationToken', 'pendingUser',
    'student', 'placementReadiness', 'alumni', 'referral', 'placement',
    'announcement', 'announcementView', 'webinar', 'registration', 'job',
    'application', 'subscription', 'plan', 'auditLog', 'notification',
    'notificationSetting', 'message', 'gamification', 'featureToggle',
    'mentorshipRequest', 'resumeAnalysis', 'mentorshipSlot',
    'mentorshipAchievement', 'careerRoadmap', 'contact', 'signupCode'
  ];

  for (const m of models) {
    try {
      const count = await prisma[m].count();
      console.log(`${m}: ${count}`);
    } catch (e) {
      console.error(`Error counting ${m}:`, e.message);
    }
  }

  console.log('\n--- Sri Sai Ranganathan Engineering College (ID: 7) data details ---');
  try {
    const ssrec = await prisma.college.findUnique({
      where: { id: 7 },
      include: {
        users: {
          include: {
            student: true,
            alumni: true,
          }
        },
        departmentsList: true,
        subscription: true,
        signupCodes: true,
        jobs: true,
        webinars: true,
        announcements: true,
      }
    });

    if (!ssrec) {
      console.log('Sri Sai Ranganathan Engineering College (ID: 7) NOT found!');
    } else {
      console.log(`Name: ${ssrec.name}`);
      console.log(`Users count: ${ssrec.users.length}`);
      ssrec.users.forEach(u => {
        console.log(`  - User: ${u.email} (${u.role}), isVerified: ${u.isVerified}, Student: ${!!u.student}, Alumni: ${!!u.alumni}`);
      });
      console.log(`Departments count: ${ssrec.departmentsList.length}`);
      console.log(`Subscription: ${ssrec.subscription ? ssrec.subscription.plan : 'None'}`);
      console.log(`Signup codes count: ${ssrec.signupCodes.length}`);
      console.log(`Jobs count: ${ssrec.jobs.length}`);
      console.log(`Webinars count: ${ssrec.webinars.length}`);
      console.log(`Announcements count: ${ssrec.announcements.length}`);
    }
  } catch (e) {
    console.error('Error fetching SSREC details:', e);
  }

  console.log('\n--- Plans in database ---');
  try {
    const plans = await prisma.plan.findMany();
    console.log(plans);
  } catch (e) {
    console.error(e);
  }

  console.log('\n--- Feature Toggles in database ---');
  try {
    const toggles = await prisma.featureToggle.findMany();
    console.log(toggles);
  } catch (e) {
    console.error(e);
  }

  await prisma.$disconnect();
}

run();
