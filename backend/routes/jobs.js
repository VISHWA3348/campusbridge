const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Alumni: Post Job
router.post('/', authenticateUser, authorizeRole('ALUMNI'), async (req, res) => {
  const { title, company, description } = req.body;
  try {
    const alumniProfile = await prisma.alumni.findUnique({
      where: { userId: req.user.id }
    });

    if (!alumniProfile) return res.status(400).json({ error: 'Alumni profile not found' });

    const job = await prisma.job.create({
      data: {
        alumniId: alumniProfile.id,
        title,
        company,
        description,
      },
    });

    // Create system notification for all students in the same college (Simplified)
    const students = await prisma.user.findMany({
      where: { collegeId: req.user.collegeId, role: 'STUDENT' }
    });

    for (const student of students) {
      await prisma.notification.create({
        data: {
          userId: student.id,
          type: 'JOB',
          message: `New job posted at ${company}: ${title}`,
        },
      });
    }

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post job' });
  }
});

// Student: Get Jobs
router.get('/', authenticateUser, async (req, res) => {
  const jobs = await prisma.job.findMany({
    include: { alumni: { include: { user: { select: { name: true } } } } }
  });
  res.json(jobs);
});

// Student: Apply for Job
router.post('/:id/apply', authenticateUser, authorizeRole('STUDENT'), async (req, res) => {
  const { id } = req.params;
  try {
    const application = await prisma.application.create({
      data: {
        studentId: req.user.id,
        jobId: parseInt(id),
      }
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply' });
  }
});

module.exports = router;
