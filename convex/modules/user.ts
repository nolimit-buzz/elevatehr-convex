import { v } from "convex/values";

export const UserSchema = v.object({
  first_name: v.string(),
  last_name: v.string(),
  email: v.string(),
  password: v.string(),
  role: v.union(v.literal("admin"), v.literal("super")),
  job_title: v.optional(v.string()),
  phone_number: v.optional(v.string()),
  company_id: v.optional(v.id("companies")),
  is_active: v.boolean(),
});
