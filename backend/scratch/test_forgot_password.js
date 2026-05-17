import axios from 'axios';

async function testForgotPassword() {
  const email = 'superadmin@test.com'; // Use a known email from our check_db.js
  
  try {
    console.log('Testing Forgot Password...');
    const forgotRes = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
    console.log('Forgot Password response:', forgotRes.data);

    // Note: I can't easily get the OTP from email in this script without checking DB
    // So I'll just check if the rate limiting works
    console.log('Testing Rate Limiting...');
    for (let i = 0; i < 4; i++) {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
        console.log(`Request ${i+2} successful`);
      } catch (e) {
        console.log(`Request ${i+2} failed as expected:`, e.response?.data?.error);
      }
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testForgotPassword();
