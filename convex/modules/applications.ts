import { Constants } from "../utils/constants";
import { ConvexError, v } from "convex/values";
import { Id, Doc } from "../_generated/dataModel";
import { authedMutation, authedQuery } from "../utils/permission";
import { internalMutation, internalQuery, mutation, query, DatabaseReader, DatabaseWriter } from "../_generated/server";
import { internal } from "../_generated/api";

// ============================================
// HELPER FUNCTIONS
// ============================================

type ApplicationDoc = Doc<"applications">;
type JobDoc = Doc<"jobs">;
type ApplicationStage = "new" | "skill_assessment" | "interviews" | "acceptance" | "archived";

// Pagination helper
function paginate<T>(items: T[], page: number = 1, perPage: number = 10) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedItems = items.slice(startIndex, startIndex + perPage);
  return { paginatedItems, totalItems, totalPages, page, perPage };
}

// Get experience years from application
function getExperienceYears(app: ApplicationDoc): number {
  const years =
    app.professional_info?.experience_years ||
    app.cv_analysis?.experience_years ||
    (app.custom_fields as Record<string, unknown> | undefined)?.experience ||
    0;

  return typeof years === "string" ? Number(years.replace(/[^0-9.]/g, "")) : Number(years);
}

// Get all skills from application (combines cv_analysis and professional_info skills)
function getAllSkills(app: ApplicationDoc): string[] {
  const appSkills = app.cv_analysis?.skills || [];
  const profSkills = app.professional_info?.skills;
  return Array.isArray(profSkills)
    ? [...appSkills, ...profSkills]
    : [...appSkills, ...(profSkills ? [profSkills] : [])];
}

// Filter applications by skills
function filterBySkills(applications: ApplicationDoc[], skills: string[]): ApplicationDoc[] {
  return applications.filter((app) => {
    const allSkills = getAllSkills(app);
    return skills.some((skill) => allSkills.some((appSkill) => appSkill.toLowerCase().includes(skill.toLowerCase())));
  });
}

// Update job stage counts when moving applications between stages
async function updateJobStageCounts(
  db: DatabaseWriter,
  job: JobDoc,
  oldStage: ApplicationStage,
  newStage: ApplicationStage,
) {
  if (!job.stage_counts) return;

  const newStageCounts = { ...job.stage_counts };
  if (oldStage !== newStage) {
    newStageCounts[oldStage] = Math.max(0, newStageCounts[oldStage] - 1);
    newStageCounts[newStage] = newStageCounts[newStage] + 1;
  }
  await db.patch(job._id, { stage_counts: newStageCounts });
}

// Decrement stage count (for deletions)
async function decrementStageCount(db: DatabaseWriter, job: JobDoc, stage: ApplicationStage) {
  if (!job.stage_counts) return;

  const newStageCounts = { ...job.stage_counts };
  newStageCounts[stage] = Math.max(0, newStageCounts[stage] - 1);
  await db.patch(job._id, { stage_counts: newStageCounts });
}

// Verify job belongs to user's company
async function verifyJobOwnership(db: DatabaseReader, jobId: Id<"jobs">, companyId: Id<"companies">): Promise<JobDoc> {
  const job = await db.get(jobId);
  if (!job) throw new ConvexError({ message: "Job not found", code: 404 });
  if (job.company_id !== companyId) {
    throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
  }
  return job;
}

// Application stage enum values
const APPLICATION_STAGES = v.union(
  v.literal("new"),
  v.literal("skill_assessment"),
  v.literal("interviews"),
  v.literal("acceptance"),
  v.literal("archived"),
);

// Professional info schema
const ProfessionalInfoSchema = v.object({
  experience_years: v.optional(v.number()),
  skills: v.optional(v.union(v.string(), v.array(v.string()))),
  education: v.optional(v.array(v.string())),
  start_date: v.optional(v.string()),
});

// CV Analysis schema
const CVAnalysisSchema = v.object({
  match_score: v.optional(v.number()),
  skills_match: v.optional(v.array(v.string())),
  missing_skills: v.optional(v.array(v.string())),
  experience_years: v.optional(v.number()),
  education_level: v.optional(v.string()),
  recommendations: v.optional(v.string()),
  skills: v.optional(v.array(v.string())),
  education: v.optional(v.array(v.string())),
  summary: v.optional(v.string()),
});

