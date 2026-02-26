import { adminQuery, adminMutation } from "../utils/permission";
import { v, ConvexError } from "convex/values";
import { CompanySchema } from "./company";
import { UserSchema } from "./user";
import { Constants } from "../utils/constants";
import { hashPassword } from "../utils/validation";
import { getMe } from "../utils/helpers";

const TEMPLATE_TYPES = [
  "skill_assessment",
  "technical_assessment",
  "online_assessment_1",
  "online_assessment_2",
  "interviews",
  "acceptance",
  "archived",
  "rejection",
] as const;

function getDefaultTemplateContent(type: string): string {
  switch (type) {
    case "skill_assessment":
      return `<p>Dear {{candidate_name}},</p>
<p>Congratulations! You have been selected to proceed to the skill assessment stage for the {{job_title}} position.</p>
<p>Please complete the assessment at your earliest convenience.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "technical_assessment":
      return `<p>Dear {{candidate_name}},</p>
<p>You have been invited to complete a technical assessment for the {{job_title}} position.</p>
<p>Please click the link below to access your assessment.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "online_assessment_1":
      return `<p>Dear {{candidate_name}},</p>
<p>You have been invited to complete an online assessment for the {{job_title}} position.</p>
<p>Please click the link below to get started.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "online_assessment_2":
      return `<p>Dear {{candidate_name}},</p>
<p>You have been invited to complete a second online assessment for the {{job_title}} position.</p>
<p>Please click the link below to continue.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "interviews":
      return `<p>Dear {{candidate_name}},</p>
<p>We are pleased to invite you for an interview for the {{job_title}} position.</p>
<p>Our team will reach out to schedule a convenient time.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "acceptance":
      return `<p>Dear {{candidate_name}},</p>
<p>We are thrilled to offer you the {{job_title}} position at {{company_name}}!</p>
<p>Please review the attached offer letter and let us know if you have any questions.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "archived":
      return `<p>Dear {{candidate_name}},</p>
<p>Thank you for your interest in the {{job_title}} position at {{company_name}}.</p>
<p>After careful consideration, we have decided to move forward with other candidates.</p>
<p>We wish you the best in your job search.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    case "rejection":
      return `<p>Dear {{candidate_name}},</p>
<p>Thank you for applying for the {{job_title}} position at {{company_name}}.</p>
<p>After careful consideration, we have decided to move forward with other candidates.</p>
<p>We wish you the best in your future endeavors.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
    default:
      return `<p>Dear {{candidate_name}},</p>
<p>Thank you for your application.</p>
<p>Best regards,<br/>{{company_name}} Team</p>`;
  }
}

function getDefaultTemplateSubject(type: string): string {
  switch (type) {
    case "skill_assessment":
      return "Skill Assessment Invitation - {{job_title}}";
    case "technical_assessment":
      return "Technical Assessment - {{job_title}}";
    case "online_assessment_1":
      return "Online Assessment - {{job_title}}";
    case "online_assessment_2":
      return "Second Online Assessment - {{job_title}}";
    case "interviews":
      return "Interview Invitation - {{job_title}}";
    case "acceptance":
      return "Job Offer - {{job_title}}";
    case "archived":
      return "Application Update - {{job_title}}";
    case "rejection":
      return "Application Status - {{job_title}}";
    default:
      return "Application Update - {{job_title}}";
  }
}

