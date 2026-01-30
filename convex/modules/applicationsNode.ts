"use node";

import { ConvexError, v } from "convex/values";
import { action, internalAction, ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { analyzeCVWithAI, extractTextFromCV } from "../ai/cvAnalysis";

// CV Analysis Schema (must match the one in applications.ts)
const CVAnalysisSchema = {
  match_score: v.optional(v.number()),
  skills_match: v.optional(v.array(v.string())),
  missing_skills: v.optional(v.array(v.string())),
  experience_years: v.optional(v.number()),
  education_level: v.optional(v.string()),
  recommendations: v.optional(v.string()),
  skills: v.optional(v.array(v.string())),
  education: v.optional(v.array(v.string())),
  summary: v.optional(v.string()),
};

// Professional info schema
const ProfessionalInfoSchema = v.object({
  experience_years: v.optional(v.number()),
  skills: v.optional(v.union(v.string(), v.array(v.string()))),
  education: v.optional(v.array(v.string())),
  start_date: v.optional(v.string()),
});

// ============================================
// SHARED CV ANALYSIS LOGIC
// ============================================

interface AnalyzeCVArgs {
  applicationId: Id<"applications">;
  cvStorageId?: Id<"_storage">;
  cvUrl?: string;
}

interface AnalyzeCVResult {
  success: boolean;
  error?: string;
  analysis?: {
    match_score: number;
    skills_match: string[];
    missing_skills: string[];
    experience_years: number;
    education_level: string;
    recommendations: string;
    skills: string[];
    education: string[];
    summary: string;
  };
}

// Shared CV analysis handler to avoid code duplication
async function performCVAnalysis(ctx: ActionCtx, args: AnalyzeCVArgs): Promise<AnalyzeCVResult> {
  const { applicationId, cvStorageId, cvUrl: argsCvUrl } = args;

  // Get the application
  const application = await ctx.runQuery(internal.modules.applications.getApplicationInternal, {
    applicationId,
  });

  if (!application) {
    console.error("[CV Analysis] Application not found:", applicationId);
    return { success: false, error: "Application not found" };
  }

  // Get the job details
  const job = await ctx.runQuery(internal.modules.applications.getJobInternal, {
    jobId: application.job_id,
  });

  if (!job) {
    console.error("[CV Analysis] Job not found:", application.job_id);
    return { success: false, error: "Job not found" };
  }

  // Get the company for AI API key
  const company = await ctx.runQuery(internal.modules.applications.getCompanyInternal, {
    companyId: application.company_id,
  });

  if (!company) {
    console.error("[CV Analysis] Company not found:", application.company_id);
    return { success: false, error: "Company not found" };
  }

  // Use company API key
  const aiApiKey = company.ai_api_key;
  if (!aiApiKey) {
    console.error("[CV Analysis] Company ai_api_key not set. Please configure it in company settings.");
    return { success: false, error: "AI API key not configured for this company" };
  }

  // Get the CV URL
  let cvUrl: string | undefined = argsCvUrl || application.cv_url;

  // If we have a storage ID, get the URL from storage
  if (cvStorageId) {
    const storageUrl = await ctx.runQuery(internal.modules.applications.getFileUrlInternal, {
      storageId: cvStorageId,
    });
    if (storageUrl) {
      cvUrl = storageUrl;
    }
  }

  if (!cvUrl) {
    console.error("[CV Analysis] No CV URL available for analysis");
    return { success: false, error: "No CV URL available" };
  }

  // Fetch the CV file
  const cvResponse = await fetch(cvUrl);
  if (!cvResponse.ok) {
    console.error("[CV Analysis] Failed to fetch CV:", cvResponse.statusText);
    return { success: false, error: "Failed to fetch CV file" };
  }

  const contentType = cvResponse.headers.get("content-type") || "";
  const cvBuffer = await cvResponse.arrayBuffer();

  // Extract text from CV
  let cvText: string;
  try {
    cvText = await extractTextFromCV(cvBuffer, contentType);
  } catch (extractError) {
    return { success: false, error: "Failed to extract text from CV" };
  }

  if (!cvText || cvText.trim().length < 50) {
    return { success: false, error: "Could not extract sufficient text from CV" };
  }

  // Analyze CV with AI
  const analysisResult = await analyzeCVWithAI({
    cvText,
    jobTitle: job.title,
    jobDescription: job.description,
    jobSkills: job.skills,
    jobRequirements: job.requirements,
    aiApiKey,
  });

  // Update the application with CV analysis
  await ctx.runMutation(internal.modules.applications.updateCVAnalysisInternal, {
    applicationId,
    cv_analysis: {
      match_score: analysisResult.match_score,
      skills_match: analysisResult.skills_match,
      missing_skills: analysisResult.missing_skills,
      experience_years: analysisResult.experience_years,
      education_level: analysisResult.education_level,
      recommendations: analysisResult.recommendations,
      skills: analysisResult.skills,
      education: analysisResult.education,
      summary: analysisResult.summary,
    },
  });

  return {
    success: true,
    analysis: analysisResult,
  };
}

// ============================================
// CV ANALYSIS ACTIONS (Node.js environment)
// ============================================

// Internal action to analyze CV after application submission (called from submitPublicApplication)
export const analyzeCVActionInternal = internalAction({
  args: {
    applicationId: v.id("applications"),
    cvStorageId: v.optional(v.id("_storage")),
    cvUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      return await performCVAnalysis(ctx, args);
    } catch (error) {
      console.error("[CV Analysis Internal] Action failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during CV analysis",
      };
    }
  },
});

// Public action to analyze CV (can be called directly)
export const analyzeCVAction = action({
  args: {
    applicationId: v.id("applications"),
    cvStorageId: v.optional(v.id("_storage")),
    cvUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      return await performCVAnalysis(ctx, args);
    } catch (error) {
      console.error("[CV Analysis] Action failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during CV analysis",
      };
    }
  },
});

// Public action to submit an application (no authentication required)
export const submitPublicApplication = action({
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
  handler: async (ctx, args): Promise<{ id: Id<"applications">; message: string }> => {
    // Create the application via internal mutation
    const result = await ctx.runMutation(internal.modules.applications.createPublicApplicationInternal, {
      job_id: args.job_id,
      name: args.name,
      email: args.email,
      phone: args.phone,
      cv_url: args.cv_url,
      cv_storage_id: args.cv_storage_id,
      professional_info: args.professional_info,
      custom_fields: args.custom_fields,
    });

    // If CV is provided, trigger CV analysis in background using scheduler
    if (args.cv_url || args.cv_storage_id) {
      try {
        // Schedule CV analysis to run immediately in the background
        await ctx.scheduler.runAfter(0, internal.modules.applicationsNode.analyzeCVActionInternal, {
          applicationId: result.id,
          cvStorageId: args.cv_storage_id,
          cvUrl: args.cv_url,
        });
      } catch (error) {
        // Log but don't fail the application submission
        console.error("Failed to schedule CV analysis:", error);
      }
    }

    return {
      id: result.id,
      message: "Application submitted successfully",
    };
  },
});
