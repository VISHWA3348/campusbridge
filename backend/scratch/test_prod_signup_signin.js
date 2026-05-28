import fetch from 'node-fetch';

const PRODUCTION_API = 'https://campusbridge-e4cv.onrender.com/api';
const SIGNUP_CODE = '7131-STUDENT-2026-FD1BC';
const TEST_EMAIL = `test_student_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Password123!';

async function runTest() {
  console.log('--- TESTING SIGNUP ---');
  
  const signupPayload = {
    name: 'Automated Prod Test',
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    role: 'STUDENT',
    collegeId: 7,
    inviteCode: SIGNUP_CODE, // Changed from signupCode to inviteCode
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

  if (signupRes.ok || signupRes.status === 403) {
      console.log('\n--- TESTING SIGNIN ---');
      console.log(`Logging in with ${TEST_EMAIL}...`);
      
      const loginRes = await fetch(`${PRODUCTION_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
      });
      
      const loginData = await loginRes.json();
      console.log(`Login Status: ${loginRes.status}`);
      console.log('Login Response:', loginData);
      
      if (loginRes.ok) {
          console.log('\n✅ Login Successful! Token received.');
      } else if (loginData.status === 'PENDING_APPROVAL') {
          console.log('\n✅ Login API works correctly! Received PENDING_APPROVAL status as expected for a new student.');
      } else {
          console.error('\n❌ Login Failed.');
      }
  } else {
      console.error('\n❌ Signup Failed, skipping login.');
  }
}

runTest().catch(console.error);
