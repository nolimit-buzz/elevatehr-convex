interface EmailTemplateProps {
  candidate_name: string;
  job_title: string;
  company_name: string;
}

export const Skill_Assessment = ({ candidate_name, job_title, company_name }: EmailTemplateProps) => {
  return (
    <>
      <p>Dear {candidate_name},</p>
      <p>
        Congratulations! You have been selected to proceed to the skill assessment stage for the {job_title} position.
      </p>
      <p>Please complete the assessment at your earliest convenience.</p>
      <p>
        Best regards,
        <br />
        {company_name} Team
      </p>
    </>
  );
};

export const Technical_Assessment = ({ candidate_name, job_title, company_name }: EmailTemplateProps) => {
  return (
    <>
      <p>Dear {candidate_name},</p>
      <p>You have been invited to complete a technical assessment for the {job_title} position.</p>
      <p>Please click the link below to access your assessment.</p>
      <p>
        Best regards,
        <br />
        {company_name} Team
      </p>
    </>
  );
};

export const Interviews = ({ candidate_name, job_title, company_name }: EmailTemplateProps) => {
  return (
    <>
      <p>Dear {candidate_name},</p>
      <p>We are pleased to invite you for an interview for the {job_title} position.</p>
      <p>Our team will reach out to schedule a convenient time.</p>
      <p>
        Best regards,
        <br />
        {company_name} Team
      </p>
    </>
  );
};

export const Acceptance = ({ candidate_name, job_title, company_name }: EmailTemplateProps) => {
  return (
    <>
      <p>Dear {candidate_name},</p>
      <p>
        We are thrilled to offer you the {job_title} position at {company_name}!
      </p>
      <p>Please review the attached offer letter and let us know if you have any questions.</p>
      <p>
        Best regards,
        <br />
        {company_name} Team
      </p>
    </>
  );
};

export const Archived = ({ candidate_name, job_title, company_name }: EmailTemplateProps) => {
  return (
    <>
      <p>Dear {candidate_name},</p>
      <p>
        Thank you for your interest in the {job_title} position at {company_name}.
      </p>
      <p>After careful consideration, we have decided to move forward with other candidates.</p>
      <p>We wish you the best in your job search.</p>
      <p>
        Best regards,
        <br />
        {company_name} Team
      </p>
    </>
  );
};

export const ApplicationReceived = ({ candidate_name, job_title, company_name }: EmailTemplateProps) => {
  return (
    <>
      <p>Dear {candidate_name},</p>
      <p>Thank you for your application.</p>
      <p>
        Best regards,
        <br />
        {company_name} Team
      </p>
    </>
  );
};
