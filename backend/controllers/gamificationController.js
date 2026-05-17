import prisma from '../prisma/db.js';

export const ACTIONS = {
  REFERRAL_ACCEPTED: { points: 100, badge: 'Referral Master' },
  JOB_POSTED: { points: 50, badge: 'Job Provider' },
  WEBINAR_HOSTED: { points: 200, badge: 'Mentor' },
  MENTORSHIP_ACTIVITY: { points: 75, badge: 'Guide' },
  PROFILE_COMPLETED: { points: 25, badge: 'Professional' }
};

export const addPoints = async (userId, actionKey) => {
  try {
    const action = ACTIONS[actionKey];
    if (!action) return;

    const gamification = await prisma.gamification.upsert({
      where: { userId },
      update: { 
        points: { increment: action.points }
      },
      create: { 
        userId, 
        points: action.points 
      }
    });

    return gamification;
  } catch (error) {
    console.error('Add points error:', error);
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { collegeId, role } = req.query;

    const where = {};
    if (collegeId) where.user = { collegeId: parseInt(collegeId) };
    if (role) where.user = { ...where.user, role };

    const leaderboard = await prisma.gamification.findMany({
      where,
      include: { 
        user: { 
          select: { 
            id: true,
            name: true, 
            profilePhoto: true, 
            role: true,
            college: { select: { name: true } },
            alumni: { select: { currentCompany: true, referrals: { where: { status: 'accepted' } } } },
            student: { select: { department: true, skills: true } }
          } 
        } 
      },
      orderBy: { points: 'desc' },
      take: 50
    });

    const formatted = leaderboard.map((item, index) => ({
      rank: index + 1,
      id: item.user.id,
      name: item.user.name,
      photo: item.user.profilePhoto,
      role: item.user.role,
      points: item.points,
      college: item.user.college.name,
      company: item.user.alumni?.currentCompany,
      referrals: item.user.alumni?.referrals?.length || 0,
      skills: item.user.student?.skills
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
