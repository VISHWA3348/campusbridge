async function runDiagnostics() {
  const API = 'https://campusbridge-e4cv.onrender.com/api';
  console.log('--- DIAGNOSTIC START ---');
  
  try {
    console.log('Logging in...');
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@test.com', password: '123456' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login Status:', loginRes.status);
    
    if (token) {
      console.log('Fetching profile...');
      const profileRes = await fetch(`${API}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Profile Status:', profileRes.status);
      const profileBody = await profileRes.text();
      console.log('Profile Body:', profileBody);
    } else {
      console.error('No token received');
    }
  } catch (err) {
    console.error('Request failed:', err.message);
  }

  console.log('--- DIAGNOSTIC END ---');
}

runDiagnostics();
