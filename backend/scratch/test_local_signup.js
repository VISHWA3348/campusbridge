import fetch from 'node-fetch';

const PRODUCTION_API = 'http://localhost:5000/api';
const SIGNUP_CODE = '7131-STUDENT-2026-FD1BC';
const TEST_EMAIL = `test_student_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Password123!';

async function runTest() {
  console.log('--- TESTING SIGNUP LOCALLY ---');
  
  const signupPayload = {
    name: 'Automated Local Test',
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
}

runTest().catch(console.error);
