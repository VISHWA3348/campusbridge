const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReferralService {
  async createReferral(studentUserId, alumniId) {
    const student = await prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) throw new Error('Student profile not found');

    const referral = await prisma.referral.create({
      data: {
        studentId: student.id,
        alumniId: parseInt(alumniId),
        status: 'pending'
      },
      include: { student: { include: { user: true } } }
    });

    // Notify Alumni
    const alumniUser = await prisma.user.findFirst({
      where: { alumni: { id: parseInt(alumniId) } }
    });
    
    if (alumniUser) {
      await prisma.notification.create({
        data: {
          userId: alumniUser.id,
          type: 'REFERRAL_REQUEST',
          message: `${referral.student.user.name} has requested a referral.`
        }
      });
    }

    return referral;
  }

  async updateStatus(referralId, status, alumniUserId) {
    const referral = await prisma.referral.update({
      where: { id: parseInt(referralId) },
      data: { status },
      include: { student: { include: { user: true } } }
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: referral.student.userId,
        type: 'REFERRAL_UPDATE',
        message: `Your referral request has been ${status}.`
      }
    });

    // Gamification & Audit Log
    if (status === 'accepted') {
      await prisma.gamification.upsert({
        where: { userId: alumniUserId },
        update: { points: { increment: 50 } },
        create: { userId: alumniUserId, points: 50 }
      });
    }

    return referral;
  }
}

module.exports = new ReferralService();
