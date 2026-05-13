import { ConvexError } from "convex/values";
import { flexibleQuery } from "../utils/permission";
import { Constants } from "../utils/constants";

// ============================================
// QUERIES
// ============================================

/**
 * Get dashboard statistics for the current user's company
 * Returns: active_jobs, total_applicants, assessments counts
 */
export const getDashboardStats = flexibleQuery({
  args: {},
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;

    if (!targetCompanyId) {
      // If user is not an admin and has no company, they shouldn't access this
      if (!isAdmin) {
        throw new ConvexError({ message: "User not associated with a company", code: 403 });
      }
      throw new ConvexError({ message: "Company not found", code: 404 });
    }

    // Get active jobs count
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .collect();

    const activeJobs = allJobs.filter((job) => job.status === "active" || job.status === undefined);

    // Get assessments count
    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .collect();

    // Get total applicants count from applications table
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .collect();
    const totalApplicants = applications.length;

    return {
      active_jobs: activeJobs.length,
      total_applicants: totalApplicants,
      assessments: assessments.length,
      // Additional stats that might be useful
      total_jobs: allJobs.length,
      closed_jobs: allJobs.filter((job) => job.status === "closed").length,
      draft_jobs: allJobs.filter((job) => job.status === "draft").length,
    };
  },
});

/**
 * Get detailed job statistics
 */
export const getJobStats = flexibleQuery({
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

    const byStatus = {
      active: jobs.filter((j) => j.status === "active" || j.status === undefined).length,
      closed: jobs.filter((j) => j.status === "closed").length,
      draft: jobs.filter((j) => j.status === "draft").length,
    };

    const byType = {
      fulltime: jobs.filter((j) => j.job_type === "fulltime").length,
      contract: jobs.filter((j) => j.job_type === "contract").length,
    };

    const byWorkModel = {
      onsite: jobs.filter((j) => j.work_model === "onsite").length,
      remote: jobs.filter((j) => j.work_model === "remote").length,
      hybrid: jobs.filter((j) => j.work_model === "hybrid").length,
    };

    return {
      total: jobs.length,
      byStatus,
      byType,
      byWorkModel,
    };
  },
});

/**
 * Get assessment statistics
 */
export const getAssessmentStats = flexibleQuery({
  args: {},
  handler: async (ctx, args) => {
    const user = ctx.user;
    if (!user) throw new ConvexError({ message: Constants.ERROR.UNAUTHORIZED, code: 401 });

    const isAdmin = ctx._isAdmin === true;
    const targetCompanyId = args.companyIdOverride ?? user.company_id;
    if (!targetCompanyId) throw new ConvexError({ message: "Company not found", code: 404 });

    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_company", (q) => q.eq("company_id", targetCompanyId))
      .collect();

    const byType = {
      technical_assessment: assessments.filter((a) => a.type === "technical_assessment").length,
      online_assessment_1: assessments.filter((a) => a.type === "online_assessment_1").length,
      online_assessment_2: assessments.filter((a) => a.type === "online_assessment_2").length,
    };

    return {
      total: assessments.length,
      byType,
    };
  },
});