// Attachments schema
const AttachmentsSchema = v.object({
  cv: v.optional(v.string()),
  external_cv_link: v.optional(v.string()),
});

// Assessment result schema for individual assessment types
const AssessmentResultSchema = v.object({
  assessment_id: v.optional(v.union(v.number(), v.string())),
  assessment_status: v.optional(v.string()),
  assessment_submitted_date: v.optional(v.string()),
  assessment_submission_status: v.optional(v.string()),
  assessment_submission_link: v.optional(v.string()),
  assessment_score: v.optional(v.number()),
  assessment_feedback: v.optional(v.string()),
  answers: v.optional(
    v.array(
      v.object({
        question_index: v.number(),
        answer: v.string(),
      }),
    ),
  ),
  selected_option: v.optional(v.string()),
});

// Application schema for database
export const ApplicationSchema = v.object({
  job_id: v.id("jobs"),
  company_id: v.id("companies"),
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  cv_url: v.optional(v.string()),
  stage: APPLICATION_STAGES,
  professional_info: v.optional(ProfessionalInfoSchema),
  cv_analysis: v.optional(CVAnalysisSchema),
  attachments: v.optional(AttachmentsSchema),
  // Assessment results by type (e.g., technical_assessment, online_assessment, etc.)
  assessments_results: v.optional(v.record(v.string(), AssessmentResultSchema)),
  // Legacy assessment fields (deprecated - use assessments_results)
  assessment_id: v.optional(v.id("assessments")),
  assessment_score: v.optional(v.number()),
  assessment_completed: v.optional(v.boolean()),
  // Custom fields from job posting
  custom_fields: v.optional(v.any()),
});

// ============================================
// QUERIES
// ============================================

// List applications for a job with optional stage filter and pagination
export const listByJob = authedQuery({
  args: {
    jobId: v.id("jobs"),
    stage: v.optional(APPLICATION_STAGES),
    assessmentType: v.optional(v.string()),
    page: v.optional(v.number()),
    perPage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    // Verify job belongs to user's company
    await verifyJobOwnership(ctx.db, args.jobId, user.company_id!);

    // Get all applications for the job
    let applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("job_id", args.jobId))
      .collect();

    // Filter by stage if provided
    if (args.stage) {
      applications = applications.filter((app) => app.stage === args.stage);
    }

    // Filter by assessment type if provided (for skill_assessment stage)
    if (args.assessmentType && args.stage === "skill_assessment") {
      // Filter applications that have a specific assessment type
      const assessmentPromises = applications.map(async (app) => {
        if (app.assessment_id) {
          const assessment = await ctx.db.get(app.assessment_id);
          return assessment?.type === args.assessmentType ? app : null;
        }
        return null;
      });
      const filteredApps = await Promise.all(assessmentPromises);
      applications = filteredApps.filter((app) => app !== null) as typeof applications;
    }

    // Pagination
    const {
      paginatedItems: paginatedApps,
      totalItems,
      totalPages,
      page,
      perPage,
    } = paginate(applications, args.page, args.perPage);

    // Transform to match expected Candidate interface
    const transformedApps = paginatedApps.map((app) => {
      // Parse name into firstname/lastname
      const nameParts = app.name.split(" ");
      const firstname = nameParts[0] || "";
      const lastname = nameParts.slice(1).join(" ") || "";

      return {
        id: app._id,
        job_id: app.job_id,
        personal_info: {
          firstname,
          lastname,
        },
        professional_info: {
          experience: String(app.professional_info?.experience_years || ""),
          salary_range: "",
          start_date: app.professional_info?.start_date || "",
          skills: Array.isArray(app.professional_info?.skills)
            ? app.professional_info.skills.join(",")
            : app.professional_info?.skills || (app.cv_analysis?.skills ? app.cv_analysis.skills.join(",") : ""),
        },
        cv_analysis: app.cv_analysis
          ? {
              ...app.cv_analysis,
              match_score: app.cv_analysis.match_score ?? 0,
            }
          : undefined,
        attachments: app.attachments,
        assessments_results: app.assessments_results,
      };
    });

    return {
      applications: transformedApps,
      total: totalItems,
      total_pages: totalPages,
      page,
      per_page: perPage,
    };
  },
});

