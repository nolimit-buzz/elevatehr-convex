import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type AdminAssessmentType = "technical_assessment" | "online_assessment_1" | "online_assessment_2";

export interface CreateAdminAssessmentInput {
  title: string;
  description?: string;
  type: AdminAssessmentType;
  level?: string;
  skills?: string[];
  questions?: any[];
}

export interface CreateAdminTechnicalAssessmentInput {
  title: string;
  description?: string;
  level?: string;
  skills?: string[];
  technical_content: string;
  assessment_options?: number;
}

export interface UpdateAdminAssessmentInput {
  id: Id<"admin_assessments">;
  title?: string;
  description?: string;
  level?: string;
  skills?: string[];
  questions?: any[];
  technical_content?: string;
  assessment_options?: number;
}

export const useAdminAssessmentsList = (type?: AdminAssessmentType) => {
  return useQuery(api.modules.admin.assessments.list, type ? { type } : {});
};

export const useAdminAssessment = (id: Id<"admin_assessments">) => {
  return useQuery(api.modules.admin.assessments.get, { id });
};

export const AdminAssessmentQueries = {
  useCreate: () => useMutation(api.modules.admin.assessments.create),
  useCreateTechnical: () => useMutation(api.modules.admin.assessments.createTechnical),
  useUpdate: () => useMutation(api.modules.admin.assessments.update),
  useRemove: () => useMutation(api.modules.admin.assessments.remove),
};
