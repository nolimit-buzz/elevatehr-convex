import { FunctionReference } from "convex/server";
import { useQuery as useBaseQuery, useMutation as useBaseMutation, useAction as useBaseAction } from "convex/react";
import { DefaultConstants } from "./constants/defaults";
import { ConvexError } from "convex/values";

export function useAuthedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: Parameters<typeof useBaseQuery<Query>>[1],
) {
  const token = typeof window !== "undefined" ? localStorage.getItem(DefaultConstants.tokenName) : null;

  // Build the final args - skip if no token, otherwise inject token
  const finalArgs = !token ? "skip" : args === "skip" ? "skip" : { ...(args || {}), token };

  // @ts-expect-error - Token injection modifies the args type
  return useBaseQuery(query, finalArgs);
}

export function useAuthedMutation<Mutation extends FunctionReference<"mutation">>(mutation: Mutation) {
  const baseMutation = useBaseMutation(mutation);
  type MutationFn = ReturnType<typeof useBaseMutation<Mutation>>;

  // Return a function that checks for token at call time
  return (args?: Parameters<MutationFn>[0]) => {
    const currentToken = typeof window !== "undefined" ? localStorage.getItem(DefaultConstants.tokenName) : null;

    if (!currentToken) {
      return Promise.reject(new Error("Not authenticated"));
    }
    const argsWithToken = { ...(args || {}), token: currentToken };
    // @ts-expect-error - Token injection modifies the args type
    return baseMutation(argsWithToken);
  };
}

export function useAuthedAction<Action extends FunctionReference<"action">>(action: Action) {
  const baseAction = useBaseAction(action);
  type ActionFn = ReturnType<typeof useBaseAction<Action>>;

  // Return a function that checks for token at call time
  return (args?: Parameters<ActionFn>[0]) => {
    const currentToken = typeof window !== "undefined" ? localStorage.getItem(DefaultConstants.tokenName) : null;

    if (!currentToken) {
      return Promise.reject(new Error("Not authenticated"));
    }
    const argsWithToken = { ...(args || {}), token: currentToken };
    // @ts-expect-error - Token injection modifies the args type
    return baseAction(argsWithToken);
  };
}

export function useAdminQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: Parameters<typeof useBaseQuery<Query>>[1],
) {
  const token = typeof window !== "undefined" ? localStorage.getItem(DefaultConstants.tokenName) : null;

  const finalArgs = !token ? "skip" : args === "skip" ? "skip" : { ...(args || {}), token };

  // @ts-expect-error - Token injection modifies the args type
  return useBaseQuery(query, finalArgs);
}

export function useAdminMutation<Mutation extends FunctionReference<"mutation">>(mutation: Mutation) {
  const baseMutation = useBaseMutation(mutation);
  type MutationFn = ReturnType<typeof useBaseMutation<Mutation>>;

  return (args?: Parameters<MutationFn>[0]) => {
    const currentToken = typeof window !== "undefined" ? localStorage.getItem(DefaultConstants.tokenName) : null;
    if (!currentToken) return Promise.reject(new Error("Not authenticated"));

    const argsWithToken = { ...(args || {}), token: currentToken };
    // @ts-expect-error - Token injection modifies the args type
    return baseMutation(argsWithToken);
  };
}

// Response type for unified handling
export type ConvexResponse<T> = { result: T; error: null } | { result: T | null; error: string | null };

/**
 * Unified response handler for Convex queries and mutations.
 * Always returns { result, error } for both sync queries and async mutations.
 */
export async function useConvexResponse<T>(input: T | Promise<T> | undefined): Promise<ConvexResponse<Awaited<T>>> {
  try {
    // Handle undefined (loading state for queries)
    if (input === undefined) {
      return { result: null, error: null };
    }

    // Handle both Promise and non-Promise values
    const result = await Promise.resolve(input);
    return { result, error: null };
  } catch (error) {
    const message =
      error instanceof ConvexError
        ? (error.data as { message: string }).message
        : error instanceof Error
          ? error.message
          : "Unexpected error occurred";
    return { result: null, error: message };
  }
}
