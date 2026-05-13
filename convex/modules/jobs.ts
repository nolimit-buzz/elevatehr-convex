import { Constants } from "../utils/constants";
import { ConvexError, v } from "convex/values";
import { flexibleMutation, flexibleQuery } from "../utils/permission";
import { Id } from "../_generated/dataModel";
import { action, internalMutation, internalQuery, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { generateJobDescription } from "../templates/ai/jobDescription";
import { generateSkillsForRole } from "../templates/ai/assessmentDescription";
import { verifyToken } from "../utils/validation";
import { requiredData } from "../utils/data";

// Internal query to get company by ID (used by actions)
export const getCompanyInternal = internalQuery({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.companyId);
  },
});

// Job type enum values
const JOB_TYPES = v.union(v.literal("fulltime"), v.literal("contract"));
const WORK_MODELS = v.union(v.literal("onsite"), v.literal("remote"), v.literal("hybrid"));
const JOB_STATUS = v.union(v.literal("draft"), v.literal("active"), v.literal("closed"));

export const JobSchema = v.object({
  title: v.string(),
  job_type: JOB_TYPES,
  work_model: WORK_MODELS,
  location: v.string(),
  status: v.optional(JOB_STATUS),
  company_id: v.id("companies"),
  created_by: v.id("users"),
  description: v.optional(v.string()),
  requirements: v.optional(v.array(v.string())),
  responsibilities: v.optional(v.array(v.string())),
  salary_min: v.optional(v.number()),
  salary_max: v.optional(v.number()),
  salary_currency: v.optional(v.string()),
  experience_level: v.optional(v.string()),
  skills: v.optional(v.array(v.string())),
  benefits: v.optional(v.array(v.string())),
  application_deadline: v.optional(v.string()),
  stage_counts: v.optional(
    v.object({
      new: v.number(),
      skill_assessment: v.number(),
      interviews: v.number(),
      acceptance: v.number(),
      archived: v.number(),
    }),
  ),
  assessments: v.optional(v.array(v.id("assessments"))),
  application_form: v.optional(
    v.object({
      custom_fields: v.optional(
        v.array(
          v.object({
            type: v.string(),
            label: v.string(),
            key: v.string(),
            required: v.boolean(),
            options: v.optional(v.record(v.string(), v.string())),
            allowed_types: v.optional(v.array(v.string())),
          }),
        ),
      ),
      required_fields: v.optional(
        v.array(
          v.object({
            type: v.string(),
            label: v.string(),
            key: v.string(),
            required: v.boolean(),
            options: v.optional(v.record(v.string(), v.string())),
            allowed_types: v.optional(v.array(v.string())),
          }),
        ),
      ),
    }),
  ),
});

// Create a new job posting with AI-generated description
export const create = action({
  args: {
    token: v.string(),
    title: v.string(),
    job_type: JOB_TYPES,
    work_model: WORK_MODELS,
    location: v.string(),
    experience_level: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ id: Id<"jobs">; message: string }> => {
    // Verify user
    const user = await verifyToken(args.token);
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });
    if (!user.company_id) throw new ConvexError({ message: "Company not found", code: 404 });

    // Fetch company to get AI API key
    const company = await ctx.runQuery(internal.modules.jobs.getCompanyInternal, {
      companyId: user.company_id,
    });
    if (!company) throw new ConvexError({ message: "Company not found", code: 404 });
    if (!company.ai_api_key) throw new ConvexError({ message: "AI API key not configured for company", code: 400 });

    // Generate job description using AI
    const aiResult = await generateJobDescription({
      jobTitle: args.title,
      jobLevel: args.experience_level,
      aiApiKey: company.ai_api_key,
    });

    // Generate skills for the role using AI
    const skillsResult = await generateSkillsForRole({
      jobTitle: args.experience_level ? `${args.experience_level} ${args.title}` : args.title,
      jobDescription: aiResult.success && aiResult.data?.aboutTheRole ? aiResult.data.aboutTheRole : "",
      aiApiKey: company.ai_api_key,
    });

    // Combine technical and soft skills
    const allSkills = [...(skillsResult.technical || []), ...(skillsResult.soft || [])];

    // Create the job with AI-generated content including skills
    const jobId: Id<"jobs"> = await ctx.runMutation(internal.modules.jobs.createJobInternal, {
      title: args.title,
      job_type: args.job_type,
      work_model: args.work_model,
      location: args.location,
      company_id: user.company_id,
      created_by: user.id,
      experience_level: args.experience_level,
      salary_min: 400,
      salary_max: 450,
      description: aiResult.success && aiResult.data ? aiResult.data.aboutTheRole : undefined,
      responsibilities: aiResult.success && aiResult.data ? aiResult.data.jobResponsibilities : undefined,
      requirements: aiResult.success && aiResult.data ? aiResult.data.expectations : undefined,
      skills: allSkills.length > 0 ? allSkills : undefined,
    });

    return { id: jobId, message: "Job posting created successfully" };
  },
});

