import prisma from '../prisma/db.js';
import aiService from '../services/aiService.js';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import axios from 'axios';
import { createNotification } from '../utils/notification.js';

const extractTextFromFile = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'];

    if (contentType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      await parser.destroy();
      return data.text;
    } else if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileUrl.toLowerCase().endsWith('.docx')) {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    } else {
      return buffer.toString('utf-8');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return '';
  }
};

export const generateResumeData = async (req, res) => {
  // ... (keep existing generateResumeData)
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: { 
        user: {
          include: { college: true }
        }
      }
    });

    if (!student) return res.status(403).json({ error: 'Not a student' });

    const resume = {
      header: {
        name: student.user.name,
        email: student.user.email,
        phone: student.phoneNumber || 'Not provided',
        linkedin: student.linkedIn || 'Not provided',
        portfolio: student.portfolioLink || 'Not provided',
        github: student.githubLink || 'Not provided'
      },
      summary: student.fullDetails || 'Professional student seeking opportunities to grow and contribute to the industry.',
      education: [
        {
          institution: student.user.college.name,
          degree: student.department || 'Not specified',
          year: student.currentYear || 'N/A',
          cgpa: student.cgpa || 'N/A'
        }
      ],
      skills: student.skills ? student.skills.split(',').map(s => s.trim()) : [],
      certifications: student.certifications ? student.certifications.split(',').map(c => c.trim()) : [],
      careerInterests: student.careerInterests || 'General Software Engineering',
      experience: [], 
      projects: student.githubLink ? [{ name: 'GitHub Projects', link: student.githubLink }] : []
    };

    res.json(resume);
  } catch (error) {
    console.error('Resume data generation error:', error);
    res.status(500).json({ error: 'Failed to generate resume data' });
  }
};

export const analyzeResume = async (req, res) => {
  try {
    const { fileName, fileUrl, filePublicId, targetRole = 'Full Stack Developer' } = req.body;
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: { user: true }
    });

    if (!student) return res.status(403).json({ error: 'Student not found' });

    // --- REAL AI ANALYSIS FROM FILE TEXT ---
    let resumeText = "";
    if (fileUrl) {
      resumeText = await extractTextFromFile(fileUrl);
      
      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(400).json({ error: 'Resume text extraction failed. Please ensure your file is a valid PDF/DOCX with readable text.' });
      }

      // Basic heuristic validation for resumes
      const lowerText = resumeText.toLowerCase();
      const hasKeywords = ['education', 'experience', 'project', 'skill', 'university', 'college', 'degree', 'work'].filter(k => lowerText.includes(k)).length;
      if (hasKeywords < 2 || resumeText.length < 100) {
        return res.status(400).json({ error: 'Uploaded file does not appear to be a valid professional resume. Please upload a valid resume.' });
      }
    } else {
      // Fallback to profile data if no file provided
      const studentData = {
        name: student.user.name,
        skills: student.skills,
        bio: student.bio,
        github: student.githubLink,
        portfolio: student.portfolioLink,
        cgpa: student.cgpa,
        department: student.department
      };
      resumeText = JSON.stringify(studentData);
    }

    const aiAnalysis = await aiService.analyzeResume(resumeText, targetRole);

    const {
      score: overallScore,
      atsScore,
      skillScore,
      projectQuality,
      communicationScore,
      designScore,
      readinessScore,
      suggestions,
      missingSkills,
      strengths,
      weaknesses,
      projectAnalysis,
      skillGapAnalysis,
      placementReadiness
    } = aiAnalysis;

    const analysis = await prisma.resumeAnalysis.create({
      data: {
        studentId: student.id,
        fileName,
        fileUrl,
        filePublicId,
        targetRole,
        score: overallScore || 0,
        atsScore: atsScore || 0,
        skillScore: skillScore || 0,
        projectQuality: projectQuality || 0,
        communicationScore: communicationScore || 0,
        designScore: designScore || 0,
        readinessScore: readinessScore || 0,
        suggestions: JSON.stringify(suggestions || []),
        missingSkills: JSON.stringify(missingSkills || {}),
        strengths: JSON.stringify(strengths || []),
        weaknesses: JSON.stringify(weaknesses || []),
        projectAnalysis: JSON.stringify(projectAnalysis || []),
        skillGapAnalysis: JSON.stringify(skillGapAnalysis || {}),
        placementReadiness: placementReadiness || "Beginner"
      }
    });

    // Update student readiness score
    await prisma.student.update({
      where: { id: student.id },
      data: { readinessScore: readinessScore || 0 }
    });

    await createNotification(req, {
      userId: student.user.id,
      type: 'SYSTEM',
      title: 'Resume Analysis Complete',
      message: `Your resume has been analyzed for the ${targetRole} role. Your Readiness Score is ${readinessScore}%.`,
      priority: 'NORMAL',
      link: '/dashboard/student/resume-analyzer'
    });

    res.json(analysis);
  } catch (error) {
    console.error("Analysis Error:", error);
    const msg = error.message && error.message.includes("AI") 
      ? "AI server temporarily busy. Please retry in a few seconds." 
      : 'Failed to process resume analysis. Please try again.';
    res.status(500).json({ error: msg });
  }
};

export const getResumeHistory = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId }
    });
    if (!student) return res.status(403).json({ error: 'Student not found' });

    const history = await prisma.resumeAnalysis.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume history' });
  }
};
