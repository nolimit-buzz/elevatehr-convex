import { adminQuery } from "../utils/permission";
import { v } from "convex/values";

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
