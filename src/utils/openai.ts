const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_KEY
// app/api/generate-description/route.js
// import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

const jobDescriptionGenerator = `You are a professional job description writer. Create a JSON object with the following structure for the job title: "\${jobTitle}".

The JSON must follow this exact structure:
{
  "jobTitle": "\${jobTitle}",
  "aboutTheRole": "A detailed description of the role.",
  "jobResponsibilities": "Responsibility 1.\\nResponsibility 2.\\nResponsibility 3.\\nResponsibility 4.\\nResponsibility 5.",
  "expectations": [
    "Qualification 1",
    "Qualification 2",
    "Qualification 3",
    "Qualification 4"
  ]
}

Ensure the response is ONLY valid JSON with no additional text or markdown formatting. Do not include any prefixes like \`\`\`json or \`\`\`.`;

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