import prisma from '../prisma/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('==================================================');
  console.log('   CAMPUSBRIDGE PRODUCTION DATABASE CLEANUP');
  console.log('==================================================');

  try {
    const ssrecId = 7;
    const keptEmails = ['zinointech@gmail.com', 'thevishwaofficial@gmail.com'];
    const defaultPassword = 'Vishwa@8105';
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);

    // 1. Verify that SSREC college exists
    const ssrecCollege = await prisma.college.findUnique({
      where: { id: ssrecId }
    });

    if (!ssrecCollege) {
      throw new Error(`Sri Sai Ranganathan Engineering College (ID: ${ssrecId}) was not found in the database! Cleanup aborted.`);
    }
    console.log(`✓ SSREC college found: ${ssrecCollege.name}`);

    // 2. Setup Super Admin (zinointech@gmail.com)
    const superAdminEmail = 'zinointech@gmail.com';
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail }
    });

    if (existingSuperAdmin) {
      await prisma.user.update({
        where: { email: superAdminEmail },
        data: {
          collegeId: ssrecId,
          role: 'SUPER_ADMIN',
          isVerified: true,
          verificationStatus: 'APPROVED'
        }
      });
      console.log(`✓ Super Admin user ${superAdminEmail} updated and mapped to SSREC (ID: ${ssrecId}).`);
    } else {
      await prisma.user.create({
        data: {
          name: 'Zinoin Super Admin',
          email: superAdminEmail,
          password: hashedDefaultPassword,
          role: 'SUPER_ADMIN',
          collegeId: ssrecId,
          isVerified: true,
          verificationStatus: 'APPROVED'
        }
      });
      console.log(`✓ Super Admin user ${superAdminEmail} created and mapped to SSREC (ID: ${ssrecId}).`);
    }

    // 3. Setup College Admin (thevishwaofficial@gmail.com)
    const collegeAdminEmailCorrect = 'thevishwaofficial@gmail.com';
    const collegeAdminEmailTypo = 'thevishwaoffical@gmail.com';

    const existingAdminCorrect = await prisma.user.findUnique({
      where: { email: collegeAdminEmailCorrect }
    });

    if (existingAdminCorrect) {
      await prisma.user.update({
        where: { email: collegeAdminEmailCorrect },
        data: {
          password: hashedDefaultPassword,
          collegeId: ssrecId,
          role: 'COLLEGE_ADMIN',
          isVerified: true,
          verificationStatus: 'APPROVED'
        }
      });
      console.log(`✓ College Admin user ${collegeAdminEmailCorrect} updated with correct password.`);
    } else {
      const existingAdminTypo = await prisma.user.findUnique({
        where: { email: collegeAdminEmailTypo }
      });

      if (existingAdminTypo) {
        await prisma.user.update({
          where: { email: collegeAdminEmailTypo },
          data: {
            email: collegeAdminEmailCorrect,
            password: hashedDefaultPassword,
            collegeId: ssrecId,
            role: 'COLLEGE_ADMIN',
            isVerified: true,
            verificationStatus: 'APPROVED'
          }
        });
        console.log(`✓ College Admin user spelling corrected: ${collegeAdminEmailTypo} -> ${collegeAdminEmailCorrect} and password set.`);
      } else {
        await prisma.user.create({
          data: {
            name: 'SSREC College Admin',
            email: collegeAdminEmailCorrect,
            password: hashedDefaultPassword,
            role: 'COLLEGE_ADMIN',
            collegeId: ssrecId,
            isVerified: true,
            verificationStatus: 'APPROVED'
          }
        });
        console.log(`✓ College Admin user ${collegeAdminEmailCorrect} created and mapped to SSREC.`);
      }
    }

    // 4. Determine IDs of users we are deleting (for reporting/safety)
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true }
    });
    const usersToDelete = allUsers.filter(u => !keptEmails.includes(u.email));
    const userIdsToDelete = usersToDelete.map(u => u.id);

    console.log(`\nDeleting data related to ${usersToDelete.length} other users...`);

    // 5. Delete dependent child records
    // Chats / Messages
    const delMsg = await prisma.message.deleteMany({});
    console.log(`- Deleted ${delMsg.count} messages`);

    // Notifications
    const delNotif = await prisma.notification.deleteMany({});
    console.log(`- Deleted ${delNotif.count} notifications`);

    // Notification Settings
    const delNotifSet = await prisma.notificationSetting.deleteMany({
      where: { userId: { in: userIdsToDelete } }
    });
    console.log(`- Deleted ${delNotifSet.count} notification settings`);

    // Gamification
    const delGam = await prisma.gamification.deleteMany({
      where: { userId: { in: userIdsToDelete } }
    });
    console.log(`- Deleted ${delGam.count} gamification records`);

    // Audit logs
    const delAudit = await prisma.auditLog.deleteMany({});
    console.log(`- Deleted ${delAudit.count} audit logs`);

    // Pending Users / Verification Tokens / Contacts
    const delPend = await prisma.pendingUser.deleteMany({});
    console.log(`- Deleted ${delPend.count} pending users`);

    const delTok = await prisma.verificationToken.deleteMany({});
    console.log(`- Deleted ${delTok.count} verification tokens`);

    const delCont = await prisma.contact.deleteMany({});
    console.log(`- Deleted ${delCont.count} contact messages`);

    // Career Roadmaps, Resume Analyses, Mentorship
    const delRoad = await prisma.careerRoadmap.deleteMany({});
    console.log(`- Deleted ${delRoad.count} career roadmaps`);

    const delRes = await prisma.resumeAnalysis.deleteMany({});
    console.log(`- Deleted ${delRes.count} resume analyses`);

    const delMentReq = await prisma.mentorshipRequest.deleteMany({});
    console.log(`- Deleted ${delMentReq.count} mentorship requests`);

    const delMentAch = await prisma.mentorshipAchievement.deleteMany({});
    console.log(`- Deleted ${delMentAch.count} mentorship achievements`);

    const delMentSlot = await prisma.mentorshipSlot.deleteMany({});
    console.log(`- Deleted ${delMentSlot.count} mentorship slots`);

    // Registrations / Webinars
    const delReg = await prisma.registration.deleteMany({});
    console.log(`- Deleted ${delReg.count} webinar registrations`);

    const delWeb = await prisma.webinar.deleteMany({});
    console.log(`- Deleted ${delWeb.count} webinars`);

    // Applications / Jobs
    const delApp = await prisma.application.deleteMany({});
    console.log(`- Deleted ${delApp.count} job applications`);

    const delJob = await prisma.job.deleteMany({});
    console.log(`- Deleted ${delJob.count} jobs`);

    // Placements / Referrals
    const delPlac = await prisma.placement.deleteMany({});
    console.log(`- Deleted ${delPlac.count} placements`);

    const delRef = await prisma.referral.deleteMany({});
    console.log(`- Deleted ${delRef.count} referrals`);

    const delReadiness = await prisma.placementReadiness.deleteMany({});
    console.log(`- Deleted ${delReadiness.count} placement readiness records`);

    // Students / Alumni Profiles
    const delStud = await prisma.student.deleteMany({});
    console.log(`- Deleted ${delStud.count} student profiles`);

    const delAlum = await prisma.alumni.deleteMany({});
    console.log(`- Deleted ${delAlum.count} alumni profiles`);

    // Announcements & Announcement Views
    const delAnnView = await prisma.announcementView.deleteMany({});
    console.log(`- Deleted ${delAnnView.count} announcement views`);

    const delAnn = await prisma.announcement.deleteMany({});
    console.log(`- Deleted ${delAnn.count} announcements`);

    // Subscriptions
    const delSub = await prisma.subscription.deleteMany({});
    console.log(`- Deleted ${delSub.count} subscriptions`);

    // Signup codes (delete those not belonging to SSREC)
    const delSign = await prisma.signupCode.deleteMany({
      where: { collegeId: { not: ssrecId } }
    });
    console.log(`- Deleted ${delSign.count} signup codes not belonging to SSREC`);

    // Departments (delete those not belonging to SSREC)
    const delDept = await prisma.department.deleteMany({
      where: { collegeId: { not: ssrecId } }
    });
    console.log(`- Deleted ${delDept.count} departments not belonging to SSREC`);

    // 6. Delete other users
    const delUser = await prisma.user.deleteMany({
      where: { NOT: { email: { in: keptEmails } } }
    });
    console.log(`- Deleted ${delUser.count} user accounts`);

    // 7. Delete other colleges
    const delColl = await prisma.college.deleteMany({
      where: { NOT: { id: ssrecId } }
    });
    console.log(`- Deleted ${delColl.count} college records`);

    console.log('\n==================================================');
    console.log('   CLEANUP COMPLETED SUCCESSFULLY');
    console.log('==================================================');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
