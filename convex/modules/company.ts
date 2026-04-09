import { UserSchema } from "./user";
import { Constants } from "../utils/constants";
import { ConvexError, v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { hashPassword } from "../utils/validation";
import { flexibleMutation } from "../utils/permission";
import { getMe } from "../utils/helpers";
import { Id } from "../_generated/dataModel";

// Template types for seeding
const TEMPLATE_TYPES = [
  "skill_assessment",
  "technical_assessment",
  "online_assessment_1",
  "online_assessment_2",
  "interviews",
  "acceptance",
  "archived",
  "rejection",
] as const;

// Default template content for seeding
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
    case "online_assessment_1":
      return `<p>Dear {{candidate_name}},</p>
<p>You have been invited to complete an online assessment for the {{job_title}} position.</p>
<p>Please click the link below to get started.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "online_assessment_2":
      return `<p>Dear {{candidate_name}},</p>
<p>You have been invited to complete a second online assessment for the {{job_title}} position.</p>
<p>Please click the link below to continue.</p>
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
    case "rejection":
      return `<p>Dear {{candidate_name}},</p>
<p>Thank you for applying for the {{job_title}} position at {{company_name}}.</p>
<p>After careful consideration, we have decided to move forward with other candidates.</p>
<p>We wish you the best in your future endeavors.</p>
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
    case "online_assessment_1":
      return "Online Assessment - {{job_title}}";
    case "online_assessment_2":
      return "Second Online Assessment - {{job_title}}";
    case "interviews":
      return "Interview Invitation - {{job_title}}";
    case "acceptance":
      return "Job Offer - {{job_title}}";
    case "archived":
      return "Application Update - {{job_title}}";
    case "rejection":
      return "Application Status - {{job_title}}";
    default:
      return "Application Update - {{job_title}}";
  }
}

// Internal mutation to seed email templates for a company
export const seedEmailTemplates = internalMutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    for (const type of TEMPLATE_TYPES) {
      await ctx.db.insert("email_templates", {
        company_id: args.companyId,
        type,
        subject: getDefaultTemplateSubject(type),
        content: getDefaultTemplateContent(type),
        is_default: true,
      });
    }
  },
});

// Authed mutation to seed email templates for existing companies (can be called from client)
export const seedEmailTemplatesForCompany = flexibleMutation({
  args: {},
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;
    if (!targetCompanyId) {
      throw new ConvexError({ message: "Company not found", code: 404 });
    }

    // Check if templates already exist
    const existingTemplates = await ctx.db
      .query("email_templates")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .collect();

    if (existingTemplates.length > 0) {
      return { message: "Templates already exist for this company" };
    }

    // Seed templates
    for (const type of TEMPLATE_TYPES) {
      await ctx.db.insert("email_templates", {
        company_id: targetCompanyId,
        type,
        subject: getDefaultTemplateSubject(type),
        content: getDefaultTemplateContent(type),
        is_default: true,
      });
    }

    return { message: "Email templates seeded successfully" };
  },
});

export const CompanySchema = v.object({
  company_name: v.string(),
  company_logo: v.optional(v.string()),
  number_of_employees: v.optional(v.string()),
  about_company: v.optional(v.string()),
  booking_link: v.optional(v.string()),
  company_website: v.optional(v.string()),
  ai_api_key: v.optional(v.string()),
});

export const create = mutation({
  args: {
    company: CompanySchema,
    user: UserSchema.omit("company_id", "is_active", "role"),
  },
  handler: async (ctx, args) => {
    const companyExist = await ctx.db
      .query("companies")
      .filter((e) => e.eq(e.field("company_name"), args.company.company_name))
      .first();

    if (companyExist)
      throw new ConvexError({
        message: Constants.ERROR.ALREADY_EXIST,
        code: 401,
      });

    const userExist = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.user.email))
      .first();
    if (userExist)
      throw new ConvexError({
        message: Constants.ERROR.ALREADY_EXIST,
        code: 401,
      });

    const newCompany = await ctx.db.insert("companies", args.company);
    if (!newCompany)
      throw new ConvexError({
        message: Constants.ERROR.CREATE_ERROR,
        code: 401,
      });

    // Seed initial email templates for the new company
    for (const type of TEMPLATE_TYPES) {
      await ctx.db.insert("email_templates", {
        company_id: newCompany,
        type,
        subject: getDefaultTemplateSubject(type),
        content: getDefaultTemplateContent(type),
        is_default: true,
      });
    }

    args.user.password = hashPassword(args.user.password);
    const newUser = await ctx.db.insert("users", {
      ...args.user,
      company_id: newCompany,
      is_active: true,
      role: "admin",
    });

    if (!newUser)
      throw new ConvexError({
        message: Constants.ERROR.CREATE_ERROR,
        code: 401,
      });
    return { message: Constants.SUCCESS.COMPANY_CREATE };
  },
});

export const get = flexibleMutation({
  args: {},
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    const company = await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("_id"), targetCompanyId))
      .first();
    if (!company) throw new ConvexError({ message: "Company not found", code: 404 });
    return company;
  },
});

export const update = flexibleMutation({
  args: {
    company: v.optional(CompanySchema.partial()),
    personal: v.optional(UserSchema.partial()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    // Only admins can update company settings
    if (!isAdmin) {
      throw new ConvexError({
        message: Constants.ERROR.UNAUTHORIZED,
        code: 403,
      });
    }

    if (args.company) {
      await ctx.db.patch(targetCompanyId, args.company);
    }
    if (args.personal) {
      await ctx.db.patch(user.id as any, args.personal);
    }

    const updatedProfile = await getMe(ctx, user.id as any);

    return {
      ...updatedProfile,
      message: Constants.SUCCESS.COMPANY_UPDATE,
    };
  },
});

// Generate a short-lived upload URL for file storage
export const generateUploadUrl = flexibleMutation({
  args: {},
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;

    // Only admins can generate upload URLs
    if (!isAdmin) {
      throw new ConvexError({
        message: Constants.ERROR.UNAUTHORIZED,
        code: 403,
      });
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Update company logo with storage ID
export const updateLogo = flexibleMutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    // Only admins can update logo
    if (!isAdmin) {
      throw new ConvexError({
        message: Constants.ERROR.UNAUTHORIZED,
        code: 403,
      });
    }

    // Get the URL for the uploaded file
    const logoUrl = await ctx.storage.getUrl(args.storageId);
    if (!logoUrl) throw new ConvexError({ message: "Failed to get logo URL", code: 500 });

    // Update the company with the new logo URL
    await ctx.db.patch(targetCompanyId, { company_logo: logoUrl });

    const updatedProfile = await getMe(ctx, user.id as any);

    return {
      ...updatedProfile,
      message: "Logo updated successfully",
    };
  },
});
