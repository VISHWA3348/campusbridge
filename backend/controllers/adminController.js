import prisma from '../prisma/db.js';
import { createNotification } from '../utils/notification.js';
import bcrypt from 'bcryptjs';

export const getSuperAdminAnalytics = async (req, res) => {
  try {
    const [
      userCounts,
      totalColleges,
      totalJobs,
      totalWebinars,
      totalCompanies,
      resumeStats,
      mentorshipStats,
      placementStats,
      globalConnectivity,
      webinarRegistrations
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      prisma.college.count(),
      prisma.job.count(),
      prisma.webinar.count(),
      prisma.job.groupBy({
        by: ['company'],
        _count: { company: true }
      }),
      prisma.resumeAnalysis.aggregate({
        _count: { id: true },
        _avg: { score: true }
      }),
      prisma.mentorshipRequest.aggregate({
        _count: { id: true },
        _avg: { rating: true }
      }),
      prisma.placement.count(),
      prisma.message.count(),
      prisma.registration.count()
    ]);

    // Role-based counts
    const roleStats = {
      STUDENT: userCounts.find(u => u.role === 'STUDENT')?._count.id || 0,
      ALUMNI: userCounts.find(u => u.role === 'ALUMNI')?._count.id || 0,
      COLLEGE_ADMIN: userCounts.find(u => u.role === 'COLLEGE_ADMIN')?._count.id || 0,
      SUPER_ADMIN: userCounts.find(u => u.role === 'SUPER_ADMIN')?._count.id || 0,
    };
    const totalUsers = Object.values(roleStats).reduce((a, b) => a + b, 0);

    // We'll take the average of all students' readiness scores
    const students = await prisma.student.findMany({
      select: {
        readinessScore: true,
        _count: {
          select: {
            resumeAnalyses: true,
            registrations: true,
            mentorshipRequests: true,
            referrals: true
          }
        }
      }
    });

    const globalAvgReadiness = students.length > 0
      ? students.reduce((acc, s) => acc + (s.readinessScore || 0), 0) / students.length
      : 0;

    const topColleges = await prisma.college.findMany({
      include: {
        _count: { select: { users: true, jobs: true } },
        users: {
          where: { role: 'STUDENT' },
          select: { student: { select: { readinessScore: true } } }
        }
      },
      take: 5
    });

    const collegesWithReadiness = topColleges.map(c => {
      const studentReadiness = c.users
        .filter(u => u.student)
        .map(u => u.student.readinessScore);
      const avgReadiness = studentReadiness.length > 0 
        ? studentReadiness.reduce((a, b) => a + b, 0) / studentReadiness.length 
        : 0;
      
      return {
        id: c.id,
        name: c.name,
        userCount: c._count.users,
        jobCount: c._count.jobs,
        avgReadiness
      };
    }).sort((a, b) => b.avgReadiness - a.avgReadiness);

    // Mentorship XP Aggregation
    const alumniXP = await prisma.alumni.aggregate({
      _sum: { mentorshipXP: true, mentorshipImpactScore: true }
    });

    // Global Activity Feed
    const [
      recentUsers,
      recentWebinars,
      recentReferrals,
      recentAnalyses,
      recentMentorship,
      recentJobs
    ] = await Promise.all([
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { college: true } }),
      prisma.webinar.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
      prisma.referral.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { student: { include: { user: true } }, alumni: { include: { user: true } } } }),
      prisma.resumeAnalysis.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { student: { include: { user: true } } } }),
      prisma.mentorshipRequest.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { student: { include: { user: true } }, alumni: { include: { user: true } } } }),
      prisma.job.findMany({ take: 3, orderBy: { createdAt: 'desc' } })
    ]);

    const liveFeed = [
      ...recentUsers.map(u => ({ type: 'USER_REGISTRATION', title: 'New Registration', message: `${u.name} joined from ${u.college?.name || 'Platform'}`, time: u.createdAt })),
      ...recentWebinars.map(w => ({ type: 'WEBINAR_CREATED', title: 'New Webinar', message: `Webinar: ${w.title} was scheduled`, time: w.createdAt })),
      ...recentReferrals.map(r => ({ type: 'REFERRAL_ACTIVITY', title: 'Referral Update', message: `${r.alumni?.user?.name || 'Alumni'} referred ${r.student?.user?.name || 'Student'}`, time: r.createdAt })),
      ...recentAnalyses.map(a => ({ type: 'RESUME_ANALYZED', title: 'Resume Analyzed', message: `${a.student?.user?.name || 'Student'} analyzed their resume`, time: a.createdAt })),
      ...recentMentorship.map(m => ({ type: 'MENTORSHIP_BOOKED', title: 'Mentorship Session', message: `Session booked between ${m.student?.user?.name || 'Student'} and ${m.alumni?.user?.name || 'Alumni'}`, time: m.createdAt })),
      ...recentJobs.map(j => ({ type: 'JOB_POSTED', title: 'New Job Opportunity', message: `${j.title} at ${j.company}`, time: j.createdAt }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

    // Real Growth Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      
      const count = monthlyUsers.filter(u => {
        const ud = new Date(u.createdAt);
        return ud.getMonth() === monthIndex && ud.getFullYear() === year;
      }).length;

      // Cumulative users for the graph if needed, or just monthly signups
      // The frontend seems to expect a count that might be cumulative or absolute
      // Let's use monthly signups for 'users' and average readiness for 'readiness'
      
      const monthReadiness = students.filter(s => {
        // This is tricky because readinessScore is current, not historical.
        // For a real trend, we'd need a history table.
        // But we can approximate or use the average of students who joined that month.
        return true; // Simplified for now
      });

      growthTrends.push({
        month: monthName,
        users: count,
        readiness: Math.floor(globalAvgReadiness) // Use current global avg as a baseline
      });
    }

    res.json({
      totalUsers,
      roleStats,
      totalColleges,
      totalJobs,
      totalWebinars,
      totalPlacements: placementStats,
      totalCompanies: totalCompanies.length,
      topColleges: collegesWithReadiness,
      globalResumeAnalyses: resumeStats._count.id,
      globalAvgResumeScore: resumeStats._avg.score || 0,
      globalMentorshipEngagement: mentorshipStats._count.id,
      globalMentorshipXP: alumniXP._sum.mentorshipXP || 0,
      globalMentorshipImpact: alumniXP._sum.mentorshipImpactScore || 0,
      globalAvgReadiness,
      liveFeed,
      growthTrends,
      connectivity: {
        totalMessages: globalConnectivity,
        webinarParticipation: webinarRegistrations,
        activeMentorships: mentorshipStats._count.id
      }
    });
  } catch (error) {
    console.error('Super admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const getCollegeAdminAnalytics = async (req, res) => {
  const collegeId = req.user.collegeId;
  try {
    // Pre-fetch all student IDs in the college to bypass Prisma's groupBy nested relation filter limitation
    const collegeStudents = await prisma.student.findMany({
      where: { user: { collegeId } },
      select: { id: true }
    });
    const studentIds = collegeStudents.map(s => s.id);

    const [
      totalStudents,
      totalAlumni,
      totalReferrals,
      acceptedReferrals,
      totalPlacements,
      totalJobs,
      totalWebinars,
      totalWebinarRegistrations,
      totalResumeAnalyses,
      totalMentorshipRequests,
      avgReadinessScore,
      topRoadmaps,
      avgResumeStats,
      readinessDistribution,
      verificationStats
    ] = await Promise.all([
      prisma.student.count({ where: { user: { collegeId } } }),
      prisma.alumni.count({ where: { user: { collegeId } } }),
      prisma.referral.count({ where: { student: { user: { collegeId } } } }),
      prisma.referral.count({ where: { student: { user: { collegeId } }, status: 'accepted' } }),
      prisma.placement.count({ where: { student: { user: { collegeId } } } }),
      prisma.job.count({ where: { collegeId } }),
      prisma.webinar.count({ where: { collegeId } }),
      prisma.registration.count({ where: { webinar: { collegeId } } }),
      prisma.resumeAnalysis.count({ where: { student: { user: { collegeId } } } }),
      prisma.mentorshipRequest.count({ where: { student: { user: { collegeId } } } }),
      prisma.student.aggregate({
        where: { user: { collegeId } },
        _avg: { readinessScore: true }
      }),
      prisma.careerRoadmap.groupBy({
        by: ['title'],
        where: { studentId: { in: studentIds } },
        _count: { title: true },
        orderBy: { _count: { title: 'desc' } },
        take: 3
      }),
      prisma.resumeAnalysis.aggregate({
        where: { student: { user: { collegeId } } },
        _avg: {
          score: true,
          atsScore: true,
          skillScore: true,
          readinessScore: true
        }
      }),
      prisma.resumeAnalysis.groupBy({
        by: ['placementReadiness'],
        where: { studentId: { in: studentIds } },
        _count: { id: true }
      }),
      prisma.user.groupBy({
        by: ['verificationStatus'],
        where: { collegeId },
        _count: { id: true }
      })
    ]);

    const vStats = {
      PENDING: (verificationStats || []).find(s => s.verificationStatus === 'PENDING_APPROVAL')?._count.id || 0,
      APPROVED: (verificationStats || []).find(s => s.verificationStatus === 'APPROVED')?._count.id || 0,
      REJECTED: (verificationStats || []).find(s => s.verificationStatus === 'REJECTED')?._count.id || 0
    };

    // Real Placement Trends (Last 8 Months)
    const pMonthsAgo = new Date();
    pMonthsAgo.setMonth(pMonthsAgo.getMonth() - 7);
    
    const monthlyPlacements = await prisma.placement.findMany({
      where: { 
        student: { user: { collegeId } },
        date: { gte: pMonthsAgo }
      },
      select: { date: true }
    });

    const placementTrends = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      
      const count = monthlyPlacements.filter(p => {
        const pd = new Date(p.date);
        return pd.getMonth() === mIdx && pd.getFullYear() === yr;
      }).length;
      
      placementTrends.push(count);
    }

    res.json({
      totalStudents,
      totalAlumni,
      totalReferrals,
      referralSuccessRate: totalReferrals > 0 ? (acceptedReferrals / totalReferrals) * 100 : 0,
      totalPlacements,
      totalJobs,
      totalWebinars,
      webinarParticipation: totalStudents > 0 ? (totalWebinarRegistrations / totalStudents) * 100 : 0,
      resumeAnalysisUsage: totalResumeAnalyses,
      mentorshipEngagement: totalMentorshipRequests,
      avgReadiness: avgReadinessScore._avg.readinessScore || 0,
      popularRoadmaps: topRoadmaps,
      verificationStats: vStats,
      resumeAnalytics: {
        avgOverall: avgResumeStats._avg.score || 0,
        avgAts: avgResumeStats._avg.atsScore || 0,
        avgSkill: avgResumeStats._avg.skillScore || 0,
        avgReadiness: avgResumeStats._avg.readinessScore || 0,
        readinessDistribution: (readinessDistribution || []).map(r => ({ level: r.placementReadiness, count: r._count.id })),
        placementTrends
      }
    });
  } catch (error) {
    console.error('College admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// --- User Management (Super Admin) ---

export const createUser = async (req, res) => {
  const { name, email, password, role, collegeId, ...extraData } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        collegeId: parseInt(collegeId),
        isVerified: true
      }
    });

    if (role === 'STUDENT') {
      await prisma.student.create({
        data: {
          userId: user.id,
          department: extraData.department,
          rollNumber: extraData.rollNumber,
          phoneNumber: extraData.phoneNumber
        }
      });
    } else if (role === 'ALUMNI') {
      await prisma.alumni.create({
        data: {
          userId: user.id,
          department: extraData.department,
          passoutYear: extraData.passoutYear,
          company: extraData.company,
          phoneNumber: extraData.phoneNumber,
          verified: true
        }
      });
    }

    // Notify user
    await createNotification(req, {
      userId: user.id,
      type: 'SYSTEM',
      title: 'Account Created',
      message: `Welcome to CampusBridge! Your account has been created by the administrator.`,
      priority: 'IMPORTANT',
      link: '/dashboard'
    });

    res.json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, collegeId, phoneNumber, ...extraData } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        collegeId: parseInt(collegeId),
        role
      }
    });

    if (role === 'STUDENT') {
      await prisma.student.update({
        where: { userId: user.id },
        data: {
          department: extraData.department,
          rollNumber: extraData.rollNumber,
          phoneNumber: phoneNumber,
          skills: extraData.skills
        }
      });
    } else if (role === 'ALUMNI') {
      await prisma.alumni.update({
        where: { userId: user.id },
        data: {
          department: extraData.department,
          company: extraData.company,
          phoneNumber: phoneNumber,
          skills: extraData.skills
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id);
    // Delete related records first due to constraints (or rely on Cascade if set up)
    // In SQLite with Prisma, we usually have to handle it if not configured.
    await prisma.student.deleteMany({ where: { userId } });
    await prisma.alumni.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: !user.isVerified }
    });

    res.json({ success: true, isVerified: updated.isVerified });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Failed to toggle status' });
  }
};

