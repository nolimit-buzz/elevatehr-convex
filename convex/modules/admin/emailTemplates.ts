import { v } from "convex/values";
import { adminMutation, adminQuery } from "../../utils/permission";
import { Constants } from "../../utils/constants";
import { ConvexError } from "convex/values";

const TEMPLATE_TYPES = v.union(
  v.literal("skill_assessment"),
  v.literal("technical_assessment"),
  v.literal("online_assessment_1"),
  v.literal("online_assessment_2"),
  v.literal("interviews"),
  v.literal("acceptance"),
  v.literal("archived"),
  v.literal("rejection"),
);

export const AdminEmailTemplateSchema = v.object({
  type: TEMPLATE_TYPES,
  subject: v.optional(v.string()),
  content: v.string(),
  is_default: v.optional(v.boolean()),
});

export const list = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admin_email_templates").collect();
  },
});

export const getByType = adminQuery({
  args: {
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("admin_email_templates")
      .withIndex("by_type", (q) => q.eq("type", args.type as any))
      .collect();

    return templates.length > 0 ? templates[0] : null;
  },
});

export const save = adminMutation({
  args: {
    type: TEMPLATE_TYPES,
    subject: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("admin_email_templates")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        subject: args.subject,
        content: args.content,
      });
      return existing[0]._id;
    } else {
      return await ctx.db.insert("admin_email_templates", {
        type: args.type,
        subject: args.subject,
        content: args.content,
        is_default: true,
      });
    }
  },
});
