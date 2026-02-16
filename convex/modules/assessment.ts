import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { Constants } from "../utils/constants";
import { ConvexError, v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "../_generated/server";
import { authedMutation, authedQuery, authedAction } from "../utils/permission";
import {
  generateQuizQuestions,
  generateSkillsForRole,
  generateTechnicalContent,
} from "../templates/ai/assessmentDescription";

// Internal query to get company by ID (used by actions)
export const getCompanyInternal = internalQuery({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.companyId);
  },
});

// Assessment type enum values
const ASSESSMENT_TYPES = v.union(
  v.literal("technical_assessment"),
  v.literal("online_assessment_1"),
  v.literal("online_assessment_2"),
);

const ASSESSMENT_LEVELS = v.union(
  v.literal("Junior"),
  v.literal("Mid-level"),
  v.literal("Senior"),
  v.literal("Lead"),
  v.literal("Manager"),
);

const QUESTION_TYPES = v.union(v.literal("open-text"), v.literal("multi-choice"));

// Question schema
const QuestionSchema = v.object({
  question: v.string(),
  type: QUESTION_TYPES,
  options: v.optional(v.array(v.string())),
});

// Assessment schema for database
export const AssessmentSchema = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  type: ASSESSMENT_TYPES,
  level: v.optional(v.string()),
  skills: v.optional(v.array(v.string())),
  company_id: v.id("companies"),
  created_by: v.id("users"),
  // For technical assessments
  technical_content: v.optional(v.string()),
  assessment_options: v.optional(v.number()),
  // For online assessments (quiz-based)
  questions: v.optional(v.array(QuestionSchema)),
  // Styling/display properties
  color: v.optional(v.string()),
  text_color: v.optional(v.string()),
});

// Helper function to get color based on level
function getLevelColors(level?: string): { color: string; textColor: string } {
  switch (level) {
    case "Senior":
      return { color: "#F9E0FA", textColor: "rgba(79, 27, 85, 0.72)" };
    case "Junior":
      return { color: "#FFF7E0", textColor: "rgba(125, 88, 15, 0.72)" };
    case "Mid-level":
      return { color: "#E0F7FA", textColor: "rgba(36, 115, 127, 0.72)" };
    case "Lead":
      return { color: "#E8F5E9", textColor: "rgba(27, 94, 32, 0.72)" };
    case "Manager":
      return { color: "#E3F2FD", textColor: "rgba(21, 101, 192, 0.72)" };
    default:
      return { color: "#F5F5F5", textColor: "rgba(17, 17, 17, 0.72)" };
  }
}

// ============================================
// QUERIES
// ============================================

// List all assessments for the company
export const list = authedQuery({
  args: {
    type: v.optional(ASSESSMENT_TYPES),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    let query = ctx.db.query("assessments").withIndex("by_company", (q) => q.eq("company_id", user.company_id!));

    const assessments = await query.collect();

    // Map to include computed color properties
    const mappedAssessments = assessments.map((assessment) => {
      const colors = getLevelColors(assessment.level);
      return {
        ...assessment,
        id: assessment._id,
        color: assessment.color || colors.color,
        textColor: assessment.text_color || colors.textColor,
      };
    });

    // Filter by type if provided
    if (args.type) {
      return mappedAssessments.filter((assessment) => assessment.type === args.type);
    }

    return mappedAssessments;
  },
});

// Get a single assessment by ID
export const get = authedQuery({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) throw new ConvexError({ message: "Assessment not found", code: 404 });

    // Ensure user can only access assessments from their company
    if (assessment.company_id !== user.company_id) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    const colors = getLevelColors(assessment.level);
    return {
      ...assessment,
      id: assessment._id,
      color: assessment.color || colors.color,
      textColor: assessment.text_color || colors.textColor,
    };
  },
});