// List applications with filters
export const listWithFilters = authedQuery({
  args: {
    jobId: v.id("jobs"),
    stage: v.optional(APPLICATION_STAGES),
    minExperience: v.optional(v.number()),
    experienceRange: v.optional(v.string()),
    minSalary: v.optional(v.number()),
    maxSalary: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    availability: v.optional(v.string()),
    trial: v.optional(v.string()),
    page: v.optional(v.number()),
    perPage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    // Verify job belongs to user's company
    await verifyJobOwnership(ctx.db, args.jobId, user.company_id!);

    // Get all applications for the job
    let applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("job_id", args.jobId))
      .collect();

    // Filter by stage if provided
    if (args.stage) {
      applications = applications.filter((app) => app.stage === args.stage);
    }

    // Filter by experience
    if (args.minExperience !== undefined) {
      applications = applications.filter((app) => {
        const years = getExperienceYears(app);
        return years >= args.minExperience!;
      });
    }

    if (args.experienceRange) {
      const [minStr, maxStr] = args.experienceRange.split("-");
      const min = Number(minStr);
      const max = Number(maxStr);

      applications = applications.filter((app) => {
        const years = getExperienceYears(app);
        if (isNaN(max)) {
          return years >= min;
        }
        return years >= min && years <= max;
      });
    }

    // Filter by skills
    if (args.skills && args.skills.length > 0) {
      applications = filterBySkills(applications, args.skills);
    }

    // Filter by availability (stored in custom_fields.availability or professional_info.start_date)
    if (args.availability) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const nowTime = now.getTime();
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
      const TWO_MONTHS = 60 * 24 * 60 * 60 * 1000;

      applications = applications.filter((app) => {
        const customFields = app.custom_fields as Record<string, unknown> | undefined;
        const appAvailability = (customFields?.availability || "").toString().toLowerCase();

        // 1. Check if it matches explicit categories (e.g., "immediately", "week")
        if (appAvailability === args.availability!.toLowerCase()) {
          return true;
        }

        // 2. Extract date from string (e.g., "Available 2026-03-20" or "2026-03-20")
        const dateMatch = (appAvailability + " " + (app.professional_info?.start_date || "")).match(
          /\d{4}-\d{2}-\d{2}/,
        );

        if (!dateMatch) return false;

        const startDate = new Date(dateMatch[0]).getTime();
        if (isNaN(startDate)) return false;

        const diff = startDate - nowTime;

        switch (args.availability) {
          case "immediately":
            return diff <= 0;
          case "week":
            return diff > 0 && diff <= ONE_WEEK;
          case "month":
            return diff > ONE_WEEK && diff <= ONE_MONTH;
          case "2_months":
            return diff > ONE_MONTH && diff <= TWO_MONTHS;
          default:
            return false;
        }
      });
    }

    // Filter by salary expectation (stored in custom_fields.salary)
    if (args.minSalary || args.maxSalary) {
      applications = applications.filter((app) => {
        const customFields = app.custom_fields as Record<string, unknown> | undefined;
        const salaryRaw = customFields?.salary;
        const salary = Number(salaryRaw);
        if (isNaN(salary) || salary === 0) return false;
        if (args.minSalary && salary < args.minSalary) return false;
        if (args.maxSalary && salary > args.maxSalary) return false;
        return true;
      });
    }

    // Filter by trial (stored in custom_fields.trial)
    if (args.trial) {
      applications = applications.filter((app) => {
        const appTrial = (app.custom_fields as Record<string, unknown> | undefined)?.trial;
        return String(appTrial).toLowerCase() === args.trial!.toLowerCase();
      });
    }

    // Pagination
    const {
      paginatedItems: paginatedApps,
      totalItems,
      totalPages,
      page,
      perPage,
    } = paginate(applications, args.page, args.perPage);

    // Transform to match expected Candidate interface
    const transformedApps = paginatedApps.map((app) => {
      const nameParts = app.name.split(" ");
      const firstname = nameParts[0] || "";
      const lastname = nameParts.slice(1).join(" ") || "";

      return {
        id: app._id,
        job_id: app.job_id,
        personal_info: {
          firstname,
          lastname,
        },
        professional_info: {
          experience: String(app.professional_info?.experience_years || ""),
          salary_range: "",
          start_date: app.professional_info?.start_date || "",
          skills: Array.isArray(app.professional_info?.skills)
            ? app.professional_info.skills.join(",")
            : app.professional_info?.skills || (app.cv_analysis?.skills ? app.cv_analysis.skills.join(",") : ""),
        },
        cv_analysis: app.cv_analysis
          ? {
              ...app.cv_analysis,
              match_score: app.cv_analysis.match_score ?? 0,
            }
          : undefined,
        attachments: app.attachments,
        assessments_results: app.assessments_results,
      };
    });

    return {
      applications: transformedApps,
      total: totalItems,
      total_pages: totalPages,
      page,
      per_page: perPage,
    };
  },
});

