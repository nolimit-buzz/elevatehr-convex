import { useAuthedMutation, useAuthedQuery, useConvexResponse } from "@/app/convex.setup";
import { api } from "../../convex/_generated/api";

// ============================================
// TYPES
// ============================================

export type TemplateType =
  | "skill_assessment"
  | "technical_assessment"
  | "online_assessment_1"
  | "online_assessment_2"
  | "interviews"
  | "acceptance"
  | "archived"
  | "rejection";

export interface EmailTemplate {
  type: TemplateType;
  subject?: string;
  content: string;
}

export interface EmailTemplatesResponse {
  templates: Record<string, { subject?: string; content: string }>;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to get all email templates for the company
 */
export const useEmailTemplates = () => {
  const templates = useAuthedQuery(api.modules.emailTemplates.list, {});
  return templates;
};

/**
 * Hook to get a single email template by type
 */
export const useEmailTemplate = (type: TemplateType | null) => {
  const template = useAuthedQuery(api.modules.emailTemplates.getByType, type ? { type } : "skip");
  return template;
};

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook for email template mutations
 */
export const useEmailTemplateMutations = () => {
  const upsertMutation = useAuthedMutation(api.modules.emailTemplates.upsert);
  const removeMutation = useAuthedMutation(api.modules.emailTemplates.remove);

  /**
   * Create or update an email template
   */
  const upsertTemplate = async (type: TemplateType, content: string, subject?: string) => {
    if (!upsertMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(
      upsertMutation({
        type,
        content,
        subject,
      })
    );
    return { result, error };
  };

  /**
   * Delete an email template
   */
  const removeTemplate = async (type: TemplateType) => {
    if (!removeMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(removeMutation({ type }));
    return { result, error };
  };

  return {
    upsertTemplate,
    removeTemplate,
  };
};