// Get a single job by ID
export const get = flexibleQuery({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new ConvexError({ message: "Job not found", code: 404 });

    // Ensure user can only access jobs from their company (or admin impersonating)
    if (!isAdmin && job.company_id !== targetCompanyId) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    // Compute real-time stage counts from applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("job_id", args.jobId))
      .collect();

    const stageCounts = {
      new: 0,
      skill_assessment: 0,
      interviews: 0,
      acceptance: 0,
      archived: 0,
    };

    for (const app of applications) {
      if (stageCounts[app.stage] !== undefined) {
        stageCounts[app.stage]++;
      }
    }

    return {
      ...job,
      stage_counts: stageCounts,
    };
  },
});

// List all jobs for the company with optional status filter
export const list = flexibleQuery({
  args: {
    status: v.optional(JOB_STATUS),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const targetCompanyId = args.companyIdOverride ?? user.company_id;
    let query = ctx.db.query("jobs").withIndex("by_company", (q) => q.eq("company_id", targetCompanyId!));
    const jobs = await query.collect();

    // Get all applications for the company to compute real-time counts
    const allApplications = await ctx.db
      .query("applications")
      .withIndex("by_company", (q) => q.eq("company_id", user.company_id!))
      .collect();

    // Group applications by job_id and stage
    const applicationsByJob = new Map<
      string,
      { new: number; skill_assessment: number; interviews: number; acceptance: number; archived: number }
    >();

    for (const app of allApplications) {
      const jobId = app.job_id.toString();
      if (!applicationsByJob.has(jobId)) {
        applicationsByJob.set(jobId, { new: 0, skill_assessment: 0, interviews: 0, acceptance: 0, archived: 0 });
      }
      const counts = applicationsByJob.get(jobId)!;
      if (counts[app.stage] !== undefined) {
        counts[app.stage]++;
      }
    }

    // Default stage counts for jobs without applicants
    const defaultStageCounts = {
      new: 0,
      skill_assessment: 0,
      interviews: 0,
      acceptance: 0,
      archived: 0,
    };

    // Add computed stage_counts to jobs
    const jobsWithStageCounts = jobs.map((job) => ({
      ...job,
      stage_counts: applicationsByJob.get(job._id.toString()) || defaultStageCounts,
    }));

    // Filter by status if provided
    if (args.status) {
      return jobsWithStageCounts.filter((job) => job.status === args.status);
    }

    return jobsWithStageCounts;
  },
});

// Update a job posting
export const update = flexibleMutation({
  args: {
    jobId: v.id("jobs"),
    data: JobSchema.partial(),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    const { jobId, data } = args;
    const job = await ctx.db.get(jobId);

    if (!job) throw new ConvexError({ message: "Job not found", code: 404 });

    // Ensure user can only update jobs from their company (or admin impersonating)
    if (!isAdmin && job.company_id !== targetCompanyId) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    // Filter out undefined values from the data object
    const filteredUpdate = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

    await ctx.db.patch(jobId, filteredUpdate);

    return { id: jobId, message: "Job posting updated successfully" };
  },
});

