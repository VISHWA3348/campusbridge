import prisma from '../prisma/db.js';
import { addPoints } from './gamificationController.js';
import { createNotification } from '../utils/notification.js';

export const requestMentorship = async (req, res) => {
  const { alumniId, message, sessionType, scheduledAt, notes } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return res.status(403).json({ error: 'Only students can request mentorship' });

    const request = await prisma.mentorshipRequest.create({
      data: {
        studentId: student.id,
        alumniId: parseInt(alumniId),
        message,
        sessionType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        notes,
        status: 'pending'
      }
    });

    // Notify Alumni
    const alumni = await prisma.alumni.findUnique({ where: { id: parseInt(alumniId) }, include: { user: true } });
    if (alumni) {
      await createNotification(req, {
        userId: alumni.user.id,
        type: 'MENTORSHIP',
        title: 'New Mentorship Request',
        message: `${req.user.name} has requested a mentorship session: ${sessionType || 'Career Guidance'}`,
        priority: 'IMPORTANT',
        link: '/dashboard/alumni/mentorship'
      });
    }

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send request' });
  }
};

export const getAlumniMentorshipRequests = async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.userId } });
    const requests = await prisma.mentorshipRequest.findMany({
      where: { alumniId: alumni.id },
      include: { student: { include: { user: true } } }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const getStudentMentorshipRequests = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    const requests = await prisma.mentorshipRequest.findMany({
      where: { studentId: student.id },
      include: { alumni: { include: { user: true } } }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const updateMentorshipStatus = async (req, res) => {
  const { status, meetingLink, meetingPlatform, notes } = req.body;
  const requestId = parseInt(req.params.id);
  try {
    const updateData = { status };
    if (meetingLink) updateData.meetingLink = meetingLink;
    if (meetingPlatform) updateData.meetingPlatform = meetingPlatform;
    if (notes) updateData.notes = notes;
    if (status === 'completed') updateData.completedAt = new Date();

    const request = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: updateData,
      include: { student: { include: { user: true } }, alumni: true }
    });

    // Notify Student
    await createNotification(req, {
      userId: request.student.user.id,
      type: 'MENTORSHIP',
      title: 'Mentorship Update',
      message: `Your mentorship request has been ${status}.`,
      priority: status === 'accepted' ? 'IMPORTANT' : 'NORMAL',
      link: '/dashboard/student/mentorship'
    });

    // Gamification & Impact if completed
    if (status === 'completed') {
      await addPoints(request.alumni.userId, 'MENTORSHIP_COMPLETED');
      await prisma.alumni.update({
        where: { id: request.alumniId },
        data: { 
          mentorshipXP: { increment: 50 },
          mentorshipImpactScore: { increment: 10 }
        }
      });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const submitMentorshipFeedback = async (req, res) => {
  const { rating, review } = req.body;
  const requestId = parseInt(req.params.id);
  try {
    const request = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: { rating, review },
      include: { alumni: true }
    });

    // Update Alumni Impact Score based on rating
    if (rating >= 4) {
      await prisma.alumni.update({
        where: { id: request.alumniId },
        data: { mentorshipImpactScore: { increment: 20 } }
      });
    }

    res.json({ message: 'Feedback submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

export const getMentorshipAnalytics = async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({ 
      where: { userId: req.user.userId },
      include: {
        mentorshipRequests: true,
        mentorshipAchievements: true
      }
    });

    const stats = {
      totalSessions: alumni.mentorshipRequests.length,
      completedSessions: alumni.mentorshipRequests.filter(r => r.status === 'completed').length,
      pendingRequests: alumni.mentorshipRequests.filter(r => r.status === 'pending').length,
      studentsMentored: new Set(alumni.mentorshipRequests.map(r => r.studentId)).size,
      impactScore: alumni.mentorshipImpactScore,
      xp: alumni.mentorshipXP,
      rating: alumni.mentorshipRequests.filter(r => r.rating).reduce((acc, r) => acc + r.rating, 0) / (alumni.mentorshipRequests.filter(r => r.rating).length || 1)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const updateAlumniExpertise = async (req, res) => {
  const { expertise } = req.body; // Array of strings
  try {
    const alumni = await prisma.alumni.update({
      where: { userId: req.user.userId },
      data: { mentorshipExpertise: JSON.stringify(expertise) }
    });
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expertise' });
  }
};

export const getAlumniSlots = async (req, res) => {
  try {
    const { alumniId } = req.params;
    const slots = await prisma.mentorshipSlot.findMany({
      where: { alumniId: parseInt(alumniId), isBooked: false }
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

export const getOwnSlots = async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.userId } });
    if (!alumni) return res.status(403).json({ error: 'Not an alumni' });
    const slots = await prisma.mentorshipSlot.findMany({
      where: { alumniId: alumni.id }
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

export const addAlumniSlot = async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.userId } });
    const { dayOfWeek, startTime, endTime } = req.body;
    const slot = await prisma.mentorshipSlot.create({
      data: {
        alumniId: alumni.id,
        dayOfWeek,
        startTime,
        endTime
      }
    });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add slot' });
  }
};

export const deleteAlumniSlot = async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    await prisma.mentorshipSlot.delete({ where: { id: slotId } });
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete slot' });
  }
};
