import express from 'express';
import prisma from '../prisma/db.js';
import { authenticate } from '../middleware/auth.js';
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

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({ 
    include: { 
      college: true,
      student: true,
      alumni: true
    } 
  });
  res.json(users);
});

router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/users/:id/profile', getUserFullProfile);

router.get('/subscriptions', getSubscriptions);
router.patch('/subscriptions/:id', updateCollegeSubscription);
router.get('/subscriptions/analytics', getSubscriptionAnalytics);

router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// --- Signup Code Management ---
router.get('/signup-codes', getSignupCodes);
router.post('/signup-codes', createSignupCode);
router.put('/signup-codes/:id', updateSignupCode);
router.delete('/signup-codes/:id', deleteSignupCode);

router.get('/features', async (req, res) => {
  const features = await prisma.featureToggle.findMany();
  res.json(features);
});

router.post('/features/:id/toggle', async (req, res) => {
  const feature = await prisma.featureToggle.findUnique({ where: { id: parseInt(req.params.id) } });
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

router.get('/system/health', async (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected'
  });
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
