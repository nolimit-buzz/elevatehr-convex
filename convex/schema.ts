import { defineSchema, defineTable } from "convex/server";
import { UserSchema } from "./modules/user";
import { CompanySchema } from "./modules/company";
import { JobSchema } from "./modules/jobs";
import { AssessmentSchema } from "./modules/assessment";
import { ApplicationSchema } from "./modules/applications";
import { EmailTemplateSchema } from "./modules/emailTemplates";
import { NotificationSchema } from "./modules/notifications";
import { AdminAssessmentSchema } from "./modules/admin/assessments";
import { AdminEmailTemplateSchema } from "./modules/admin/emailTemplates";

export default defineSchema({
  users: defineTable(UserSchema).index("by_email", ["email"]),
  admins: defineTable(UserSchema).index("by_email", ["email"]),
  companies: defineTable(CompanySchema).index("by_company_name", ["company_name"]),
  jobs: defineTable(JobSchema)
    .index("by_company", ["company_id"])
    .index("by_status", ["status"])
    .index("by_company_status", ["company_id", "status"]),
  assessments: defineTable(AssessmentSchema)
    .index("by_company", ["company_id"])
    .index("by_type", ["type"])
    .index("by_company_type", ["company_id", "type"]),
  applications: defineTable(ApplicationSchema)
    .index("by_job", ["job_id"])
    .index("by_company", ["company_id"])
    .index("by_job_stage", ["job_id", "stage"]),
  email_templates: defineTable(EmailTemplateSchema)
    .index("by_company", ["company_id"])
    .index("by_company_type", ["company_id", "type"]),
  notifications: defineTable(NotificationSchema).index("by_company", ["company_id"]).index("by_user", ["user_id"]),
  admin_assessments: defineTable(AdminAssessmentSchema).index("by_type", ["type"]),
  admin_email_templates: defineTable(AdminEmailTemplateSchema).index("by_type", ["type"]),
});
