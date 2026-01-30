import { generateSkillsForRole } from './openai';

export interface Skill {
  value: string;
  label: string;
  isCustom?: boolean;
}

let customSkills: Set<string> = new Set();

export async function getSkillsForRole(jobTitle: string, jobDescription: string): Promise<Skill[]> {
  const { technical, soft } = await generateSkillsForRole(jobTitle, jobDescription);
  
  const allSkills = [
    ...technical.map(skill => ({ value: skill, label: skill })),
    ...soft.map(skill => ({ value: skill, label: skill })),
    ...Array.from(customSkills).map(skill => ({ value: skill, label: skill, isCustom: true }))
  ];

  return allSkills;
}

export function addCustomSkill(skill: string) {
  if (skill.trim()) {
    customSkills.add(skill.trim());
  }
}

export function removeCustomSkill(skill: string) {
  customSkills.delete(skill);
}

// Fallback list of common skills in case OpenAI fails
export const fallbackSkills: Skill[] = [
  // Technical Skills
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'java', label: 'Java' },
  { value: 'sql', label: 'SQL' },
  { value: 'aws', label: 'AWS' },
  { value: 'docker', label: 'Docker' },
  { value: 'git', label: 'Git' },
  
  // Soft Skills
  { value: 'communication', label: 'Communication' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'problem-solving', label: 'Problem Solving' },
  { value: 'teamwork', label: 'Teamwork' },
  { value: 'time-management', label: 'Time Management' },
  { value: 'adaptability', label: 'Adaptability' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'critical-thinking', label: 'Critical Thinking' },
  { value: 'project-management', label: 'Project Management' },
  { value: 'mentoring', label: 'Mentoring' }
]; 