const express = require('express');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();
import prisma from '../prisma/db.js';

// --- Global Search ---
router.get('/search', authenticateUser, async (req, res) => {
  const { q } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: q } }, { email: { contains: q } }],
        collegeId: req.user.collegeId
      },
      select: { id: true, name: true, role: true }
    });

    const jobs = await prisma.job.findMany({
      where: {
        OR: [{ title: { contains: q } }, { company: { contains: q } }],
        alumni: { user: { collegeId: req.user.collegeId } }
      }
    });

    res.json({ users, jobs });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// --- Gamification Leaderboard ---
router.get('/leaderboard', authenticateUser, async (req, res) => {
  const leaderboard = await prisma.gamification.findMany({
    where: { user: { collegeId: req.user.collegeId } },
    include: { user: { select: { name: true, role: true, college: { select: { name: true } } } } },
    orderBy: { points: 'desc' },
    take: 10
  });
  res.json(leaderboard);
});

// --- AI Mock: Referral Message Generator ---
router.post('/ai/referral-message', authenticateUser, async (req, res) => {
  const { alumniName, company } = req.body;
  const message = `Hi ${alumniName}, I'm a student at your alma mater. I see you're working at ${company} as a senior professional. I'm very interested in your career path and would love to request a referral for the junior engineering position. Thank you for your time!`;
  res.json({ message });
});

// --- AI Mock: Resume Analyzer ---
router.post('/ai/resume-analyzer', authenticateUser, async (req, res) => {
  res.json({
    score: 88,
    feedback: "Excellent layout. Your internship at Acme Corp is a strong highlight. Consider adding more keywords related to Cloud Computing.",
    recommendations: ["AWS", "Docker", "Kubernetes"]
  });
});

module.exports = router;
