import { api } from "../../convex/_generated/api";
import { useAdminQuery, useAdminMutation } from "@/app/convex.setup";

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
  return useAdminQuery(api.modules.admin.emailTemplates.list, {});
};

export const useAdminEmailTemplateByType = (type: AdminEmailTemplateType) => {
  return useAdminQuery(api.modules.admin.emailTemplates.getByType, { type });
};

export const AdminEmailTemplateQueries = {
  useSave: () => useAdminMutation(api.modules.admin.emailTemplates.save),
};
