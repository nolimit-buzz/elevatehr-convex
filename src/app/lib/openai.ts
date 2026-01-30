const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_KEY
// app/api/generate-description/route.js
// import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});
const jobDescriptionGenerator = `You are a professional job description writer with expertise in HR and talent acquisition. Create a comprehensive and compelling JSON object for the job title: "\${jobTitle}".

Write in a professional, engaging tone that attracts top talent while being specific and actionable. Use industry-standard terminology and ensure the description is inclusive and accessible.

The JSON must follow this exact structure:
{
  "jobTitle": "\${jobTitle}",
  "aboutTheRole": "Write a compelling 3-4 sentence overview that clearly explains: (1) the core purpose and impact of this role on the organization, (2) key challenges or opportunities the person will tackle, (3) what success looks like in this position, and (4) why this role is exciting for career growth. Be specific about the value this role creates for the business and customers.",
  "jobResponsibilities": "Create 5-6 specific, measurable responsibilities using bullet points. Each should start with a strong action verb and include specific deliverables, success metrics, or outcomes. Format as: '• [Action verb] [specific task/deliverable] [context/stakeholders] [expected outcome/metric]'. Include responsibilities that span: core execution, strategic planning, collaboration, process improvement, and leadership/mentoring. Make each responsibility distinct and comprehensive.",
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
- Use \\n for line breaks in jobResponsibilities section only`;

export async function generateInput(request: { jobTitle: string, jobLevel: string, field: string }) {
    try {
        const { jobTitle, jobLevel, field } = request;
        
        // Create a prompt based on the job title and level
        const fullJobTitle = jobLevel ? `${jobLevel} ${jobTitle}` : jobTitle;
        const prompt = jobDescriptionGenerator.replace(/\${jobTitle}/g, fullJobTitle);

        // Call the OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional job description writer with expertise in creating compelling, accurate, and inclusive job descriptions. You must respond with ONLY valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" } // This ensures JSON output
        });

        const generatedText = response.choices[0].message.content;
        console.log('Generated content:', generatedText);
        
        try {
            // Check if generatedText is null or empty
            if (!generatedText) {
                throw new Error('Generated text is empty or null');
            }
            
            // Parse the JSON response
            const parsedResponse = JSON.parse(generatedText);
            
            // Filter fields if requested
            console.log('Parsed response:', field);
            if (field) {
                console.log('Parsed response:',  {
                    jobTitle: parsedResponse.jobTitle,
                    [field]: parsedResponse[field]
                })
                return {
                    jobTitle: parsedResponse.jobTitle,
                    [field]: parsedResponse[field]
                };
            }
            
            return parsedResponse;
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.error('Raw content:', generatedText);
            return { error: 'Failed to parse generated job description' };
        }
    } catch (error) {
        console.error('Error generating job description:', error);
        return { error: 'Failed to generate job description' };
    }
}

export async function generateSkillsForRole(jobTitle: string, jobDescription: string): Promise<{ technical: string[], soft: string[] }> {
  try {
    const prompt = `Given this job title: "${jobTitle}" and description: "${jobDescription}", 
    generate a comprehensive list of skills required for this role. Include:

    1. Technical Skills (at least 50):
 

    2. Soft Skills (at least 40):
    

    Format the response as a JSON object with two arrays: "technical" and "soft".
    Each skill should be a single word or space-separated phrase (do not use hyphens).
    Ensure skills are specific and relevant to the role.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a technical recruiter helping to identify relevant skills for a job posting. Generate comprehensive lists of both technical and soft skills."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"technical":[],"soft":[]}');
    return result;
  } catch (error) {
    console.error('Error generating skills:', error);
    return { technical: [], soft: [] };
  }
}