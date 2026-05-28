import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const PRODUCTION_API = 'https://campusbridge-e4cv.onrender.com/api';
const JWT_SECRET = process.env.JWT_SECRET || 'Vishwa@8105';

// List of all API endpoints to validate per role
const ENDPOINTS = {
  SUPER_ADMIN: [
    { name: 'Analytics Overview', path: '/admin/analytics/overview' },
    { name: 'Placements List', path: '/admin/placements' },
    { name: 'Placement Stats', path: '/admin/placements/stats' },
    { name: 'Self Profile', path: '/admin/me' },
    { name: 'Colleges List', path: '/admin/colleges' },
    { name: 'Departments List', path: '/admin/departments' },
    { name: 'Users List', path: '/admin/users' },
    { name: 'Subscriptions List', path: '/admin/subscriptions' },
    { name: 'Subscription Analytics', path: '/admin/subscriptions/analytics' },
    { name: 'Plans List', path: '/admin/plans' },
    { name: 'Features List', path: '/admin/features' },
    { name: 'System Health', path: '/admin/system/health' },
    { name: 'Audit Logs', path: '/admin/audit-logs' }
  ],
  COLLEGE_ADMIN: [
    { name: 'Analytics', path: '/college/analytics' },
    { name: 'Students', path: '/college/students' },
    { name: 'Alumni', path: '/college/alumni' },
    { name: 'Pending Verifications', path: '/college/verifications/pending' },
    { name: 'Announcements', path: '/college/announcements' },
    { name: 'Announcement Analytics', path: '/college/announcements/analytics' },
    { name: 'Placements', path: '/college/placements' },
    { name: 'Placement Stats', path: '/college/placements/stats' },
    { name: 'Webinars', path: '/college/webinars' },
    { name: 'Referrals', path: '/college/referrals' }
  ],
  ALUMNI: [
    { name: 'Alumni Profile', path: '/alumni/profile' },
    { name: 'Referrals Request', path: '/alumni/referrals' },
    { name: 'Placements', path: '/alumni/placements' },
    { name: 'Webinars', path: '/alumni/webinars' },
    { name: 'Alumni Posted Jobs', path: '/jobs/alumni' },
    { name: 'Mentorship Requests', path: '/mentorship/requests' },
    { name: 'Own Slots', path: '/mentorship/my-slots' },
    { name: 'Mentorship Analytics', path: '/mentorship/analytics' }
  ],
  STUDENT: [
    { name: 'Profile/Dashboard', path: '/student/profile' },
    { name: 'Referrals', path: '/student/referrals' },
    { name: 'Webinars', path: '/student/webinars' },
    { name: 'Placements', path: '/student/placements' },
    { name: 'Alumni List', path: '/student/alumni' },
    { name: 'Announcements', path: '/student/announcements' },
    { name: 'All Jobs', path: '/jobs' },
    { name: 'My Job Applications', path: '/applications/my' },
    { name: 'Job Recommendations', path: '/recommendations' },
    { name: 'Resume Data', path: '/resume/data' },
    { name: 'Career Roadmaps', path: '/roadmap' },
    { name: 'Placement Readiness', path: '/tracker/readiness' },
    { name: 'My Mentorship Requests', path: '/mentorship/my-requests' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Notifications', path: '/notifications' }
  ]
};

async function testEndpoint(endpoint, token) {
  try {
    const url = `${PRODUCTION_API}${endpoint.path}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const contentType = res.headers.get('content-type') || '';
    let body = null;
    let isJson = false;

    if (contentType.includes('application/json')) {
      body = await res.json();
      isJson = true;
    } else {
      body = await res.text();
    }

    return {
      status: res.status,
      isOk: res.ok,
      isJson,
      name: endpoint.name,
      path: endpoint.path,
      error: res.ok ? null : (body?.error || body?.message || 'Request failed'),
      dataSample: isJson ? (Array.isArray(body) ? `Array[${body.length}]` : typeof body === 'object' ? Object.keys(body) : body) : 'Non-JSON response'
    };
  } catch (err) {
    return {
      status: 0,
      isOk: false,
      isJson: false,
      name: endpoint.name,
      path: endpoint.path,
      error: err.message,
      dataSample: null
    };
  }
}

async function runE2ETests() {
  console.log('==================================================');
  console.log('   CAMPUSBRIDGE PRODUCTION E2E DIAGNOSTIC SUITE');
  console.log('==================================================');

  // 1. Prisma & DB Connection Check
  console.log('\n[1] Checking Prisma Database connection...');
  try {
    const count = await prisma.user.count();
    console.log(`    ✓ Database Connected. Total Users: ${count}`);
  } catch (e) {
    console.error('    ✗ DB Connection Failed:', e.message);
    process.exit(1);
  }

  // 2. Fetch or Generate Users for each role
  console.log('\n[2] Identifying test users for roles...');
  const roles = ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'ALUMNI', 'STUDENT'];
  const users = {};

  for (const role of roles) {
    const user = await prisma.user.findFirst({
      where: { role },
      select: { id: true, email: true, collegeId: true }
    });

    if (user) {
      users[role] = user;
      console.log(`    ✓ Found ${role}: ${user.email} (ID: ${user.id}, College: ${user.collegeId})`);
    } else {
      console.warn(`    ⚠ No user found for role: ${role}`);
    }
  }

  // 3. Test Dashboard APIs for each role
  console.log('\n[3] Validating Dashboard APIs...');
  const results = {};

  for (const role of roles) {
    const user = users[role];
    if (!user) {
      console.log(`    [SKIP] ${role} (No test user available)`);
      continue;
    }

    console.log(`    Testing APIs as ${role} (${user.email})...`);
    
    // Sign JWT
    const token = jwt.sign(
      { userId: user.id, role, collegeId: user.collegeId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    results[role] = [];
    for (const ep of ENDPOINTS[role]) {
      const res = await testEndpoint(ep, token);
      results[role].push(res);
      if (res.isOk && res.isJson) {
        console.log(`      ✓ [${res.status}] ${res.name} (${res.path}) - Keys: ${JSON.stringify(res.dataSample)}`);
      } else {
        console.log(`      ✗ [${res.status}] ${res.name} (${res.path}) - ERROR: ${res.error}`);
      }
    }
  }

  // 4. Test Authentication & Signup flow in production
  console.log('\n[4] Validating Authentication flow (Signup -> OTP -> Login -> Cleanup)...');
  
  // Find a valid signup code first
  const activeCode = await prisma.signupCode.findFirst({
    where: { status: 'ACTIVE', role: 'STUDENT' },
    include: { college: true }
  });

  if (!activeCode) {
    console.warn('    ⚠ No active STUDENT signup code found in DB. Skipping signup flow testing.');
  } else {
    const college = activeCode.college;
    const testEmail = `prod_e2e_student_${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';
    const testRoll = `ROLL-${Date.now()}`;
    const testIdNum = `ID-${Date.now()}`;

    try {
      // Step A: Signup Request
      console.log(`    A. Attempting Signup for ${testEmail}...`);
      const signupPayload = {
        name: 'Prod E2E Test Student',
        email: testEmail,
        password: testPassword,
        role: 'STUDENT',
        collegeName: college.name,
        collegeCode: college.collegeCode,
        inviteCode: activeCode.code,
        collegeIdNumber: testIdNum,
        departmentName: activeCode.departmentName || 'Computer Science and Engineering', 
        currentYear: activeCode.batch || '1',
        rollNumber: testRoll
      };

      const signupRes = await fetch(`${PRODUCTION_API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload)
      });
      const signupData = await signupRes.json();
      console.log(`       Signup API status: ${signupRes.status}`);

      if (!signupRes.ok) {
        throw new Error(`Signup failed: ${signupData.error || JSON.stringify(signupData)}`);
      }

      // Step B: Retrieve OTP from database
      console.log('    B. Retrieving OTP from DB...');
      const pendingUser = await prisma.pendingUser.findUnique({ where: { email: testEmail } });
      if (!pendingUser) throw new Error('Pending user record not created in database.');
      const otp = pendingUser.otp;
      console.log(`       Retrieved OTP: ${otp}`);

      // Step C: Verify OTP
      console.log('    C. Verifying OTP...');
      const verifyRes = await fetch(`${PRODUCTION_API}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, otp, type: 'signup' })
      });
      const verifyData = await verifyRes.json();
      console.log(`       Verify API status: ${verifyRes.status}`);
      if (!verifyRes.ok) throw new Error(`Verification failed: ${verifyData.error}`);

      // Step D: Login
      console.log('    D. Testing Login...');
      // Mark verified status to bypass approval if we want to test dashboard loading for this user,
      // but let's test the response logic when PENDING_APPROVAL.
      const loginRes = await fetch(`${PRODUCTION_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      });
      const loginData = await loginRes.json();
      console.log(`       Login API status: ${loginRes.status}`);
      
      if (loginRes.status === 403 && loginData.status === 'PENDING_APPROVAL') {
        console.log('       ✓ Received expected PENDING_APPROVAL status (403)');
      } else if (loginRes.ok) {
        console.log('       ✓ Login successful!');
      } else {
        throw new Error(`Login response unexpected: ${JSON.stringify(loginData)}`);
      }

      // Step E: Clean up database records
      console.log('    E. Cleaning up test user records from database...');
      const createdUser = await prisma.user.findUnique({ where: { email: testEmail } });
      if (createdUser) {
        await prisma.student.deleteMany({ where: { userId: createdUser.id } });
        await prisma.user.delete({ where: { id: createdUser.id } });
        console.log('       ✓ Deleted test student and user records.');
      }

    } catch (err) {
      console.error('    ✗ Auth flow test failed:', err.message);
      // Clean up in case of failure
      try {
        const createdUser = await prisma.user.findUnique({ where: { email: testEmail } });
        if (createdUser) {
          await prisma.student.deleteMany({ where: { userId: createdUser.id } });
          await prisma.user.delete({ where: { id: createdUser.id } });
        }
        await prisma.pendingUser.deleteMany({ where: { email: testEmail } });
      } catch (cleanErr) {}
    }
  }

  console.log('\n==================================================');
  console.log('                 TESTING COMPLETED');
  console.log('==================================================');

  await prisma.$disconnect();
}

runE2ETests().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
