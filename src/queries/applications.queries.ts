import { api } from "../../convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { Id } from "../../convex/_generated/dataModel";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { useAuthedMutation, useAuthedQuery, useConvexResponse } from "@/app/convex.setup";

// Re-export Id type for use in components
export type ApplicationId = Id<"applications">;
export type JobId = Id<"jobs">;
export type AssessmentId = Id<"assessments">;

// ============================================
// TYPES - Inferred from Convex backend
// ============================================

// Stage type inferred from the backend
export type StageType = "new" | "skill_assessment" | "interviews" | "acceptance" | "archived";

// Types inferred from Convex query return types
export type ApplicationsResponse = NonNullable<FunctionReturnType<typeof api.modules.applications.listByJob>>;
export type Application = ApplicationsResponse["applications"][number];

export type CompanyApplicationsResponse = NonNullable<
  FunctionReturnType<typeof api.modules.applications.listByCompany>
>;
export type CompanyApplication = CompanyApplicationsResponse["applications"][number];

export type SingleApplication = NonNullable<FunctionReturnType<typeof api.modules.applications.get>>;

// Arg types inferred from Convex functions
export type FilterParams = Omit<FunctionArgs<typeof api.modules.applications.listByJob>, "jobId"> & { jobId: string };
export type FilterWithCriteriaParams = Omit<FunctionArgs<typeof api.modules.applications.listWithFilters>, "jobId"> & {
  jobId: string;
};
export type CompanyApplicationsParams = FunctionArgs<typeof api.modules.applications.listByCompany>;

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to get applications for a job with optional filters
 */
export const useApplications = (params: FilterParams | null) => {
  const applications = useAuthedQuery(
    api.modules.applications.listByJob,
    params
      ? {
          jobId: params.jobId as Id<"jobs">,
          stage: params.stage,
          assessmentType: params.assessmentType,
          page: params.page,
          perPage: params.perPage,
        }
      : "skip",
  );
  return applications;
};

/**
 * Hook to get applications with advanced filters
 */
export const useApplicationsWithFilters = (params: FilterWithCriteriaParams | null) => {
  const applications = useAuthedQuery(
    api.modules.applications.listWithFilters,
    params
      ? {
          jobId: params.jobId as Id<"jobs">,
          stage: params.stage,
          minExperience: params.minExperience,
          experienceRange: params.experienceRange,
          minSalary: params.minSalary,
          maxSalary: params.maxSalary,
          skills: params.skills,
          availability: params.availability,
          trial: params.trial,
          page: params.page,
          perPage: params.perPage,
        }
      : "skip",
  );
  return applications;
};

/**
 * Hook to get a single application by ID
 */
export const useApplication = (applicationId: string | null) => {
  const application = useAuthedQuery(
    api.modules.applications.get,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip",
  );
  return application;
};

// ============================================
// COMPANY-LEVEL QUERY HOOKS
// ============================================

/**
 * Hook to get all applications for the current user's company
 * Replaces the WP API call to /all-job-applications
 */
export const useCompanyApplications = (params: CompanyApplicationsParams | null) => {
  const applications = useAuthedQuery(api.modules.applications.listByCompany, params ?? "skip");
  return applications;
};

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook for application mutations
 */
