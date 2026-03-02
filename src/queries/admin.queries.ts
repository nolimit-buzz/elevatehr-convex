import { api } from "../../convex/_generated/api";
import { FunctionArgs } from "convex/server";
import { useAdminQuery, useAdminMutation } from "@/app/convex.setup";

export type AdminCreateCompanyInput = FunctionArgs<typeof api.modules.admin.createCompany>;

export const useAdminCreateCompanyMutation = () => {
  return useAdminMutation(api.modules.admin.createCompany);
};

export const useAdminGenerateLogoUploadUrl = () => {
  return useAdminMutation(api.modules.admin.generateCompanyLogoUploadUrl);
};

export const useAdminDashboardStats = () => {
  const stats = useAdminQuery(api.modules.admin.getDashboardStats);
  return {
    stats,
    isLoading: stats === undefined,
  };
};

export const useAdminRecentActivity = () => {
  const activity = useAdminQuery(api.modules.admin.getRecentActivity);
  return {
    activity,
    isLoading: activity === undefined,
  };
};

export const useAdminRecruiters = () => {
  const recruiters = useAdminQuery(api.modules.admin.getRecruiters);
  return {
    recruiters,
    isLoading: recruiters === undefined,
  };
};

export const useAdminRecruiterDetails = (companyId: string) => {
  const details = useAdminQuery(api.modules.admin.getRecruiterDetails, { companyId: companyId as any });
  return {
    details,
    isLoading: details === undefined,
  };
};

export const useAdminRecruiterActivityLogs = (companyId: string) => {
  const logs = useAdminQuery(api.modules.admin.getRecruiterActivityLogs, { companyId: companyId as any });
  return {
    logs,
    isLoading: logs === undefined,
  };
};

export const useAdminRecruiterJobDetails = (jobId: string) => {
  const jobDetails = useAdminQuery(api.modules.admin.getRecruiterJobDetails, { jobId: jobId as any });
  return {
    jobDetails,
    isLoading: jobDetails === undefined,
  };
};

export const useAdminUpdateRecruiterMutation = () => {
  return useAdminMutation(api.modules.admin.updateRecruiter);
};
