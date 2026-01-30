import { api } from "../../convex/_generated/api";
import { fetchAction } from "convex/nextjs";
import { DefaultConstants } from "@/app/constants/defaults";

/**
 * Generate skills for a job role using AI (Convex action with Groq)
 * Requires authentication token
 */
export async function generateSkillsForRole(
  jobTitle: string,
  jobDescription: string = "",
): Promise<{ technical: string[]; soft: string[] }> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem(DefaultConstants.tokenName) : null;

    if (!token) {
      console.error("Error generating skills: No auth token found");
      return { technical: [], soft: [] };
    }

    const result = await fetchAction(api.modules.assessment.generateSkills, {
      jobTitle,
      jobDescription,
      token,
    });
    return result;
  } catch (error) {
    console.error("Error generating skills:", error);
    return { technical: [], soft: [] };
  }
}