export const getDashboardStats = adminQuery({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const applications = await ctx.db.query("applications").collect();
    const assessments = await ctx.db.query("assessments").collect();

    // For recruiter growth, we can group companies by creation month
    // For now, we'll just return the mock data structure or calculate it if we have _creationTime
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const growthMap = new Map<string, number>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString("default", { month: "short" });
      growthMap.set(monthStr, 0);
    }

    companies.forEach((company) => {
      const d = new Date(company._creationTime);
      if (d >= sixMonthsAgo) {
        const monthStr = d.toLocaleString("default", { month: "short" });
        if (growthMap.has(monthStr)) {
          growthMap.set(monthStr, growthMap.get(monthStr)! + 1);
        }
      }
    });

    const recruiterGrowth = Array.from(growthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .reverse();

    // Recent activity - we can get the latest companies, jobs, assessments
    const recentCompanies = await ctx.db.query("companies").order("desc").take(5);
    const recentJobs = await ctx.db.query("jobs").order("desc").take(5);
    const recentAssessments = await ctx.db.query("assessments").order("desc").take(5);

    const allActivity = [
      ...recentCompanies.map((c) => ({
        id: `company-${c._id}`,
        text: `New recruiter '${c.company_name}' joined.`,
        time: new Date(c._creationTime).toISOString(),
        timestamp: c._creationTime,
      })),
      ...recentJobs.map((j) => ({
        id: `job-${j._id}`,
        text: `New job '${j.title}' posted.`,
        time: new Date(j._creationTime).toISOString(),
        timestamp: j._creationTime,
      })),
      ...recentAssessments.map((a) => ({
        id: `assessment-${a._id}`,
        text: `New assessment '${a.title}' created.`,
        time: new Date(a._creationTime).toISOString(),
        timestamp: a._creationTime,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    return {
      kpis: {
        totalRecruiters: companies.length,
        activeJobs: jobs.length,
        candidates: applications.length,
        assessments: assessments.length,
      },
      recruiterGrowth,
      recentActivity: allActivity.slice(0, 5).map((a) => {
        // Format time relative to now
        const diffMs = Date.now() - a.timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeStr = "Just now";
        if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        else if (diffHours > 0) timeStr = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        else if (diffMins > 0) timeStr = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

        return {
          id: a.id,
          text: a.text,
          time: timeStr,
        };
      }),
    };
  },
});

export const getRecentActivity = adminQuery({
  args: {},
  handler: async (ctx) => {
    const recentCompanies = await ctx.db.query("companies").order("desc").take(20);
    const recentJobs = await ctx.db.query("jobs").order("desc").take(20);
    const recentAssessments = await ctx.db.query("assessments").order("desc").take(20);

    const allActivity = [
      ...recentCompanies.map((c) => ({
        id: `company-${c._id}`,
        text: `New recruiter '${c.company_name}' joined.`,
        time: new Date(c._creationTime).toISOString(),
        timestamp: c._creationTime,
      })),
      ...recentJobs.map((j) => ({
        id: `job-${j._id}`,
        text: `New job '${j.title}' posted.`,
        time: new Date(j._creationTime).toISOString(),
        timestamp: j._creationTime,
      })),
      ...recentAssessments.map((a) => ({
        id: `assessment-${a._id}`,
        text: `New assessment '${a.title}' created.`,
        time: new Date(a._creationTime).toISOString(),
        timestamp: a._creationTime,
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    return allActivity.map((a) => {
      // Format time relative to now
      const diffMs = Date.now() - a.timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeStr = "Just now";
      if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      else if (diffHours > 0) timeStr = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      else if (diffMins > 0) timeStr = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

      return {
        id: a.id,
        text: a.text,
        time: timeStr,
      };
    });
  },
});

export const getRecruiters = adminQuery({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").order("desc").collect();

    // For each company, we need to get their primary admin (first user created for this company)
    // and count their active jobs
    const recruiters = await Promise.all(
      companies.map(async (company) => {
        const users = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("company_id"), company._id))
          .order("asc")
          .collect();

        const primaryAdmin = users.length > 0 ? users[0] : null;

        const jobs = await ctx.db
          .query("jobs")
          .withIndex("by_company", (q) => q.eq("company_id", company._id))
          .collect();

        const activeJobsCount = jobs.filter((j) => j.status === "active").length;

        return {
          id: company._id,
          companyName: company.company_name,
          companyLogo: company.company_logo,
          industry: "Technology", // Defaulting as it's not in schema
          primaryAdmin: primaryAdmin ? `${primaryAdmin.first_name} ${primaryAdmin.last_name}` : "Unknown",
          email: primaryAdmin?.email || "Unknown",
          status: "active" as const, // Defaulting as it's not in schema
          activeJobs: activeJobsCount,
          joinedAt: new Date(company._creationTime).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
      }),
    );

    return recruiters;
  },
});

export const getRecruiterDetails = adminQuery({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) return null;

    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("company_id"), company._id))
      .order("asc")
      .collect();

    const primaryAdmin = users.length > 0 ? users[0] : null;

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("company_id", company._id))
      .collect();

    const activeJobsCount = jobs.filter((j) => j.status === "active").length;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_company", (q) => q.eq("company_id", company._id))
      .collect();

    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_company", (q) => q.eq("company_id", company._id))
      .collect();

    return {
      id: company._id,
      companyName: company.company_name,
      companyLogo: company.company_logo,
      industry: "Technology", // Defaulting as it's not in schema
      primaryAdmin: primaryAdmin ? `${primaryAdmin.first_name} ${primaryAdmin.last_name}` : "Unknown",
      email: primaryAdmin?.email || "Unknown",
      status: "active" as const, // Defaulting as it's not in schema
      activeJobs: activeJobsCount,
      totalJobs: jobs.length,
      totalCandidates: applications.length,
      totalAssessments: assessments.length,
      joinedAt: new Date(company._creationTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      website: company.company_website || "N/A",
      employees: company.number_of_employees || "N/A",
      about: company.about_company || "N/A",
      jobs: jobs.map((j) => ({
        id: j._id,
        title: j.title,
        department: "Engineering", // Defaulting
        status: j.status || "draft",
        candidates: applications.filter((a) => a.job_id === j._id).length,
        postedDate: new Date(j._creationTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
      recentActivity: [
        ...jobs.map((j) => ({
          id: `job-${j._id}`,
          action: "Job Posted",
          details: `Posted new job: ${j.title}`,
          date: new Date(j._creationTime).toISOString(),
          timestamp: j._creationTime,
        })),
        ...assessments.map((a) => ({
          id: `assessment-${a._id}`,
          action: "Assessment Created",
          details: `Created assessment: ${a.title}`,
          date: new Date(a._creationTime).toISOString(),
          timestamp: a._creationTime,
        })),
      ]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10),
    };
  },
});

export const getRecruiterActivityLogs = adminQuery({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) return [];

    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("company_id"), company._id))
      .collect();

    const userMap = new Map(users.map((u) => [u._id, `${u.first_name} ${u.last_name}`]));
    const primaryAdminName = users.length > 0 ? `${users[0].first_name} ${users[0].last_name}` : "System";

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("company_id", company._id))
      .collect();

    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_company", (q) => q.eq("company_id", company._id))
      .collect();

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_company", (q) => q.eq("company_id", company._id))
      .collect();

    const allActivity = [
      {
        id: `company-${company._id}`,
        action: "Company Created",
        details: `Registered company account for ${company.company_name}`,
        timestamp: company._creationTime,
        user: primaryAdminName,
      },
      ...jobs.map((j) => ({
        id: `job-${j._id}`,
        action: "Job Posted",
        details: `Posted new job: ${j.title}`,
        timestamp: j._creationTime,
        user: j.created_by ? userMap.get(j.created_by) || "Unknown User" : primaryAdminName,
      })),
      ...assessments.map((a) => ({
        id: `assessment-${a._id}`,
        action: "Assessment Created",
        details: `Created assessment: ${a.title}`,
        timestamp: a._creationTime,
        user: a.created_by ? userMap.get(a.created_by) || "Unknown User" : primaryAdminName,
      })),
      ...applications.map((app) => {
        const job = jobs.find((j) => j._id === app.job_id);
        return {
          id: `app-${app._id}`,
          action: "Application Received",
          details: `New application for ${job?.title || "Unknown Job"}`,
          timestamp: app._creationTime,
          user: "Candidate",
        };
      }),
    ];

    return allActivity.sort((a, b) => b.timestamp - a.timestamp);
  },
});