// Get assessment by ID (public - for candidates taking assessments)
export const getPublic = query({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) throw new ConvexError({ message: "Assessment not found", code: 404 });

    const colors = getLevelColors(assessment.level);
    return {
      id: assessment._id,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      level: assessment.level,
      skills: assessment.skills,
      technical_content: assessment.technical_content,
      assessment_options: assessment.assessment_options,
      questions: assessment.questions,
      color: assessment.color || colors.color,
      textColor: assessment.text_color || colors.textColor,
    };
  },
});

// ============================================
// MUTATIONS
// ============================================

// Create a new assessment (internal - called from action)
export const createInternal = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: ASSESSMENT_TYPES,
    level: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    company_id: v.id("companies"),
    created_by: v.string(),
    technical_content: v.optional(v.string()),
    assessment_options: v.optional(v.number()),
    questions: v.optional(v.array(QuestionSchema)),
  },
  handler: async (ctx, args) => {
    const { created_by, ...rest } = args;
    const colors = getLevelColors(args.level);

    const assessmentId = await ctx.db.insert("assessments", {
      ...rest,
      created_by: created_by as Id<"users">,
      color: colors.color,
      text_color: colors.textColor,
    });

    return assessmentId;
  },
});

// Update an assessment
export const update = authedMutation({
  args: {
    assessmentId: v.id("assessments"),
    data: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      type: v.optional(ASSESSMENT_TYPES),
      level: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      technical_content: v.optional(v.string()),
      assessment_options: v.optional(v.number()),
      questions: v.optional(v.array(QuestionSchema)),
    }),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const { assessmentId, data } = args;
    const assessment = await ctx.db.get(assessmentId);

    if (!assessment) throw new ConvexError({ message: "Assessment not found", code: 404 });

    // Ensure user can only update assessments from their company
    if (assessment.company_id !== user.company_id) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    // Update colors if level changed
    let updateData: Record<string, unknown> = { ...data };
    if (data.level) {
      const colors = getLevelColors(data.level);
      updateData.color = colors.color;
      updateData.text_color = colors.textColor;
    }

    // Filter out undefined values
    const filteredUpdate = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

    await ctx.db.patch(assessmentId, filteredUpdate);

    return { id: assessmentId, message: "Assessment updated successfully" };
  },
});

// Delete an assessment
export const remove = authedMutation({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const assessment = await ctx.db.get(args.assessmentId);

    if (!assessment) throw new ConvexError({ message: "Assessment not found", code: 404 });

    // Ensure user can only delete assessments from their company
    if (assessment.company_id !== user.company_id) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    await ctx.db.delete(args.assessmentId);

    return { message: "Assessment deleted successfully" };
  },
});

// ============================================
// ACTIONS (AI-powered)
// ============================================

// Generate quiz questions using AI (returns questions without saving)
export const generateQuestions = authedAction({
  args: {
    jobTitle: v.string(),
    level: v.optional(v.string()),
    skills: v.array(v.string()),
    numberOfOpenTextQuestions: v.number(),
    numberOfMultiChoiceQuestions: v.number(),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    // Fetch company to get AI API key
    const company = await ctx.runQuery(internal.modules.assessment.getCompanyInternal, {
      companyId: user.company_id,
    });
    if (!company) throw new ConvexError({ message: "Company not found", code: 404 });
    if (!company.ai_api_key) throw new ConvexError({ message: "AI API key not configured for company", code: 400 });

    // Generate questions using AI
    const result = await generateQuizQuestions({
      jobTitle: args.jobTitle,
      level: args.level,
      skills: args.skills,
      numberOfOpenTextQuestions: args.numberOfOpenTextQuestions,
      numberOfMultiChoiceQuestions: args.numberOfMultiChoiceQuestions,
      aiApiKey: company.ai_api_key,
    });

    if (!result.success || !result.questions) {
      throw new ConvexError({ message: result.error || "Failed to generate questions", code: 500 });
    }

    return {
      status: "success",
      response: {
        questions: result.questions,
      },
    };
  },
});

