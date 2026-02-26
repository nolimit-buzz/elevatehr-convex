import { adminQuery } from "../utils/permission";

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