// Get a single application with full details
export const get = authedQuery({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new ConvexError({ message: "Application not found", code: 404 });

    // Verify application belongs to user's company
    if (application.company_id !== user.company_id) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    // Get job details for job_title
    const job = await ctx.db.get(application.job_id);

    // Parse name into firstname/lastname
    const nameParts = application.name.split(" ");
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || "";

    return {
      id: application._id,
      job_id: application.job_id,
      job_title: job?.title || "",
      personal_info: {
        firstname,
        lastname,
        email: application.email,
        phone: application.phone || "",
      },
      professional_info: {
        experience_years: application.professional_info?.experience_years,
        skills: Array.isArray(application.professional_info?.skills)
          ? application.professional_info.skills
          : application.professional_info?.skills
            ? application.professional_info.skills.split(",").map((s: string) => s.trim())
            : [],
        education: application.professional_info?.education || [],
        start_date: application.professional_info?.start_date || "",
      },
      cv_analysis: application.cv_analysis
        ? {
            ...application.cv_analysis,
            match_score: application.cv_analysis.match_score ?? 0,
          }
        : undefined,
      attachments: application.attachments,
      assessments_results: application.assessments_results,
      custom_fields: application.custom_fields,
      stage: application.stage,
      created_at: new Date(application._creationTime).toISOString(),
    };
  },
});

