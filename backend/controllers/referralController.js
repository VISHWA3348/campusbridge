import prisma from '../prisma/db.js';
import { addPoints } from './gamificationController.js';
import { createNotification } from '../utils/notification.js';

export const createReferral = async (req, res) => {
  try {
    const { alumniId, status } = req.body;
    const userId = req.user.userId;

    if (!alumniId) {
      return res.status(400).json({ error: 'alumniId is required' });
    }

    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      return res.status(403).json({ error: 'Only students can request referrals' });
    }

    const referral = await prisma.referral.create({
      data: {
        studentId: student.id,
        alumniId: parseInt(alumniId),
        status: status || 'pending'
      }
    });

    // Notify Alumni
    const alumni = await prisma.alumni.findUnique({
      where: { id: parseInt(alumniId) },
      include: { user: true }
    });
    
    if (alumni) {
      await createNotification(req, {
        userId: alumni.userId,
        type: 'REFERRAL',
        title: 'New Referral Request',
        message: `${req.user.name} has requested a referral.`,
        priority: 'IMPORTANT',
        link: '/dashboard/alumni/referrals'
      });
    }

    res.status(201).json(referral);
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const referral = await prisma.referral.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { alumni: true }
    });

    if (status === 'accepted') {
      // Reward Alumni
      await addPoints(referral.alumni.userId, 'REFERRAL_ACCEPTED');
    }

    // Notify Student
    const studentReferral = await prisma.referral.findUnique({
      where: { id: parseInt(id) },
      include: { student: { include: { user: true } } }
    });

    if (studentReferral) {
      await createNotification(req, {
        userId: studentReferral.student.userId,
        type: 'REFERRAL',
        title: 'Referral Update',
        message: `Your referral request has been ${status}.`,
        priority: status === 'accepted' ? 'IMPORTANT' : 'NORMAL',
        link: '/dashboard/student/referrals'
      });
    }

    res.json(referral);
  } catch (error) {
    res.status(500).json({ error: 'Update referral error' });
  }
};

export const getReferrals = async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      include: {
        student: { include: { user: true } },
        alumni: { include: { user: true } }
      }
    });
    res.json(referrals);
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
