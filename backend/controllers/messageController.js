import prisma from '../prisma/db.js';
import { createNotification } from '../utils/notification.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, fileName, fileType, fileUrl, filePublicId } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || (!content && !fileUrl)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Strict College Isolation: Verify that receiver is in the same college (except for Super Admins)
    const receiver = await prisma.user.findUnique({ where: { id: parseInt(receiverId) } });
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });
    
    if (req.user.role !== 'SUPER_ADMIN' && receiver.collegeId !== req.user.collegeId) {
      return res.status(403).json({ error: 'Strict Isolation: You can only message users from your own college.' });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: parseInt(receiverId),
        content,
        fileUrl,
        filePublicId,
        fileName,
        fileType
      },
      include: {
        sender: { select: { name: true, profilePhoto: true } }
      }
    });

    // Real-time notification via Socket.io
    const receiverSocketId = req.onlineUsers.get(parseInt(receiverId));
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit('receive_message', message);
    }

    // In-app & Real-time notification
    await createNotification(req, {
      userId: parseInt(receiverId),
      type: 'CHAT',
      title: 'New Message',
      message: `You have a new message from ${req.user.name}`,
      priority: 'NORMAL',
      link: '/dashboard/chat' // Most roles have /dashboard/[role]/chat but /dashboard/chat could be a redirect
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: parseInt(otherUserId) },
            { senderId: parseInt(otherUserId), receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId, receiverId: parseInt(otherUserId) },
            { senderId: parseInt(otherUserId), receiverId: userId }
          ]
        }
      })
    ]);

    // Mark these messages as read
    await prisma.message.updateMany({
      where: {
        senderId: parseInt(otherUserId),
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      messages: messages.reverse(),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all users who have messaged with the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true, role: true } },
        receiver: { select: { id: true, name: true, profilePhoto: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const conversations = [];
    const seenUsers = new Set();

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!seenUsers.has(otherUser.id)) {
        seenUsers.add(otherUser.id);
        
        // Count unread
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUser.id,
            receiverId: userId,
            isRead: false
          }
        });

        conversations.push({
          user: otherUser,
          lastMessage: msg,
          unreadCount
        });
      }
    }

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
      fileUrl: req.file.path,
      filePublicId: req.file.filename,
      fileName: req.file.originalname,
      fileType: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
};
