import { useAuthedMutation, useAuthedQuery, useAuthedAction, useConvexResponse } from "@/app/convex.setup";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Re-export Id type for use in components
export type { Id };

// ============================================
// TYPES
// ============================================

export type AssessmentType = "technical_assessment" | "online_assessment_1" | "online_assessment_2";

export type QuestionType = "open-text" | "multi-choice";

export interface Question {
  question: string;
  type: QuestionType;
  options?: string[];
}

export interface GenerateQuestionsInput {
  jobTitle: string;
  level?: string;
  skills: string[];
  numberOfOpenTextQuestions: number;
  numberOfMultiChoiceQuestions: number;
}

export interface CreateAssessmentInput {
  title: string;
  description: string;
  type: AssessmentType;
  level?: string;
  skills: string[];
  questions: Question[];
}

export interface CreateTechnicalAssessmentInput {
  title: string;
  level?: string;
  skills: string[];
  technicalContent: string;
  assessmentOptions?: number;
}

export interface GenerateTechnicalContentInput {
  jobTitle: string;
  level?: string;
  skills: string[];
  assessmentOptions: number;
}

export interface UpdateAssessmentInput {
  assessmentId: Id<"assessments">;
  data: {
    title?: string;
    description?: string;
    type?: AssessmentType;
    level?: string;
    skills?: string[];
    technical_content?: string;
    assessment_options?: number;
    questions?: Question[];
  };
}

// ============================================
// QUERIES HOOK
// ============================================

export const AssessmentQueries = () => {
  const GenerateQuestionsAction = useAuthedAction(api.modules.assessment.generateQuestions);
  const GenerateTechnicalContentAction = useAuthedAction(api.modules.assessment.generateTechnicalAssessmentContent);
  const GenerateSkillsAction = useAuthedAction(api.modules.assessment.generateSkills);
  const CreateAction = useAuthedAction(api.modules.assessment.create);
  const CreateTechnicalAction = useAuthedAction(api.modules.assessment.createTechnical);
  const UpdateMutation = useAuthedMutation(api.modules.assessment.update);
  const RemoveMutation = useAuthedMutation(api.modules.assessment.remove);

  /**
   * Generate skills for a job role using AI (Groq)
   */
  const GenerateSkills = async (args: { jobTitle: string; jobDescription?: string }) => {
    if (!GenerateSkillsAction) {
      return { result: null, error: "Action not ready" };
    }
    const { result, error } = await useConvexResponse(
      GenerateSkillsAction({
        jobTitle: args.jobTitle,
        jobDescription: args.jobDescription,
      })
    );
    return { result, error };
  };
  const GenerateQuestions = async (args: GenerateQuestionsInput) => {
    if (!GenerateQuestionsAction) {
      return { result: null, error: "Action not ready" };
    }
    const { result, error } = await useConvexResponse(
      GenerateQuestionsAction({
        jobTitle: args.jobTitle,
        level: args.level,
        skills: args.skills,
        numberOfOpenTextQuestions: args.numberOfOpenTextQuestions,
        numberOfMultiChoiceQuestions: args.numberOfMultiChoiceQuestions,
      })
    );
    return { result, error };
  };

  /**
   * Generate technical assessment content using AI (Groq)
   */
  const GenerateTechnicalContent = async (args: GenerateTechnicalContentInput) => {
    if (!GenerateTechnicalContentAction) {
      return { result: null, error: "Action not ready" };
    }
    const { result, error } = await useConvexResponse(
      GenerateTechnicalContentAction({
        jobTitle: args.jobTitle,
        level: args.level,
        skills: args.skills,
        assessmentOptions: args.assessmentOptions,
      })
    );
    return { result, error };
  };

  /**
   * Create an online assessment with questions
   */
  const CreateAssessment = async (args: CreateAssessmentInput) => {
    if (!CreateAction) {
      return { result: null, error: "Action not ready" };
    }
    const { result, error } = await useConvexResponse(
      CreateAction({
        title: args.title,
        description: args.description,
        type: args.type,
        level: args.level,
        skills: args.skills,
        questions: args.questions,
      })
    );
    return { result, error };
  };

  /**
   * Create a technical assessment
   */
  const CreateTechnicalAssessment = async (args: CreateTechnicalAssessmentInput) => {
    if (!CreateTechnicalAction) {
      return { result: null, error: "Action not ready" };
    }
    const { result, error } = await useConvexResponse(
      CreateTechnicalAction({
        title: args.title,
        level: args.level,
        skills: args.skills,
        technicalContent: args.technicalContent,
        assessmentOptions: args.assessmentOptions,
      })
    );
    return { result, error };
  };

  /**
   * Update an existing assessment
   */
  const UpdateAssessment = async (args: UpdateAssessmentInput) => {
    if (!UpdateMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(
      UpdateMutation({
        assessmentId: args.assessmentId,
        data: args.data,
      })
    );
    return { result, error };
  };

  /**
   * Delete an assessment
   */
  const RemoveAssessment = async (assessmentId: Id<"assessments">) => {
    if (!RemoveMutation) {
      return { result: null, error: "Mutation not ready" };
    }
    const { result, error } = await useConvexResponse(RemoveMutation({ assessmentId }));
    return { result, error };
  };

  return {
    GenerateSkills,
    GenerateQuestions,
    GenerateTechnicalContent,
    CreateAssessment,
    CreateTechnicalAssessment,
    UpdateAssessment,
    RemoveAssessment,
  };
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to get a single assessment by ID
 */
export const useAssessment = (assessmentId: Id<"assessments"> | null) => {
  const assessment = useAuthedQuery(api.modules.assessment.get, assessmentId ? { assessmentId } : "skip");
  return assessment;
};

/**
 * Hook to list all assessments with optional type filter
 */
export const useAssessmentsList = (type?: AssessmentType) => {
  const assessments = useAuthedQuery(api.modules.assessment.list, { type });
  return assessments;
};

/**
 * Hook to get assessment statistics
 */
export const useAssessmentStatistics = () => {
  const statistics = useAuthedQuery(api.modules.assessment.getStatistics, {});
  return statistics;
};

/**
 * Hook to get a public assessment by ID (no authentication required)
 * Used for public assessment pages where candidates view/take assessments
 */
export const usePublicAssessment = (assessmentId: Id<"assessments"> | null) => {
  const assessment = useQuery(api.modules.assessment.getPublic, assessmentId ? { assessmentId } : "skip");
  return assessment;
};
