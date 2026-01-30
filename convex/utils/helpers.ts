import { ConvexError } from "convex/values";
import { QueryCtx } from "../_generated/server";
import { Constants } from "./constants";
import { Id } from "../_generated/dataModel";

export const getMe = async (ctx: QueryCtx, userId: Id<"users">) => {
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
  const { password: _, ...userWithoutPassword } = user;

  const company = await ctx.db
    .query("companies")
    .filter((q) => q.eq(q.field("_id"), user.company_id))
    .first();

  return {
    companyInfo: company,
    personalInfo: userWithoutPassword,
  };
};
