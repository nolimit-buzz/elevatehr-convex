import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export type AdminEmailTemplateType =
  | "skill_assessment"
  | "technical_assessment"
  | "online_assessment_1"
  | "online_assessment_2"
  | "interviews"
  | "acceptance"
  | "archived"
  | "rejection";

export interface SaveAdminEmailTemplateInput {
  type: AdminEmailTemplateType;
  subject?: string;
  content: string;
}

export const useAdminEmailTemplatesList = () => {
  return useQuery(api.modules.admin.emailTemplates.list, {});
};

export const useAdminEmailTemplateByType = (type: AdminEmailTemplateType) => {
  return useQuery(api.modules.admin.emailTemplates.getByType, { type });
};

export const AdminEmailTemplateQueries = {
  useSave: () => useMutation(api.modules.admin.emailTemplates.save),
};
