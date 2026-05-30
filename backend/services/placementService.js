import prisma from '../prisma/db.js';

class PlacementService {
  async recordPlacement(studentId, company, role, referralId = null) {
    // 1. Create Placement Record
    const placement = await prisma.placement.create({
      data: {
        studentId: parseInt(studentId),
        company,
        role,
        referralId: referralId ? parseInt(referralId) : null
      },
      include: { student: { include: { user: true } } }
    });

    // 2. If it was via referral, reward the alumni
    if (referralId) {
      const referral = await prisma.referral.findUnique({
        where: { id: parseInt(referralId) },
        include: { alumni: { include: { user: true } } }
      });

      if (referral) {
        // Award 500 points for successful placement
        await prisma.gamification.upsert({
          where: { userId: referral.alumni.userId },
          update: { points: { increment: 500 } },
          create: { userId: referral.alumni.userId, points: 500, badges: 'Top Mentor' }
        });

        // Notify Alumni
        await prisma.notification.create({
          data: {
            userId: referral.alumni.userId,
            type: 'PLACEMENT_SUCCESS',
            message: `Congratulations! Your referral for ${placement.student.user.name} at ${company} resulted in a placement!`
          }
        });
      }
    }

    // 3. Notify Student
    await prisma.notification.create({
      data: {
        userId: placement.student.userId,
        type: 'PLACEMENT_RECORDED',
        message: `Your placement at ${company} as ${role} has been recorded by the college admin.`
      }
    });

    return placement;
  }

  async getCollegePlacements(collegeId) {
    return prisma.placement.findMany({
      where: { student: { user: { collegeId } } },
      include: { student: { include: { user: { select: { name: true } } } }, referral: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new PlacementService();