// Delete a job posting
export const remove = flexibleMutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    const job = await ctx.db.get(args.jobId);

    if (!job) throw new ConvexError({ message: "Job not found", code: 404 });

    // Ensure user can only delete jobs from their company (or admin impersonating)
    if (!isAdmin && job.company_id !== targetCompanyId) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    await ctx.db.delete(args.jobId);

    return { message: "Job posting deleted successfully" };
  },
});

// Get job statistics for the company
export const getStatistics = flexibleQuery({
  args: {},
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;
    if (!targetCompanyId) throw new ConvexError({ message: "Company not found", code: 404 });

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .collect();

    const activeJobs = jobs.filter((job) => job.status === "active").length;
    const draftJobs = jobs.filter((job) => job.status === "draft").length;
    const closedJobs = jobs.filter((job) => job.status === "closed").length;

    return {
      total: jobs.length,
      active_jobs: activeJobs,
      draft_jobs: draftJobs,
      closed_jobs: closedJobs,
    };
  },
});

// Shared args for internal job creation
const createJobInternalArgs = {
  title: v.string(),
  job_type: JOB_TYPES,
  work_model: WORK_MODELS,
  location: v.string(),
  company_id: v.id("companies"),
  created_by: v.string(),
  experience_level: v.optional(v.string()),
  salary_min: v.optional(v.number()),
  salary_max: v.optional(v.number()),
  description: v.optional(v.string()),
  responsibilities: v.optional(v.array(v.string())),
  requirements: v.optional(v.array(v.string())),
  skills: v.optional(v.array(v.string())),
};

export const createJobInternal = internalMutation({
  args: createJobInternalArgs,
  handler: async (ctx, args) => {
    const { created_by, ...rest } = args;
    const jobId = await ctx.db.insert("jobs", {
      ...rest,
      status: "draft",
      application_form: {
        required_fields: requiredData,
      },
      created_by: created_by as Id<"users">,
    });

    return jobId;
  },
});

// Get assessments linked to a specific job
export const getJobAssessments = flexibleQuery({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new ConvexError({ message: "Job not found", code: 404 });

    // Ensure user can only access assessments for jobs from their company (or admin impersonating)
    if (!isAdmin && job.company_id !== targetCompanyId) {
      throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 403 });
    }

    // Get only assessments linked to this specific job
    const jobAssessmentIds = job.assessments || [];
    const assessments = await Promise.all(jobAssessmentIds.map((assessmentId) => ctx.db.get(assessmentId)));
    const validAssessments = assessments.filter(Boolean) as NonNullable<(typeof assessments)[number]>[];

    return {
      status: "success",
      assessments: validAssessments.map((assessment) => ({
        id: assessment._id,
        type: assessment.type,
        title: assessment.title,
        description: assessment.description || "",
        created_at: new Date(assessment._creationTime).toISOString(),
        updated_at: new Date(assessment._creationTime).toISOString(),
      })),
    };
  },
});

// Public query to get job details for public job listing page (no authentication required)
export const getPublicJob = query({
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

    // Return job data formatted for public view
    return {
      id: job._id,
      title: job.title,
      location: job.location,
      work_model: job.work_model,
      job_type: job.job_type,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      experience_level: job.experience_level,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_currency: job.salary_currency,
      skills: job.skills,
      benefits: job.benefits,
      application_deadline: job.application_deadline,
      company_id: job.company_id,
      created_at: new Date(job._creationTime).toISOString(),
    };
  },
});

// Public query to get company details for public job listing page (no authentication required)
export const getPublicCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) throw new ConvexError({ message: "Company not found", code: 404 });

    // Return only public-facing company info
    return {
      id: company._id,
      company_name: company.company_name,
      company_logo: company.company_logo,
      company_website: company.company_website,
      number_of_employees: company.number_of_employees,
      about_company: company.about_company,
    };
  },
});
