import prisma from '../prisma/db.js';

export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: req.user.userId } }),
      prisma.notification.count({ where: { userId: req.user.userId, read: false } })
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.body;
  try {
    if (id) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: { id: parseInt(id), userId: req.user.userId },
        data: { read: true }
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: req.user.userId, read: false },
        data: { read: true }
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.delete({
      where: { id: parseInt(id), userId: req.user.userId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.userId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

export const getNotificationSettings = async (req, res) => {
  try {
    let settings = await prisma.notificationSetting.findUnique({
      where: { userId: req.user.userId }
    });

    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.notificationSetting.create({
        data: {
          userId: req.user.userId,
          emailEnabled: true,
          pushEnabled: true,
          webinarAlerts: true,
          jobAlerts: true,
          referralAlerts: true,
          chatAlerts: true,
          webinarPush: true,
          jobPush: true,
          referralPush: true,
          chatPush: true
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Fetch notification settings error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
};

export const updateNotificationSettings = async (req, res) => {
  const { 
    emailEnabled, 
    pushEnabled, 
    webinarAlerts, 
    jobAlerts, 
    referralAlerts, 
    chatAlerts,
    webinarPush,
    jobPush,
    referralPush,
    chatPush
  } = req.body;
  try {
    const settings = await prisma.notificationSetting.upsert({
      where: { userId: req.user.userId },
      update: {
        emailEnabled: emailEnabled ?? true,
        pushEnabled: pushEnabled ?? true,
        webinarAlerts: webinarAlerts ?? true,
        jobAlerts: jobAlerts ?? true,
        referralAlerts: referralAlerts ?? true,
        chatAlerts: chatAlerts ?? true,
        webinarPush: webinarPush ?? true,
        jobPush: jobPush ?? true,
        referralPush: referralPush ?? true,
        chatPush: chatPush ?? true
      },
      create: {
        userId: req.user.userId,
        emailEnabled: emailEnabled ?? true,
        pushEnabled: pushEnabled ?? true,
        webinarAlerts: webinarAlerts ?? true,
        jobAlerts: jobAlerts ?? true,
        referralAlerts: referralAlerts ?? true,
        chatAlerts: chatAlerts ?? true,
        webinarPush: webinarPush ?? true,
        jobPush: jobPush ?? true,
        referralPush: referralPush ?? true,
        chatPush: chatPush ?? true
      }
    });
    res.json(settings);
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
};
