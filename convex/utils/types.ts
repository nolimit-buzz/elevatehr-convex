import { Infer } from "convex/values";
import { UserSchema } from "../modules/user";

export type UserPayload = { id: string } & Infer<ReturnType<typeof UserSchema.pick<"company_id" | "email" | "role">>>;
