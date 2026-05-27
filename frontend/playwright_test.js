import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const FRONTEND_URL = process.env.APP_URL || 'https://campusbridge.zinoingroup.in';

const CREDENTIALS = {
  SUPER_ADMIN: { email: 'superadmin@test.com', password: '123456', name: 'Super Admin' },
  COLLEGE_ADMIN: { email: 'admin@abc.com', password: '123456', name: 'College Admin' },
  STUDENT: { email: 'student1@abc.com', password: '123456', name: 'Student' },
  ALUMNI: { email: 'alumni1@abc.com', password: '123456', name: 'Alumni' }
};

const SCREENSHOT_DIR = path.resolve('scratch/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPlaywrightTests() {
  console.log('======================================================================');
  console.log('       CAMPUSBRIDGE PRODUCTION PLAYWRIGHT UI TEST SUITE               ');
  console.log(`Target Host: ${FRONTEND_URL}`);
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  let passedCount = 0;
  let failedCount = 0;

  async function checkStep(name, actionFn) {
    try {
      console.log(`⏳ Testing: ${name}...`);
      await actionFn();
      console.log(`✅ [PASS] ${name}\n`);
      passedCount++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name} => ${err.message}`);
      const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      try {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `fail_${safeName}.png`), fullPage: true });
        console.log(`📸 Screenshot saved: scratch/screenshots/fail_${safeName}.png`);
      } catch (screenshotErr) {
        console.error('Failed to take screenshot:', screenshotErr.message);
      }
      failedCount++;
    }
  }

  // --- STEP 1: LANDING PAGE RESOLUTION ---
  await checkStep('Landing Page Loading & Meta Verification', async () => {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const title = await page.title();
    console.log(`Page Title: "${title}"`);
    
    // Check if hero content or main heading exists
    const h1Text = await page.locator('h1').first().innerText();
    console.log(`H1 Header Text: "${h1Text}"`);
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing_page.png') });
  });

  // --- STEP 2: STUDENT LOGIN & DASHBOARD VISIBILITY ---
  await checkStep('Student Login & Mentorship Section', async () => {
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', CREDENTIALS.STUDENT.email);
    await page.fill('input[type="password"]', CREDENTIALS.STUDENT.password);
    await page.click('form button');

    // Wait for dashboard to load (checking URL or sidebar container)
    await page.waitForURL('**/dashboard/student', { timeout: 15000 });
    console.log('Logged in successfully as STUDENT');

    // Screenshot the Student dashboard
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'student_dashboard.png') });

    // Navigate to Mentorship Page
    await page.goto(`${FRONTEND_URL}/dashboard/student/mentorship`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Mentorship', { timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'student_mentorship.png') });

    // Logout
    await page.goto(`${FRONTEND_URL}/logout`, { waitUntil: 'networkidle' });
  });

  // --- STEP 3: ALUMNI LOGIN & DASHBOARD VISIBILITY ---
  await checkStep('Alumni Login & Job Management Section', async () => {
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', CREDENTIALS.ALUMNI.email);
    await page.fill('input[type="password"]', CREDENTIALS.ALUMNI.password);
    await page.click('form button');

    await page.waitForURL('**/dashboard/alumni', { timeout: 15000 });
    console.log('Logged in successfully as ALUMNI');

    // Screenshot the Alumni dashboard
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'alumni_dashboard.png') });

    // Navigate to Job posting section
    await page.goto(`${FRONTEND_URL}/dashboard/alumni/jobs`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Job', { timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'alumni_jobs.png') });

    // Logout
    await page.goto(`${FRONTEND_URL}/logout`, { waitUntil: 'networkidle' });
  });

  // --- STEP 4: COLLEGE ADMIN LOGIN & ANALYTICS VISIBILITY ---
  await checkStep('College Admin Login & Analytics Section', async () => {
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', CREDENTIALS.COLLEGE_ADMIN.email);
    await page.fill('input[type="password"]', CREDENTIALS.COLLEGE_ADMIN.password);
    await page.click('form button');

    await page.waitForURL('**/dashboard/college-admin', { timeout: 15000 });
    console.log('Logged in successfully as COLLEGE_ADMIN');

    // Screenshot the College Admin dashboard
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'college_admin_dashboard.png') });

    // Navigate to Placements Stats
    await page.goto(`${FRONTEND_URL}/dashboard/college-admin/placements`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'college_admin_placements.png') });

    // Logout
    await page.goto(`${FRONTEND_URL}/logout`, { waitUntil: 'networkidle' });
  });

  // --- STEP 5: SUPER ADMIN LOGIN & PLATFORM CONTROLS ---
  await checkStep('Super Admin Login & System Health Section', async () => {
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', CREDENTIALS.SUPER_ADMIN.email);
    await page.fill('input[type="password"]', CREDENTIALS.SUPER_ADMIN.password);
    await page.click('form button');

    await page.waitForURL('**/dashboard/admin', { timeout: 15000 });
    console.log('Logged in successfully as SUPER_ADMIN');

    // Screenshot the Super Admin dashboard
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'super_admin_dashboard.png') });

    // Logout
    await page.goto(`${FRONTEND_URL}/logout`, { waitUntil: 'networkidle' });
  });

  await browser.close();

  console.log('======================================================================');
  console.log('               PLAYWRIGHT UI TEST RUN COMPLETED                       ');
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log('======================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('🟢 ALL PLAYWRIGHT UI TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  }
}

runPlaywrightTests();
