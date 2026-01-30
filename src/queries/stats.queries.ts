import { useAuthedQuery } from "@/app/convex.setup";
import { api } from "../../convex/_generated/api";

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
  active_jobs: number;
  total_applicants: number;
  assessments: number;
  total_jobs: number;
  closed_jobs: number;
  draft_jobs: number;
}

export interface JobStats {
  total: number;
  byStatus: {
    active: number;
    closed: number;
    draft: number;
  };
  byType: {
    fulltime: number;
    contract: number;
  };
  byWorkModel: {
    onsite: number;
    remote: number;
    hybrid: number;
  };
}

export interface AssessmentStats {
  total: number;
  byType: {
    technical_assessment: number;
    online_assessment_1: number;
    online_assessment_2: number;
  };
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to get dashboard statistics
 * Returns: active_jobs, total_applicants, assessments counts
 */
export const useDashboardStats = () => {
  const stats = useAuthedQuery(api.modules.statistics.getDashboardStats, {});
  return stats;
};

/**
 * Hook to get detailed job statistics
 */
export const useJobStats = () => {
  const stats = useAuthedQuery(api.modules.statistics.getJobStats, {});
  return stats;
};

/**
 * Hook to get assessment statistics
 */
export const useAssessmentStats = () => {
  const stats = useAuthedQuery(api.modules.statistics.getAssessmentStats, {});
  return stats;
};
