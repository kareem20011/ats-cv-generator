import { GoogleGenAI, Type } from "@google/genai";
import { CVData, JDAnalysis } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing Gemini API key. Set VITE_GEMINI_API_KEY in your .env/.env.local (and in Vercel Environment Variables) then restart the dev server."
  );
}

const ai = new GoogleGenAI({ apiKey });

export const analyzeJobDescription = async (jd: string): Promise<JDAnalysis> => {
  // Use Gemini 3 Flash for text analysis and extraction
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this job description and extract critical information for a resume. 
    Return as JSON.
    JD: ${jd}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keywords: {
            type: Type.OBJECT,
            properties: {
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              tools: { type: Type.ARRAY, items: { type: Type.STRING } },
              responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['skills', 'tools', 'responsibilities']
          },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          matchScore: { type: Type.NUMBER },
          // Ensure suggestions is present to match JDAnalysis interface
          suggestions: { type: Type.STRING }
        },
        required: ['keywords', 'gaps', 'matchScore', 'suggestions']
      }
    }
  });

  // Extract text using .text property and trim before parsing
  return JSON.parse(response.text.trim());
};

export const optimizeBulletPoint = async (action: string, task: string, result: string): Promise<string> => {
  const prompt = `Convert these raw facts into ONE professional ATS-optimized resume bullet point following the "Action + What + How + Result" pattern.
  Action: ${action}
  What: ${task}
  Result/Metric: ${result}
  
  Make it punchy, technical, and high-impact. Use strong action verbs.`;

  // Use ai.models.generateContent to query GenAI directly
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  // Access text property directly as per latest SDK guidelines
  return response.text.trim().replace(/^[-•]\s*/, '');
};

export const generateSummary = async (cvData: CVData, jd: string): Promise<string> => {
  const prompt = `Create a 3-5 line professional summary for a resume.
  The summary should be tailored to this specific job description while accurately reflecting the candidate's data.
  
  Candidate Data:
  - Title: ${cvData.professionalTitle}
  - Key Skills: ${cvData.skillGroups.map(sg => sg.skills.join(', ')).join(', ')}
  - Experience Highlights: ${cvData.experiences.slice(0, 2).map(e => e.role + ' at ' + e.company).join(', ')}
  
  Job Description:
  ${jd}
  
  Ensure it's keyword-optimized but natural.`;

  // Query Gemini with model name and prompt in a single call
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  // Use the .text property to extract output
  return response.text.trim();
};
