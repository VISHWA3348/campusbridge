import prisma from '../prisma/db.js';

async function diagnose() {
  console.log('=== DB DIAGNOSTIC ===');
  try {
    const toggles = await prisma.featureToggle.findMany();
    console.log('Feature Toggles:', toggles);

    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });
    console.log('Super Admin User:', superAdmin);

    if (superAdmin) {
      const notifSettings = await prisma.notificationSetting.findUnique({
        where: { userId: superAdmin.id }
      });
      console.log('Notification Settings for Super Admin:', notifSettings);
    }
  } catch (error) {
    console.error('Error during diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
