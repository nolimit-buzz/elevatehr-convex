import { UserSchema } from "./user";
import { Constants } from "../utils/constants";
import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { hashPassword } from "../utils/validation";
import { authedMutation } from "../utils/permission";
import { getMe } from "../utils/helpers";
import { Id } from "../_generated/dataModel";

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

    if (companyExist) throw new ConvexError({ message: Constants.ERROR.ALREADY_EXIST, code: 401 });

    const userExist = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.user.email))
      .first();
    if (userExist) throw new ConvexError({ message: Constants.ERROR.ALREADY_EXIST, code: 401 });

    const newCompany = await ctx.db.insert("companies", args.company);
    if (!newCompany) throw new ConvexError({ message: Constants.ERROR.CREATE_ERROR, code: 401 });

    args.user.password = hashPassword(args.user.password);
    const newUser = await ctx.db.insert("users", {
      ...args.user,
      company_id: newCompany,
      is_active: true,
      role: "admin",
    });

    if (!newUser) throw new ConvexError({ message: Constants.ERROR.CREATE_ERROR, code: 401 });
    return { message: Constants.SUCCESS.COMPANY_CREATE };
  },
});

export const get = authedMutation({
  args: {},
  handler: async (ctx) => {
    const user = ctx.user;
    if (!user?.company_id) throw new ConvexError({ message: "Company not found", code: 404 });
    const company = await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("_id"), user.company_id))
      .first();
    if (!company) throw new ConvexError({ message: "Company not found", code: 404 });
    return company;
  },
});

export const update = authedMutation({
  args: {
    company: v.optional(CompanySchema.partial()),
    personal: v.optional(UserSchema.partial()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user?.role || user.role !== "admin") {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    if (args.company) {
      await ctx.db.patch(user.company_id, args.company);
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
export const generateUploadUrl = authedMutation({
  args: {},
  handler: async (ctx) => {
    const user = ctx.user;
    if (!user?.role || user.role !== "admin") {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Update company logo with storage ID
export const updateLogo = authedMutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user?.role || user.role !== "admin") {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    // Get the URL for the uploaded file
    const logoUrl = await ctx.storage.getUrl(args.storageId);
    if (!logoUrl) throw new ConvexError({ message: "Failed to get logo URL", code: 500 });

    // Update the company with the new logo URL
    await ctx.db.patch(user.company_id, { company_logo: logoUrl });

    const updatedProfile = await getMe(ctx, user.id as any);

    return {
      ...updatedProfile,
      message: "Logo updated successfully",
    };
  },
});