// List all applications for a company with optional stage filter and pagination
export const listByCompany = authedQuery({
  args: {
    stage: v.optional(APPLICATION_STAGES),
    page: v.optional(v.number()),
    perPage: v.optional(v.number()),
    searchQuery: v.optional(v.string()),
    minExperience: v.optional(v.number()),
    maxExperience: v.optional(v.number()),
    experienceRange: v.optional(v.string()),
    minSalary: v.optional(v.number()),
    maxSalary: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    availability: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "User not associated with a company", code: 403 });

    const companyId = user.company_id;

    // Get all applications for the company
    let applications = await ctx.db
      .query("applications")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();

    // Filter by stage if provided
    if (args.stage) {
      applications = applications.filter((app) => app.stage === args.stage);
    }

    // Filter by search query (name or email)
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      applications = applications.filter(
        (app) => app.name.toLowerCase().includes(query) || app.email.toLowerCase().includes(query),
      );
    }

    // Filter by experience range
    if (args.experienceRange) {
      const parts = args.experienceRange.split("-");
      const min = parseInt(parts[0], 10);
      const max = parts[1] ? parseInt(parts[1], 10) : undefined;
      applications = applications.filter((app) => {
        const years = getExperienceYears(app);
        if (max) {
          return years >= min && years <= max;
        }
        return years >= min;
      });
    } else {
      // Filter by min/max experience
      if (args.minExperience !== undefined) {
        applications = applications.filter((app) => getExperienceYears(app) >= args.minExperience!);
      }
      if (args.maxExperience !== undefined) {
        applications = applications.filter((app) => getExperienceYears(app) <= args.maxExperience!);
      }
    }

    // Filter by skills
    if (args.skills && args.skills.length > 0) {
      applications = filterBySkills(applications, args.skills);
    }

    // Fetch job titles for applications
    const jobIds = [...new Set(applications.map((app) => app.job_id))];
    const jobs = await Promise.all(jobIds.map((id) => ctx.db.get(id)));
    const jobMap = new Map(jobs.filter((j) => j !== null).map((j) => [j!._id, j!.title]));

    // Pagination
    const {
      paginatedItems: paginatedApps,
      totalItems,
      totalPages,
      page,
      perPage,
    } = paginate(applications, args.page, args.perPage);

    // Transform to match expected Candidate interface
    const transformedApps = paginatedApps.map((app) => {
      // Parse name into firstname/lastname
      const nameParts = app.name.split(" ");
      const firstname = nameParts[0] || "";
      const lastname = nameParts.slice(1).join(" ") || "";

      return {
        id: app._id,
        job_id: app.job_id,
        job_title: jobMap.get(app.job_id) || "",
        personal_info: {
          firstname,
          lastname,
        },
        professional_info: {
          experience: getExperienceYears(app).toString() || "",
          salary_range: "",
          start_date: app.professional_info?.start_date || "",
          skills: Array.isArray(app.professional_info?.skills)
            ? app.professional_info.skills.join(",")
            : app.professional_info?.skills || (app.cv_analysis?.skills ? app.cv_analysis.skills.join(",") : ""),
        },
        cv_analysis: app.cv_analysis
          ? {
              ...app.cv_analysis,
              match_score: app.cv_analysis.match_score ?? 0,
            }
          : undefined,
        attachments: app.attachments,
        assessments_results: app.assessments_results,
      };
    });

    return {
      applications: transformedApps,
      total: totalItems,
      total_pages: totalPages,
      page,
      per_page: perPage,
    };
  },
});

// ============================================
// MUTATIONS
// ============================================

// Create internal mutation for applications
export const createInternal = internalMutation({
  args: {
    job_id: v.id("jobs"),
    company_id: v.id("companies"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    cv_url: v.optional(v.string()),
    stage: APPLICATION_STAGES,
    professional_info: v.optional(ProfessionalInfoSchema),
    cv_analysis: v.optional(CVAnalysisSchema),
    attachments: v.optional(AttachmentsSchema),
  },
  handler: async (ctx, args) => {
    const applicationId = await ctx.db.insert("applications", args);
    return applicationId;
  },
});

// ============================================
// INTERNAL QUERIES & MUTATIONS FOR CV ANALYSIS
// ============================================

// Internal query to get application by ID
export const getApplicationInternal = internalQuery({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.applicationId);
  },
});

// Internal query to get job by ID
export const getJobInternal = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// Internal query to get company by ID
export const getCompanyInternal = internalQuery({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.companyId);
  },
});

// Internal query to get file URL from storage
export const getFileUrlInternal = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Internal query to get all data needed to send a lifecycle email for an application
export const getApplicationEmailDataInternal = internalQuery({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;
    const job = await ctx.db.get(application.job_id);
    const company = await ctx.db.get(application.company_id);
    if (!job || !company) return null;
    return { application, job, company };
  },
});

// Internal mutation to update CV analysis
export const updateCVAnalysisInternal = internalMutation({
  args: {
    applicationId: v.id("applications"),
    cv_analysis: CVAnalysisSchema,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, {
      cv_analysis: args.cv_analysis,
    });
    return { success: true };
  },
});