export const getRecruiterJobDetails = adminQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    const company = await ctx.db.get(job.company_id);

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("job_id", job._id))
      .collect();

    const candidates = applications.map((app) => {
      return {
        id: app._id,
        name: app.name || "Unknown Candidate",
        jobTitle: job.title,
        stage: app.stage,
        appliedAt: new Date(app._creationTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        skills: app.cv_analysis?.skills || [],
      };
    });

    return {
      id: job._id,
      title: job.title,
      status: job.status,
      companyName: company?.company_name || "Unknown Company",
      employmentType: job.job_type || "Full-time",
      workMode: job.work_model || "Onsite",
      location: job.location || "Not specified",
      skills: job.skills || [],
      about: job.description || "No description provided.",
      responsibilities: job.responsibilities || [],
      candidates,
    };
  },
});

// Admin mutation to create a new company with primary admin user
export const createCompany = adminMutation({
  args: {
    company: CompanySchema,
    user: UserSchema.omit("company_id", "is_active", "role"),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Check if company already exists
    const companyExist = await ctx.db
      .query("companies")
      .filter((e) => e.eq(e.field("company_name"), args.company.company_name))
      .first();

    if (companyExist)
      throw new ConvexError({
        message: Constants.ERROR.ALREADY_EXIST,
        code: 401,
      });

    // Check if user already exists
    const userExist = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.user.email))
      .first();

    if (userExist)
      throw new ConvexError({
        message: Constants.ERROR.ALREADY_EXIST,
        code: 401,
      });

    // Convert storage ID to URL if provided
    let logoUrl: string | undefined;
    if (args.logoStorageId) {
      const url = await ctx.storage.getUrl(args.logoStorageId);
      if (!url) {
        throw new ConvexError({
          message: "Failed to get logo URL",
          code: 500,
        });
      }
      logoUrl = url;
    }

    // Create the company with the logo URL if available
    const companyData = {
      ...args.company,
      company_logo: logoUrl,
    };

    const newCompany = await ctx.db.insert("companies", companyData);

    // Seed initial email templates for the new company
    for (const type of TEMPLATE_TYPES) {
      await ctx.db.insert("email_templates", {
        company_id: newCompany,
        type,
        subject: getDefaultTemplateSubject(type),
        content: getDefaultTemplateContent(type),
        is_default: true,
      });
    }

    // Hash password and create the admin user
    const hashedPassword = hashPassword(args.user.password);
    const newUser = await ctx.db.insert("users", {
      ...args.user,
      password: hashedPassword,
      company_id: newCompany,
      is_active: true,
      role: "admin",
    });

    if (!newUser)
      throw new ConvexError({
        message: Constants.ERROR.CREATE_ERROR,
        code: 401,
      });

    return {
      companyId: newCompany,
      message: Constants.SUCCESS.COMPANY_CREATE,
    };
  },
});

// Admin mutation to generate upload URL for company logo
export const generateCompanyLogoUploadUrl = adminMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
