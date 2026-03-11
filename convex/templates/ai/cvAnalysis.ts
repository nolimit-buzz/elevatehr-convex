"use node";

import { Groq } from "groq-sdk";

export interface CVAnalysisResult {
  match_score: number;
  skills_match: string[];
  missing_skills: string[];
  experience_years: number;
  education_level: string;
  recommendations: string;
  skills: string[];
  education: string[];
  summary: string;
}

export interface AnalyzeCVArgs {
  cvText: string;
  jobTitle: string;
  jobDescription?: string;
  jobSkills?: string[];
  jobRequirements?: string[];
  aiApiKey: string;
}

const cvAnalysisPrompt = `You are an expert HR recruiter analyzing a candidate's CV/resume for a specific job position.

Job Title: "\${jobTitle}"
Job Description: "\${jobDescription}"
Required Skills: \${jobSkills}
Job Requirements: \${jobRequirements}

Analyze the following CV text and extract relevant information:

CV TEXT:
\${cvText}

Based on the CV content and job requirements, provide a JSON response with the following structure:
{
  "match_score": <number between 1-100 indicating how well the candidate matches the job requirements>,
  "skills_match": [<array of required skills that the candidate HAS based on their CV>],
  "missing_skills": [<array of required skills that the candidate is MISSING or lacks evidence of>],
  "experience_years": <number - total years of relevant professional experience, use 0 if unclear>,
  "education_level": "<highest education level: 'High School', 'Associate', 'Bachelor', 'Master', 'PhD', or 'Other'>",
  "recommendations": "<detailed hiring recommendation explaining why this candidate should or should not be considered, including strengths and areas of concern>",
  "skills": [<array of ALL technical and professional skills found in the CV>],
  "education": [<array of educational qualifications, degrees, certifications>],
  "summary": "<2-3 sentence summary of the candidate's profile and relevance to this specific role>"
}

Match Score Guidelines:
- 80-100: Excellent match - meets or exceeds all major requirements
- 60-79: Good match - meets most requirements with minor gaps
- 40-59: Moderate match - meets some requirements but has notable gaps
- 20-39: Weak match - meets few requirements
- 1-19: Poor match - does not align with the role

Be objective and base the analysis solely on the CV content provided.`;

export async function analyzeCVWithAI(args: AnalyzeCVArgs): Promise<CVAnalysisResult> {
  try {
    const { cvText, jobTitle, jobDescription, jobSkills, jobRequirements, aiApiKey } = args;

    const groq = new Groq({ apiKey: aiApiKey });

    const prompt = cvAnalysisPrompt
      .replace("${jobTitle}", jobTitle)
      .replace("${jobDescription}", jobDescription || "Not provided")
      .replace("${jobSkills}", jobSkills?.join(", ") || "Not specified")
      .replace("${jobRequirements}", jobRequirements?.join(", ") || "Not specified")
      .replace("${cvText}", cvText);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR recruiter specializing in CV analysis and candidate evaluation. Provide accurate, objective assessments based on the CV content. You must respond with ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const generatedText = response.choices[0].message.content;

    if (!generatedText) {
      throw new Error("AI returned empty response");
    }

    const parsedResponse = JSON.parse(generatedText) as CVAnalysisResult;

    // Validate and normalize the response
    return {
      match_score:
        typeof parsedResponse.match_score === "number" ? Math.min(100, Math.max(1, parsedResponse.match_score)) : 50,
      skills_match: Array.isArray(parsedResponse.skills_match) ? parsedResponse.skills_match : [],
      missing_skills: Array.isArray(parsedResponse.missing_skills) ? parsedResponse.missing_skills : [],
      experience_years: typeof parsedResponse.experience_years === "number" ? parsedResponse.experience_years : 0,
      education_level: typeof parsedResponse.education_level === "string" ? parsedResponse.education_level : "",
      recommendations: typeof parsedResponse.recommendations === "string" ? parsedResponse.recommendations : "",
      skills: Array.isArray(parsedResponse.skills) ? parsedResponse.skills : [],
      education: Array.isArray(parsedResponse.education) ? parsedResponse.education : [],
      summary: typeof parsedResponse.summary === "string" ? parsedResponse.summary : "",
    };
  } catch (error) {
    // Return default values if analysis fails
    return {
      match_score: 0,
      skills_match: [],
      missing_skills: [],
      experience_years: 0,
      education_level: "",
      recommendations: "CV analysis could not be completed.",
      skills: [],
      education: [],
      summary: "CV analysis could not be completed.",
    };
  }
}

// Extract text from PDF using pdf-parse compatible approach
export async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = Buffer.from(pdfBuffer);
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    throw new Error("Failed to extract text from PDF");
  }
}

// Extract text from DOCX using mammoth
export async function extractTextFromDOCX(docxBuffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const buffer = Buffer.from(docxBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    throw new Error("Failed to extract text from DOCX");
  }
}

// Determine file type and extract text accordingly
export async function extractTextFromCV(fileBuffer: ArrayBuffer, contentType: string): Promise<string> {
  const lowerType = contentType.toLowerCase();

  if (lowerType.includes("pdf") || lowerType === "application/pdf") {
    return extractTextFromPDF(fileBuffer);
  } else if (
    lowerType.includes("word") ||
    lowerType.includes("docx") ||
    lowerType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerType === "application/msword"
  ) {
    return extractTextFromDOCX(fileBuffer);
  } else {
    throw new Error(`Unsupported file type: ${contentType}`);
  }
}
