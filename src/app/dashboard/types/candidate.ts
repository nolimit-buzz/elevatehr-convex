export interface JobDetails {
  title: string;
  about_role: string;
  job_type: string;
  work_model: string;
  location: string;
  level?: string;
  responsibilities?: string;
  expectations?: string;
  stage_counts: {
    new: number;
    skill_assessment: number;
    interviews: number;
    acceptance: number;
    archived: number;
  };
  requirements?: string[];
  experience_years?: string;
  status: string;
  assessment_id?: string;
}

export interface FilterState {
  yearsOfExperience: string;
  salaryMin: string;
  salaryMax: string;
  requiredSkills: string[];
  availability: string;
  trial: string;
}

export interface Candidate {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  cv_url: string;
  status: string;
  created_at: string;
  professional_info?: {
    experience_years: number;
    skills: string | string[];
    education: string[];
    start_date: string;
    [key: string]: any;
  };
  cv_analysis?: {
    experience_years?: number;
    skills?: string[];
    education?: string[];
    [key: string]: any;
  };
  attachments?: {
    cv?: string;
  };
  [key: string]: any;
}

// Import CompanyApplication from Convex for type compatibility
import type { CompanyApplication } from "@/queries/applications.queries";

export interface CandidateResponse {
  applications: CompanyApplication[];
  total?: number;
}

export interface SkillColor {
  bg: string;
  color: string;
}

export type StageType = "new" | "skill_assessment" | "interviews" | "acceptance" | "archived";

export interface PhaseOption {
  label: string;
  icon: any; // Using any to allow MUI icon props like fontSize
  action: string;
  id?: string;
}

export interface Assessment {
  id: string | number;
  type: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
