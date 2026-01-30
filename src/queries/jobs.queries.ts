import { useAuthedMutation, useAuthedQuery, useAuthedAction, useConvexResponse } from "@/app/convex.setup";
import { FunctionArgs } from "convex/server";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Export JobId type so consumers don't need to import from convex directly
export type JobId = Id<"jobs">;

export type JobCreateInput = {
  title: string;
  job_type: "fulltime" | "contract";
  work_model: "onsite" | "remote" | "hybrid";
  location: string;
  experience_level?: string;
};
export type JobUpdateInput = FunctionArgs<typeof api.modules.jobs.update>;
export type JobListInput = FunctionArgs<typeof api.modules.jobs.list>;

export const JobQueries = () => {
  const CreateAction = useAuthedAction(api.modules.jobs.create);
  const UpdateMutation = useAuthedMutation(api.modules.jobs.update);
  const RemoveMutation = useAuthedMutation(api.modules.jobs.remove);

  const CreateJob = async (args: JobCreateInput) => {
    if (!CreateAction) {
      return { result: null, error: "Action not ready" };
    }
    // @ts-expect-error - token is injected by useAuthedAction
    const { result, error } = await useConvexResponse(CreateAction(args));
    return { result, error };
  };

  const UpdateJob = async (args: JobUpdateInput) => {
    if (!UpdateMutation) {
      return { result: null, error: "Mutations not ready" };
    }
    const { result, error } = await useConvexResponse(UpdateMutation(args));
    return { result, error };
  };

  const RemoveJob = async (jobId: Id<"jobs">) => {
    if (!RemoveMutation) {
      return { result: null, error: "Mutations not ready" };
    }
    const { result, error } = await useConvexResponse(RemoveMutation({ jobId }));
    return { result, error };
  };

  return { CreateJob, UpdateJob, RemoveJob };
};

// Hook to get a single job by ID (accepts string or Id<"jobs">)
export const useJob = (jobId: string | Id<"jobs"> | null | undefined) => {
  // Skip the query if no jobId is provided
  const job = useAuthedQuery(api.modules.jobs.get, jobId ? { jobId: jobId as Id<"jobs"> } : "skip");
  return job;
};

// Hook to list jobs with optional status filter
export const useJobsList = (status?: "draft" | "active" | "closed") => {
  const jobs = useAuthedQuery(api.modules.jobs.list, { status });
  return jobs;
};

// Hook to get job statistics
export const useJobStatistics = () => {
  const statistics = useAuthedQuery(api.modules.jobs.getStatistics, {});
  return statistics;
};

// Hook for job mutations (update, remove)
// Accepts string jobId and casts internally to avoid consumers needing convex types
export const useJobMutations = () => {
  const UpdateMutation = useAuthedMutation(api.modules.jobs.update);
  const RemoveMutation = useAuthedMutation(api.modules.jobs.remove);

  const updateJob = async (jobId: string, data: Partial<JobUpdateInput["data"]>) => {
    if (!UpdateMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(UpdateMutation({ jobId: jobId as Id<"jobs">, data }));
    return { result, error };
  };

  const removeJob = async (jobId: string) => {
    if (!RemoveMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(RemoveMutation({ jobId: jobId as Id<"jobs"> }));
    return { result, error };
  };

  const updateJobStatus = async (jobId: string, status: "draft" | "active" | "closed") => {
    return updateJob(jobId, { status });
  };

  return { updateJob, removeJob, updateJobStatus };
};

// Hook to get assessments for a job
export const useJobAssessments = (jobId: string | null | undefined) => {
  const assessments = useAuthedQuery(
    api.modules.jobs.getJobAssessments,
    jobId ? { jobId: jobId as Id<"jobs"> } : "skip"
  );
  return assessments;
};

// Hook to get public job details (no authentication required)
export const usePublicJob = (jobId: string | null | undefined) => {
  const job = useQuery(api.modules.jobs.getPublicJob, jobId ? { jobId: jobId as Id<"jobs"> } : "skip");
  return job;
};

// Hook to get public company details (no authentication required)
export const usePublicCompany = (companyId: string | null | undefined) => {
  const company = useQuery(
    api.modules.jobs.getPublicCompany,
    companyId ? { companyId: companyId as Id<"companies"> } : "skip"
  );
  return company;
};
