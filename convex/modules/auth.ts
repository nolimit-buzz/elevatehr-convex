import { v, ConvexError } from "convex/values";
import { mutation } from "../_generated/server";
import { UserSchema } from "./user";
import { generateToken, hashPassword, verifyPassword } from "../utils/validation";
import { Constants } from "../utils/constants";
import { authedMutation } from "../utils/permission";
import { Id } from "../_generated/dataModel";
import { getMe } from "../utils/helpers";

export const Me = authedMutation({
  args: {},
  handler: async (ctx) => {
    const userPayload = ctx.user;
    if (!userPayload) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    return await getMe(ctx, userPayload.id as Id<"users">);
  },
});

export const Login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },

  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) throw new ConvexError({ message: Constants.ERROR.WRONG_USER, status: 401 });

    const validPassword = verifyPassword({ password, hashedPassword: user?.password });
    if (!validPassword) throw new ConvexError({ message: Constants.ERROR.WRONG_USER, code: 401 });

    const userPayload = {
      id: user?._id,
      email: user?.email,
      role: user?.role,
      company_id: user?.company_id,
    };

    const token = await generateToken(userPayload);
    const { password: _, ...userWithoutPassword } = user;
    const company = await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("_id"), user.company_id))
      .first();
    return {
      token,
      companyInfo: company,
      personalInfo: userWithoutPassword,
      notifications: {},
    };
  },
});

export const CreateSuper = mutation({
  args: UserSchema.omit("is_active", "company_id", "role"),
  handler: async (ctx, args) => {
    const hasSuper = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "super"))
      .first();

    if (hasSuper) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (user) throw new ConvexError({ message: Constants.ERROR.CREATE_ERROR, code: 401 });

    args.password = hashPassword(args.password);
    const newUser = await ctx.db.insert("users", {
      ...args,
      is_active: true,
      role: "super",
    });

    if (!newUser) throw new ConvexError({ message: Constants.ERROR.CREATE_ERROR, code: 401 });
    return { message: "Super Admin Created" };
  },
});

export const ChangePassword = authedMutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { currentPassword, newPassword }) => {
    const userPayload = ctx.user;
    if (!userPayload) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    // Fetch full user document from database
    const userId = userPayload.id as Id<"users">;
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    // Verify current password
    const validPassword = verifyPassword({ password: currentPassword, hashedPassword: user.password });
    if (!validPassword) {
      throw new ConvexError({ message: Constants.ERROR.WRONG_PASSWORD, code: 401 });
    }

    // Hash and update new password
    const hashedNewPassword = hashPassword(newPassword);
    await ctx.db.patch(userId, { password: hashedNewPassword });

    return { message: "Password changed successfully" };
  },
});

export const UpdateProfile = authedMutation({
  args: UserSchema.partial(),
  handler: async (ctx, args) => {
    const userPayload = ctx.user;
    if (!userPayload) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    // Fetch full user document from database
    const userId = userPayload.id as Id<"users">;
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    //remove password and email from args if present
    if (args.password) delete args.password;
    if (args.email) delete args.email;

    await ctx.db.patch(userId, args);

    return { message: Constants.SUCCESS.USER_UPDATE };
  },
});

export const CreateAdmin = mutation({
  args: UserSchema.omit("is_active", "role"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) throw new ConvexError({ message: Constants.ERROR.ALREADY_EXIST, code: 409 });

    args.password = hashPassword(args.password);
    const newAdmin = await ctx.db.insert("users", {
      ...args,
      is_active: true,
      role: "admin",
    });

    if (!newAdmin) throw new ConvexError({ message: Constants.ERROR.CREATE_ERROR, code: 500 });
    return { message: Constants.SUCCESS.USER_CREATE };
  },
});
