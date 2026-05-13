import {
  query as baseQuery,
  mutation as baseMutation,
  action as baseAction,
  type QueryCtx,
  type MutationCtx,
  type ActionCtx,
} from "../_generated/server";
import { customQuery, customMutation, customAction } from "convex-helpers/server/customFunctions";
import { ConvexError, v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { verifyToken } from "./validation";
import { Constants } from "./constants";

// Type for the context with the injected user
export type AuthedQueryCtx = QueryCtx & { user: Doc<"users"> | null };
export type AuthedMutationCtx = MutationCtx & { user: Doc<"users"> | null };
export type AuthedActionCtx = ActionCtx & { user: Doc<"users"> | null };

async function getUserFromToken(ctx: QueryCtx | MutationCtx, token?: string) {
  if (!token) return null;

  const userPayload = await verifyToken(token);
  if (!userPayload) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

  if (userPayload.role === "admin") {
    // Admins are stored in the "admins" table
    const admin = await ctx.db.get(userPayload.id as Id<"admins">);
    if (!admin) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    return { ...admin, company_id: userPayload.company_id } as unknown as Doc<"users">;
  }

  // Regular users are stored in the "users" table
  const user = await ctx.db.get(userPayload.id as Id<"users">);
  if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
  return user;
}

async function getUserFromTokenForAction(token?: string) {
  if (!token) return null;

  const userPayload = await verifyToken(token);
  if (!userPayload) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

  // Need to create a minimal ctx-like object for db access in non-Convex context
  // For actions, we'll handle this differently - fetch in handler
  return userPayload as unknown as Doc<"users">;
}

export const authedQuery = customQuery(baseQuery, {
  args: { token: v.optional(v.string()) },
  input: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    return { ctx: { user }, args: {} };
  },
});

export const authedMutation = customMutation(baseMutation, {
  args: { token: v.optional(v.string()) },
  input: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    return { ctx: { user }, args: {} };
  },
});

export const authedAction = customAction(baseAction, {
  args: { token: v.optional(v.string()) },
  input: async (ctx, { token }) => {
    const user = await getUserFromTokenForAction(token);
    return { ctx: { user }, args: {} };
  },
});

export const adminQuery = customQuery(baseQuery, {
  args: { token: v.optional(v.string()) },
  input: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user || user.role !== "admin") {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    }
    return { ctx: { user }, args: {} };
  },
});

export const adminMutation = customMutation(baseMutation, {
  args: { token: v.optional(v.string()) },
  input: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);

    if (!user || user.role !== "admin") {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    }
    return { ctx: { user }, args: {} };
  },
});

export const isAdmin = (user: Doc<"users"> | null) => {
  if (!user || user.role !== "admin") throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
  return true;
};

// Flexible versions that pass all args through and add _isAdmin to context

export type FlexibleQueryCtx = QueryCtx & { user: Doc<"users"> | null; _isAdmin: boolean };
export type FlexibleMutationCtx = MutationCtx & { user: Doc<"users"> | null; _isAdmin: boolean };
export type FlexibleActionCtx = ActionCtx & { user: Doc<"users"> | null; _isAdmin: boolean };

export const flexibleQuery = customQuery(baseQuery, {
  args: {
    token: v.optional(v.string()),
    companyIdOverride: v.optional(v.id("companies")),
  },
  input: async (ctx, { token, companyIdOverride }) => {
    const user = await getUserFromToken(ctx, token);
    const _isAdmin = user?.role === "admin";
    return { ctx: { user, _isAdmin }, args: { companyIdOverride } };
  },
});

export const flexibleMutation = customMutation(baseMutation, {
  args: {
    token: v.optional(v.string()),
    companyIdOverride: v.optional(v.id("companies")),
  },
  input: async (ctx, { token, companyIdOverride }) => {
    const user = await getUserFromToken(ctx, token);
    const _isAdmin = user?.role === "admin";
    return { ctx: { user, _isAdmin }, args: { companyIdOverride } };
  },
});

export const flexibleAction = customAction(baseAction, {
  args: {
    token: v.optional(v.string()),
    companyIdOverride: v.optional(v.id("companies")),
  },
  input: async (ctx, { token, companyIdOverride }) => {
    // For actions, we can't access ctx.db in input function
    // We'll fetch the full user in each handler instead
    // But we can at least determine _isAdmin from token
    if (!token) {
      return { ctx: { user: null, _isAdmin: false }, args: { companyIdOverride } };
    }

    const userPayload = await verifyToken(token);
    if (!userPayload) {
      return { ctx: { user: null, _isAdmin: false }, args: { companyIdOverride } };
    }

    // Return the payload - we'll fetch full user in handler
    // We add a flag so handlers know to fetch full user
    const _isAdmin = userPayload.role === "admin";
    return {
      ctx: {
        user: {
          ...userPayload,
          _id: userPayload.id as any,
          _creationTime: 0,
        } as any,
        _isAdmin,
      },
      args: { companyIdOverride },
    };
  },
});
