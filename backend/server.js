import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import collegeAdminRoutes from './routes/collegeAdmin.js';
import superAdminRoutes from './routes/superAdmin.js';
import jobRoutes from './routes/jobRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import webinarRoutes from './routes/webinarRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import trackerRoutes from './routes/trackerRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import prisma from './prisma/db.js';
import { authenticate } from './middleware/auth.js';
import { getNotifications, markAsRead, deleteNotification, clearAllNotifications, getNotificationSettings, updateNotificationSettings } from './controllers/notificationController.js';
import { checkFeature } from './middleware/feature.js';
import { processPayment } from './controllers/paymentController.js';
import { getLeaderboard } from './controllers/gamificationController.js';

dotenv.config();
console.log("SERVER DATABASE URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^@:]*)@/, ':****@') : "undefined");

const app = express();
const httpServer = createServer(app);

const ALLOWED_ORIGINS = [
  "https://campusbridge.pages.dev",
  "https://campusbridge.zinoingroup.in",
  "http://localhost:3000",
  "http://localhost:3001"
];

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Socket.io Logic
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(parseInt(userId), socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  socket.on('send_message', (data) => {
    const receiverSocketId = onlineUsers.get(parseInt(data.receiverId));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', data);
    }
  });

  socket.on('typing', (data) => {
    const receiverSocketId = onlineUsers.get(parseInt(data.receiverId));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing_status', {
        senderId: data.senderId,
        isTyping: data.isTyping
      });
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log('User disconnected:', socket.id);
  });
});

// Attach io to request for use in controllers
app.use((req, res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/college', collegeAdminRoutes);
app.use('/api/admin', superAdminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', checkFeature('chat'), messageRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/webinars', checkFeature('webinar'), webinarRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/notifications', authenticate, getNotifications);
app.post('/api/notifications/read', authenticate, markAsRead);
app.delete('/api/notifications/:id', authenticate, deleteNotification);
app.delete('/api/notifications', authenticate, clearAllNotifications);
app.get('/api/notifications/settings', authenticate, getNotificationSettings);
app.post('/api/notifications/settings', authenticate, updateNotificationSettings);

// Gamification & Leaderboard
app.get('/api/gamification', authenticate, async (req, res) => {
  const gamification = await prisma.gamification.findUnique({
    where: { userId: req.user.userId }
  });
  res.json(gamification || { points: 0, badges: "" });
});

app.get('/api/leaderboard', authenticate, getLeaderboard);
app.get('/api/global/leaderboard', authenticate, getLeaderboard);

// Mock Global/AI APIs
app.post('/api/global/ai/referral-message', authenticate, (req, res) => {
  const { alumniName, company } = req.body;
  res.json({ message: `Hi ${alumniName}, I'm a student from your college and I'm very interested in the opportunities at ${company}. Would you be willing to refer me?` });
});

app.post('/api/payment/process', authenticate, processPayment);

app.get('/api/global/search', authenticate, async (req, res) => {
  const { q } = req.query;
  const searchTerm = q?.toString() || '';

  const [users, jobs] = await Promise.all([
    prisma.user.findMany({
      where: { 
        name: { contains: searchTerm },
        role: { in: ['STUDENT', 'ALUMNI'] },
        collegeId: req.user.collegeId
      },
      include: { alumni: true, student: true },
      take: 5
    }),
    prisma.job.findMany({
      where: { 
        OR: [
          { title: { contains: searchTerm } },
          { company: { contains: searchTerm } }
        ]
      },
      take: 5
    })
  ]);

  res.json({ users, jobs });
});

app.get('/', (req, res) => {
  res.json({ message: 'CampusBridge API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Verify DB connection
prisma.$connect()
  .then(() => {
    console.log('◇ Database connected successfully');
    httpServer.listen(PORT, () => {
      console.log(`◇ Server is running on port ${PORT}`);
      console.log(`◇ http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('◆ Database connection failed:', err);
    process.exit(1);
  });