// Create assessment with questions (after questions are generated)
export const create = authedAction({
  args: {
    title: v.string(),
    description: v.string(),
    type: ASSESSMENT_TYPES,
    level: v.optional(v.string()),
    skills: v.array(v.string()),
    questions: v.array(QuestionSchema),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    // Create the assessment
    const assessmentId: Id<"assessments"> = await ctx.runMutation(internal.modules.assessment.createInternal, {
      title: args.title,
      description: args.description,
      type: args.type,
      level: args.level,
      skills: args.skills,
      company_id: user.company_id,
      created_by: user.id,
      questions: args.questions,
    });

    return { assessment_id: assessmentId, message: "Assessment created successfully" };
  },
});

// Create technical assessment (no AI questions, just content)
export const createTechnical = authedAction({
  args: {
    title: v.string(),
    level: v.optional(v.string()),
    skills: v.array(v.string()),
    technicalContent: v.string(),
    assessmentOptions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    // Generate description
    const description = `${args.title} (${args.level || "All levels"}) assessment covering the following skills: ${args.skills.join(", ")}.`;

    // Create the assessment
    const assessmentId: Id<"assessments"> = await ctx.runMutation(internal.modules.assessment.createInternal, {
      title: args.title,
      description,
      type: "technical_assessment",
      level: args.level,
      skills: args.skills,
      company_id: user.company_id,
      created_by: user.id,
      technical_content: args.technicalContent,
      assessment_options: args.assessmentOptions || 2,
    });

    return { assessment_id: assessmentId, message: "Technical assessment created successfully" };
  },
});

// Generate skills for a role using AI
export const generateSkills = authedAction({
  args: {
    jobTitle: v.string(),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ technical: string[]; soft: string[] }> => {
    const user = ctx.user;

    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    // Fetch company to get AI API key
    const company = await ctx.runQuery(internal.modules.assessment.getCompanyInternal, {
      companyId: user.company_id,
    });
    if (!company) throw new ConvexError({ message: "Company not found", code: 404 });
    if (!company.ai_api_key) throw new ConvexError({ message: "AI API key not configured for company", code: 400 });

    return await generateSkillsForRole({
      jobTitle: args.jobTitle,
      jobDescription: args.jobDescription || "",
      aiApiKey: company.ai_api_key,
    });
  },
});

// Generate technical assessment content using AI
export const generateTechnicalAssessmentContent = authedAction({
  args: {
    jobTitle: v.string(),
    level: v.optional(v.string()),
    skills: v.array(v.string()),
    assessmentOptions: v.number(),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    // Fetch company to get AI API key
    const company = await ctx.runQuery(internal.modules.assessment.getCompanyInternal, {
      companyId: user.company_id,
    });
    if (!company) throw new ConvexError({ message: "Company not found", code: 404 });
    if (!company.ai_api_key) throw new ConvexError({ message: "AI API key not configured for company", code: 400 });

    const result = await generateTechnicalContent({
      jobTitle: args.jobTitle,
      level: args.level,
      skills: args.skills,
      assessmentOptions: args.assessmentOptions,
      aiApiKey: company.ai_api_key,
    });

    if (!result.success || !result.content) {
      throw new ConvexError({ message: result.error || "Failed to generate technical content", code: 500 });
    }

    return {
      status: "success",
      content: result.content,
    };
  },
});

// Get assessment statistics
export const getStatistics = authedQuery({
  args: {},
  handler: async (ctx) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_company", (q) => q.eq("company_id", user.company_id!))
      .collect();

    const technicalAssessments = assessments.filter((a) => a.type === "technical_assessment").length;
    const onlineAssessments1 = assessments.filter((a) => a.type === "online_assessment_1").length;
    const onlineAssessments2 = assessments.filter((a) => a.type === "online_assessment_2").length;

    return {
      total: assessments.length,
      technical_assessments: technicalAssessments,
      online_assessments_1: onlineAssessments1,
      online_assessments_2: onlineAssessments2,
    };
  },
});
