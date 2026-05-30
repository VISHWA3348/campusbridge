import prisma from '../prisma/db.js';
import { createNotification } from '../utils/notification.js';
import { sendNotificationEmail } from '../services/emailService.js';

export const getCollegeAnnouncements = async (req, res) => {
  const collegeId = req.user.collegeId;
  try {
    const announcements = await prisma.announcement.findMany({
      where: { collegeId },
      include: {
        _count: { select: { views: true } }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req, res) => {
  const collegeId = req.user.collegeId;
  const { title, description, priority, targetRole, targetDept, targetYear, attachment, isPinned } = req.body;
  try {
    const announcement = await prisma.announcement.create({
      data: {
        collegeId,
        title,
        description,
        priority: priority || 'low',
        targetRole: targetRole || 'ALL',
        targetDept,
        targetYear,
        attachment,
        isPinned: isPinned || false
      }
    });

    // Create notifications and send email alerts for targeted users
    const users = await prisma.user.findMany({
      where: {
        collegeId,
        role: targetRole === 'ALL' ? { in: ['STUDENT', 'ALUMNI'] } : targetRole,
      }
    });

    users.forEach(u => {
      createNotification(req, {
        userId: u.id,
        type: 'ANNOUNCEMENT',
        title: 'New Announcement',
        message: `A new announcement has been posted: ${title}`,
        priority: priority === 'high' ? 'URGENT' : (priority === 'medium' ? 'IMPORTANT' : 'NORMAL'),
        link: '/dashboard/announcements'
      });

      sendNotificationEmail(u.email, {
        title: `New Announcement: ${title}`,
        message: description,
        link: '/dashboard/announcements'
      }).catch(err => console.error(`[ANNOUNCEMENT EMAIL FAILED] To: ${u.email} | Error:`, err.message));
    });

    res.json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.announcementView.deleteMany({ where: { announcementId: parseInt(id) } });
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

export const togglePinAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    const ann = await prisma.announcement.findUnique({ where: { id: parseInt(id) } });
    const updated = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { isPinned: !ann.isPinned }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
};

export const getAnnouncementAnalytics = async (req, res) => {
  const collegeId = req.user.collegeId;
  try {
    const stats = await prisma.announcement.findMany({
      where: { collegeId },
      select: {
        id: true,
        title: true,
        _count: { select: { views: true } }
      }
    });

    const totalViews = stats.reduce((acc, curr) => acc + curr._count.views, 0);
    const mostViewed = stats.sort((a, b) => b._count.views - a._count.views)[0];

    res.json({
      totalAnnouncements: stats.length,
      totalViews,
      mostViewedAnnouncement: mostViewed
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// --- Student/Alumni Side ---

export const getMyAnnouncements = async (req, res) => {
  const { collegeId, role, id: userId } = req.user;
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        collegeId,
        OR: [
          { targetRole: 'ALL' },
          { targetRole: role }
        ]
      },
      include: {
        views: {
          where: { userId }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Map to include 'isRead' flag
    const mapped = announcements.map(a => ({
      ...a,
      isRead: a.views.length > 0
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your announcements' });
  }
};

export const markAsRead = async (req, res) => {
  const userId = req.user.id;
  const announcementId = parseInt(req.params.id);
  try {
    await prisma.announcementView.upsert({
      where: {
        announcementId_userId: { announcementId, userId }
      },
      create: { announcementId, userId },
      update: {}
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};