// Internal mutation to create application from public submission
export const createPublicApplicationInternal = internalMutation({
  args: {
    job_id: v.id("jobs"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    cv_url: v.optional(v.string()),
    cv_storage_id: v.optional(v.id("_storage")),
    professional_info: v.optional(ProfessionalInfoSchema),
    custom_fields: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get the job to verify it exists and is active
    const job = await ctx.db.get(args.job_id);
    if (!job) {
      throw new ConvexError({ message: "Job not found", code: 404 });
    }

    if (job.status !== "active") {
      throw new ConvexError({ message: "This job is no longer accepting applications", code: 400 });
    }

    // Check for duplicate applications (same email for same job)
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("job_id", args.job_id))
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingApplication) {
      throw new ConvexError({ message: "You have already applied for this position", code: 400 });
    }

    // Get CV URL from storage if storage ID provided
    let cvUrl: string | undefined = args.cv_url;
    if (args.cv_storage_id) {
      const storageUrl = await ctx.storage.getUrl(args.cv_storage_id);
      if (storageUrl) {
        cvUrl = storageUrl;
      }
    }

    // Create the application
    const applicationId = await ctx.db.insert("applications", {
      job_id: args.job_id,
      company_id: job.company_id,
      name: args.name,
      email: args.email,
      phone: args.phone,
      cv_url: cvUrl || undefined,
      stage: "new",
      professional_info: args.professional_info,
      custom_fields: args.custom_fields,
      attachments: cvUrl ? { cv: cvUrl } : undefined,
    });

    // Update job stage counts
    if (job.stage_counts) {
      const newStageCounts = { ...job.stage_counts };
      newStageCounts.new = newStageCounts.new + 1;
      await ctx.db.patch(args.job_id, { stage_counts: newStageCounts });
    } else {
      // Initialize stage counts if not present
      await ctx.db.patch(args.job_id, {
        stage_counts: {
          new: 1,
          skill_assessment: 0,
          interviews: 0,
          acceptance: 0,
          archived: 0,
        },
      });
    }

    // Notify the company of the new application
    await ctx.scheduler.runAfter(0, internal.modules.notifications.createInternal, {
      company_id: job.company_id,
      title: "New Application Received",
      content: `${args.name} has applied for the ${job.title} position.`,
      type: "application",
    });

    return { id: applicationId };
  },
});

// ============================================
// MUTATIONS (Authenticated)
// ============================================

// Update application stage
export const updateStage = authedMutation({
  args: {
    applicationIds: v.array(v.id("applications")),
    stage: APPLICATION_STAGES,
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const results = [];

    for (const applicationId of args.applicationIds) {
      const application = await ctx.db.get(applicationId);
      if (!application) {
        results.push({ id: applicationId, success: false, error: "Application not found" });
        continue;
      }

      // Verify application belongs to user's company
      if (application.company_id !== user.company_id) {
        results.push({ id: applicationId, success: false, error: "Unauthorized" });
        continue;
      }

      const prevStage = application.stage;

      // Auto-assign the job's first assessment when moving to skill_assessment
      const patchData: Record<string, unknown> = { stage: args.stage };
      if (args.stage === "skill_assessment" && !application.assessment_id) {
        const job = await ctx.db.get(application.job_id);
        if (job?.assessments && job.assessments.length > 0) {
          patchData.assessment_id = job.assessments[0];
        }
      }
      await ctx.db.patch(applicationId, patchData);

      // Update job stage counts
      const job = await ctx.db.get(application.job_id);
      if (job) {
        await updateJobStageCounts(ctx.db, job, prevStage, args.stage);
      }

      // Schedule email notification for applicable stage transitions
      const stageTemplateMap: Record<string, string> = {
        skill_assessment: "skill_assessment",
        interviews: "interviews",
        acceptance: "acceptance",
        archived: "archived",
      };
      const templateType = stageTemplateMap[args.stage];
      if (templateType && prevStage !== args.stage) {
        await ctx.scheduler.runAfter(0, internal.modules.applicationsNode.sendStageEmailInternal, {
          applicationId,
          templateType,
          origin: args.origin,
        });
      }

      results.push({ id: applicationId, success: true });
    }

    return { results, message: `Updated ${results.filter((r) => r.success).length} applications` };
  },
});