export const useApplicationMutations = () => {
  const updateStageMutation = useAuthedMutation(api.modules.applications.updateStage);
  const sendAssessmentMutation = useAuthedMutation(api.modules.applications.sendAssessment);
  const moveToStageWithEmailMutation = useAuthedMutation(api.modules.applications.moveToStageWithEmail);
  const removeMutation = useAuthedMutation(api.modules.applications.remove);

  /**
   * Update stage for multiple applications
   */
  const updateStage = async (applicationIds: string[], stage: StageType) => {
    if (!updateStageMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(
      updateStageMutation({
        applicationIds: applicationIds as Id<"applications">[],
        stage,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      }),
    );
    return { result, error };
  };

  /**
   * Send assessment to applications
   */
  const sendAssessment = async (applicationIds: string[], assessmentId: string, customEmailTemplate?: string) => {
    if (!sendAssessmentMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(
      sendAssessmentMutation({
        applicationIds: applicationIds as Id<"applications">[],
        assessmentId: assessmentId as Id<"assessments">,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
        customEmailTemplate,
      }),
    );
    return { result, error };
  };

  /**
   * Move applications to stage with custom email
   */
  const moveToStageWithEmail = async (applicationIds: string[], stage: StageType, customEmailTemplate?: string) => {
    if (!moveToStageWithEmailMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(
      moveToStageWithEmailMutation({
        applicationIds: applicationIds as Id<"applications">[],
        stage,
        customEmailTemplate,
        origin: typeof window !== "undefined" ? window.location.origin : undefined,
      }),
    );
    return { result, error };
  };

  /**
   * Remove an application
   */
  const removeApplication = async (applicationId: string) => {
    if (!removeMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(
      removeMutation({
        applicationId: applicationId as Id<"applications">,
      }),
    );
    return { result, error };
  };

  return {
    updateStage,
    sendAssessment,
    moveToStageWithEmail,
    removeApplication,
  };
};

// ============================================
// PUBLIC HOOKS (No Authentication Required)
// ============================================

// Types for the public application form that match the original UI expectations
export interface PublicFormField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[] | Record<string, string>;
  placeholder?: string;
  description?: string;
  allowed_types?: string[];
}

export interface PublicApplicationForm {
  required_fields: PublicFormField[];
  custom_fields: PublicFormField[];
}

export interface PublicJobFormData {
  job_id: string;
  title: string;
  skills: string[];
  application_form: PublicApplicationForm;
}

/**
 * Hook to get public job application form data
 * Transforms the data to match the format expected by the original UI
 */
export const usePublicJobApplicationForm = (jobId: string | null): PublicJobFormData | null | undefined => {
  const formData = useQuery(
    api.modules.applications.getPublicJobApplicationForm,
    jobId ? { jobId: jobId as Id<"jobs"> } : "skip",
  );

  // Return undefined while loading, null if no data
  if (formData === undefined) return undefined;
  if (formData === null) return null;

  // Transform the data to match the original UI format
  // The original UI expects options as string[] for radio, Record<string, string> for select
  const transformField = (field: {
    key: string;
    label: string;
    type: string;
    required: boolean;
    options?: Record<string, string>;
    allowed_types?: string[];
  }): PublicFormField => {
    // For radio type, convert Record<string, string> to string[] (array of values)
    // For select type, keep as Record<string, string>
    let options: string[] | Record<string, string> | undefined = field.options;
    if (field.type === "radio" && field.options && typeof field.options === "object") {
      // Convert to array of keys (which are the values for radio buttons)
      options = Object.keys(field.options);
    }

    return {
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
      options,
      allowed_types: field.allowed_types,
    };
  };

  const applicationForm = formData.application_form || { required_fields: [], custom_fields: [] };

  return {
    job_id: formData.job_id,
    title: formData.title,
    skills: formData.skills || [],
    application_form: {
      required_fields: (applicationForm.required_fields || []).map(transformField),
      custom_fields: (applicationForm.custom_fields || []).map(transformField),
    },
  };
};

/**
 * Hook for public application submission mutations
 */
export const usePublicApplicationMutations = () => {
  const submitAction = useAction(api.modules.applicationsNode.submitPublicApplication);
  const generateUploadUrlMutation = useMutation(api.modules.applications.generatePublicUploadUrl);
  const submitAssessmentMutation = useMutation(api.modules.applications.submitAssessment);

  /**
   * Submit a public application
   */
  const submitApplication = async (args: {
    job_id: string;
    name: string;
    email: string;
    phone?: string;
    cv_url?: string;
    cv_storage_id?: string;
    professional_info?: {
      experience_years?: number;
      skills?: string | string[];
      education?: string[];
      start_date?: string;
    };
    custom_fields?: Record<string, unknown>;
  }) => {
    try {
      const result = await submitAction({
        job_id: args.job_id as Id<"jobs">,
        name: args.name,
        email: args.email,
        phone: args.phone,
        cv_url: args.cv_url,
        cv_storage_id: args.cv_storage_id as Id<"_storage"> | undefined,
        professional_info: args.professional_info,
        custom_fields: args.custom_fields,
      });
      return { result, error: null };
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : error instanceof Error
            ? error.message
            : "Failed to submit application";
      return { result: null, error: message };
    }
  };

  /**
   * Submit an assessment
   */
  const submitAssessment = async (args: {
    applicationId: string;
    jobId: string;
    assessmentId: string;
    answers?: { question_index: number; answer: string }[];
    submissionUrl?: string;
    selectedOption?: string;
  }) => {
    try {
      const result = await submitAssessmentMutation({
        applicationId: args.applicationId as Id<"applications">,
        jobId: args.jobId as Id<"jobs">,
        assessmentId: args.assessmentId as Id<"assessments">,
        answers: args.answers,
        submissionUrl: args.submissionUrl,
        selectedOption: args.selectedOption,
      });
      return { result, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit assessment";
      return { result: null, error: message };
    }
  };

  /**
   * Generate upload URL for file uploads
   */
  const generateUploadUrl = async (jobId: string) => {
    try {
      const result = await generateUploadUrlMutation({
        job_id: jobId as Id<"jobs">,
      });
      return { result, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate upload URL";
      return { result: null, error: message };
    }
  };

  return {
    submitApplication,
    generateUploadUrl,
    submitAssessment,
  };
};
