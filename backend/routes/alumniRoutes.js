import express from 'express';
import prisma from '../prisma/db.js';
import { authenticate } from '../middleware/auth.js';
import { getMyAnnouncements, markAsRead } from '../controllers/announcementController.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', async (req, res) => {
  const profile = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { alumni: true, college: true }
  });
  res.json({
    ...profile.alumni,
    name: profile.name,
    email: profile.email,
    college: profile.college
  });
});

router.put('/settings', async (req, res) => {
  const { name, department, passoutYear, currentCompany, companyAddress, experience, maritalStatus } = req.body;
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { name }
    });

    const updatedAlumni = await prisma.alumni.update({
      where: { userId: req.user.userId },
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

router.get('/referrals', async (req, res) => {
  const referrals = await prisma.referral.findMany({
    where: { alumni: { userId: req.user.userId } },
    include: { student: { include: { user: true } } }
  });
  res.json(referrals);
});

router.get('/announcements', getMyAnnouncements);
router.patch('/announcements/:id/read', markAsRead);

router.get('/placements', async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({ 
      where: { userId: req.user.userId } 
    });
    
    if (!alumni) return res.status(404).json({ error: 'Alumni profile not found' });

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
      orderBy: { createdAt: 'desc' }
    });
    res.json(placements);
  } catch (error) {
    console.error('Fetch alumni placements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/students', async (req, res) => {
  try {
    const { q, department } = req.query;
    const searchTerm = q ? String(q) : '';

    const where = {
      user: {
        collegeId: req.user.collegeId,
        role: 'STUDENT'
      }
    };

    // Build AND array for additional filters
    const andConditions = [];

    if (department) {
      andConditions.push({ department: { contains: String(department) } });
    }

    if (searchTerm) {
      andConditions.push({
        OR: [
          { skills: { contains: searchTerm } },
          { interestedDomain: { contains: searchTerm } },
          { user: { name: { contains: searchTerm } } },
          { user: { email: { contains: searchTerm } } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const students = await prisma.student.findMany({
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
      }
    });
    res.json(students);
  } catch (error) {
    console.error('Student search error:', error);
    res.status(500).json({ error: 'Failed to search students' });
  }
});


export default router;
