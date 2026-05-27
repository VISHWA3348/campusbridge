import jwt from 'jsonwebtoken';

async function runDeepDiagnostics() {
  const API = 'https://campusbridge-e4cv.onrender.com/api';
  console.log('=== DEEP PRODUCTION DIAGNOSTIC ===\n');

  try {
    // Step 1: Login
    console.log('[1] Logging in as superadmin@test.com...');
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@test.com', password: '123456' })
    });

    const loginData = await loginRes.json();
    console.log('    Login HTTP Status:', loginRes.status);
    
    if (loginRes.status !== 200) {
      console.error('    LOGIN FAILED:', JSON.stringify(loginData));
      return;
    }

    const token = loginData.token;
    console.log('    Token received:', token ? 'YES' : 'NO');

    if (!token) {
      console.error('    No token in response');
      return;
    }

    // Step 2: Decode the token WITHOUT verifying
    const decoded = jwt.decode(token);
    console.log('\n[2] Token decoded payload:', JSON.stringify(decoded, null, 2));
    
    // Check expiry
    if (decoded?.exp) {
      const expDate = new Date(decoded.exp * 1000);
      console.log('    Token expires at:', expDate.toISOString());
      console.log('    Token expired:', expDate < new Date() ? 'YES !!!' : 'NO - still valid');
    }

    // Step 3: Try to verify with our LOCAL known secret
    const knownSecrets = ['Vishwa@8105', 'secret', 'jwt_secret', 'your_jwt_secret'];
    console.log('\n[3] Testing token verification against known secrets:');
    for (const secret of knownSecrets) {
      try {
        jwt.verify(token, secret);
        console.log(`    ✓ VALID with secret: "${secret}"`);
      } catch (e) {
        console.log(`    ✗ INVALID with secret: "${secret}" => ${e.message}`);
      }
    }

    // Step 4: Fetch profile
    console.log('\n[4] Fetching /profile/me with token...');
    const profileRes = await fetch(`${API}/profile/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('    Profile HTTP Status:', profileRes.status);
    const profileBody = await profileRes.text();
    console.log('    Profile Response:', profileBody);

    // Step 5: Test system health
    console.log('\n[5] Testing /admin/system/health...');
    const healthRes = await fetch(`${API}/admin/system/health`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('    Health HTTP Status:', healthRes.status);
    const healthBody = await healthRes.text();
    console.log('    Health Response:', healthBody);

  } catch (err) {
    console.error('Request failed:', err.message);
  }

  console.log('\n=== DIAGNOSTIC END ===');
}

runDeepDiagnostics();