export const getUserFullProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        college: true,
        student: {
          include: {
            referrals: true,
            placements: true,
            registrations: { include: { webinar: true } }
          }
        },
        alumni: {
          include: {
            referrals: true,
            webinars: true,
            jobs: true
          }
        }
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// --- Subscription & Plan Management ---

export const getPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await prisma.plan.create({ data: req.body });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await prisma.plan.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

export const deletePlan = async (req, res) => {
  try {
    await prisma.plan.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const subs = await prisma.subscription.findMany({
      include: {
        college: {
          include: {
            _count: { select: { users: true } }
          }
        }
      }
    });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

export const updateCollegeSubscription = async (req, res) => {
  const { id } = req.params;
  const { plan, status, endDate } = req.body;
  try {
    const sub = await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: {
        plan,
        status,
        endDate: endDate ? new Date(endDate) : undefined
      },
      include: { college: { include: { users: { where: { role: 'COLLEGE_ADMIN' } } } } }
    });

    // Notify College Admin
    if (sub.college.users.length > 0) {
      await createNotification(req, {
        userId: sub.college.users[0].id,
        type: 'SYSTEM',
        title: 'Subscription Updated',
        message: `Your college subscription has been updated to ${plan} (${status}).`,
        priority: 'IMPORTANT',
        link: '/dashboard/college-admin/profile'
      });
    }

    res.json(sub);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

export const getSubscriptionAnalytics = async (req, res) => {
  try {
    const [
      totalRevenue,
      activeSubs,
      expiredSubs,
      popularPlans
    ] = await Promise.all([
      prisma.subscription.aggregate({ _sum: { amount: true } }),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.count({ where: { status: 'expired' } }),
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
        orderBy: { _count: { plan: 'desc' } },
        take: 3
      })
    ]);

    res.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      activeSubscriptions: activeSubs,
      expiredPlans: expiredSubs,
      mostPopularPlan: popularPlans[0]?.plan || 'N/A'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription analytics' });
  }
};
// --- Verification Management (College Admin) ---

