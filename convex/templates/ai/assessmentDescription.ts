import { Groq } from "groq-sdk";

// ============================================
// TYPES
// ============================================

export interface QuizQuestion {
  question: string;
  type: "open-text" | "multi-choice";
  options: string[];
}

export interface GenerateQuestionsResult {
  success: boolean;
  questions?: QuizQuestion[];
  error?: string;
}

export interface GenerateSkillsResult {
  technical: string[];
  soft: string[];
}

export interface GenerateTechnicalContentResult {
  success: boolean;
  content?: string;
  error?: string;
}

// ============================================
// PROMPTS
// ============================================

const quizQuestionsPrompt = `You are an expert technical interviewer. Generate assessment questions for a \${jobTitle} position.

Skills to assess: \${skills}

Generate exactly:
- \${openTextCount} open-text questions (type: "open-text")
- \${multiChoiceCount} multiple-choice questions (type: "multi-choice")

For open-text questions:
- Ask thought-provoking questions that assess understanding and problem-solving
- Questions should require detailed explanations or code examples
- Set options to an empty array []

For multiple-choice questions:
- Provide exactly 4 options for each question
- Include one correct answer and three plausible but incorrect options
- Make questions challenging but fair

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Your question here",
      "type": "open-text" or "multi-choice",
      "options": [] or ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}

Ensure questions are professional, technically accurate, and relevant to the skills specified.`;

const technicalContentPrompt = `You are an expert technical interviewer creating a comprehensive take-home or practical assessment for a \${jobTitle} position.\n\nSkills to assess: \${skills}\nNumber of assessment options/tasks: \${optionsCount}\n\nCreate a detailed technical assessment document with the following structure:\n\n1. **Assessment Overview** - Brief introduction explaining what this assessment evaluates\n2. **Instructions** - Clear guidelines for candidates on how to complete the assessment, time expectations, and submission requirements\n3. **Assessment Tasks** - Generate exactly \${optionsCount} practical tasks/problems that:\n   - Test real-world application of the skills listed\n   - Are challenging but achievable\n   - Have clear success criteria\n   - Include code challenges, system design questions, or practical scenarios as appropriate\n4. **Evaluation Criteria** - What you will look for when reviewing submissions\n\nFormat the response in well-structured HTML that can be rendered in a rich text editor. Use proper headings (h2, h3), lists (ul, ol), code blocks where appropriate, and clear paragraph structure.\n\nMake the assessment professional, comprehensive, and challenging enough to distinguish exceptional candidates.`;

const skillsPrompt = `Given this job title: "\${jobTitle}" and description: "\${jobDescription}", 
generate a comprehensive list of skills required for this role. Include:

1. Technical Skills (15-20 relevant skills)
2. Soft Skills (10-15 relevant skills)

Format the response as a JSON object with two arrays: "technical" and "soft".
Each skill should be a single word or space-separated phrase (do not use hyphens).
Ensure skills are specific and relevant to the role.

Example format:
{
  "technical": ["JavaScript", "React", "Node.js", "REST APIs"],
  "soft": ["Communication", "Problem Solving", "Team Collaboration"]
}`;

// ============================================
// AI FUNCTIONS
// ============================================

/**
 * Generate quiz questions for an assessment using Groq AI
 */
export async function generateQuizQuestions(args: {
  jobTitle: string;
  level?: string;
  skills: string[];
  numberOfOpenTextQuestions: number;
  numberOfMultiChoiceQuestions: number;
  aiApiKey: string;
}): Promise<GenerateQuestionsResult> {
  try {
    const groq = new Groq({ apiKey: args.aiApiKey });
    const { jobTitle, level, skills, numberOfOpenTextQuestions, numberOfMultiChoiceQuestions } = args;

    const fullJobTitle = level ? `${level} ${jobTitle}` : jobTitle;

    const prompt = quizQuestionsPrompt
      .replace(/\${jobTitle}/g, fullJobTitle)
      .replace(/\${skills}/g, skills.join(", "))
      .replace(/\${openTextCount}/g, String(numberOfOpenTextQuestions))
      .replace(/\${multiChoiceCount}/g, String(numberOfMultiChoiceQuestions));

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer creating assessment questions. You must respond with ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const generatedText = response.choices[0].message.content;

    if (!generatedText) {
      return { success: false, error: "Generated text is empty" };
    }

    const result = JSON.parse(generatedText);
    return { success: true, questions: result.questions as QuizQuestion[] };
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate questions",
      questions: generateFallbackQuestions(args.numberOfOpenTextQuestions, args.numberOfMultiChoiceQuestions),
    };
  }
}

/**
 * Generate skills for a role using Groq AI
 */
export async function generateSkillsForRole(args: {
  jobTitle: string;
  jobDescription: string;
  aiApiKey: string;
}): Promise<GenerateSkillsResult> {
  try {
    const groq = new Groq({ apiKey: args.aiApiKey });
    const { jobTitle, jobDescription } = args;

    const prompt = skillsPrompt.replace(/\${jobTitle}/g, jobTitle).replace(/\${jobDescription}/g, jobDescription);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a technical recruiter helping to identify relevant skills for a job posting. Generate comprehensive lists of both technical and soft skills. You must respond with ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"technical":[],"soft":[]}');
    return result as GenerateSkillsResult;
  } catch (error) {
    console.error("Error generating skills:", error);
    return { technical: [], soft: [] };
  }
}

/**
 * Generate technical assessment content using Groq AI
 */
export async function generateTechnicalContent(args: {
  jobTitle: string;
  level?: string;
  skills: string[];
  assessmentOptions: number;
  aiApiKey: string;
}): Promise<GenerateTechnicalContentResult> {
  try {
    const groq = new Groq({ apiKey: args.aiApiKey });
    const { jobTitle, level, skills, assessmentOptions } = args;

    const fullJobTitle = level ? `${level} ${jobTitle}` : jobTitle;

    const prompt = technicalContentPrompt
      .replace(/\${jobTitle}/g, fullJobTitle)
      .replace(/\${skills}/g, skills.join(", "))
      .replace(/\${optionsCount}/g, String(assessmentOptions));

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer creating comprehensive practical assessments. Generate well-formatted HTML content that can be used in a rich text editor.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const generatedText = response.choices[0].message.content;

    if (!generatedText) {
      return { success: false, error: "Generated content is empty" };
    }

    return { success: true, content: generatedText };
  } catch (error) {
    console.error("Error generating technical content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate technical content",
    };
  }
}

/**
 * Generate fallback questions when AI fails
 */
function generateFallbackQuestions(openText: number, multiChoice: number): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < openText; i++) {
    questions.push({
      question: `Describe your experience with relevant skill ${i + 1} and how you have applied it in your previous work.`,
      type: "open-text",
      options: [],
    });
  }

  for (let i = 0; i < multiChoice; i++) {
    questions.push({
      question: `Question ${i + 1} about the role requirements`,
      type: "multi-choice",
      options: ["Option A", "Option B", "Option C", "Option D"],
    });
  }

  return questions;
}
