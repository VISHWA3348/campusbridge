import prisma from '../prisma/db.js';
import { sendNotificationEmail } from '../services/emailService.js';

/**
 * Centralized utility to create notifications
 * Handles DB entry, Socket.io emission, and Email delivery
 */
export const createNotification = async (req, { 
  userId, 
  type, 
  title, 
  message, 
  priority = 'NORMAL', 
  link = null 
}) => {
  try {
    if (!userId) return null;

    // 1. Create notification record in DB
    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        type: type || 'SYSTEM',
        title,
        message,
        priority,
        link,
        read: false
      }
    });

    // 2. Fetch user settings for notifications filtering
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { notificationSettings: true }
    });

    const settings = user?.notificationSettings || {
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
    };

    // 3. Emit real-time notification via Socket.io (if push is enabled)
    let shouldSendPush = true;
    if (settings.pushEnabled === false) {
      shouldSendPush = false;
    } else {
      if (type === 'WEBINAR' && settings.webinarPush === false) shouldSendPush = false;
      else if (type === 'JOB' && settings.jobPush === false) shouldSendPush = false;
      else if (type === 'REFERRAL' && settings.referralPush === false) shouldSendPush = false;
      else if (type === 'CHAT' && settings.chatPush === false) shouldSendPush = false;
    }

    if (shouldSendPush && req && req.io && req.onlineUsers) {
      const socketId = req.onlineUsers.get(parseInt(userId));
      if (socketId) {
        req.io.to(socketId).emit('new_notification', notification);
      }
    }

    // 4. Send email if email notification is enabled
    if (user && user.email && settings.emailEnabled) {
      let shouldSendEmail = true;
      if (type === 'WEBINAR' && !settings.webinarAlerts) shouldSendEmail = false;
      else if (type === 'JOB' && !settings.jobAlerts) shouldSendEmail = false;
      else if (type === 'REFERRAL' && !settings.referralAlerts) shouldSendEmail = false;
      else if (type === 'CHAT' && !settings.chatAlerts) shouldSendEmail = false;

      if (shouldSendEmail) {
        sendNotificationEmail(user.email, { 
          title: title || 'New Notification', 
          message, 
          link 
        }).catch(emailErr => console.error('Background notification email error:', emailErr));
      }
    }

    return notification;
  } catch (error) {
    console.error('Error in createNotification utility:', error);
    return null;
  }
};

export default { createNotification };