// Send assessment to applications
export const sendAssessment = authedMutation({
  args: {
    applicationIds: v.array(v.id("applications")),
    assessmentId: v.id("assessments"),
    customEmailTemplate: v.optional(v.string()),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    // Determine email template type from the assessment type
    const assessment = await ctx.db.get(args.assessmentId);
    const emailTemplateType = assessment?.type === "technical_assessment" ? "technical_assessment" : "skill_assessment";

    const results = [];

    for (const applicationId of args.applicationIds) {
      const application = await ctx.db.get(applicationId);
      if (!application) {
        results.push({ id: applicationId, success: false, error: "Application not found" });
        continue;
      }

      // Verify application belongs to user's company
      if (application.company_id !== user.company_id) {
        results.push({ id: applicationId, success: false, error: "Unauthorized" });
        continue;
      }

      // Update application with assessment and move to skill_assessment stage
      await ctx.db.patch(applicationId, {
        assessment_id: args.assessmentId,
        stage: "skill_assessment",
        assessment_completed: false,
      });

      // Update job stage counts
      const job = await ctx.db.get(application.job_id);
      if (job) {
        await updateJobStageCounts(ctx.db, job, application.stage, "skill_assessment");
      }

      // Schedule email notification for the candidate
      await ctx.scheduler.runAfter(0, internal.modules.applicationsNode.sendStageEmailInternal, {
        applicationId,
        templateType: emailTemplateType,
        origin: args.origin,
        customContent: args.customEmailTemplate,
      });

      results.push({ id: applicationId, success: true });
    }

    return { results, message: `Sent assessment to ${results.filter((r) => r.success).length} candidates` };
  },
});

// Move applications to stage with custom email
export const moveToStageWithEmail = authedMutation({
  args: {
    applicationIds: v.array(v.id("applications")),
    stage: APPLICATION_STAGES,
    customEmailTemplate: v.optional(v.string()),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const results = [];

    for (const applicationId of args.applicationIds) {
      const application = await ctx.db.get(applicationId);
      if (!application) {
        results.push({ id: applicationId, success: false, error: "Application not found" });
        continue;
      }

      // Verify application belongs to user's company
      if (application.company_id !== user.company_id) {
        results.push({ id: applicationId, success: false, error: "Unauthorized" });
        continue;
      }

      const oldStage = application.stage;

      // Auto-assign the job's first assessment when moving to skill_assessment
      const patchData: Record<string, unknown> = { stage: args.stage };
      if (args.stage === "skill_assessment" && !application.assessment_id) {
        const jobForAssessment = await ctx.db.get(application.job_id);
        if (jobForAssessment?.assessments && jobForAssessment.assessments.length > 0) {
          patchData.assessment_id = jobForAssessment.assessments[0];
        }
      }
      await ctx.db.patch(applicationId, patchData);

      // Update job stage counts
      const job = await ctx.db.get(application.job_id);
      if (job) {
        await updateJobStageCounts(ctx.db, job, oldStage, args.stage);
      }

      // Schedule email notification (skips stages with no template)
      const stageTemplateMap: Record<string, string> = {
        skill_assessment: "skill_assessment",
        interviews: "interviews",
        acceptance: "acceptance",
        archived: "archived",
      };
      const templateType = stageTemplateMap[args.stage];
      if (templateType) {
        await ctx.scheduler.runAfter(0, internal.modules.applicationsNode.sendStageEmailInternal, {
          applicationId,
          templateType,
          origin: args.origin,
          customContent: args.customEmailTemplate,
        });
      }

      results.push({ id: applicationId, success: true });
    }

    return {
      results,
      message: `Moved ${results.filter((r) => r.success).length} candidates to ${args.stage.replace("_", " ")}`,
    };
  },
});

// Delete an application
export const remove = authedMutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new ConvexError({ message: "Application not found", code: 404 });

    // Verify application belongs to user's company
    if (application.company_id !== user.company_id) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    // Update job stage counts before deletion
    const job = await ctx.db.get(application.job_id);
    if (job) {
      await decrementStageCount(ctx.db, job, application.stage);
    }

    await ctx.db.delete(args.applicationId);

    return { message: "Application deleted successfully" };
  },
});

// ============================================
// PUBLIC ENDPOINTS (No Authentication Required)
// ============================================

// Public query to get job application form details
export const getPublicJobApplicationForm = query({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    // Only return active jobs for public viewing
    if (job.status !== "active") {
      return null;
    }

    // Return application form structure with job skills
    return {
      job_id: job._id,
      title: job.title,
      skills: job.skills || [],
      application_form: job.application_form || {
        required_fields: [],
        custom_fields: [],
      },
    };
  },
});

// Note: submitPublicApplication is now in applications.node.ts (requires Node.js runtime)

