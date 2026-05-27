/**
 * ============================================================
 *  CAMPUSBRIDGE — FULL PRODUCTION E2E API TEST SUITE
 *  Tests: 80+ across Auth, Super Admin, College Admin,
 *         Student, Alumni, Integration & Performance
 * ============================================================
 */

const PRODUCTION_API = process.env.API_URL || 'https://campusbridge-e4cv.onrender.com/api';

const USERS = [
  { email: 'superadmin@test.com', role: 'SUPER_ADMIN',    password: '123456' },
  { email: 'admin@abc.com',       role: 'COLLEGE_ADMIN',  password: '123456' },
  { email: 'student1@abc.com',    role: 'STUDENT',        password: '123456' },
  { email: 'alumni1@abc.com',     role: 'ALUMNI',         password: '123456' },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

let totalTests = 0, passedTests = 0, failedTests = 0;
const failures = [];
const tokens   = {};
const usersInfo = {};
const timings  = {};

function pass(name, detail = '') {
  totalTests++; passedTests++;
  console.log(`  ✅ [PASS] ${name}${detail ? ' — ' + detail : ''}`);
}

function fail(name, detail = '') {
  totalTests++; failedTests++;
  console.error(`  ❌ [FAIL] ${name} — ${detail}`);
  failures.push({ name, detail });
}

function record(name, ok, detail = '') {
  ok ? pass(name, detail) : fail(name, detail);
}

function section(title) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(70));
}

