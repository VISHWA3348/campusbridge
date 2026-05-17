import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";

/**
 * Centralized AI Service to handle OpenRouter API requests.
 */
class AIService {
  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  }

  /**
   * General purpose method to call OpenRouter.
   */
  async callAI(prompt, systemPrompt = "You are a helpful career assistant for CampusBridge, an alumni-student networking platform.", model = DEFAULT_MODEL) {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://campusbridge.edu", // Optional: your site URL
          "X-Title": "CampusBridge AI", // Optional: your site name
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API Error:", errorData);
        throw new Error(errorData.error?.message || "Failed to fetch from AI service");
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }

  /**
   * Analyzes a resume for a specific role.
   */
  async analyzeResume(resumeText, targetRole) {
    const systemPrompt = `You are an expert HR Recruiter and ATS Optimizer. 
Analyze the following resume for the role: ${targetRole}. 
Return a JSON object with:
{
  "score": number,
  "atsScore": number,
  "skillScore": number,
  "projectQuality": number,
  "communicationScore": number,
  "designScore": number,
  "readinessScore": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "missingSkills": {
    "technologies": string[],
    "certifications": string[],
    "keywords": string[]
  },
  "projectAnalysis": string[],
  "skillGapAnalysis": {
    "current": string[],
    "expected": string[],
    "recommendations": string[]
  },
  "placementReadiness": "Beginner" | "Developing" | "Ready" | "Industry Ready"
}`;

    const prompt = `Resume Content:
${resumeText}

Analyze this resume for the role of ${targetRole} and provide the analysis in the specified JSON format. Return ONLY valid JSON, do not include any other text or markdown formatting.`;

    const result = await this.callAI(prompt, systemPrompt);
    try {
      const match = result.match(/\{[\s\S]*\}/);
      const cleanJson = match ? match[0] : result.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse AI JSON response:", result);
      throw new Error("AI returned invalid data format");
    }
  }

  /**
   * Generates a dynamic, multi-level career roadmap.
   */
  async generateRoadmap(studentProfile, targetRole) {
    const systemPrompt = `You are a Career Coach and Industry Expert. 
Create a highly personalized career roadmap for the role: ${targetRole}.
Consider the student's background:
- Department: ${studentProfile.department}
- Current Skills: ${studentProfile.skills}
- Resume Data: ${JSON.stringify(studentProfile.resumeData || {})}

The roadmap MUST be structured into three distinct levels: Beginner, Intermediate, and Advanced.
For EACH level, provide:
1. Key concepts and skills to learn.
2. Specific starter tools or frameworks.
3. Relevant real-world projects (Beginner: simple, Intermediate: real-world, Advanced: complex/scaling).
4. Recommended certifications.
5. Interview preparation topics specific to that level.

Return a JSON object with:
{
  "role": "${targetRole}",
  "overview": "A brief mentor-like introduction",
  "levels": {
    "beginner": {
      "skills": string[],
      "tools": string[],
      "projects": [{ "title": string, "description": string }],
      "certifications": string[],
      "interviewPrep": string[],
      "resources": string[]
    },
    "intermediate": {
      "skills": string[],
      "tools": string[],
      "projects": [{ "title": string, "description": string }],
      "certifications": string[],
      "interviewPrep": string[],
      "resources": string[]
    },
    "advanced": {
      "skills": string[],
      "tools": string[],
      "projects": [{ "title": string, "description": string }],
      "certifications": string[],
      "interviewPrep": string[],
      "resources": string[]
    }
  },
  "steps": [
    { "id": string, "title": string, "level": "Beginner" | "Intermediate" | "Advanced", "description": string }
  ]
}`;

    const prompt = `Generate a comprehensive AI-powered career roadmap for a student aiming to become a ${targetRole}. Ensure the advice is actionable and placement-focused. Return ONLY valid JSON, do not include any other text or markdown formatting.`;

    const result = await this.callAI(prompt, systemPrompt);
    try {
      const match = result.match(/\{[\s\S]*\}/);
      const cleanJson = match ? match[0] : result.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Roadmap JSON Error:", result);
      throw new Error("AI returned invalid roadmap format");
    }
  }

  /**
   * Generates deep placement readiness insights.
   */
  async getPlacementInsights(studentData) {
    const systemPrompt = `You are an AI Placement Mentor. 
Analyze the student's platform activity and profile to determine their career readiness.
Student Activity Data:
${JSON.stringify(studentData, null, 2)}

Calculate a Placement Readiness Score (0-100) based on:
1. Resume Quality (ATS score, content).
2. Profile Completion (GitHub, LinkedIn, CGPA).
3. Technical Skills (Roadmap progress, skill list).
4. Engagement (Webinars attended, referrals sent, mentorship sessions).
5. Application Activity (Jobs applied).

Return a JSON object with:
{
  "readinessScore": number,
  "level": "Beginner" | "Intermediate" | "Placement Ready",
  "probability": string (e.g., "High", "Moderate", "Low"),
  "metrics": {
    "technical": number,
    "resume": number,
    "communication": number,
    "activity": number,
    "profileHealth": number
  },
  "topWeaknesses": string[],
  "topStrengths": string[],
  "actionPlan": string[],
  "careerInsights": string[],
  "jobEligibility": string,
  "missingSkillsForJobs": string[],
  "recommendedRoles": string[]
}`;

    const prompt = `Analyze this student's readiness for placement. Be critical yet encouraging. Provide actionable steps to reach 100% readiness.`;

    const result = await this.callAI(prompt, systemPrompt);
    try {
      const cleanJson = result.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Insights JSON Error:", result);
      throw new Error("AI returned invalid insights format");
    }
  }
}

export default new AIService();
