/**
 * Fixes production test accounts for E2E testing
 * - Ensures superadmin@test.com, admin@abc.com, student1@abc.com exist
 * - Sets password to bcrypt hash of '123456'
 * - Sets isVerified=true, verificationStatus='APPROVED'
 * 
 * SAFE: Only creates/updates test accounts. Does NOT touch other data.
 */

import prisma from '../prisma/db.js';
import bcrypt from 'bcryptjs';

const TEST_PASSWORD = '123456';
const TEST_ACCOUNTS = [
  {
    email: 'superadmin@test.com',
    name: 'Super Admin (Test)',
    role: 'SUPER_ADMIN',
    needsProfile: false
  },
  {
    email: 'admin@abc.com',
    name: 'College Admin (Test)',
    role: 'COLLEGE_ADMIN',
    needsProfile: false
  },
  {
    email: 'student1@abc.com',
    name: 'Test Student One',
    role: 'STUDENT',
    needsProfile: true,
    profileType: 'student'
  }
];

async function fixTestAccounts() {
  console.log('═'.repeat(60));
  console.log('  CampusBridge — Test Account Fixer');
  console.log('═'.repeat(60));

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  console.log(`\nHashed password for "${TEST_PASSWORD}": ${hashedPassword.substring(0, 20)}...`);

  // Find any college to use (first active one)
  const college = await prisma.college.findFirst({
    where: { status: 'active' }
  });

  if (!college) {
    console.error('❌ No active college found in database! Cannot create test accounts.');
    process.exit(1);
  }

  console.log(`\nUsing college: "${college.name}" (id=${college.id})`);

  for (const account of TEST_ACCOUNTS) {
    console.log(`\n→ Processing: ${account.email} (${account.role})`);

    try {
      const existing = await prisma.user.findUnique({
        where: { email: account.email },
        include: { student: true, alumni: true }
      });

      if (existing) {
        // Update password and verification status
        await prisma.user.update({
          where: { email: account.email },
          data: {
            password: hashedPassword,
            isVerified: true,
            verificationStatus: 'APPROVED',
            name: account.name
          }
        });
        console.log(`  ✅ Updated: password reset, verified, approved`);

        // Ensure student/alumni profile exists
        if (account.profileType === 'student' && !existing.student) {
          await prisma.student.create({
            data: { userId: existing.id, department: 'Computer Science', rollNumber: 'TEST001' }
          });
          console.log(`  ✅ Created missing student profile`);
        }
      } else {
        // Create the user
        const newUser = await prisma.user.create({
          data: {
            name: account.name,
            email: account.email,
            password: hashedPassword,
            role: account.role,
            collegeId: college.id,
            isVerified: true,
            verificationStatus: 'APPROVED'
          }
        });
        console.log(`  ✅ Created user id=${newUser.id}`);

        // Create profile if needed
        if (account.profileType === 'student') {
          await prisma.student.create({
            data: { userId: newUser.id, department: 'Computer Science', rollNumber: 'TEST001' }
          });
          console.log(`  ✅ Created student profile`);
        }
      }

      // Verify login would work
      const verifyUser = await prisma.user.findUnique({ where: { email: account.email } });
      const canLogin = await bcrypt.compare(TEST_PASSWORD, verifyUser.password);
      console.log(`  ${canLogin ? '✅' : '❌'} Password verify: ${canLogin ? 'OK' : 'FAILED'}`);
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  Done. Re-run the E2E test suite now.');
  console.log('═'.repeat(60) + '\n');

  await prisma.$disconnect();
}

fixTestAccounts().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