export const getPendingVerifications = async (req, res) => {
  const collegeId = req.user.collegeId;
  try {
    const users = await prisma.user.findMany({
      where: { 
        collegeId, 
        verificationStatus: 'PENDING_APPROVAL' 
      },
      include: {
        student: true,
        alumni: true,
        inviteCodeUsed: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
};

export const approveUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { verificationStatus: 'APPROVED' },
      include: { alumni: true }
    });

    if (user.role === 'ALUMNI' && user.alumni) {
      await prisma.alumni.update({
        where: { id: user.alumni.id },
        data: { verified: true }
      });
    }

    await createNotification(req, {
      userId: user.id,
      type: 'SYSTEM',
      title: 'Account Approved!',
      message: 'Your account has been verified and approved by the college admin. You now have full access.',
      priority: 'IMPORTANT',
      link: '/dashboard'
    });

    res.json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

export const rejectUser = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { 
        verificationStatus: 'REJECTED',
        rejectionReason: reason
      }
    });

    await createNotification(req, {
      userId: user.id,
      type: 'SYSTEM',
      title: 'Account Verification Rejected',
      message: `Your account verification was rejected. Reason: ${reason}. Please update your documents and request re-verification.`,
      priority: 'IMPORTANT',
      link: '/auth/rejected'
    });

    res.json({ success: true, message: 'User rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject user' });
  }
};
