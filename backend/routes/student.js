const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const studentOnly = [authenticateUser, authorizeRole('STUDENT')];

// --- Profile ---
router.get('/profile', ...studentOnly, async (req, res) => {
  const profile = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { 
      student: true,
      college: { include: { subscription: true } }
    }
  });
  res.json({
    ...profile.student,
    name: profile.name,
    email: profile.email,
    college: profile.college
  });
});

router.put('/settings', ...studentOnly, async (req, res) => {
  const { name, department, rollNumber, currentYear, totalStudents, fullDetails } = req.body;
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { name }
    });

    const updatedStudent = await prisma.student.update({
      where: { userId: req.user.id },
      data: { 
        department, 
        rollNumber, 
        currentYear, 
        totalStudents: parseInt(totalStudents) || 0, 
        fullDetails 
      }
    });

    res.json({ message: 'Settings updated successfully', student: updatedStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- Alumni Search ---
router.get('/alumni', ...studentOnly, async (req, res) => {
  const { company, role, q } = req.query;
  const alumni = await prisma.alumni.findMany({
    where: {
      user: {
        collegeId: req.user.collegeId,
        name: q ? { contains: q } : undefined,
      },
      OR: q ? [
        { skills: { contains: q } },
        { department: { contains: q } }
      ] : undefined,
      AND: [
        company ? {
          OR: [
            { company: { contains: company } },
            { currentCompany: { contains: company } }
          ]
        } : {},
        role ? {
          OR: [
            { role: { contains: role } },
            { jobRole: { contains: role } }
          ]
        } : {}
      ]
    },
    include: { user: true }
  });
  res.json(alumni);
});

// --- Placements ---
router.get('/placements', ...studentOnly, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const placements = await prisma.placement.findMany({
      where: { studentId: student.id },
      include: { 
        alumni: { include: { user: true } },
        referral: { include: { alumni: { include: { user: true } } } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(placements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
});

router.post('/placements', ...studentOnly, async (req, res) => {
  const { company, role, salary, mode, date, alumniId, referralId } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const placement = await prisma.placement.create({
      data: {
        studentId: student.id,
        company,
        role,
        salary,
        mode,
        date: date ? new Date(date) : undefined,
        alumniId: alumniId ? parseInt(alumniId) : undefined,
        referralId: referralId ? parseInt(referralId) : undefined
      },
      include: { alumni: { include: { user: true } } }
    });

    // Notify College Admin (optional, but good for tracking)
    await prisma.notification.create({
      data: {
        userId: req.user.collegeId, // Assuming we want to notify college admin
        type: 'NEW_PLACEMENT',
        message: `${req.user.name} reported a new placement at ${company}.`
      }
    });

    res.status(201).json(placement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to report placement' });
  }
});

// --- Referral System ---
router.post('/referrals', ...studentOnly, async (req, res) => {
  const { alumniId } = req.body;
  try {
    const studentProfile = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const referral = await prisma.referral.create({
      data: {
        studentId: studentProfile.id,
        alumniId: parseInt(alumniId),
        status: 'pending'
      }
    });

    // Notify Alumni
    const alumniUser = await prisma.user.findFirst({
      where: { alumni: { id: parseInt(alumniId) } }
    });
    if (alumniUser) {
      await prisma.notification.create({
        data: {
          userId: alumniUser.id,
          type: 'REFERRAL_REQUEST',
          message: `${req.user.name} has requested a referral.`
        }
      });
    }

    res.status(201).json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request referral' });
  }
});

router.get('/referrals', ...studentOnly, async (req, res) => {
  const studentProfile = await prisma.student.findUnique({ where: { userId: req.user.id } });
  const referrals = await prisma.referral.findMany({
    where: { studentId: studentProfile?.id },
    include: { alumni: { include: { user: { select: { name: true } } } } }
  });
  res.json(referrals);
});

// --- Job System ---
router.get('/jobs', ...studentOnly, async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { alumni: { user: { collegeId: req.user.collegeId } } },
    include: { alumni: { include: { user: { select: { name: true } } } } }
  });
  res.json(jobs);
});

router.post('/applications', ...studentOnly, async (req, res) => {
  const { jobId } = req.body;
  try {
    const studentProfile = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const application = await prisma.application.create({
      data: {
        studentId: studentProfile.id,
        jobId: parseInt(jobId),
        status: 'applied'
      }
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// --- Webinars ---
router.get('/webinars', ...studentOnly, async (req, res) => {
  const webinars = await prisma.webinar.findMany({
    where: { alumni: { user: { collegeId: req.user.collegeId } } },
    include: { alumni: { include: { user: { select: { name: true } } } } }
  });
  res.json(webinars);
});

router.post('/webinars/register', ...studentOnly, async (req, res) => {
  const { webinarId } = req.body;
  try {
    const studentProfile = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const registration = await prisma.registration.create({
      data: {
        studentId: studentProfile.id,
        webinarId: parseInt(webinarId)
      }
    });
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register' });
  }
});

// --- Notifications ---
router.get('/notifications', ...studentOnly, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(notifications);
});

// --- AI Mock ---
router.post('/ai/resume-analyze', ...studentOnly, async (req, res) => {
  res.json({
    score: 85,
    feedback: "Your skills section is strong. Consider adding more metrics to your experience descriptions.",
    suggestions: ["Add Cloud Computing", "Highlight leadership roles"]
  });
});

module.exports = router;
