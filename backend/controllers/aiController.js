import prisma from '../prisma/db.js';
import aiService from '../services/aiService.js';

export const getDashboardInsights = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: {
        resumeAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        roadmaps: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!student) return res.status(403).json({ error: 'Not a student' });

    const context = {
      skills: student.skills,
      targetRole: student.interestedJobRole,
      resumeScore: student.resumeAnalyses[0]?.score || 0,
      roadmapProgress: student.roadmaps[0]?.progress || 0
    };

    const systemPrompt = "You are a personalized career mentor. Based on the student's current state, provide 3 short, actionable 'Smart Suggestions' for their dashboard.";
    const prompt = `Student Context: ${JSON.stringify(context)}. Provide 3 smart suggestions. Return as a JSON array of strings.`;

    const result = await aiService.callAI(prompt, systemPrompt);
    let suggestions = [];
    try {
      suggestions = JSON.parse(result.replace(/```json|```/g, "").trim());
    } catch (e) {
      suggestions = ["Keep improving your skills", "Check out new job postings", "Connect with alumni"];
    }

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
};

export const chatAssistant = async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId }
    });

    const systemPrompt = `You are the CampusBridge AI Assistant. You help students with career advice, platform navigation, and interview prep. 
    Student Name: ${req.user.name}
    Student Skills: ${student?.skills || 'Not specified'}
    Keep responses concise and helpful.`;

    // Incorporate history if provided
    const historyPrompt = chatHistory.map(h => `${h.role}: ${h.content}`).join("\n");
    const fullPrompt = `${historyPrompt}\nuser: ${message}`;

    const response = await aiService.callAI(fullPrompt, systemPrompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'AI Assistant is currently unavailable' });
  }
};
