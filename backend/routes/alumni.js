const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const alumniOnly = [authenticateUser, authorizeRole('ALUMNI')];

// --- Placements (Track students referred/mentored by alumni) ---
router.get('/placements', ...alumniOnly, async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.id } });
    if (!alumni) return res.status(404).json({ error: 'Alumni not found' });

    const placements = await prisma.placement.findMany({
      where: {
        OR: [
          { alumniId: alumni.id },
          { referral: { alumniId: alumni.id } }
        ]
      },
      include: {
        student: { include: { user: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(placements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
});

// --- Referrals ---
router.get('/referrals', ...alumniOnly, async (req, res) => {
  const referrals = await prisma.referral.findMany({
    where: { alumniId: req.user.id },
    include: { student: { include: { user: { select: { name: true, email: true } } } } }
  });
  res.json(referrals);
});

// --- Jobs ---
router.post('/jobs', ...alumniOnly, async (req, res) => {
  const { title, company, description } = req.body;
  try {
    const alumniProfile = await prisma.alumni.findUnique({ where: { userId: req.user.id } });
    if (!alumniProfile) return res.status(400).json({ error: 'Alumni profile not found' });

    const job = await prisma.job.create({
      data: {
        alumniId: alumniProfile.id,
        title,
        company,
        description,
      },
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post job' });
  }
});

router.get('/jobs', ...alumniOnly, async (req, res) => {
  const alumniProfile = await prisma.alumni.findUnique({ where: { userId: req.user.id } });
  const jobs = await prisma.job.findMany({
    where: { alumniId: alumniProfile?.id }
  });
  res.json(jobs);
});

router.delete('/jobs/:id', ...alumniOnly, async (req, res) => {
  const { id } = req.params;
  await prisma.job.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Job deleted' });
});

// --- Webinars ---
router.post('/webinars', ...alumniOnly, async (req, res) => {
  const { title, description, date } = req.body;
  try {
    const alumniProfile = await prisma.alumni.findUnique({ where: { userId: req.user.id } });
    const webinar = await prisma.webinar.create({
      data: {
        alumniId: alumniProfile.id,
        title,
        description,
        date: new Date(date)
      }
    });
    res.status(201).json(webinar);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create webinar' });
  }
});

router.get('/webinars', ...alumniOnly, async (req, res) => {
  const alumniProfile = await prisma.alumni.findUnique({ where: { userId: req.user.id } });
  const webinars = await prisma.webinar.findMany({
    where: { alumniId: alumniProfile?.id },
    include: { _count: { select: { registrations: true } } }
  });
  res.json(webinars);
});

// --- Gamification ---
router.get('/gamification', ...alumniOnly, async (req, res) => {
  const points = await prisma.gamification.findUnique({
    where: { userId: req.user.id }
  });
  res.json(points || { points: 0, badges: "" });
});

router.get('/leaderboard', authenticateUser, async (req, res) => {
  const leaderboard = await prisma.gamification.findMany({
    take: 10,
    orderBy: { points: 'desc' },
    include: { user: { select: { name: true } } }
  });
  res.json(leaderboard);
});

// --- Profile ---
router.get('/profile', ...alumniOnly, async (req, res) => {
  const profile = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { 
      alumni: true,
      college: true
    }
  });
  res.json({
    ...profile.alumni,
    name: profile.name,
    email: profile.email,
    college: profile.college
  });
});

router.put('/settings', ...alumniOnly, async (req, res) => {
  const { name, department, passoutYear, currentCompany, companyAddress, experience, maritalStatus } = req.body;
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { name }
    });

    const updatedAlumni = await prisma.alumni.update({
      where: { userId: req.user.id },
      data: { 
        department, 
        passoutYear, 
        currentCompany, 
        companyAddress, 
        experience, 
        maritalStatus 
      }
    });

    res.json({ message: 'Settings updated successfully', alumni: updatedAlumni });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
