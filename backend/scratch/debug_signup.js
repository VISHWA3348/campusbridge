import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugSignup() {
  console.log('--- DEBUGGING SIGNUP HANDLER FLOW ---');

  // Find signup code
  const sc = await prisma.signupCode.findFirst({
    where: { status: 'ACTIVE', role: 'STUDENT' },
    include: { college: true }
  });

  if (!sc) {
    console.error('No active student signup code found!');
    return;
  }

  const college = sc.college;
  console.log(`Using signup code: ${sc.code} for college: ${college.name} (Code: ${college.collegeCode})`);

  const testEmail = `prod_e2e_debug_${Date.now()}@test.com`;
  const payload = {
    name: 'Debug Student',
    email: testEmail,
    password: 'Password123!',
    role: 'STUDENT',
    collegeName: college.name,
    collegeCode: college.collegeCode,
    inviteCode: sc.code,
    collegeIdNumber: `ID-${Date.now()}`,
    departmentName: sc.departmentName || 'Computer Science and Engineering', 
    currentYear: sc.batch || '1',
    rollNumber: `ROLL-${Date.now()}`
  };

  try {
    const { 
      role, name, email, password, collegeName, collegeCode, inviteCode,
      departmentName, departmentId, rollNumber, collegeIdNumber, currentYear
    } = payload;

    console.log('Step 1: Checking college matching name & code...');
    const dbCollege = await prisma.college.findFirst({
      where: { name: collegeName, collegeCode: collegeCode },
      include: { departmentsList: true }
    });

    if (!dbCollege) {
      console.error('Invalid College Name or College ID. Please check your details.');
      return;
    }
    console.log('✓ College found:', dbCollege.id);

    console.log('Step 2: Checking signup code...');
    const dbSc = await prisma.signupCode.findUnique({
      where: { code: inviteCode },
      include: { college: true }
    });

    if (!dbSc || dbSc.status !== 'ACTIVE') {
      console.error('Invalid or Unauthorized Signup Code.');
      return;
    }
    console.log('✓ Signup code valid:', dbSc.id);

    const verifiedCollegeId = dbSc.collegeId;
    const verifiedDepartmentName = dbSc.departmentName || departmentName;
    const verifiedBatch = dbSc.batch || currentYear;

    console.log('Step 3: Checking duplicate roll number or college ID...');
    const duplicateStudent = await prisma.user.findFirst({
      where: {
        collegeId: dbCollege.id,
        OR: [
          { collegeIdNumber: collegeIdNumber },
          { student: { rollNumber: rollNumber } }
        ]
      }
    });

    if (duplicateStudent) {
      console.error('Duplicate roll number/college ID found.');
      return;
    }
    console.log('✓ Duplicate check passed');

    console.log('Step 4: Checking existing user...');
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error('User already exists');
      return;
    }
    console.log('✓ User exists check passed');

    console.log('Step 5: Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log('✓ Password hashed');

    console.log('Step 6: Pending user upsert...');
    const finalSignupData = {
      ...payload,
      collegeId: verifiedCollegeId,
      departmentName: verifiedDepartmentName,
      currentYear: verifiedBatch
    };

    const pending = await prisma.pendingUser.upsert({
      where: { email },
      update: { otp, signupData: JSON.stringify(finalSignupData), expiresAt },
      create: { email, otp, signupData: JSON.stringify(finalSignupData), expiresAt }
    });
    console.log('✓ Pending user upsert succeeded:', pending.id);

    // Clean up
    console.log('Cleaning up pending user...');
    await prisma.pendingUser.delete({ where: { email } });
    console.log('✓ Cleanup completed');

  } catch (err) {
    console.error('✗ ERROR during flow execution:', err);
  }
}

debugSignup().catch(console.error).finally(() => prisma.$disconnect());
