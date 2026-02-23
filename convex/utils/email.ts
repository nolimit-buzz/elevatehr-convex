import { Resend } from "resend";
import { ConvexError } from "convex/values";

type EmailConfigPayload = {
  to: string[];
  subject: string;
  html: string;
};

type EmailTemplatePayload = {
  candidate_name: string;
  job_title: string;
  company_name: string;
  assessment_link?: string;
};

function replacePlaceholders(str: string, vars: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// -------------------------------------------------------
// HTML email templates – plain strings, no React renderer
// -------------------------------------------------------
function wrapEmail(body: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">${body}</body></html>`;
}

function tplSkillAssessment({
  candidate_name,
  job_title,
  company_name,
  assessment_link,
}: EmailTemplatePayload): string {
  const linkHtml = assessment_link
    ? `<p>Please click the link below to start:</p><p><a href="${assessment_link}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Start Assessment</a></p>`
    : "";

  return wrapEmail(`
    <p>Dear ${candidate_name},</p>
    <p>Congratulations! You have been selected to proceed to the skill assessment stage for the <strong>${job_title}</strong> position.</p>
    <p>Please complete the assessment at your earliest convenience.</p>
    ${linkHtml}
    <p>Best regards,<br/>${company_name} Team</p>
  `);
}

function tplTechnicalAssessment({
  candidate_name,
  job_title,
  company_name,
  assessment_link,
}: EmailTemplatePayload): string {
  const linkHtml = assessment_link
    ? `<p>Please click the link below to access your assessment:</p><p><a href="${assessment_link}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Start Technical Assessment</a></p>`
    : "";

  return wrapEmail(`
    <p>Dear ${candidate_name},</p>
    <p>You have been invited to complete a technical assessment for the <strong>${job_title}</strong> position.</p>
    ${linkHtml}
    <p>Best regards,<br/>${company_name} Team</p>
  `);
}

function tplInterviews({ candidate_name, job_title, company_name }: EmailTemplatePayload): string {
  return wrapEmail(`
    <p>Dear ${candidate_name},</p>
    <p>We are pleased to invite you for an interview for the <strong>${job_title}</strong> position.</p>
    <p>Our team will reach out to schedule a convenient time.</p>
    <p>Best regards,<br/>${company_name} Team</p>
  `);
}

function tplAcceptance({ candidate_name, job_title, company_name }: EmailTemplatePayload): string {
  return wrapEmail(`
    <p>Dear ${candidate_name},</p>
    <p>We are thrilled to offer you the <strong>${job_title}</strong> position at <strong>${company_name}</strong>!</p>
    <p>Please review the attached offer letter and let us know if you have any questions.</p>
    <p>Best regards,<br/>${company_name} Team</p>
  `);
}

function tplArchived({ candidate_name, job_title, company_name }: EmailTemplatePayload): string {
  return wrapEmail(`
    <p>Dear ${candidate_name},</p>
    <p>Thank you for your interest in the <strong>${job_title}</strong> position at <strong>${company_name}</strong>.</p>
    <p>After careful consideration, we have decided to move forward with other candidates at this time.</p>
    <p>We wish you the best in your job search.</p>
    <p>Best regards,<br/>${company_name} Team</p>
  `);
}

function tplApplicationReceived({ candidate_name, job_title, company_name }: EmailTemplatePayload): string {
  return wrapEmail(`
    <p>Dear ${candidate_name},</p>
    <p>Thank you for applying for the <strong>${job_title}</strong> position at <strong>${company_name}</strong>.</p>
    <p>We have received your application and will review it shortly. We will be in touch about next steps.</p>
    <p>Best regards,<br/>${company_name} Team</p>
  `);
}

function buildFallbackHtml(template: string, payload: EmailTemplatePayload): string {
  switch (template) {
    case "skill_assessment":
      return tplSkillAssessment(payload);
    case "technical_assessment":
      return tplTechnicalAssessment(payload);
    case "interviews":
      return tplInterviews(payload);
    case "acceptance":
      return tplAcceptance(payload);
    case "archived":
    case "rejection":
      return tplArchived(payload);
    default:
      return tplApplicationReceived(payload);
  }
}

export class Mailman {
  static async sendEmail(payload: EmailConfigPayload) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new ConvexError("Email service not configured: RESEND_API_KEY environment variable is missing");
    }

    const client = new Resend(apiKey);
    const { data, error } = await client.emails.send({
      from: "ElevateHR <noreply@codesordinate.studio>",
      to: [...payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.html.replace(/<[^>]+>/g, ""),
    });

    if (error) {
      console.error("[Mailman] Resend error:", JSON.stringify(error));
      throw new ConvexError(`Failed to send email: ${(error as any).message ?? JSON.stringify(error)}`);
    }

    console.log("[Mailman] Email sent, id:", (data as any)?.id);
  }

  /**
   * Send a stage-transition or lifecycle email.
   * If `customHtmlContent` is provided (from a company's saved template) it is
   * used with placeholder substitution; otherwise a built-in HTML template is
   * used as fallback.
   */
  static async sendTemplatedEmail({
    to,
    subject,
    template,
    templatePayload,
    customHtmlContent,
  }: {
    to: string[];
    subject: string;
    template: string;
    templatePayload: EmailTemplatePayload;
    customHtmlContent?: string;
  }) {
    const assessmentLinkHtml = templatePayload.assessment_link
      ? `<p></p><p>Please click the link below to start the assessment:</p><p><a href="${templatePayload.assessment_link}" style="display:inline-block;padding:12px 24px;background-color:#007bff;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Start Assessment</a></p>`
      : "";

    const vars: Record<string, string> = {
      candidate_name: templatePayload.candidate_name,
      job_title: templatePayload.job_title,
      company_name: templatePayload.company_name,
      // If the user puts {{assessment_link}} in their template, use the raw URL so they can format it how they want (e.g. inside an <a href="...">)
      assessment_link: templatePayload.assessment_link || "",
    };

    let htmlContent: string;

    console.log(`[Mailman] Processing template: ${template}`);
    console.log(
      `[Mailman] Assessment link present: ${!!templatePayload.assessment_link} (${templatePayload.assessment_link})`,
    );
    console.log(`[Mailman] Custom content present: ${!!customHtmlContent}`);

    if (customHtmlContent) {
      // First, perform variable substitution on the custom content
      htmlContent = replacePlaceholders(customHtmlContent, vars);

      // If we have an assessment link available, ALWAYS append the button automatically.
      if (templatePayload.assessment_link) {
        console.log(`[Mailman] Appending assessment link HTML to custom content`, { assessmentLinkHtml });
        htmlContent += assessmentLinkHtml;
      }
    } else {
      htmlContent = buildFallbackHtml(template, templatePayload);
    }

    // Ensure we wrap custom content in basic HTML structure if it's not already
    if (
      !htmlContent.trim().toLowerCase().startsWith("<!doctype html") &&
      !htmlContent.trim().toLowerCase().startsWith("<html")
    ) {
      htmlContent = wrapEmail(htmlContent);
    }

    await Mailman.sendEmail({ to, subject: replacePlaceholders(subject, vars), html: htmlContent });
    console.log(`[Mailman] Sent '${template}' email to ${to.join(", ")}`);
  }

  /** @deprecated Use sendTemplatedEmail instead */
  static async AssessmentEmail({
    template,
    emailConfig: { to, subject },
    templatePayload,
  }: {
    template: string;
    emailConfig: EmailConfigPayload;
    templatePayload: EmailTemplatePayload;
  }) {
    await Mailman.sendTemplatedEmail({ to, subject, template, templatePayload });
  }
}
