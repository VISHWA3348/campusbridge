const users = [
  { email: 'zinointech@gmail.com', role: 'SUPER_ADMIN' },
  { email: 'thevishwaofficial@gmail.com', role: 'COLLEGE_ADMIN' }
];

async function testLogins() {
  for (const user of users) {
    try {
      const response = await fetch('https://campusbridge-e4cv.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: 'Vishwa@8105' })
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Login successful for ${user.role}: ${user.email} -> Token received`);
      } else {
        console.error(`❌ Login failed for ${user.role}: ${user.email} -> ${data.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(`❌ Error testing login for ${user.email}:`, e.message);
    }
  }
}

testLogins();
