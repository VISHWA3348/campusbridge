const express = require('express');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();
import prisma from '../prisma/db.js';

// College Admin: Get College Stats
router.get('/college', authenticateUser, authorizeRole('COLLEGE_ADMIN'), async (req, res) => {
  const collegeId = req.user.collegeId;
  try {
    const studentsCount = await prisma.user.count({ where: { collegeId, role: 'STUDENT' } });
    const alumniCount = await prisma.user.count({ where: { collegeId, role: 'ALUMNI' } });
    
    // Referral Stats for this college
    const totalReferrals = await prisma.referral.count({
      where: { student: { collegeId } }
    });
    const acceptedReferrals = await prisma.referral.count({
      where: { student: { collegeId }, status: 'accepted' }
    });

    // Placement Stats
    const totalPlacements = await prisma.placement.count({
      where: { student: { collegeId } }
    });

    res.json({
      studentsCount,
      alumniCount,
      totalReferrals,
      referralSuccessRate: totalReferrals > 0 ? (acceptedReferrals / totalReferrals) * 100 : 0,
      totalPlacements
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Super Admin: Global Stats
router.get('/global', authenticateUser, authorizeRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const totalColleges = await prisma.college.count();
    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.job.count();
    const activeSubscriptions = await prisma.subscription.count({ where: { status: 'active' } });

    res.json({
      totalColleges,
      totalUsers,
      totalJobs,
      activeSubscriptions
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global analytics' });
  }
});

module.exports = router;