// Internal mutation to update assessment score after AI grading
export const updateAssessmentScore = internalMutation({
  args: {
    applicationId: v.id("applications"),
    assessmentType: v.string(),
    score: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) return;

    const currentResults = application.assessments_results || {};
    const existingResult = currentResults[args.assessmentType] || {};

    await ctx.db.patch(args.applicationId, {
      assessments_results: {
        ...currentResults,
        [args.assessmentType]: {
          ...existingResult,
          assessment_score: args.score,
          assessment_feedback: args.feedback,
        },
      },
      // Also update legacy top-level field for compatibility
      assessment_score: args.score,
    });
  },
});

// Public mutation to submit online/technical assessment
export const submitAssessment = mutation({
  args: {
    applicationId: v.id("applications"),
    jobId: v.id("jobs"),
    assessmentId: v.id("assessments"),
    answers: v.optional(
      v.array(
        v.object({
          question_index: v.number(),
          answer: v.string(),
        }),
      ),
    ),
    submissionUrl: v.optional(v.string()),
    selectedOption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { applicationId, jobId, assessmentId, answers, submissionUrl, selectedOption } = args;

    // Validate application
    const application = await ctx.db.get(applicationId);
    if (!application) {
      throw new ConvexError({ message: "Application not found", code: 404 });
    }

    if (application.job_id !== jobId) {
      throw new ConvexError({ message: "Application does not match job", code: 400 });
    }

    // Validate assessment
    const assessment = await ctx.db.get(assessmentId);
    if (!assessment) {
      throw new ConvexError({ message: "Assessment not found", code: 404 });
    }

    // Update application with assessment results
    const assessmentKey = assessment.type;
    const now = new Date().toISOString();

    const result = {
      assessment_id: assessmentId,
      assessment_status: "completed",
      assessment_submitted_date: now,
      assessment_submission_status: "submitted",
      assessment_submission_link: submissionUrl,
      answers: answers,
      selected_option: selectedOption,
    };

    // Prepare update data
    const updateData: any = {};

    // Get existing assessment results or initialize
    const currentResults = application.assessments_results || {};

    // Update the specific assessment type result
    updateData.assessments_results = {
      ...currentResults,
      [assessmentKey]: {
        ...(currentResults[assessmentKey] || {}), // Keep existing data if any (though usually overwriting)
        ...result,
      },
    };

    // Also update legacy fields if needed (optional but good for compatibility)
    if (assessment.type === "technical_assessment") {
      updateData.assessment_completed = true;
      updateData.assessment_id = assessmentId;
    }

    await ctx.db.patch(applicationId, updateData);

    // Notify the company that an assessment has been submitted
    const notifJob = await ctx.db.get(args.jobId);
    if (notifJob) {
      await ctx.scheduler.runAfter(0, internal.modules.notifications.createInternal, {
        company_id: application.company_id,
        title: "Assessment Submitted",
        content: `${application.name} has submitted their ${assessment.type.replace(/_/g, " ")} for the ${notifJob.title} position.`,
        type: "assessment",
      });
    }

    // Schedule AI grading for online assessments that have questions and answers
    const isOnlineAssessment = assessment.type === "online_assessment_1" || assessment.type === "online_assessment_2";
    const hasAnswers = answers && answers.length > 0;
    if (isOnlineAssessment && hasAnswers) {
      await ctx.scheduler.runAfter(0, internal.modules.assessment.gradeAssessmentInternal, {
        applicationId,
        assessmentId,
        assessmentType: assessment.type,
      });
    }

    return { status: "success", message: "Assessment submitted successfully" };
  },
});

// Public mutation to generate upload URL for CV/resume uploads
export const generatePublicUploadUrl = mutation({
  args: {
    job_id: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    // Verify job exists and is active
    const job = await ctx.db.get(args.job_id);
    if (!job) {
      throw new ConvexError({ message: "Job not found", code: 404 });
    }

    if (job.status !== "active") {
      throw new ConvexError({ message: "This job is no longer accepting applications", code: 400 });
    }

    // Generate upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Public query to get file URL from storage ID
export const getPublicFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
