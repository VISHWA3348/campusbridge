// Using native Node.js global fetch
const PRODUCTION_API = process.env.API_URL || 'https://campusbridge-e4cv.onrender.com/api';

const USERS = [
  { email: 'superadmin@test.com', role: 'SUPER_ADMIN', password: '123456' },
  { email: 'admin@abc.com', role: 'COLLEGE_ADMIN', password: '123456' },
  { email: 'student1@abc.com', role: 'STUDENT', password: '123456' },
  { email: 'alumni1@abc.com', role: 'ALUMNI', password: '123456' }
];

async function runProductionTests() {
  console.log('======================================================================');
  console.log('       CAMPUSBRIDGE PRODUCTION END-TO-END API TEST SUITE              ');
  console.log(`Target Host: ${PRODUCTION_API}`);
  console.log('======================================================================\n');

  const tokens = {};
  const usersInfo = {};
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failuresList = [];

  function recordTest(name, passed, detail = '') {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`[PASS] ${name} ${detail ? `- ${detail}` : ''}`);
    } else {
      failedTests++;
      console.error(`[FAIL] ${name} - ${detail}`);
      failuresList.push({ name, detail });
    }
  }

  try {
    // --- AREA 1: AUTHENTICATION & ACCESS CONTROL ---
    console.log('--- AREA 1: AUTHENTICATION & LOGIN FLOW ---');
    
    // Test base API connection
    try {
      const rootRes = await fetch(PRODUCTION_API.replace('/api', '/'));
      const rootData = await rootRes.json();
      recordTest('Root API Health Check', rootRes.ok && rootData.message.includes('CampusBridge API'), `Response: ${JSON.stringify(rootData)}`);
    } catch (err) {
      recordTest('Root API Health Check', false, `Connection error: ${err.message}`);
    }

    // Login for each role
    for (const u of USERS) {
      try {
        console.log(`Attempting login for ${u.role} (${u.email})...`);
        const loginRes = await fetch(`${PRODUCTION_API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: u.email, password: u.password })
        });
        const loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.token) {
          tokens[u.role] = loginData.token;
          usersInfo[u.role] = loginData.user;
          recordTest(`Login for ${u.role}`, true, `Token received (length: ${loginData.token.length})`);
        } else {
          recordTest(`Login for ${u.role}`, false, `Status: ${loginRes.status}, Error: ${JSON.stringify(loginData)}`);
        }
      } catch (err) {
        recordTest(`Login for ${u.role}`, false, err.message);
      }
    }
    console.log('');

    // --- AREA 2: PROTECTED ROUTE / UNAUTHORIZED ACCESS BLOCKED ---
    console.log('--- AREA 2: SECURITY & PROTECTED ROUTES ---');
    try {
      const unauthRes = await fetch(`${PRODUCTION_API}/admin/colleges`);
      recordTest('Access Denied Without Token', unauthRes.status === 401 || unauthRes.status === 403, `Status code: ${unauthRes.status}`);
    } catch (err) {
      recordTest('Access Denied Without Token', false, err.message);
    }

    if (tokens['STUDENT']) {
      try {
        const studentAccessRes = await fetch(`${PRODUCTION_API}/admin/colleges`, {
          headers: { 'Authorization': `Bearer ${tokens['STUDENT']}` }
        });
        const bodyText = await studentAccessRes.text();
        recordTest('Role Isolation: Student cannot access Admin routes', studentAccessRes.status === 401 || studentAccessRes.status === 403, `Status code: ${studentAccessRes.status}, Body: ${bodyText.substring(0, 100)}`);
      } catch (err) {
        recordTest('Role Isolation Check', false, err.message);
      }
    }
    console.log('');

    // --- AREA 3: STUDENT DASHBOARD APIs ---
    console.log('--- AREA 3: STUDENT DASHBOARD DATA FLOW ---');
    if (tokens['STUDENT']) {
      try {
        const profRes = await fetch(`${PRODUCTION_API}/student/profile`, {
          headers: { 'Authorization': `Bearer ${tokens['STUDENT']}` }
        });
        const profile = await profRes.json();
        recordTest('Student Profile Fetch', profRes.ok, `Name: ${profile.name}, College: ${profile.college?.name || 'N/A'}`);
      } catch (err) {
        recordTest('Student Profile Fetch', false, err.message);
      }

      try {
        const refRes = await fetch(`${PRODUCTION_API}/student/referrals`, {
          headers: { 'Authorization': `Bearer ${tokens['STUDENT']}` }
        });
        const referrals = await refRes.json();
        recordTest('Student Referrals Fetch', refRes.ok, `Found: ${referrals.length} referral requests`);
      } catch (err) {
        recordTest('Student Referrals Fetch', false, err.message);
      }

      try {
        const webRes = await fetch(`${PRODUCTION_API}/student/webinars`, {
          headers: { 'Authorization': `Bearer ${tokens['STUDENT']}` }
        });
        const webinars = await webRes.json();
        recordTest('Student Webinars List', webRes.ok, `Found: ${webinars.length} webinars`);
      } catch (err) {
        recordTest('Student Webinars List', false, err.message);
      }

      try {
        const jobsRes = await fetch(`${PRODUCTION_API}/jobs`, {
          headers: { 'Authorization': `Bearer ${tokens['STUDENT']}` }
        });
        const jobData = await jobsRes.json();
        const jobsList = jobData.jobs || [];
        recordTest('Student Jobs Search Feed', jobsRes.ok, `Found: ${jobsList.length} jobs available`);
      } catch (err) {
        recordTest('Student Jobs Search Feed', false, err.message);
      }
    } else {
      console.warn('⚠️ Skipping STUDENT tests: Login failed');
    }
    console.log('');

    // --- AREA 4: ALUMNI DASHBOARD APIs & CRUD ---
    console.log('--- AREA 4: ALUMNI DASHBOARD & JOB POSTING ---');
    if (tokens['ALUMNI']) {
      try {
        const profRes = await fetch(`${PRODUCTION_API}/profile/me`, {
          headers: { 'Authorization': `Bearer ${tokens['ALUMNI']}` }
        });
        const profile = await profRes.json();
        recordTest('Alumni Profile Fetch', profRes.ok, `Bio: ${profile.bio || 'None'}`);
      } catch (err) {
        recordTest('Alumni Profile Fetch', false, err.message);
      }

      // Test posting a job
      let newJobId = null;
      try {
        const jobPayload = {
          title: 'Automated Test Engineer',
          company: 'AI Automation Inc',
          location: 'Remote',
          type: 'Full-time',
          description: 'Responsible for end-to-end production pipeline verification tests.',
          requirements: 'Node.js, Playwright, API Testing',
          salary: '$120,000',
          link: 'https://careers.example.com'
        };
        const createJobRes = await fetch(`${PRODUCTION_API}/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens['ALUMNI']}`
          },
          body: JSON.stringify(jobPayload)
        });
        const jobData = await createJobRes.json();
        newJobId = jobData.id;
        recordTest('Alumni Job Posting Creation', createJobRes.ok && newJobId !== undefined, `Created Job ID: ${newJobId}`);
      } catch (err) {
        recordTest('Alumni Job Posting Creation', false, err.message);
      }

      // Retrieve and cleanup the test job if created
      if (newJobId) {
        try {
          const deleteRes = await fetch(`${PRODUCTION_API}/jobs/${newJobId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokens['ALUMNI']}` }
          });
          const delData = await deleteRes.json();
          recordTest('Alumni Job Deletion', deleteRes.ok, `Status: ${deleteRes.status}, Response: ${JSON.stringify(delData)}`);
        } catch (err) {
          recordTest('Alumni Job Deletion', false, err.message);
        }
      }
    } else {
      console.warn('⚠️ Skipping ALUMNI tests: Login failed');
    }
    console.log('');

    // --- AREA 5: COLLEGE ADMIN ANALYTICS ---
    console.log('--- AREA 5: COLLEGE ADMIN DATA & ANALYTICS ---');
    if (tokens['COLLEGE_ADMIN']) {
      try {
        const statsRes = await fetch(`${PRODUCTION_API}/college/analytics`, {
          headers: { 'Authorization': `Bearer ${tokens['COLLEGE_ADMIN']}` }
        });
        const analytics = await statsRes.json();
        recordTest('College Admin Analytics Fetch', statsRes.ok, statsRes.ok ? `Analytics Keys: ${Object.keys(analytics).join(', ')}` : `Error response: ${JSON.stringify(analytics)}`);
      } catch (err) {
        recordTest('College Admin Analytics Fetch', false, err.message);
      }

      try {
        const studRes = await fetch(`${PRODUCTION_API}/college/students`, {
          headers: { 'Authorization': `Bearer ${tokens['COLLEGE_ADMIN']}` }
        });
        const students = await studRes.json();
        recordTest('College Admin Students Management', studRes.ok, studRes.ok ? `Total Registered Students: ${students.length}` : `Error response: ${JSON.stringify(students)}`);
      } catch (err) {
        recordTest('College Admin Students Management', false, err.message);
      }

      try {
        const alumRes = await fetch(`${PRODUCTION_API}/college/alumni`, {
          headers: { 'Authorization': `Bearer ${tokens['COLLEGE_ADMIN']}` }
        });
        const alumni = await alumRes.json();
        recordTest('College Admin Alumni Management', alumRes.ok, alumRes.ok ? `Total Registered Alumni: ${alumni.length}` : `Error response: ${JSON.stringify(alumni)}`);
      } catch (err) {
        recordTest('College Admin Alumni Management', false, err.message);
      }
    } else {
      console.warn('⚠️ Skipping COLLEGE_ADMIN tests: Login failed');
    }
    console.log('');

    // --- AREA 6: SUPER ADMIN CONTROLS & FEATURE TOGGLES ---
    console.log('--- AREA 6: SUPER ADMIN CONTROLS ---');
    if (tokens['SUPER_ADMIN']) {
      try {
        const healthRes = await fetch(`${PRODUCTION_API}/admin/system/health`, {
          headers: { 'Authorization': `Bearer ${tokens['SUPER_ADMIN']}` }
        });
        const health = await healthRes.json();
        recordTest('System Health Verification', healthRes.ok, healthRes.ok ? `Database Status: ${health.database}, Uptime: ${Math.round(health.uptime)}s` : `Error response: ${JSON.stringify(health)}`);
      } catch (err) {
        recordTest('System Health Verification', false, err.message);
      }

      try {
        const featuresRes = await fetch(`${PRODUCTION_API}/admin/features`, {
          headers: { 'Authorization': `Bearer ${tokens['SUPER_ADMIN']}` }
        });
        const features = await featuresRes.json();
        recordTest('Feature Toggles List Fetch', featuresRes.ok, featuresRes.ok ? `Total Features Configured: ${features.length}` : `Error response: ${JSON.stringify(features)}`);
      } catch (err) {
        recordTest('Feature Toggles List Fetch', false, err.message);
      }
    } else {
      console.warn('⚠️ Skipping SUPER_ADMIN tests: Login failed');
    }
    console.log('');

    // --- AREA 7: WEBSOCKET & CHAT REST APIS ---
    console.log('--- AREA 7: REAL-TIME CHAT INTEGRATION ---');
    if (tokens['STUDENT'] && tokens['ALUMNI']) {
      try {
        const receiverId = usersInfo['ALUMNI'].id;
        const msgPayload = { receiverId, content: 'Production E2E Automated Verification Message' };
        
        const sendRes = await fetch(`${PRODUCTION_API}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens['STUDENT']}`
          },
          body: JSON.stringify(msgPayload)
        });
        const msg = await sendRes.json();
        recordTest('Send Message API', sendRes.ok, sendRes.ok ? `Message Created with ID: ${msg.id}` : `Error response: ${JSON.stringify(msg)}`);
      } catch (err) {
        recordTest('Send Message API', false, err.message);
      }
    } else {
      console.warn('⚠️ Skipping Chat System tests: STUDENT/ALUMNI token missing');
    }
    console.log('');

  } catch (globalError) {
    console.error('❌ Critical error during test execution:', globalError);
  }

  // --- FINAL SCORE CARD ---
  console.log('======================================================================');
  console.log('                       E2E TEST RESULT SUMMARY                       ');
  console.log(`Total Hires/Tests Ran: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log('======================================================================');

  if (failedTests > 0) {
    console.error('\n🔴 Detailed Failures List:');
    failuresList.forEach((f, idx) => {
      console.error(`${idx + 1}. ${f.name} => ${f.detail}`);
    });
    process.exit(1);
  } else {
    console.log('\n🟢 ALL PRODUCTION END-TO-END API TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runProductionTests();
