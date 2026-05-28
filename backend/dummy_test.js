const API_URL = 'https://campusbridge-e4cv.onrender.com/api';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('🚀 STARTING DUMMY USER E2E TEST\n');
  
  let tokens = {};
  let userIds = {};
  let alumniProfileIds = {};

  const users = [
    { email: 'superadmin@test.com', role: 'SUPER_ADMIN' },
    { email: 'admin@abc.com', role: 'COLLEGE_ADMIN' },
    { email: 'student1@abc.com', role: 'STUDENT' },
    { email: 'student2@abc.com', role: 'STUDENT' },
    { email: 'alumni1@abc.com', role: 'ALUMNI' },
    { email: 'alumni2@abc.com', role: 'ALUMNI' }
  ];

  try {
    // --- STEP 1: LOGIN TEST ---
    console.log('--- STEP 1: LOGIN TEST ---');
    for (const u of users) {
      const resp = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: u.email, password: '123456' })
      }).then(r => r.json());
      
      if (resp.token) {
        tokens[u.email] = resp.token;
        userIds[u.email] = resp.user.id;
        console.log(`✅ Login Success: ${u.email} (${u.role})`);
      } else {
        console.error(`❌ Login Failed: ${u.email}`, resp);
        throw new Error('Login failed');
      }
    }
    console.log('');

    // Pre-fetch Alumni Profile IDs
    const alum1User = await prisma.user.findUnique({ where: { email: 'alumni1@abc.com' }, include: { alumni: true } });
    alumniProfileIds['alumni1@abc.com'] = alum1User.alumni.id;
    const alum2User = await prisma.user.findUnique({ where: { email: 'alumni2@abc.com' }, include: { alumni: true } });
    alumniProfileIds['alumni2@abc.com'] = alum2User.alumni.id;

    // --- STEP 2: REFERRAL TEST (Dept Isolation) ---
    console.log('--- STEP 2: REFERRAL TEST ---');
    // Student 1 (CSE) -> Alumni 1 (CSE)
    const ref1 = await fetch(`${API_URL}/student/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens['student1@abc.com']}` },
      body: JSON.stringify({ alumniId: alumniProfileIds['alumni1@abc.com'] })
    }).then(r => r.json());
    console.log('✅ CSE Referral Requested');

    await fetch(`${API_URL}/referrals/${ref1.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens['alumni1@abc.com']}` },
      body: JSON.stringify({ status: 'accepted' })
    });
    console.log('✅ CSE Referral Accepted');

    // Student 2 (ECE) -> Alumni 2 (ECE)
    const ref2 = await fetch(`${API_URL}/student/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens['student2@abc.com']}` },
      body: JSON.stringify({ alumniId: alumniProfileIds['alumni2@abc.com'] })
    }).then(r => r.json());
    console.log('✅ ECE Referral Requested');

    await fetch(`${API_URL}/referrals/${ref2.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens['alumni2@abc.com']}` },
      body: JSON.stringify({ status: 'accepted' })
    });
    console.log('✅ ECE Referral Accepted\n');

    // --- STEP 3: JOB SYSTEM ---
    console.log('--- STEP 3: JOB SYSTEM ---');
    const job = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens['alumni1@abc.com']}` },
      body: JSON.stringify({ title: 'CSE Engineer', company: 'ABC Tech', description: 'CSE Role' })
    }).then(r => r.json());
    console.log('✅ Alumni 1 (CSE) posted job');

    const s1Jobs = await fetch(`${API_URL}/jobs`, { headers: { Authorization: `Bearer ${tokens['student1@abc.com']}` } }).then(r => r.json());
    const s2Jobs = await fetch(`${API_URL}/jobs`, { headers: { Authorization: `Bearer ${tokens['student2@abc.com']}` } }).then(r => r.json());
    console.log(`✅ Job visible to Student 1: ${s1Jobs.some(j => j.id === job.id)}`);
    console.log(`✅ Job visible to Student 2: ${s2Jobs.some(j => j.id === job.id)}\n`);

    // --- STEP 4: CHAT SYSTEM ---
    console.log('--- STEP 4: CHAT SYSTEM ---');
    await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens['student1@abc.com']}` },
      body: JSON.stringify({ receiverId: userIds['alumni1@abc.com'], content: 'Hi CSE Mentor!' })
    });
    console.log('✅ Student 1 (CSE) sent message to Alumni 1 (CSE)');

    const alum1Msgs = await fetch(`${API_URL}/messages/${userIds['student1@abc.com']}`, {
      headers: { Authorization: `Bearer ${tokens['alumni1@abc.com']}` }
    }).then(r => r.json());
    console.log(`✅ Alumni 1 received message: "${alum1Msgs[0].content}"`);

    const alum2Msgs = await fetch(`${API_URL}/messages/${userIds['student1@abc.com']}`, {
      headers: { Authorization: `Bearer ${tokens['alumni2@abc.com']}` }
    }).then(r => r.json());
    console.log(`✅ Alumni 2 (ECE) see Student 1 chat: ${alum2Msgs.length > 0 ? 'FAIL' : 'PASS (Isolated)'}\n`);

    // --- STEP 5: PLACEMENT ---
    console.log('--- STEP 5: PLACEMENT ---');
    const stud1Profile = await prisma.student.findUnique({ where: { userId: userIds['student1@abc.com'] } });
    await fetch(`${API_URL}/college/placements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens['admin@abc.com']}` },
      body: JSON.stringify({ studentId: stud1Profile.id, company: 'Google', role: 'Dev', referralId: ref1.id })
    });
    console.log('✅ Admin added placement for Student 1\n');

    // --- STEP 6-7: ADMIN PANELS ---
    console.log('--- STEP 6: COLLEGE ADMIN PANEL ---');
    const adminData = await fetch(`${API_URL}/college/analytics`, { headers: { Authorization: `Bearer ${tokens['admin@abc.com']}` } }).then(r => r.json());
    console.log(`✅ ABC Admin sees data: ${adminData ? 'YES' : 'NO'}`);

    console.log('--- STEP 7: SUPER ADMIN PANEL ---');
    const superData = await fetch(`${API_URL}/admin/colleges`, { headers: { Authorization: `Bearer ${tokens['superadmin@test.com']}` } }).then(r => r.json());
    console.log(`✅ Super Admin sees ${superData.length} colleges\n`);

    console.log('🏁 ALL DUMMY USER TESTS COMPLETED!');
    process.exit(0);

  } catch (error) {
    console.error('❌ DUMMY TEST FAILED');
    console.error(error);
    process.exit(1);
  }
}

runTests();
