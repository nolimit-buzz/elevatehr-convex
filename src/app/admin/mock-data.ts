/**
 * Mock data for Admin Dashboard (frontend-only, no Convex).
 */

export type RecruiterStatus = "active" | "pending" | "suspended";

export interface MockRecruiter {
  id: string;
  companyName: string;
  industry: string;
  logoUrl?: string;
  primaryAdmin: string;
  email: string;
  status: RecruiterStatus;
  tier: "standard" | "premium";
  jobsCount: number;
  candidatesCount: number;
  createdAt: string;
  featureFlags: { aiTools: boolean };
}

export interface MockAssessmentTemplate {
  id: string;
  title: string;
  type: "quiz" | "technical";
  scope: "global" | "assigned";
  createdAt: string;
}

export interface MockEmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyPreview: string;
  variables: string[];
}

export interface MockAuditEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

export interface MockCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  stage: string;
  assessmentScore?: number;
  appliedAt: string;
}

export interface MockJobRow {
  id: string;
  title: string;
  status: string;
  applicants: number;
  createdAt: string;
}

// Global analytics
export const MOCK_GLOBAL_KPIS = {
  activeRecruiters: 24,
  totalJobsPosted: 156,
  totalCandidatesApplied: 2847,
  platformPassRate: 72,
};

export const MOCK_RECRUITER_GROWTH = [
  { month: "Aug", count: 12 },
  { month: "Sep", count: 14 },
  { month: "Oct", count: 16 },
  { month: "Nov", count: 19 },
  { month: "Dec", count: 21 },
  { month: "Jan", count: 24 },
];

export const MOCK_USAGE_BILLING = {
  premiumAssessmentsThisMonth: 420,
  totalActiveSeats: 48,
};

// Recruiter directory
export const MOCK_RECRUITERS: MockRecruiter[] = [
  {
    id: "co-1",
    companyName: "TechHire Solutions",
    industry: "Technology",
    primaryAdmin: "Jane Smith",
    email: "jane@techflow.io",
    status: "active",
    tier: "premium",
    jobsCount: 1,
    candidatesCount: 2,
    createdAt: "2024-09-15",
    featureFlags: { aiTools: true },
  },
  {
    id: "co-2",
    companyName: "Creative Talent Agency",
    industry: "Design",
    primaryAdmin: "Mike Johnson",
    email: "mike@hireright.com",
    status: "active",
    tier: "standard",
    jobsCount: 1,
    candidatesCount: 1,
    createdAt: "2024-10-01",
    featureFlags: { aiTools: false },
  },
  {
    id: "co-3",
    companyName: "Okwu Njoku",
    industry: "Oil",
    primaryAdmin: "Sarah Williams",
    email: "sarah@talentbridge.co",
    status: "active",
    tier: "standard",
    jobsCount: 0,
    candidatesCount: 0,
    createdAt: "2025-01-20",
    featureFlags: { aiTools: false },
  },
  {
    id: "co-4",
    companyName: "RecruitPro",
    industry: "Technology",
    primaryAdmin: "David Brown",
    email: "david@recruitpro.com",
    status: "suspended",
    tier: "premium",
    jobsCount: 5,
    candidatesCount: 89,
    createdAt: "2024-08-10",
    featureFlags: { aiTools: true },
  },
];

export const MOCK_ASSESSMENT_TEMPLATES: MockAssessmentTemplate[] = [
  { id: "a1", title: "React Fundamentals", type: "quiz", scope: "global", createdAt: "25/02/2026" },
  { id: "a2", title: "System Design Challenge", type: "technical", scope: "global", createdAt: "25/02/2026" },
];

export const MOCK_EMAIL_TEMPLATES: MockEmailTemplate[] = [
  {
    id: "e1",
    name: "Application Received",
    subject: "We received your application for {{job_title}}",
    bodyPreview: "Hi {{candidate_name}}, Thank you for applying to {{company_name}}. We have received your application and will review it shortly.",
    variables: ["{{candidate_name}}", "{{job_title}}", "{{company_name}}"],
  },
  {
    id: "e2",
    name: "Interview Invite",
    subject: "Interview Invitation: {{job_title}}",
    bodyPreview: "Hi {{candidate_name}}, We'd like to invite you for an interview for the {{job_title}} position at {{company_name}}.",
    variables: ["{{candidate_name}}", "{{job_title}}", "{{company_name}}"],
  },
];

export const MOCK_RECENT_ACTIVITY = [
  { id: "ra1", text: "New recruiter 'TechHire Solutions' joined.", time: "2 hours ago" },
  { id: "ra2", text: "High volume job 'Senior Frontend Engineer' posted by TechHire.", time: "4 hours ago" },
  { id: "ra3", text: "Global assessment 'React Fundamentals' updated.", time: "1 day ago" },
];

// Single recruiter deep-dive (for co-1)
export const MOCK_RECRUITER_DASHBOARD_SNAPSHOT = {
  activeJobs: 12,
  totalApplicants: 340,
  interviewsScheduled: 28,
};

export const MOCK_AUDIT_LOG: MockAuditEntry[] = [
  { id: "1", action: "Deleted Job", details: "Job #402 - Senior Frontend Developer", timestamp: "2025-02-25T10:30:00Z", user: "Jane Smith" },
  { id: "2", action: "Invited User", details: "Sarah Chen (sarah@techflow.io)", timestamp: "2025-02-24T14:00:00Z", user: "Jane Smith" },
  { id: "3", action: "Created Job", details: "Backend Engineer - Remote", timestamp: "2025-02-23T09:15:00Z", user: "Jane Smith" },
  { id: "4", action: "Archived Candidate", details: "John Doe - Backend Engineer", timestamp: "2025-02-22T16:45:00Z", user: "Jane Smith" },
];

export const MOCK_CANDIDATES: MockCandidate[] = [
  { id: "c1", name: "Alex Rivera", email: "alex.r@email.com", phone: "+1 555-0101", jobTitle: "Senior Frontend Developer", stage: "interviews", assessmentScore: 85, appliedAt: "2025-02-20" },
  { id: "c2", name: "Jordan Lee", email: "jordan.lee@email.com", phone: "+1 555-0102", jobTitle: "Senior Frontend Developer", stage: "skill_assessment", assessmentScore: 72, appliedAt: "2025-02-21" },
  { id: "c3", name: "Sam Taylor", email: "sam.t@email.com", phone: "+1 555-0103", jobTitle: "Backend Engineer", stage: "new", appliedAt: "2025-02-24" },
];

export const MOCK_JOBS: MockJobRow[] = [
  { id: "j1", title: "Senior Frontend Developer", status: "active", applicants: 45, createdAt: "2025-01-15" },
  { id: "j2", title: "Backend Engineer - Remote", status: "active", applicants: 32, createdAt: "2025-02-01" },
  { id: "j3", title: "DevOps Engineer", status: "closed", applicants: 18, createdAt: "2024-12-10" },
];
