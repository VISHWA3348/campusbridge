import prisma from '../prisma/db.js';
import aiService from '../services/aiService.js';

export const getPlacementReadiness = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: {
        readinessHistory: {
          orderBy: { createdAt: 'desc' },
          take: 7
        }
      }
    });

    if (!student) return res.status(403).json({ error: 'Not a student' });

    // Caching: If last analysis is less than 24h old, return it
    const lastAnalysis = student.readinessHistory[0];
    if (lastAnalysis && (new Date().getTime() - new Date(lastAnalysis.createdAt).getTime()) < 24 * 60 * 60 * 1000) {
      return res.json({
        ...lastAnalysis,
        suggestions: JSON.parse(lastAnalysis.suggestions || '[]'),
        weaknesses: JSON.parse(lastAnalysis.weaknesses || '[]'),
        strengths: JSON.parse(lastAnalysis.strengths || '[]'),
        nextActions: JSON.parse(lastAnalysis.nextActions || '[]'),
        metrics: JSON.parse(lastAnalysis.metrics || '{}'),
        history: student.readinessHistory.reverse()
      });
    }

    // If no fresh analysis, trigger one
    return await reanalyzeReadiness(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch readiness' });
  }
};

export const reanalyzeReadiness = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: true,
        resumeAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        referrals: true,
        applications: { include: { job: true } },
        registrations: { include: { webinar: true } }, // Webinars
        roadmaps: true,
        mentorshipRequests: { where: { status: 'completed' } }
      }
    });

    if (!student) return res.status(403).json({ error: 'Not a student' });

    // Fetch available jobs and webinars for recommendations
    const [jobs, webinars] = await Promise.all([
      prisma.job.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
      prisma.webinar.findMany({ take: 10, orderBy: { createdAt: 'desc' } })
    ]);

    // Prepare student data for AI
    const studentData = {
      profile: {
        skills: student.skills,
        bio: student.bio,
        github: student.githubLink,
        linkedin: student.linkedIn,
        cgpa: student.cgpa,
        department: student.department,
        certifications: student.certifications
      },
      stats: {
        resumeScore: student.resumeAnalyses[0]?.score || 0,
        referralsSent: student.referrals.length,
        webinarsAttended: student.registrations.length,
        applicationsMade: student.applications.length,
        roadmapsCompleted: student.roadmaps.filter(r => r.progress === 100).length,
        averageRoadmapProgress: student.roadmaps.length > 0 
          ? Math.round(student.roadmaps.reduce((acc, r) => acc + r.progress, 0) / student.roadmaps.length)
          : 0,
        mentorshipSessions: student.mentorshipRequests.length,
        jobApplications: student.applications.map(a => a.job.title)
      },
      context: {
        availableJobs: jobs.map(j => ({ title: j.title, skills: j.skills })),
        availableWebinars: webinars.map(w => ({ title: w.title, domain: w.domain }))
      }
    };

    const aiInsights = await aiService.getPlacementInsights(studentData);

    const {
      readinessScore,
      level,
      probability,
      metrics,
      topWeaknesses,
      topStrengths,
      actionPlan,
      careerInsights,
      jobEligibility,
      missingSkillsForJobs,
      recommendedRoles
    } = aiInsights;

    // Save to history
    const history = await prisma.placementReadiness.create({
      data: {
        studentId: student.id,
        score: readinessScore,
        level,
        probability,
        suggestions: JSON.stringify(actionPlan),
        weaknesses: JSON.stringify(topWeaknesses),
        strengths: JSON.stringify(topStrengths),
        nextActions: JSON.stringify(careerInsights),
        metrics: JSON.stringify(metrics)
      }
    });

    // Update the student record with the new score
    await prisma.student.update({
      where: { id: student.id },
      data: { readinessScore }
    });

    // Fetch history for the response
    const fullHistory = await prisma.placementReadiness.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 7
    });

    res.json({
      readinessScore,
      level,
      probability,
      metrics,
      topWeaknesses,
      topStrengths,
      stats: studentData.stats,
      suggestions: actionPlan,
      careerInsights,
      jobEligibility,
      missingSkillsForJobs,
      recommendedRoles,
      history: fullHistory.reverse()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze readiness' });
  }
};
