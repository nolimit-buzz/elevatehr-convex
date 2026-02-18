import { Resend } from "resend";
import { ConvexError } from "convex/values";
import { render } from "@react-email/render";
import {
  Acceptance,
  ApplicationReceived,
  Interviews,
  Skill_Assessment,
  Technical_Assessment,
} from "../templates/email/skill_assessment";

const resend = new Resend(process.env.YOUR_RESEND_API_KEY);

type EmailConfigPayload = {
  to: string[];
  subject: string;
  html: string;
};

type EmailTemplatePayload = {
  candidate_name: string;
  job_title: string;
  company_name: string;
};

export class Mailman {
  static async sendEmail(payload: EmailConfigPayload) {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@example.com>",
      to: [...payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.html.replace(/<[^>]+>/g, ""),
    });

    if (error) throw new ConvexError("Failed to send email");
  }

  static async AssessmentEmail({
    template,
    emailConfig: { to, subject },
    templatePayload,
  }: {
    template: string;
    emailConfig: EmailConfigPayload;
    templatePayload: EmailTemplatePayload;
  }) {
    let htmlContent = "";

    switch (template) {
      case "skill_assessment":
        htmlContent = await render(Skill_Assessment(templatePayload));
        break;
      case "technical_assessment":
        htmlContent = await render(Technical_Assessment(templatePayload));
        break;
      case "interviews":
        htmlContent = await render(Interviews(templatePayload));
        break;
      case "acceptance":
        htmlContent = await render(Acceptance(templatePayload));
        break;
      default:
        htmlContent = await render(ApplicationReceived(templatePayload));
    }

    Mailman.sendEmail({ to, subject, html: htmlContent });
    console.log("Email Queued for sending");
  }
}
