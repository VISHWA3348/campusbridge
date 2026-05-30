import prisma from '../prisma/db.js';

const features = [
  'Chat System',
  'Job Portal',
  'Webinar Module',
  'Referral System',
  'Mentorship System',
  'Resume Analyzer',
  'Career Roadmap',
  'Placement Tracker',
  'Notifications',
  'Alumni Recommendations'
];

async function main() {
  console.log('Seeding feature toggles...');
  for (const featureName of features) {
    await prisma.featureToggle.upsert({
      where: { featureName },
      update: {},
      create: {
        featureName,
        enabled: true
      }
    });
  }
  console.log('Feature toggles seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
