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

    // 2. Emit real-time notification via Socket.io
    // req.io and req.onlineUsers are attached in server.js middleware
    if (req && req.io && req.onlineUsers) {
      const socketId = req.onlineUsers.get(parseInt(userId));
      if (socketId) {
        req.io.to(socketId).emit('new_notification', notification);
      }
    }

    // 3. Check for email preferences and send email
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { notificationSettings: true }
    });

    if (user && user.email) {
      // Initialize settings if they don't exist
      const settings = user.notificationSettings || {
        emailEnabled: true,
        webinarAlerts: true,
        jobAlerts: true,
        referralAlerts: true,
        chatAlerts: true
      };

      if (settings.emailEnabled) {
        let shouldSendEmail = true;
        
        // Filter based on type
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
    }

    return notification;
  } catch (error) {
    console.error('Error in createNotification utility:', error);
    return null;
  }
};

export default { createNotification };
