const BASE_URL = 'https://campusbridge-e4cv.onrender.com/api';

async function testBackend() {
  console.log('--- Starting Backend Verification ---');

  try {
    // 1. Signup
    console.log('\nTesting Signup...');
    const signupRes = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Student',
        email: 'john@example.com',
        password: 'password123',
        role: 'STUDENT',
        collegeName: 'IIT Bombay',
        collegeCode: 'IITB001'
      })
    });
    const signupData = await signupRes.json();
    console.log('Signup Response:', signupData);

    // 2. Login
    console.log('\nTesting Login...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
    const token = loginData.token;
    const userId = loginData.user.id;

    // 3. Create another user (Alumni)
    console.log('\nCreating Alumni User...');
    await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Alumni',
        email: 'jane@example.com',
        password: 'password123',
        role: 'ALUMNI',
        collegeCode: 'IITB001'
      })
    });

    const usersRes = await fetch(`${BASE_URL}/users`);
    const users = await usersRes.json();
    const alumni = users.find(u => u.role === 'ALUMNI');
    const alumniId = alumni.id;

    // 4. Create Job
    console.log('\nTesting Create Job...');
    const jobRes = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Software Engineer',
        company: 'Google',
        createdBy: alumniId
      })
    });
    console.log('Job Created:', await jobRes.json());

    // 5. Send Message
    console.log('\nTesting Send Message...');
    const msgRes = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: userId,
        receiverId: alumniId,
        content: 'Hello Jane, I would like a referral!'
      })
    });
    console.log('Message Sent:', await msgRes.json());

    // 6. Referral
    console.log('\nTesting Referral...');
    const refRes = await fetch(`${BASE_URL}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: userId,
        alumniId: alumniId,
        status: 'pending'
      })
    });
    console.log('Referral Created:', await refRes.json());

    console.log('\n--- Verification Completed Successfully ---');
  } catch (error) {
    console.error('\n--- Verification Failed ---');
    console.error(error);
  }
}

testBackend();
