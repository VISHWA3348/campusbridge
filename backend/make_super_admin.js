// Script to create super admin via the live production API
// Uses the existing superadmin@test.com account to create and promote the new user

const API = 'https://campusbridge-e4cv.onrender.com';
const EMAIL = 'zinointech@gmail.com';
const PASSWORD = 'Vishwa@8105';
const NAME = 'Zinoin Group Super Admin';

async function run() {
  try {
    // Step 1: Login as existing super admin to get token
    console.log('🔑 Logging in as existing super admin...');
    const loginRes = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@test.com', password: '123456' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginData);
      process.exit(1);
    }
    const token = loginData.token;
    console.log('✅ Logged in. Token received.');

    // Step 2: Check if user already exists by trying to login
    console.log(`\n🔍 Checking if ${EMAIL} already exists...`);
    const checkRes = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const checkData = await checkRes.json();

    if (checkRes.ok) {
      console.log(`⚠️  User already exists and can login: ${EMAIL}`);
      console.log(`   Role: ${checkData.user?.role}`);
      console.log(`   ID:   ${checkData.user?.id}`);
      if (checkData.user?.role === 'SUPER_ADMIN') {
        console.log('✅ User is already SUPER_ADMIN. Nothing to do!');
      } else {
        console.log('⬆️  User exists but is not SUPER_ADMIN. Please use the admin panel to promote them.');
      }
      return;
    }

    // Step 3: Create the user via the admin users endpoint
    console.log(`\n➕ Creating user ${EMAIL} via admin API...`);
    const createRes = await fetch(`${API}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: NAME,
        email: EMAIL,
        password: PASSWORD,
        role: 'SUPER_ADMIN',
        collegeId: loginData.user.collegeId
      })
    });
    const createData = await createRes.json();

    if (createRes.ok) {
      console.log('\n✅ User created successfully via API!');
      console.log(createData);
    } else {
      console.log(`\nℹ️  Admin create endpoint response (${createRes.status}):`, createData);
      console.log('\n🔄 Trying direct super admin creation endpoint...');

      // Try alternate super admin route
      const altRes = await fetch(`${API}/api/admin/create-super-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: NAME, email: EMAIL, password: PASSWORD })
      });
      const altData = await altRes.json();
      console.log(`Response (${altRes.status}):`, altData);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
