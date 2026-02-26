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
