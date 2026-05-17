import prisma from '../prisma/db.js';
import aiService from '../services/aiService.js';

export const getRoadmaps = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return res.status(403).json({ error: 'Not a student' });
    
    const userRoadmaps = await prisma.careerRoadmap.findMany({ 
      where: { studentId: student.id } 
    });
    
    res.json({ userRoadmaps });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
};

export const createRoadmap = async (req, res) => {
  try {
    const { title } = req.body;
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return res.status(403).json({ error: 'Not a student' });

    // Check if already exists
    const existing = await prisma.careerRoadmap.findFirst({
      where: { studentId: student.id, title }
    });
    if (existing) return res.json(existing);

    // Generate AI Roadmap
    const resumeAnalysis = await prisma.resumeAnalysis.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    const studentProfile = {
      skills: student.skills,
      department: student.department,
      resumeData: resumeAnalysis ? {
        score: resumeAnalysis.score,
        missingSkills: resumeAnalysis.missingSkills,
        suggestions: resumeAnalysis.suggestions
      } : null
    };
    let aiRoadmap;
    try {
      aiRoadmap = await aiService.generateRoadmap(studentProfile, title);
    } catch (aiError) {
      console.warn("AI Roadmap generation failed, using fallback:", aiError);
      aiRoadmap = {
        role: title,
        overview: `A structured career path to become a ${title}. Focus on building foundational skills, practical projects, and interview readiness.`,
        levels: {
          beginner: {
            skills: ["Core Fundamentals", "Basic Concepts"],
            tools: ["Essential Tools"],
            projects: [{ title: "Starter Project", description: "Learn the basics by building a simple project." }],
            certifications: ["Basic Certification"],
            interviewPrep: ["Fundamental concepts and definitions"],
            resources: ["Official Documentation", "Beginner Tutorials"]
          },
          intermediate: {
            skills: ["Advanced Concepts", "Architecture"],
            tools: ["Industry Standard Tools"],
            projects: [{ title: "Real-world Application", description: "Build a production-like application." }],
            certifications: ["Professional Certification"],
            interviewPrep: ["System Design", "Scenario-based questions"],
            resources: ["Advanced Courses", "Tech Blogs"]
          },
          advanced: {
            skills: ["System Scaling", "Performance Optimization"],
            tools: ["Enterprise Tools"],
            projects: [{ title: "Scalable System", description: "Design and implement a highly scalable system." }],
            certifications: ["Expert Level Certification"],
            interviewPrep: ["Deep dive into architecture", "Leadership questions"],
            resources: ["Research Papers", "Industry Conferences"]
          }
        },
        steps: [
          { id: "step_1", title: "Master Fundamentals", level: "Beginner", description: "Learn the core concepts and basic tools required for this role." },
          { id: "step_2", title: "Build Starter Projects", level: "Beginner", description: "Apply your knowledge by building small, functional projects." },
          { id: "step_3", title: "Advanced Architecture", level: "Intermediate", description: "Understand how to build robust, scalable applications." },
          { id: "step_4", title: "Real-world Implementation", level: "Intermediate", description: "Contribute to open source or build a full-stack project." },
          { id: "step_5", title: "Expert Specialization", level: "Advanced", description: "Deep dive into complex topics and performance tuning." },
          { id: "step_6", title: "Interview Readiness", level: "Advanced", description: "Prepare for behavioral and technical interviews." }
        ]
      };
    }

    const roadmap = await prisma.careerRoadmap.create({
      data: {
        studentId: student.id,
        title,
        steps: JSON.stringify(aiRoadmap.steps),
        detailedData: JSON.stringify(aiRoadmap),
        completedSteps: JSON.stringify([]),
        currentLevel: "Beginner",
        progress: 0
      }
    });
    res.json(roadmap);
  } catch (error) {
    console.error("Roadmap creation error:", error);
    res.status(500).json({ error: 'Failed to create roadmap' });
  }
};

export const updateRoadmapStep = async (req, res) => {
  try {
    const { roadmapId, stepId, completed } = req.body;
    const roadmap = await prisma.careerRoadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    let completedSteps = JSON.parse(roadmap.completedSteps || "[]");
    
    if (completed) {
      if (!completedSteps.includes(stepId)) completedSteps.push(stepId);
    } else {
      completedSteps = completedSteps.filter(id => id !== stepId);
    }

    const steps = JSON.parse(roadmap.steps || "[]");
    const progress = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0;

    let currentLevel = "Beginner";
    if (progress > 40) currentLevel = "Intermediate";
    if (progress > 80) currentLevel = "Advanced";

    const updated = await prisma.careerRoadmap.update({
      where: { id: roadmapId },
      data: {
        completedSteps: JSON.stringify(completedSteps),
        progress,
        currentLevel
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update roadmap' });
  }
};
