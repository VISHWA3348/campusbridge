import express from 'express';
import prisma from '../prisma/db.js';
import { authenticate } from '../middleware/auth.js';
import { getMyAnnouncements, markAsRead } from '../controllers/announcementController.js';
import { createNotification } from '../utils/notification.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', async (req, res) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { student: true, college: true }
    });
    if (!profile) return res.status(404).json({ error: 'User not found' });
    if (!profile.student) return res.status(404).json({ error: 'Student profile not found' });
    res.json({
      ...profile.student,
      name: profile.name,
      email: profile.email,
      college: profile.college,
      profilePhoto: profile.profilePhoto,
      bio: profile.bio
    });
  } catch (error) {
    console.error('Student profile error:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});


router.put('/settings', async (req, res) => {
  const { name, department, rollNumber, currentYear, totalStudents, fullDetails } = req.body;
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { name }
    });

    const updatedStudent = await prisma.student.update({
      where: { userId: req.user.userId },
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

router.get('/referrals', async (req, res) => {
  const referrals = await prisma.referral.findMany({
    where: { student: { userId: req.user.userId } },
    include: { alumni: { include: { user: true } } }
  });
  res.json(referrals);
});

router.get('/webinars', async (req, res) => {
  const webinars = await prisma.webinar.findMany({
    where: { collegeId: req.user.collegeId },
    include: { alumni: { include: { user: true } } }
  });
  res.json(webinars);
});

router.get('/alumni', async (req, res) => {
  try {
    const { q, company, role } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const where = {
      user: {
        collegeId: req.user.collegeId,
        role: 'ALUMNI',
        OR: q ? [
          { name: { contains: String(q) } },
          { email: { contains: String(q) } }
        ] : undefined
      },
      AND: [
        company ? {
          OR: [
            { company: { contains: String(company) } },
            { currentCompany: { contains: String(company) } }
          ]
        } : {},
        role ? {
          OR: [
            { role: { contains: String(role) } },
            { jobRole: { contains: String(role) } }
          ]
        } : {},
        q ? {
          OR: [
            { skills: { contains: String(q) } },
            { department: { contains: String(q) } }
          ]
        } : {}
      ]
    };

    const [alumni, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        include: { 
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              bio: true
            }
          }
        },
        orderBy: { user: { name: 'asc' } },
        skip,
        take: limit
      }),
      prisma.alumni.count({ where })
    ]);

    res.json({
      alumni,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Alumni search error:', error);
    res.status(500).json({ error: 'Failed to search alumni' });
  }
});

router.get('/announcements', getMyAnnouncements);
router.patch('/announcements/:id/read', markAsRead);

router.get('/placements', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
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

router.post('/placements', async (req, res) => {
  const { company, role, salary, mode, date, alumniId, referralId } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
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

    // Notify Alumni if they were involved
    if (alumniId) {
      const alumniObj = await prisma.alumni.findUnique({ where: { id: parseInt(alumniId) } });
      if (alumniObj) {
        await createNotification(req, {
          userId: alumniObj.userId,
          type: 'PLACEMENT',
          title: 'Great News: Student Placed!',
          message: `${req.user.name} has been placed at ${company} as ${role}. Thank you for your guidance!`,
          priority: 'IMPORTANT',
          link: '/dashboard/alumni/placements'
        });
      }
    }

    res.status(201).json(placement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to report placement' });
  }
});

export default router;
