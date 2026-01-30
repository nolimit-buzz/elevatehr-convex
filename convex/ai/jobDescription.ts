import { Groq } from "groq-sdk";

const jobDescriptionPrompt = `You are a professional job description writer with expertise in HR and talent acquisition. Create a comprehensive and compelling JSON object for the job title: "\${jobTitle}".

Write in a professional, engaging tone that attracts top talent while being specific and actionable. Use industry-standard terminology and ensure the description is inclusive and accessible.

The JSON must follow this exact structure:
{
  "jobTitle": "\${jobTitle}",
  "aboutTheRole": "Write a compelling 3-4 sentence overview that clearly explains: (1) the core purpose and impact of this role on the organization, (2) key challenges or opportunities the person will tackle, (3) what success looks like in this position, and (4) why this role is exciting for career growth. Be specific about the value this role creates for the business and customers.",
  "jobResponsibilities": ["Responsibility 1 - specific, measurable with action verb", "Responsibility 2", ...],
  "expectations": [
    "Educational background: Specify degree level, field of study, and acceptable alternatives (e.g., 'Bachelor's degree in Computer Science, Engineering, or related technical field, or equivalent practical experience with demonstrated technical proficiency')",
    "Professional experience: Include years, specific domain expertise, and proven track record (e.g., '5+ years of experience in software development with demonstrated success in delivering scalable applications and leading technical projects')",
    "Technical competencies: List specific tools, technologies, programming languages, or methodologies with proficiency levels (e.g., 'Expert-level proficiency in Python, JavaScript, and cloud platforms (AWS/Azure) with experience architecting microservices')",
    "Core soft skills: Specify communication, leadership, or analytical abilities with context (e.g., 'Exceptional written and verbal communication skills with proven ability to present complex technical concepts to non-technical stakeholders')",
    "Industry or domain knowledge: Include relevant sector experience, regulations, or specialized knowledge (e.g., 'Experience in fintech or financial services with understanding of regulatory compliance and security requirements')",
    "Leadership and collaboration: Describe team dynamics, mentoring, or cross-functional work experience (e.g., 'Proven track record of leading cross-functional teams, mentoring junior developers, and driving technical decision-making in collaborative environments')"
  ]
}

Content Quality Requirements:
- Make each responsibility specific with clear deliverables and success criteria
- Include relevant metrics, timelines, or performance indicators where applicable
- Ensure expectations are realistic, measurable, and directly related to job success
- Use active voice and specific action verbs throughout
- Avoid vague terms like 'support,' 'assist,' or 'help with' - be specific about what the person will accomplish
- Include both individual contributor and collaborative aspects of the role
- Consider the seniority level when setting expectations for experience and leadership

Technical Requirements:
- Ensure the response is ONLY valid JSON with no additional text or markdown formatting
- Do not include any prefixes like \`\`\`json or \`\`\`
- All string values must be properly escaped for JSON format
- jobResponsibilities must be an array of 5-6 responsibility strings`;

export interface JobDescriptionResponse {
  jobTitle: string;
  aboutTheRole: string;
  jobResponsibilities: string[];
  expectations: string[];
}

export interface GenerateJobDescriptionResult {
  success: boolean;
  data?: JobDescriptionResponse | Partial<JobDescriptionResponse>;
  error?: string;
}

export interface GenerateSkillsResult {
  technical: string[];
  soft: string[];
}

// Generate job description using Groq
export async function generateJobDescription(args: {
  jobTitle: string;
  jobLevel?: string;
  aiApiKey: string;
}): Promise<GenerateJobDescriptionResult> {
  try {
    const { jobTitle, jobLevel, aiApiKey } = args;
    const groq = new Groq({ apiKey: aiApiKey });
    const fullJobTitle = jobLevel ? `${jobLevel} ${jobTitle}` : jobTitle;
    const prompt = jobDescriptionPrompt.replace(/\${jobTitle}/g, fullJobTitle);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional job description writer with expertise in creating compelling, accurate, and inclusive job descriptions. You must respond with ONLY valid JSON.",
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
      return { success: false, error: "Generated text is empty or null" };
    }

    const parsedResponse = JSON.parse(generatedText) as JobDescriptionResponse;

    return { success: true, data: parsedResponse };
  } catch (error) {
    console.error("Error generating job description:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate job description",
    };
  }
}

// Generate skills for a role using Groq
export async function generateSkillsForRole(args: {
  jobTitle: string;
  jobDescription: string;
}): Promise<GenerateSkillsResult> {
  try {
    const { jobTitle, jobDescription } = args;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Given this job title: "${jobTitle}" and description: "${jobDescription}", 
    generate a comprehensive list of skills required for this role. Include:

    1. Technical Skills (at least 50)
    2. Soft Skills (at least 40)

    Format the response as a JSON object with two arrays: "technical" and "soft".
    Each skill should be a single word or space-separated phrase (do not use hyphens).
    Ensure skills are specific and relevant to the role.`;

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
