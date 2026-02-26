import { v } from "convex/values";
import { adminMutation, adminQuery } from "../../utils/permission";
import { Constants } from "../../utils/constants";
import { ConvexError } from "convex/values";
import { Id } from "../../_generated/dataModel";

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

const QuestionSchema = v.object({
  question: v.string(),
  type: QUESTION_TYPES,
  options: v.optional(v.array(v.string())),
});

export const AdminAssessmentSchema = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  type: ASSESSMENT_TYPES,
  level: v.optional(v.string()),
  skills: v.optional(v.array(v.string())),
  created_by: v.optional(v.id("users")),
  technical_content: v.optional(v.string()),
  assessment_options: v.optional(v.number()),
  questions: v.optional(v.array(QuestionSchema)),
  color: v.optional(v.string()),
  text_color: v.optional(v.string()),
});

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

export const list = adminQuery({
  args: {
    type: v.optional(ASSESSMENT_TYPES),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("admin_assessments");
    if (args.type) {
      query = query.withIndex("by_type", (q) => q.eq("type", args.type!)) as any;
    }

    const assessments = await query.collect();

    return assessments.map((assessment) => {
      const colors = getLevelColors(assessment.level);
      return {
        ...assessment,
        color: assessment.color || colors.color,
        text_color: assessment.text_color || colors.textColor,
        duration: assessment.type === "technical_assessment" ? "45 mins" : "30 mins",
        questions_count: assessment.questions?.length || 0,
      };
    });
  },
});

export const get = adminQuery({
  args: {
    id: v.id("admin_assessments"),
  },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.id);
    if (!assessment) throw new ConvexError({ message: "Assessment not found", code: 404 });

    const colors = getLevelColors(assessment.level);
    return {
      ...assessment,
      color: assessment.color || colors.color,
      text_color: assessment.text_color || colors.textColor,
      duration: assessment.type === "technical_assessment" ? "45 mins" : "30 mins",
      questions_count: assessment.questions?.length || 0,
    };
  },
});

export const create = adminMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: ASSESSMENT_TYPES,
    level: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    questions: v.optional(v.array(QuestionSchema)),
  },
  handler: async (ctx, args) => {
    const colors = getLevelColors(args.level);

    const assessmentId = await ctx.db.insert("admin_assessments", {
      title: args.title,
      description: args.description,
      type: args.type,
      level: args.level,
      skills: args.skills,
      questions: args.questions,
      color: colors.color,
      text_color: colors.textColor,
    });

    return assessmentId;
  },
});

export const createTechnical = adminMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    level: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    technical_content: v.string(),
    assessment_options: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const colors = getLevelColors(args.level);

    const assessmentId = await ctx.db.insert("admin_assessments", {
      title: args.title,
      description: args.description,
      type: "technical_assessment",
      level: args.level,
      skills: args.skills,
      technical_content: args.technical_content,
      assessment_options: args.assessment_options,
      color: colors.color,
      text_color: colors.textColor,
    });

    return assessmentId;
  },
});

export const update = adminMutation({
  args: {
    id: v.id("admin_assessments"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    questions: v.optional(v.array(QuestionSchema)),
    technical_content: v.optional(v.string()),
    assessment_options: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new ConvexError({ message: "Assessment not found", code: 404 });

    const { id, ...updates } = args;

    if (updates.level && updates.level !== existing.level) {
      const colors = getLevelColors(updates.level);
      (updates as any).color = colors.color;
      (updates as any).text_color = colors.textColor;
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = adminMutation({
  args: {
    id: v.id("admin_assessments"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new ConvexError({ message: "Assessment not found", code: 404 });

    await ctx.db.delete(args.id);
    return true;
  },
});
