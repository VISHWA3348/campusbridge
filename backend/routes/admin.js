const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const adminOnly = [authenticateUser, authorizeRole('SUPER_ADMIN')];

// --- College Management ---

router.post('/colleges', ...adminOnly, async (req, res, next) => {
  const { name, domain, status } = req.body;
  try {
    const college = await prisma.college.create({
      data: { name, domain, status },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: { action: `Created college: ${name}`, userId: req.user.id }
    });

    res.status(201).json(college);
  } catch (error) {
    next(error);
  }
});

router.get('/colleges', ...adminOnly, async (req, res) => {
  const colleges = await prisma.college.findMany({
    include: { subscription: true }
  });
  res.json(colleges);
});

router.patch('/colleges/:id', ...adminOnly, async (req, res, next) => {
  const { id } = req.params;
  const { name, domain, status } = req.body;
  try {
    const college = await prisma.college.update({
      where: { id: parseInt(id) },
      data: { name, domain, status },
    });

    await prisma.auditLog.create({
      data: { action: `Updated college: ${name}`, userId: req.user.id }
    });

    res.json(college);
  } catch (error) {
    next(error);
  }
});

router.delete('/colleges/:id', ...adminOnly, async (req, res, next) => {
  const { id } = req.params;
  try {
    const college = await prisma.college.findUnique({ where: { id: parseInt(id) } });
    await prisma.college.delete({ where: { id: parseInt(id) } });

    await prisma.auditLog.create({
      data: { action: `Deleted college: ${college.name}`, userId: req.user.id }
    });

    res.json({ message: 'College deleted' });
  } catch (error) {
    next(error);
  }
});

// --- Analytics ---

router.get('/analytics/overview', ...adminOnly, async (req, res) => {
  const totalColleges = await prisma.college.count();
  const totalUsers = await prisma.user.count();
  const revenue = await prisma.subscription.aggregate({ _sum: { amount: true } });
  
  res.json({
    totalColleges,
    totalUsers,
    revenue: revenue._sum.amount || 0,
    referrals: 1240
  });
});

// --- Feature Toggles ---

router.get('/features', ...adminOnly, async (req, res) => {
  const features = await prisma.featureToggle.findMany();
  res.json(features);
});

router.patch('/features/:id', ...adminOnly, async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  const feature = await prisma.featureToggle.update({
    where: { id: parseInt(id) },
    data: { enabled },
  });
  res.json(feature);
});

// --- Audit Logs ---

router.get('/audit-logs', ...adminOnly, async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(logs);
});

module.exports = router;
