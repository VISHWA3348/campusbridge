import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const PRODUCTION_API = 'https://campusbridge-e4cv.onrender.com/api';
const SIGNUP_CODE = '7131-STUDENT-2026-FD1BC';
const TEST_EMAIL = `test_student_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Password123!';

async function runTest() {
  const prisma = new PrismaClient();
  console.log('--- TESTING SIGNUP IN PRODUCTION ---');
  
  const signupPayload = {
    name: 'Automated Prod Test',
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    role: 'STUDENT',
    collegeId: 7,
    inviteCode: SIGNUP_CODE,
    collegeIdNumber: `TEST-ID-${Date.now()}`,
    departmentName: 'Computer Science and Engineering', 
    currentYear: '1',
    courseDuration: '4'
  };

  console.log(`Signing up with email: ${TEST_EMAIL}...`);
  const signupRes = await fetch(`${PRODUCTION_API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupPayload)
  });
  
  const signupData = await signupRes.json();
  console.log(`Signup Status: ${signupRes.status}`);
  console.log('Signup Response:', signupData);

  if (signupRes.ok || signupRes.status === 201) {
      console.log('\n--- FETCHING OTP FROM DATABASE ---');
      await new Promise(r => setTimeout(r, 2000)); // wait for db insert
      const pendingUser = await prisma.pendingUser.findUnique({ where: { email: TEST_EMAIL } });
      
      if (!pendingUser) {
        console.error('Pending user not found in DB!');
        return;
      }
      
      const otp = pendingUser.otp;
      console.log(`Retrieved OTP: ${otp}`);
      
      console.log('\n--- VERIFYING OTP ---');
      const verifyRes = await fetch(`${PRODUCTION_API}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL, otp })
      });
      
      const verifyData = await verifyRes.json();
      console.log(`Verify Status: ${verifyRes.status}`);
      console.log('Verify Response:', verifyData);

      if (verifyRes.ok) {
          console.log('\n--- TESTING SIGNIN ---');
          console.log(`Logging in with ${TEST_EMAIL}...`);
          
          const loginRes = await fetch(`${PRODUCTION_API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
          });
          
          const loginData = await loginRes.json();
          console.log(`Login Status: ${loginRes.status}`);
          
          if (loginRes.ok) {
              console.log('\n✅ Login Successful! Token received.');
              console.log('--- ALL TESTS PASSED ---');
          } else if (loginData.status === 'PENDING_APPROVAL') {
              console.log('\n✅ Login API works correctly! Received PENDING_APPROVAL status as expected for a new student.');
              console.log('--- ALL TESTS PASSED ---');
          } else {
              console.error('\n❌ Login Failed:', loginData);
          }
      } else {
          console.error('\n❌ Verify Failed.');
      }
  } else {
      console.error('\n❌ Signup Failed.');
  }
  await prisma.$disconnect();
}

runTest().catch(console.error);
