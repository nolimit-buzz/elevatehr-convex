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
import { Doc } from "../_generated/dataModel";
import { verifyToken } from "./validation";
import { Constants } from "./constants";

// Type for the context with the injected user
export type AuthedQueryCtx = QueryCtx & { user: Doc<"users"> | null };
export type AuthedMutationCtx = MutationCtx & { user: Doc<"users"> | null };
export type AuthedActionCtx = ActionCtx & { user: Doc<"users"> | null };

async function getUserFromToken(ctx: QueryCtx | MutationCtx, token?: string) {
  if (!token) return null;

  const user = await verifyToken(token);
  if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

  return user;
}

async function getUserFromTokenForAction(token?: string) {
  if (!token) return null;

  const user = await verifyToken(token);
  if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

  return user;
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