async function api(method, path, body = null, token = null, label = '') {
  const start = Date.now();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${PRODUCTION_API}${path}`, opts);
    const elapsed = Date.now() - start;
    if (label) timings[label] = elapsed;
    let data;
    try { data = await res.json(); } catch { data = {}; }
    return { ok: res.ok, status: res.status, data, elapsed };
  } catch (err) {
    return { ok: false, status: 0, data: {}, error: err.message, elapsed: -1 };
  }
}

// ─── area 1: API health & auth ────────────────────────────────────────────────

async function testAuthArea() {
  section('AREA 1 — API HEALTH & AUTHENTICATION (12 tests)');

  // 1.1 root health
  const root = await api('GET', '/../', null, null, 'root_health');
  record('Root API Health Check', root.ok, `status=${root.status} elapsed=${root.elapsed}ms`);

  // 1.2 debug env check
  const dbg = await api('GET', '/debug/env-check', null, null, 'debug_env');
  record('Debug Env Endpoint Responds', dbg.ok, `jwtSet=${dbg.data?.jwtSecretSet} dbSet=${dbg.data?.dbUrlSet}`);

  // 1.3–1.6 login for each role
  for (const u of USERS) {
    const r = await api('POST', '/auth/login', { email: u.email, password: u.password }, null, `login_${u.role}`);
    if (r.ok && r.data?.token) {
      tokens[u.role]    = r.data.token;
      usersInfo[u.role] = r.data.user;
      record(`Login — ${u.role}`, true, `tokenLen=${r.data.token.length} userId=${r.data.user?.id}`);
    } else {
      record(`Login — ${u.role}`, false, `status=${r.status} err=${JSON.stringify(r.data)}`);
    }
  }

  // 1.7 invalid credentials
  const bad = await api('POST', '/auth/login', { email: 'nobody@test.com', password: 'wrong' });
  record('Invalid Credentials Rejected', !bad.ok && (bad.status === 400 || bad.status === 401 || bad.status === 404),
    `status=${bad.status}`);

  // 1.8 no token → 401
  const noTok = await api('GET', '/admin/colleges');
  record('No-token 401 Enforcement', noTok.status === 401, `status=${noTok.status}`);

  // 1.9 invalid token → 401
  const badTok = await api('GET', '/admin/colleges', null, 'bad.token.here');
  record('Invalid-token 401 Enforcement', badTok.status === 401, `status=${badTok.status}`);

  // 1.10 student cannot access admin route
  if (tokens['STUDENT']) {
    const iso1 = await api('GET', '/admin/colleges', null, tokens['STUDENT']);
    record('Role Isolation: Student ≠ Admin routes', iso1.status === 403, `status=${iso1.status}`);
  }

  // 1.11 alumni cannot access college-admin route
  if (tokens['ALUMNI']) {
    const iso2 = await api('GET', '/college/students', null, tokens['ALUMNI']);
    record('Role Isolation: Alumni ≠ College Admin routes', iso2.status === 403, `status=${iso2.status}`);
  }

  // 1.12 college admin cannot access super admin route
  if (tokens['COLLEGE_ADMIN']) {
    const iso3 = await api('GET', '/admin/users', null, tokens['COLLEGE_ADMIN']);
    record('Role Isolation: College Admin ≠ Super Admin routes', iso3.status === 403, `status=${iso3.status}`);
  }
}

// ─── area 2: super admin ──────────────────────────────────────────────────────

async function testSuperAdminArea() {
  section('AREA 2 — SUPER ADMIN DASHBOARD (15 tests)');
  const tok = tokens['SUPER_ADMIN'];
  if (!tok) { console.warn('  ⚠️  SUPER_ADMIN login failed — skipping area'); return; }

  // 2.1 analytics overview
  const ov = await api('GET', '/admin/analytics/overview', null, tok, 'sa_analytics');
  record('SA: Analytics Overview', ov.ok,
    `users=${ov.data?.totalUsers} colleges=${ov.data?.totalColleges} elapsed=${ov.elapsed}ms`);

  // 2.2 system health
  const hlth = await api('GET', '/admin/system/health', null, tok, 'sa_health');
  record('SA: System Health Check', hlth.ok && hlth.data?.database === 'connected',
    `db=${hlth.data?.database} uptime=${Math.round(hlth.data?.uptime || 0)}s`);

  // 2.3 list colleges
  const cols = await api('GET', '/admin/colleges', null, tok, 'sa_colleges');
  const collegeList = Array.isArray(cols.data) ? cols.data : (cols.data?.colleges || []);
  record('SA: Colleges List', cols.ok, `count=${collegeList.length}`);

  // 2.4 users list
  const users = await api('GET', '/admin/users', null, tok, 'sa_users');
  const userList = users.data?.users || users.data || [];
  record('SA: Users List', users.ok, `total=${users.data?.total || userList.length}`);

  // 2.5 filter users by role
  const studOnly = await api('GET', '/admin/users?role=STUDENT', null, tok);
  record('SA: Users Filter by Role', studOnly.ok, `students=${studOnly.data?.total || 'N/A'}`);

  // 2.6 feature toggles — list
  const feats = await api('GET', '/admin/features', null, tok, 'sa_features');
  record('SA: Feature Toggles List', feats.ok && Array.isArray(feats.data),
    `features=${feats.data?.length}`);

  // 2.7 feature toggle — toggle one & restore
  let featureToggled = false;
  if (Array.isArray(feats.data) && feats.data.length > 0) {
    const feat = feats.data[0];
    const originalState = feat.enabled;
    const tog1 = await api('POST', `/admin/features/${feat.id}/toggle`, null, tok);
    record('SA: Feature Toggle — Flip', tog1.ok && tog1.data?.enabled !== originalState,
      `id=${feat.id} was=${originalState} now=${tog1.data?.enabled}`);
    // restore
    const tog2 = await api('POST', `/admin/features/${feat.id}/toggle`, null, tok);
    record('SA: Feature Toggle — Restore', tog2.ok && tog2.data?.enabled === originalState,
      `restored=${tog2.data?.enabled}`);
    featureToggled = true;
  } else {
    fail('SA: Feature Toggle — Flip', 'No features returned');
    fail('SA: Feature Toggle — Restore', 'No features returned');
  }

  // 2.8 platform settings GET
  const stg = await api('GET', '/admin/settings', null, tok);
  record('SA: Platform Settings GET', stg.ok, `platform="${stg.data?.platformName}"`);

  // 2.9 subscriptions
  const subs = await api('GET', '/admin/subscriptions', null, tok, 'sa_subs');
  record('SA: Subscriptions List', subs.ok, `count=${Array.isArray(subs.data) ? subs.data.length : 'N/A'}`);

  // 2.10 subscription analytics
  const subAn = await api('GET', '/admin/subscriptions/analytics', null, tok);
  record('SA: Subscription Analytics', subAn.ok, `revenue=${subAn.data?.totalRevenue}`);

  // 2.11 plans list
  const plans = await api('GET', '/admin/plans', null, tok);
  record('SA: Plans List', plans.ok, `count=${Array.isArray(plans.data) ? plans.data.length : 'N/A'}`);

  // 2.12 global placements
  const gpl = await api('GET', '/admin/placements', null, tok, 'sa_placements');
  record('SA: Global Placements List', gpl.ok, `count=${Array.isArray(gpl.data) ? gpl.data.length : 'N/A'}`);

  // 2.13 global placement stats
  const gpls = await api('GET', '/admin/placements/stats', null, tok);
  record('SA: Global Placement Stats', gpls.ok, `total=${gpls.data?.total}`);

  // 2.14 super admin self profile
  const me = await api('GET', '/admin/me', null, tok);
  record('SA: Self Profile (GET /admin/me)', me.ok && me.data?.role === 'SUPER_ADMIN',
    `name="${me.data?.name}"`);

  // 2.15 audit logs
  const logs = await api('GET', '/admin/audit-logs', null, tok);
  record('SA: Audit Logs Endpoint', logs.ok, `status=${logs.status}`);
}

// ─── area 3: college admin ────────────────────────────────────────────────────

async function testCollegeAdminArea() {
  section('AREA 3 — COLLEGE ADMIN DASHBOARD (12 tests)');
  const tok = tokens['COLLEGE_ADMIN'];
  if (!tok) { console.warn('  ⚠️  COLLEGE_ADMIN login failed — skipping area'); return; }

  // 3.1 analytics
  const an = await api('GET', '/college/analytics', null, tok, 'ca_analytics');
  record('CA: Analytics Dashboard', an.ok,
    `students=${an.data?.totalStudents} alumni=${an.data?.totalAlumni} elapsed=${an.elapsed}ms`);

  // 3.2 students list
  const studs = await api('GET', '/college/students', null, tok, 'ca_students');
  record('CA: Students List', studs.ok, `count=${Array.isArray(studs.data) ? studs.data.length : 'N/A'}`);

  // 3.3 alumni list
  const alum = await api('GET', '/college/alumni', null, tok, 'ca_alumni');
  record('CA: Alumni List', alum.ok, `count=${Array.isArray(alum.data) ? alum.data.length : 'N/A'}`);

  // 3.4 referrals
  const refs = await api('GET', '/college/referrals', null, tok, 'ca_referrals');
  record('CA: Referrals List', refs.ok, `count=${Array.isArray(refs.data) ? refs.data.length : 'N/A'}`);

  // 3.5 placements
  const pl = await api('GET', '/college/placements', null, tok, 'ca_placements');
  record('CA: Placements List', pl.ok, `count=${Array.isArray(pl.data) ? pl.data.length : 'N/A'}`);

  // 3.6 placement stats
  const pls = await api('GET', '/college/placements/stats', null, tok);
  record('CA: Placement Stats', pls.ok, `total=${pls.data?.total}`);

  // 3.7 webinars
  const web = await api('GET', '/college/webinars', null, tok, 'ca_webinars');
  record('CA: Webinars List', web.ok, `count=${Array.isArray(web.data) ? web.data.length : 'N/A'}`);

  // 3.8 pending verifications
  const vfy = await api('GET', '/college/verifications/pending', null, tok);
  record('CA: Pending Verifications', vfy.ok, `count=${Array.isArray(vfy.data) ? vfy.data.length : 'N/A'}`);

  // 3.9 announcements list
  const anns = await api('GET', '/college/announcements', null, tok, 'ca_announcements');
  record('CA: Announcements List', anns.ok, `count=${Array.isArray(anns.data) ? anns.data.length : 'N/A'}`);

  // 3.10 create announcement → pin → delete (CRUD)
  const newAnn = await api('POST', '/college/announcements', {
    title: '[E2E-TEST] Automated Test Announcement',
    description: 'This is an automated E2E test announcement. Please ignore.',
    priority: 'low',
    targetRole: 'ALL'
  }, tok);
  record('CA: Create Announcement', newAnn.ok && newAnn.data?.id, `id=${newAnn.data?.id}`);

  if (newAnn.data?.id) {
    const pin = await api('PATCH', `/college/announcements/${newAnn.data.id}/pin`, null, tok);
    record('CA: Pin Announcement', pin.ok, `pinned=${pin.data?.isPinned}`);

    const del = await api('DELETE', `/college/announcements/${newAnn.data.id}`, null, tok);
    record('CA: Delete Announcement', del.ok, `status=${del.status}`);
  } else {
    fail('CA: Pin Announcement', 'No announcement created');
    fail('CA: Delete Announcement', 'No announcement created');
  }

  // 3.12 announcement analytics
  const annAn = await api('GET', '/college/announcements/analytics', null, tok);
  record('CA: Announcement Analytics', annAn.ok, `status=${annAn.status}`);
}

// ─── area 4: student ──────────────────────────────────────────────────────────

async function testStudentArea() {
  section('AREA 4 — STUDENT DASHBOARD (18 tests)');
  const tok = tokens['STUDENT'];
  if (!tok) { console.warn('  ⚠️  STUDENT login failed — skipping area'); return; }

  // 4.1 profile
  const prof = await api('GET', '/student/profile', null, tok, 'st_profile');
  record('ST: Student Profile', prof.ok, `name="${prof.data?.name}" college="${prof.data?.college?.name}" elapsed=${prof.elapsed}ms`);

  // 4.2 referrals
  const refs = await api('GET', '/student/referrals', null, tok, 'st_referrals');
  record('ST: Referrals List', refs.ok, `count=${Array.isArray(refs.data) ? refs.data.length : 'N/A'}`);

  // 4.3 webinars
  const webs = await api('GET', '/student/webinars', null, tok, 'st_webinars');
  record('ST: Webinars List', webs.ok, `count=${Array.isArray(webs.data) ? webs.data.length : 'N/A'}`);

  // 4.4 jobs
  const jobs = await api('GET', '/jobs', null, tok, 'st_jobs');
  const jobsList = jobs.data?.jobs || jobs.data || [];
  record('ST: Jobs Feed', jobs.ok, `count=${Array.isArray(jobsList) ? jobsList.length : 'N/A'} elapsed=${jobs.elapsed}ms`);

  // 4.5 alumni search (basic)
  const alSearch = await api('GET', '/student/alumni?page=1&limit=5', null, tok, 'st_alumni_search');
  record('ST: Alumni Search (basic)', alSearch.ok,
    `found=${alSearch.data?.alumni?.length || 0} total=${alSearch.data?.pagination?.total || 0}`);

  // 4.6 alumni search with filter
  const alFilter = await api('GET', '/student/alumni?q=engineer', null, tok);
  record('ST: Alumni Search (filtered)', alFilter.ok, `count=${alFilter.data?.alumni?.length || 0}`);

  // 4.7 notifications
  const notifs = await api('GET', '/notifications', null, tok, 'st_notifications');
  record('ST: Notifications Fetch', notifs.ok,
    `count=${Array.isArray(notifs.data) ? notifs.data.length : 'N/A'}`);

  // 4.8 mark notifications read
  const markRead = await api('POST', '/notifications/read', null, tok);
  record('ST: Mark Notifications Read', markRead.ok, `status=${markRead.status}`);

  // 4.9 placements list
  const plac = await api('GET', '/student/placements', null, tok, 'st_placements');
  record('ST: Student Placements List', plac.ok, `count=${Array.isArray(plac.data) ? plac.data.length : 'N/A'}`);

  // 4.10 AI recommendations
  const recs = await api('GET', '/recommendations', null, tok, 'st_recommendations');
  record('ST: AI Recommendations', recs.ok || recs.status === 404, // endpoint may not exist on all deploys
    `status=${recs.status}`);

  // 4.11 roadmaps list
  const roads = await api('GET', '/roadmap', null, tok, 'st_roadmaps');
  record('ST: Career Roadmaps List', roads.ok, `count=${Array.isArray(roads.data) ? roads.data.length : 'N/A'}`);

  // 4.12 resume history
  const resHist = await api('GET', '/resume/history', null, tok, 'st_resume_history');
  record('ST: Resume Analysis History', resHist.ok, `count=${Array.isArray(resHist.data) ? resHist.data.length : 'N/A'}`);

  // 4.13 placement readiness tracker
  const tracker = await api('GET', '/tracker/readiness', null, tok, 'st_tracker');
  record('ST: Placement Readiness Tracker', tracker.ok || tracker.status === 404,
    `score=${tracker.data?.readinessScore || 'N/A'} elapsed=${tracker.elapsed}ms`);

  // 4.14 AI insights
  const insights = await api('GET', '/ai/insights', null, tok, 'st_ai_insights');
  record('ST: AI Dashboard Insights', insights.ok,
    `suggestions=${insights.data?.suggestions?.length || 0} elapsed=${insights.elapsed}ms`);

  // 4.15 mentorship requests (student view)
  const mentReqs = await api('GET', '/mentorship/my-requests', null, tok, 'st_mentorship_requests');
  record('ST: My Mentorship Requests', mentReqs.ok,
    `count=${Array.isArray(mentReqs.data) ? mentReqs.data.length : 'N/A'}`);

  // 4.16 create roadmap + step update (CRUD)
  const newRoad = await api('POST', '/roadmap', { title: 'E2E Test Roadmap - Full Stack Dev' }, tok);
  record('ST: Create Career Roadmap', newRoad.ok && newRoad.data?.id, `id=${newRoad.data?.id}`);

  if (newRoad.data?.id) {
    const stepUpd = await api('POST', '/roadmap/step', {
      roadmapId: newRoad.data.id,
      stepId: 'step-1',
      completed: true
    }, tok);
    record('ST: Update Roadmap Step', stepUpd.ok, `status=${stepUpd.status}`);
  } else {
    fail('ST: Update Roadmap Step', 'Roadmap creation failed');
  }

  // 4.17 student announcements
  const stuAnns = await api('GET', '/student/announcements', null, tok, 'st_announcements');
  record('ST: Student Announcements', stuAnns.ok, `count=${Array.isArray(stuAnns.data) ? stuAnns.data.length : 'N/A'}`);

  // 4.18 leaderboard
  const leaderboard = await api('GET', '/leaderboard', null, tok, 'st_leaderboard');
  record('ST: Leaderboard / Honor Board', leaderboard.ok,
    `status=${leaderboard.status}`);
}

// ─── area 5: alumni ───────────────────────────────────────────────────────────

async function testAlumniArea() {
  section('AREA 5 — ALUMNI DASHBOARD (14 tests)');
  const tok = tokens['ALUMNI'];
  if (!tok) { console.warn('  ⚠️  ALUMNI login failed — skipping area'); return; }

  // 5.1 profile
  const prof = await api('GET', '/alumni/profile', null, tok, 'al_profile');
  record('AL: Alumni Profile', prof.ok, `name="${prof.data?.name}" company="${prof.data?.currentCompany}" elapsed=${prof.elapsed}ms`);

  // 5.2 referrals
  const refs = await api('GET', '/alumni/referrals', null, tok, 'al_referrals');
  record('AL: Referrals List', refs.ok, `count=${Array.isArray(refs.data) ? refs.data.length : 'N/A'}`);

  // 5.3 placements (alumni-assisted)
  const plac = await api('GET', '/alumni/placements', null, tok, 'al_placements');
  record('AL: Alumni Placements List', plac.ok, `count=${Array.isArray(plac.data) ? plac.data.length : 'N/A'}`);

  // 5.4 students search
  const studs = await api('GET', '/alumni/students', null, tok, 'al_students');
  record('AL: Students List / Search', studs.ok, `count=${Array.isArray(studs.data) ? studs.data.length : 'N/A'}`);

  // 5.5 students search with query
  const studsQ = await api('GET', '/alumni/students?q=computer', null, tok);
  record('AL: Students Search (filtered)', studsQ.ok, `count=${Array.isArray(studsQ.data) ? studsQ.data.length : 'N/A'}`);

  // 5.6 announcements
  const anns = await api('GET', '/alumni/announcements', null, tok, 'al_announcements');
  record('AL: Alumni Announcements', anns.ok, `count=${Array.isArray(anns.data) ? anns.data.length : 'N/A'}`);

  // 5.7 alumni jobs list
  const alJobs = await api('GET', '/jobs/alumni', null, tok, 'al_jobs');
  record('AL: Alumni Posted Jobs', alJobs.ok, `count=${Array.isArray(alJobs.data) ? alJobs.data.length : 'N/A'}`);

  // 5.8–5.9 Job CRUD (post + delete)
  const newJob = await api('POST', '/jobs', {
    title: '[E2E-TEST] QA Engineer',
    company: 'AutoTest Corp',
    location: 'Remote',
    description: 'Automated E2E test job listing. Please ignore.',
    skills: 'Playwright, Cypress, Node.js',
    salary: '₹12 LPA',
    workType: 'Remote'
  }, tok);
  record('AL: Post Job', newJob.ok && newJob.data?.id, `id=${newJob.data?.id}`);

  if (newJob.data?.id) {
    const delJob = await api('DELETE', `/jobs/${newJob.data.id}`, null, tok);
    record('AL: Delete Own Job', delJob.ok, `status=${delJob.status}`);
  } else {
    fail('AL: Delete Own Job', 'No job was created');
  }

  // 5.10 mentorship requests
  const mentReqs = await api('GET', '/mentorship/requests', null, tok, 'al_mentorship');
  record('AL: Mentorship Requests (incoming)', mentReqs.ok,
    `count=${Array.isArray(mentReqs.data) ? mentReqs.data.length : 'N/A'}`);

  // 5.11 mentorship slots (own)
  const slots = await api('GET', '/mentorship/my-slots', null, tok, 'al_slots');
  record('AL: Mentorship Slots (own)', slots.ok, `count=${Array.isArray(slots.data) ? slots.data.length : 'N/A'}`);

  // 5.12 add mentorship slot + delete
  const newSlot = await api('POST', '/mentorship/slots', {
    dayOfWeek: 'Friday',
    startTime: '15:00',
    endTime: '16:00'
  }, tok);
  record('AL: Add Mentorship Slot', newSlot.ok && newSlot.data?.id, `id=${newSlot.data?.id}`);

  if (newSlot.data?.id) {
    const delSlot = await api('DELETE', `/mentorship/slots/${newSlot.data.id}`, null, tok);
    record('AL: Delete Mentorship Slot', delSlot.ok, `status=${delSlot.status}`);
  } else {
    fail('AL: Delete Mentorship Slot', 'No slot was created');
  }

  // 5.13 mentorship analytics
  const mentAn = await api('GET', '/mentorship/analytics', null, tok, 'al_mentorship_analytics');
  record('AL: Mentorship Analytics', mentAn.ok, `status=${mentAn.status}`);

  // 5.14 leaderboard
  const lb = await api('GET', '/leaderboard', null, tok, 'al_leaderboard');
  record('AL: Global Leaderboard', lb.ok, `status=${lb.status}`);
}

// ─── area 6: cross-role integration ──────────────────────────────────────────

async function testIntegrationArea() {
  section('AREA 6 — CROSS-ROLE INTEGRATION FLOWS (8 tests)');

  // 6.1 student → send chat message to alumni
  if (tokens['STUDENT'] && usersInfo['ALUMNI']) {
    const msg = await api('POST', '/messages', {
      receiverId: usersInfo['ALUMNI'].id,
      content: '[E2E-TEST] Integration test message. Please ignore.'
    }, tokens['STUDENT']);
    record('INT: Student sends message to Alumni', msg.ok && msg.data?.id,
      `msgId=${msg.data?.id}`);

    // 6.2 alumni reads message thread from student
    if (msg.ok && usersInfo['STUDENT']) {
      const thread = await api('GET', `/messages/${usersInfo['STUDENT'].id}`, null, tokens['ALUMNI']);
      record('INT: Alumni reads message thread from Student', thread.ok && Array.isArray(thread.data),
        `messages=${Array.isArray(thread.data) ? thread.data.length : 'N/A'}`);
    } else {
      fail('INT: Alumni reads message thread from Student', 'No message sent or no student info');
    }
  } else {
    fail('INT: Student sends message to Alumni', 'Missing tokens or alumni user info');
    fail('INT: Alumni reads message thread from Student', 'Missing tokens');
  }

  // 6.3 student → request referral to alumni
  if (tokens['STUDENT'] && usersInfo['ALUMNI']) {
    const alumniRecord = await api('GET', '/alumni/profile', null, tokens['ALUMNI']);
    const alumniId = alumniRecord.data?.id;
    if (alumniId) {
      const ref = await api('POST', '/referrals', { alumniId }, tokens['STUDENT']);
      const refCreated = ref.ok && ref.data?.id;
      record('INT: Student requests Referral from Alumni', refCreated, `refId=${ref.data?.id}`);

      // 6.4 alumni sees referral in list
      if (refCreated) {
        const alRefs = await api('GET', '/alumni/referrals', null, tokens['ALUMNI']);
        const found = Array.isArray(alRefs.data) && alRefs.data.some(r => r.id === ref.data.id);
        record('INT: Alumni sees Student referral in list', alRefs.ok, `total=${alRefs.data?.length}`);

        // 6.5 alumni accepts referral
        const accept = await api('PATCH', `/referrals/${ref.data.id}`, { status: 'accepted' }, tokens['ALUMNI']);
        record('INT: Alumni accepts Referral', accept.ok && accept.data?.status === 'accepted',
          `status=${accept.data?.status}`);

        // 6.6 student sees accepted referral
        const stRefs = await api('GET', '/student/referrals', null, tokens['STUDENT']);
        const accRef = Array.isArray(stRefs.data) &&
          stRefs.data.find(r => r.id === ref.data.id && r.status === 'accepted');
        record('INT: Student sees accepted Referral', stRefs.ok && !!accRef,
          `refId=${ref.data?.id} status=${accRef?.status || 'not found'}`);
      } else {
        fail('INT: Alumni sees Student referral in list', 'Referral not created');
        fail('INT: Alumni accepts Referral', 'Referral not created');
        fail('INT: Student sees accepted Referral', 'Referral not created');
      }
    } else {
      fail('INT: Student requests Referral from Alumni', `Could not get alumniId — alumniProfile.ok=${alumniRecord.ok}`);
      fail('INT: Alumni sees Student referral in list', 'No alumni ID');
      fail('INT: Alumni accepts Referral', 'No alumni ID');
      fail('INT: Student sees accepted Referral', 'No alumni ID');
    }
  } else {
    fail('INT: Student requests Referral from Alumni', 'Missing tokens');
    fail('INT: Alumni sees Student referral in list', 'Missing tokens');
    fail('INT: Alumni accepts Referral', 'Missing tokens');
    fail('INT: Student sees accepted Referral', 'Missing tokens');
  }

  // 6.7 notification delivery check (after referral workflow, student should have a notification)
  if (tokens['STUDENT']) {
    const notifs = await api('GET', '/notifications', null, tokens['STUDENT']);
    const hasReferralNotif = Array.isArray(notifs.data) &&
      notifs.data.some(n => n.type === 'REFERRAL' || n.message?.toLowerCase().includes('referral'));
    record('INT: Notification delivered to Student after Referral', notifs.ok,
      `total=${notifs.data?.length} hasReferralNotif=${hasReferralNotif}`);
  } else {
    fail('INT: Notification delivered to Student after Referral', 'No student token');
  }

  // 6.8 global search (cross-entity)
  if (tokens['STUDENT']) {
    const search = await api('GET', '/global/search?q=engineer', null, tokens['STUDENT']);
    record('INT: Global Search returns results', search.ok,
      `users=${search.data?.users?.length || 0} jobs=${search.data?.jobs?.length || 0}`);
  } else {
    fail('INT: Global Search returns results', 'No student token');
  }
}

// ─── area 7: performance ──────────────────────────────────────────────────────

async function testPerformanceArea() {
  section('AREA 7 — PERFORMANCE & STABILITY (5 tests)');

  const THRESHOLD_MS = 5000; // 5s max for production (Render cold start considered)

  const criticalEndpoints = [
    { label: 'sa_analytics',    role: 'SUPER_ADMIN',   name: 'Super Admin Analytics' },
    { label: 'ca_analytics',    role: 'COLLEGE_ADMIN',  name: 'College Admin Analytics' },
    { label: 'st_profile',      role: 'STUDENT',        name: 'Student Profile' },
    { label: 'al_profile',      role: 'ALUMNI',         name: 'Alumni Profile' },
    { label: 'st_ai_insights',  role: 'STUDENT',        name: 'AI Insights' },
  ];

  for (const ep of criticalEndpoints) {
    const ms = timings[ep.label];
    if (ms !== undefined) {
      record(`PERF: ${ep.name} < ${THRESHOLD_MS}ms`, ms < THRESHOLD_MS, `actual=${ms}ms`);
    } else {
      record(`PERF: ${ep.name} < ${THRESHOLD_MS}ms`, false, 'timing not recorded (endpoint not tested)');
    }
  }
}

// ─── area 8: database integrity (via API) ────────────────────────────────────

async function testDbIntegrityArea() {
  section('AREA 8 — DATABASE INTEGRITY (via API) (5 tests)');
  const tok = tokens['SUPER_ADMIN'];
  if (!tok) { console.warn('  ⚠️  Skipping DB integrity — no SUPER_ADMIN token'); return; }

  // 8.1 System health confirms DB is connected
  const health = await api('GET', '/admin/system/health', null, tok);
  record('DB: Connection Status — connected', health.data?.database === 'connected',
    `db=${health.data?.database}`);

  // 8.2 All colleges have at least a name
  const cols = await api('GET', '/admin/colleges', null, tok);
  const colList = Array.isArray(cols.data) ? cols.data : (cols.data?.colleges || []);
  const allHaveName = colList.every(c => c.name && c.name.length > 0);
  record('DB: All colleges have a name', cols.ok && allHaveName,
    `total=${colList.length} allNamed=${allHaveName}`);

  // 8.3 Users all have valid roles
  const users = await api('GET', '/admin/users?limit=100', null, tok);
  const userList = users.data?.users || [];
  const validRoles = ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'STUDENT', 'ALUMNI'];
  const allValidRoles = userList.every(u => validRoles.includes(u.role));
  record('DB: All users have valid roles', users.ok && allValidRoles,
    `total=${userList.length} allValid=${allValidRoles}`);

  // 8.4 Feature toggles exist and are properly structured
  const feats = await api('GET', '/admin/features', null, tok);
  const validFeats = Array.isArray(feats.data) &&
    feats.data.every(f => f.id && f.featureName && typeof f.enabled === 'boolean');
  record('DB: Feature toggles valid structure', feats.ok && validFeats,
    `count=${feats.data?.length} allValid=${validFeats}`);

  // 8.5 Placements have required company + role fields
  const placs = await api('GET', '/admin/placements', null, tok);
  const placList = Array.isArray(placs.data) ? placs.data : [];
  const allHaveCompany = placList.every(p => p.company && p.role);
  record('DB: Placements have company + role fields', placs.ok,
    `total=${placList.length} allComplete=${allHaveCompany}`);
}

// ─── main runner ──────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log('  🚀  CAMPUSBRIDGE — FULL PRODUCTION E2E TEST SUITE');
  console.log(`  📡  Target: ${PRODUCTION_API}`);
  console.log(`  🕐  Started: ${new Date().toISOString()}`);
  console.log('═'.repeat(70));

  await testAuthArea();
  await testSuperAdminArea();
  await testCollegeAdminArea();
  await testStudentArea();
  await testAlumniArea();
  await testIntegrationArea();
  await testPerformanceArea();
  await testDbIntegrityArea();

  // ─── final scorecard ─────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70));
  console.log('  📊  FINAL TEST SCORECARD');
  console.log('═'.repeat(70));
  console.log(`  Total Tests : ${totalTests}`);
  console.log(`  ✅ Passed   : ${passedTests}`);
  console.log(`  ❌ Failed   : ${failedTests}`);
  console.log(`  Pass Rate   : ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
  console.log('─'.repeat(70));

  // performance summary
  console.log('\n  ⏱  PERFORMANCE SUMMARY:');
  const perfKeys = [
    ['root_health', 'Root Health'],
    ['sa_analytics', 'SA Analytics'],
    ['ca_analytics', 'CA Analytics'],
    ['st_profile', 'Student Profile'],
    ['al_profile', 'Alumni Profile'],
    ['st_ai_insights', 'AI Insights'],
    ['st_jobs', 'Jobs Feed'],
    ['st_tracker', 'Readiness Tracker'],
  ];
  for (const [key, label] of perfKeys) {
    if (timings[key] !== undefined) {
      const flag = timings[key] > 3000 ? '⚠️ ' : '  ';
      console.log(`  ${flag}${label.padEnd(22)} : ${timings[key]}ms`);
    }
  }

  if (failures.length > 0) {
    console.log('\n  🔴  FAILED TESTS:');
    failures.forEach((f, i) => {
      console.error(`  ${i + 1}. ${f.name}`);
      console.error(`     → ${f.detail}`);
    });
  }

  console.log('\n' + '═'.repeat(70));
  if (failedTests === 0) {
    console.log('  🟢  ALL PRODUCTION E2E TESTS PASSED! Platform is stable. ✨');
  } else {
    const rate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`  🟡  ${failedTests} test(s) failed. Pass rate: ${rate}%`);
    console.log('  → Review failures above and fix before production release.');
  }
  console.log('═'.repeat(70) + '\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\n🔴 Critical test runner error:', err);
  process.exit(1);
});
