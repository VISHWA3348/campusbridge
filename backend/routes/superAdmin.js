import express from 'express';
import prisma from '../prisma/db.js';
import { authenticate, authorizeRole } from '../middleware/auth.js';
import { createNotification } from '../utils/notification.js';
import { 
  getSuperAdminAnalytics, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  getUserFullProfile,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getSubscriptions,
  updateCollegeSubscription,
  getSubscriptionAnalytics
} from '../controllers/adminController.js';
import { 
  getColleges, 
  getCollegeById, 
  createCollege, 
  updateCollege, 
  deleteCollege, 
  toggleCollegeStatus,
  toggleInviteCode,
  regenerateInviteCode 
} from '../controllers/collegeController.js';
import { 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment, 
  toggleDepartmentStatus 
} from '../controllers/departmentController.js';
import {
  getSignupCodes,
  createSignupCode,
  updateSignupCode,
  deleteSignupCode
} from '../controllers/signupCodeController.js';
import { uploadCollege } from '../utils/upload.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole('SUPER_ADMIN'));

router.get('/analytics/overview', getSuperAdminAnalytics);

// --- College Management ---
router.get('/colleges', getColleges);
router.get('/colleges/:id', getCollegeById);
router.post('/colleges', createCollege);
router.put('/colleges/:id', updateCollege);
router.delete('/colleges/:id', deleteCollege);
router.patch('/colleges/:id/toggle-status', toggleCollegeStatus);
router.patch('/colleges/:id/toggle-invite-code', toggleInviteCode);
router.patch('/colleges/:id/regenerate-invite-code', regenerateInviteCode);
router.post('/colleges/upload', uploadCollege.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ fileUrl: req.file.path, publicId: req.file.filename });
});

// --- Department Management ---
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);
router.patch('/departments/:id/toggle-status', toggleDepartmentStatus);

// Super Admin self-profile endpoint
router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { college: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, otp, otpExpiresAt, verificationToken, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Super admin self-profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 100, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ 
        where,
        include: { 
          college: true,
          student: true,
          alumni: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/users/:id/profile', getUserFullProfile);

router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/analytics', getSubscriptionAnalytics); // Must be before /:id
router.patch('/subscriptions/:id', updateCollegeSubscription);

router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// --- Signup Code Management ---
router.get('/signup-codes', getSignupCodes);
router.post('/signup-codes', createSignupCode);
router.put('/signup-codes/:id', updateSignupCode);
router.delete('/signup-codes/:id', deleteSignupCode);

const mapName = (name) => {
  const n = name.toLowerCase();
  if (n === 'chat' || n === 'chat system' || n === 'real-time chat') return 'Chat System';
  if (n === 'webinar' || n === 'webinar module' || n === 'webinar portal' || n === 'webinars') return 'Webinar Module';
  if (n === 'referrals' || n === 'referral system') return 'Referral System';
  if (n === 'jobs' || n === 'job portal' || n === 'job postings') return 'Job Portal';
  return name;
};

router.get('/features', async (req, res) => {
  try {
    const requiredFeatures = [
      'Referral System',
      'Job Portal',
      'Chat System',
      'Webinar Module'
    ];
    
    // Check if they exist, if not, create them
    const existing = await prisma.featureToggle.findMany();
    const existingNames = existing.map(e => e.featureName);
    
    for (const name of requiredFeatures) {
      if (!existingNames.includes(name)) {
        const newToggle = await prisma.featureToggle.create({
          data: { featureName: name, enabled: true }
        });
        existing.push(newToggle);
      }
    }
    
    res.json(existing);
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

router.post('/features/:id/toggle', async (req, res) => {
  const param = req.params.id;
  let feature;
  
  if (isNaN(parseInt(param))) {
    const featureName = mapName(param);
    feature = await prisma.featureToggle.findUnique({ where: { featureName } });
  } else {
    feature = await prisma.featureToggle.findUnique({ where: { id: parseInt(param) } });
  }

  if (feature) {
    const updated = await prisma.featureToggle.update({
      where: { id: feature.id },
      data: { enabled: !feature.enabled }
    });
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Feature not found' });
  }
});

// Get global platform settings
router.get('/settings', async (req, res) => {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      include: { college: true }
    });
    
    if (!superAdmin) {
      return res.status(404).json({ error: 'Super Admin or College not found' });
    }

    const requiredFeatures = [
      'Referral System',
      'Job Portal',
      'Chat System',
      'Webinar Module'
    ];
    
    const existing = await prisma.featureToggle.findMany();
    const existingNames = existing.map(e => e.featureName);
    
    for (const name of requiredFeatures) {
      if (!existingNames.includes(name)) {
        const newToggle = await prisma.featureToggle.create({
          data: { featureName: name, enabled: true }
        });
        existing.push(newToggle);
      }
    }

    res.json({
      platformName: superAdmin.college?.name || 'CampusBridge',
      features: existing
    });
  } catch (error) {
    console.error('Get platform settings error:', error);
    res.status(500).json({ error: 'Failed to fetch platform settings' });
  }
});

// Update global platform settings
router.put('/settings', async (req, res) => {
  try {
    const { platformName, features } = req.body;

    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!superAdmin) {
      return res.status(404).json({ error: 'Super Admin not found' });
    }

    if (platformName !== undefined) {
      await prisma.college.update({
        where: { id: superAdmin.collegeId },
        data: { name: platformName }
      });
    }

    if (Array.isArray(features)) {
      for (const feat of features) {
        if (feat.id !== undefined && feat.enabled !== undefined) {
          let dbFeat;
          if (isNaN(parseInt(feat.id))) {
            const featureName = mapName(feat.id);
            dbFeat = await prisma.featureToggle.findUnique({ where: { featureName } });
          } else {
            dbFeat = await prisma.featureToggle.findUnique({ where: { id: parseInt(feat.id) } });
          }

          if (dbFeat) {
            await prisma.featureToggle.update({
              where: { id: dbFeat.id },
              data: { enabled: feat.enabled }
            });
          }
        }
      }
    }

    res.json({ message: 'Platform settings updated successfully' });
  } catch (error) {
    console.error('Update platform settings error:', error);
    res.status(500).json({ error: 'Failed to update platform settings' });
  }
});

router.get('/system/health', async (req, res) => {
  try {
    // Verify DB is actually reachable
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.json({
      status: 'degraded',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/audit-logs', async (req, res) => {
  res.json([]);
});

// --- Placements (Global) ---
router.get('/placements', async (req, res) => {
  try {
    const placements = await prisma.placement.findMany({
      include: {
        student: { include: { user: { include: { college: true } } } },
        alumni: { include: { user: true } },
        referral: { include: { alumni: { include: { user: true } } } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(placements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global placements' });
  }
});

router.get('/placements/stats', async (req, res) => {
  try {
    const placements = await prisma.placement.findMany({
      include: { student: { include: { user: { include: { college: true } } } } }
    });

    const totalPlacements = placements.length;

    // Top colleges by placement
    const collegeStats = {};
    placements.forEach(p => {
      const collegeName = p.student?.user?.college?.name || 'Unknown';
      collegeStats[collegeName] = (collegeStats[collegeName] || 0) + 1;
    });
    const topColleges = Object.entries(collegeStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top companies
    const companyStats = {};
    placements.forEach(p => {
      companyStats[p.company] = (companyStats[p.company] || 0) + 1;
    });
    const topCompanies = Object.entries(companyStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      total: totalPlacements,
      topColleges,
      topCompanies
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global placement stats' });
  }
});

export default router;
