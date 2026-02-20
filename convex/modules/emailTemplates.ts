import { Constants } from "../utils/constants";
import { ConvexError, v } from "convex/values";
import { authedMutation, authedQuery } from "../utils/permission";

// Template type enum
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

// Email template schema for database
export const EmailTemplateSchema = v.object({
  company_id: v.id("companies"),
  type: TEMPLATE_TYPES,
  subject: v.optional(v.string()),
  content: v.string(),
  is_default: v.optional(v.boolean()),
});

// ============================================
// QUERIES
// ============================================

// List all email templates for the company
export const list = authedQuery({
  args: {},
  handler: async (ctx) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    const templates = await ctx.db
      .query("email_templates")
      .withIndex("by_company", (q) => q.eq("company_id", user.company_id!))
      .collect();

    // Transform to the expected format with templates object
    const templatesObject: Record<string, { subject?: string; content: string }> = {};
    templates.forEach((template) => {
      templatesObject[template.type] = {
        subject: template.subject,
        content: template.content,
      };
    });

    return {
      templates: templatesObject,
    };
  },
});

// Get a single template by type
export const getByType = authedQuery({
  args: {
    type: TEMPLATE_TYPES,
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    const templates = await ctx.db
      .query("email_templates")
      .withIndex("by_company_type", (q) => q.eq("company_id", user.company_id!).eq("type", args.type))
      .collect();

    if (templates.length === 0) {
      // Return default template content
      return {
        type: args.type,
        content: getDefaultTemplateContent(args.type),
        subject: getDefaultTemplateSubject(args.type),
      };
    }

    return {
      type: templates[0].type,
      content: templates[0].content,
      subject: templates[0].subject,
    };
  },
});

// ============================================
// MUTATIONS
// ============================================

// Create or update an email template
export const upsert = authedMutation({
  args: {
    type: TEMPLATE_TYPES,
    subject: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    // Check if template exists
    const existingTemplates = await ctx.db
      .query("email_templates")
      .withIndex("by_company_type", (q) => q.eq("company_id", user.company_id!).eq("type", args.type))
      .collect();

    if (existingTemplates.length > 0) {
      // Update existing
      await ctx.db.patch(existingTemplates[0]._id, {
        subject: args.subject,
        content: args.content,
      });
      return { id: existingTemplates[0]._id, message: "Template updated successfully" };
    } else {
      // Create new
      const templateId = await ctx.db.insert("email_templates", {
        company_id: user.company_id,
        type: args.type,
        subject: args.subject,
        content: args.content,
      });
      return { id: templateId, message: "Template created successfully" };
    }
  },
});

// Delete an email template
export const remove = authedMutation({
  args: {
    type: TEMPLATE_TYPES,
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    const templates = await ctx.db
      .query("email_templates")
      .withIndex("by_company_type", (q) => q.eq("company_id", user.company_id!).eq("type", args.type))
      .collect();

    if (templates.length === 0) {
      throw new ConvexError({ message: "Template not found", code: 404 });
    }

    await ctx.db.delete(templates[0]._id);

    return { message: "Template deleted successfully" };
  },
});

// ============================================
// HELPERS
// ============================================

function getDefaultTemplateContent(type: string): string {
  switch (type) {
    case "skill_assessment":
      return `<p>Dear {{candidate_name}},</p>
<p>Congratulations! You have been selected to proceed to the skill assessment stage for the {{job_title}} position.</p>
<p>Please complete the assessment at your earliest convenience.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "technical_assessment":
      return `<p>Dear {{candidate_name}},</p>
<p>You have been invited to complete a technical assessment for the {{job_title}} position.</p>
<p>Please click the link below to access your assessment.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "interviews":
      return `<p>Dear {{candidate_name}},</p>
<p>We are pleased to invite you for an interview for the {{job_title}} position.</p>
<p>Our team will reach out to schedule a convenient time.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "acceptance":
      return `<p>Dear {{candidate_name}},</p>
<p>We are thrilled to offer you the {{job_title}} position at {{company_name}}!</p>
<p>Please review the attached offer letter and let us know if you have any questions.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "archived":
      return `<p>Dear {{candidate_name}},</p>
<p>Thank you for your interest in the {{job_title}} position at {{company_name}}.</p>
<p>After careful consideration, we have decided to move forward with other candidates.</p>
<p>We wish you the best in your job search.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    default:
      return `<p>Dear {{candidate_name}},</p>
<p>Thank you for your application.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
  }
}

function getDefaultTemplateSubject(type: string): string {
  switch (type) {
    case "skill_assessment":
      return "Skill Assessment Invitation - {{job_title}}";
    case "technical_assessment":
      return "Technical Assessment - {{job_title}}";
    case "interviews":
      return "Interview Invitation - {{job_title}}";
    case "acceptance":
      return "Job Offer - {{job_title}}";
    case "archived":
      return "Application Update - {{job_title}}";
    default:
      return "Application Update - {{job_title}}";
  }
}
