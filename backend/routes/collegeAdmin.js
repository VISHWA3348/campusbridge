import express from 'express';
import prisma from '../prisma/db.js';
import { authenticate } from '../middleware/auth.js';
import { 
  getCollegeAdminAnalytics, 
  getPendingVerifications, 
  approveUser, 
  rejectUser 
} from '../controllers/adminController.js';
import { 
  getCollegeAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  togglePinAnnouncement, 
  getAnnouncementAnalytics 
} from '../controllers/announcementController.js';
import { createNotification } from '../utils/notification.js';

const router = express.Router();

router.use(authenticate);

router.get('/analytics', getCollegeAdminAnalytics);
router.get('/verifications/pending', getPendingVerifications);
router.post('/verifications/approve/:userId', approveUser);
router.post('/verifications/reject/:userId', rejectUser);

router.get('/students', async (req, res) => {
  const students = await prisma.student.findMany({
    where: { user: { collegeId: req.user.collegeId } },
    include: { user: true }
  });
  res.json(students);
});

router.delete('/students/:id', async (req, res) => {
  await prisma.student.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

router.get('/alumni', async (req, res) => {
  const alumni = await prisma.alumni.findMany({
    where: { user: { collegeId: req.user.collegeId } },
    include: { 
      user: {
        include: {
          college: true,
          inviteCodeUsed: true
        }
      } 
    }
  });
  res.json(alumni);
});

router.post('/alumni/:id/verify', async (req, res) => {
  try {
    const alumni = await prisma.alumni.update({
      where: { id: parseInt(req.params.id) },
      data: { verified: true }
    });

    // Notify Alumni
    await createNotification(req, {
      userId: alumni.userId,
      type: 'VERIFICATION',
      title: 'Profile Verified',
      message: 'Your alumni profile has been verified by the college admin! You can now post jobs and webinars.',
      priority: 'IMPORTANT',
      link: '/dashboard/alumni/profile'
    });

    res.json({ success: true, alumni });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

router.get('/announcements', getCollegeAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);
router.patch('/announcements/:id/pin', togglePinAnnouncement);
router.get('/announcements/analytics', getAnnouncementAnalytics);

router.get('/placements', async (req, res) => {
  try {
    const placements = await prisma.placement.findMany({
      where: { student: { user: { collegeId: req.user.collegeId } } },
      include: { 
        student: { include: { user: true } },
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

router.get('/placements/stats', async (req, res) => {
  try {
    const placements = await prisma.placement.findMany({
      where: { student: { user: { collegeId: req.user.collegeId } } },
      include: { student: true }
    });

    const totalPlacements = placements.length;
    
    // Calculate department-wise placements
    const deptStats = {};
    placements.forEach(p => {
      const dept = p.student?.department || 'Unknown';
      deptStats[dept] = (deptStats[dept] || 0) + 1;
    });

    // Top hiring companies
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
      departmentStats: deptStats,
      topCompanies
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch placement stats' });
  }
});

router.get('/webinars', async (req, res) => {
  const webinars = await prisma.webinar.findMany({
    where: { alumni: { user: { collegeId: req.user.collegeId } } },
    include: { 
      alumni: { include: { user: true } },
      _count: { select: { registrations: true } }
    }
  });
  res.json(webinars);
});

router.get('/referrals', async (req, res) => {
  const referrals = await prisma.referral.findMany({
    where: { student: { user: { collegeId: req.user.collegeId } } },
    include: { student: { include: { user: true } }, alumni: { include: { user: true } } }
  });
  res.json(referrals);
});

router.get('/:id', async (req, res) => {
  const college = await prisma.college.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { _count: { select: { users: true } } }
  });
  res.json(college);
});

router.put('/:id/settings', async (req, res) => {
  const { collegeName, collegeCode, departments, departmentsData } = req.body;
  try {
    // 1. Update the main College record
    // We also update the comma-separated 'departments' string for legacy/signup support
    const updatedCollege = await prisma.college.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        name: collegeName, 
        collegeCode, 
        departments: Array.isArray(departmentsData) 
          ? departmentsData.map(d => d.name).join(', ') 
          : departments 
      }
    });

    // 2. Synchronize individual Department records (relational)
    if (Array.isArray(departmentsData)) {
      for (const dept of departmentsData) {
        if (!dept.name || !dept.code) continue;
        
        await prisma.department.upsert({
          where: { 
            collegeId_code: {
              collegeId: updatedCollege.id,
              code: dept.code
            }
          },
          update: { 
            name: dept.name,
            status: 'active' // Re-activate if it was inactive
          },
          create: {
            name: dept.name,
            code: dept.code,
            collegeId: updatedCollege.id,
            status: 'active'
          }
        });
      }
    }

    res.json({ message: 'College settings updated successfully', college: updatedCollege });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update college settings' });
  }
});

export default router;
