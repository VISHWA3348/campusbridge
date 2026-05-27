import fetch from 'node-fetch';

async function runSessionTest() {
  const email = 'superadmin@test.com';
  const password = '123456';
  const API = 'http://localhost:5000/api';

  console.log('--- Simulating Re-login Session Flow ---');

  // 1. First Login
  console.log('\nStep 1: Performing first login...');
  const res1 = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log(`First Login Status: ${res1.status}`);
  const data1 = await res1.json();
  if (!res1.ok) {
    console.error('First login failed:', data1);
    return;
  }
  const token = data1.token;
  console.log('✔ First login successful. Token received.');

  // 2. Fetch Dashboard Analytics
  console.log('\nStep 2: Fetching dashboard analytics (simulating user navigation)...');
  const res2 = await fetch(`${API}/admin/analytics/overview`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Fetch Analytics Status: ${res2.status}`);
  const data2 = await res2.json();
  if (!res2.ok) {
    console.error('Fetch analytics failed:', data2);
  } else {
    console.log('✔ Dashboard analytics loaded successfully.');
  }

  // 3. Second Login (Re-login)
  console.log('\nStep 3: Performing second login (simulating logging in again)...');
  const res3 = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log(`Second Login Status: ${res3.status}`);
  const data3 = await res3.json();
  if (res3.ok) {
    console.log('✔ Second login SUCCESSFUL.');
  } else {
    console.error('❌ Second login FAILED:', data3);
  }
}

runSessionTest();
