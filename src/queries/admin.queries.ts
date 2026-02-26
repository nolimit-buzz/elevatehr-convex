import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useAdminDashboardStats = () => {
  const stats = useQuery(api.modules.admin.getDashboardStats);
  return {
    stats,
    isLoading: stats === undefined,
  };
};

export const useAdminRecentActivity = () => {
  const activity = useQuery(api.modules.admin.getRecentActivity);
  return {
    activity,
    isLoading: activity === undefined,
  };
};

export const useAdminRecruiters = () => {
  const recruiters = useQuery(api.modules.admin.getRecruiters);
  return {
    recruiters,
    isLoading: recruiters === undefined,
  };
};

export const useAdminRecruiterDetails = (companyId: string) => {
  const details = useQuery(api.modules.admin.getRecruiterDetails, { companyId: companyId as any });
  return {
    details,
    isLoading: details === undefined,
  };
};

export const useAdminRecruiterActivityLogs = (companyId: string) => {
  const logs = useQuery(api.modules.admin.getRecruiterActivityLogs, { companyId: companyId as any });
  return {
    logs,
    isLoading: logs === undefined,
  };
};

export const useAdminRecruiterJobDetails = (jobId: string) => {
  const jobDetails = useQuery(api.modules.admin.getRecruiterJobDetails, { jobId: jobId as any });
  return {
    jobDetails,
    isLoading: jobDetails === undefined,
  };
};
