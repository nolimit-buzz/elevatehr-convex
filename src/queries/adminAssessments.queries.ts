import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useAdminQuery, useAdminMutation } from "@/app/convex.setup";

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
  return useAdminQuery(api.modules.admin.assessments.list, type ? { type } : {});
};

export const useAdminAssessment = (id: Id<"admin_assessments">) => {
  return useAdminQuery(api.modules.admin.assessments.get, { id });
};

export const AdminAssessmentQueries = {
  useCreate: () => useAdminMutation(api.modules.admin.assessments.create),
  useCreateTechnical: () => useAdminMutation(api.modules.admin.assessments.createTechnical),
  useUpdate: () => useAdminMutation(api.modules.admin.assessments.update),
  useRemove: () => useAdminMutation(api.modules.admin.assessments.remove),
};
