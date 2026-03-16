"use client";
//@ts-nocheck
import { useState, Fragment, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";


// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { pdfjs } from "react-pdf";

import { useApplication, useApplications, useApplicationMutations } from "@/queries/applications.queries";
import { useJob } from "@/queries/jobs.queries";
import EmailStageTransitionDialog from "@/app/dashboard/components/EmailStageTransitionDialog";
import Notification from "@/app/dashboard/components/Notification";

// Components
import Sidebar from "../components/Sidebar";
import ApplicantHeader from "../components/ApplicantHeader";
import SkillsSection from "../components/SkillsSection";
import KeyInfo from "../components/KeyInfo";
import CVAnalysisSection from "../components/CVAnalysisSection";
import CustomFieldsSection from "../components/CustomFieldsSection";
import ResumeViewer from "../components/ResumeViewer";
import ActionButtons from "../components/ActionButtons";
import DetailsSkeleton from "../components/DetailsSkeleton";
import ScoreAnalysisSection from "../components/ScoreAnalysisSection";
import GradingFeedbacks from "../components/GradingFeedbacks";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const dynamic = "force-dynamic";

export default function ApplicantDetails() {
  const router = useRouter();
  const params = useParams();

  // Get applicant_id and job_id from params
  const applicantId = typeof params.applicant_id === "string" ? params.applicant_id : null;
  const jobId = typeof params.job_id === "string" ? params.job_id : null;

  // Fetch single applicant details using Convex
  const applicantData = useApplication(applicantId);

  // Fetch job details to get custom field labels
  const jobData = useJob(jobId);

  // Fetch all applications for this job (for sidebar)
  const applicationsData = useApplications(jobId ? { jobId: jobId } : null);

  // Get mutations for reject and move to stage
  const { updateStage } = useApplicationMutations();

  // Derive loading and error states
  const detailsLoading = applicantData === undefined || jobData === undefined;
  const loading = applicationsData === undefined;
  const error = applicantData === null ? "Failed to fetch applicant details" : jobData === null ? "Failed to fetch job details" : null;

  // Transform applicant data
  const applicant = useMemo(() => {
    if (!applicantData) return null;
    return {
      id: applicantData.id,
      personal_info: {
        firstname: applicantData.personal_info?.firstname || "",
        lastname: applicantData.personal_info?.lastname || "",
        email: applicantData.personal_info?.email || "",
        phone: applicantData.personal_info?.phone || "",
        location: applicantData.personal_info?.location || "",
      },
      professional_info: {
        experience_years: applicantData.professional_info?.experience_years,
        experience: String(applicantData.professional_info?.experience_years || ""),
        start_date: applicantData.professional_info?.start_date || "",
        skills: Array.isArray(applicantData.professional_info?.skills)
          ? applicantData.professional_info.skills.join(", ")
          : "",
      },
      attachments: applicantData.attachments,
      cv_analysis: applicantData.cv_analysis,
      custom_fields: applicantData.custom_fields,
      job_title: applicantData.job_title,
      assessments_results: applicantData.assessments_results,
    };
  }, [applicantData]);

  // Transform applications list for sidebar
  const applicants = useMemo(() => {
    if (!applicationsData?.applications) return [];
    return applicationsData.applications.map((app) => ({
      id: app.id,
      personal_info: {
        firstname: app.personal_info?.firstname || "",
        lastname: app.personal_info?.lastname || "",
        location: app.personal_info?.location || "",
      },
      professional_info: {
        experience: String(app.professional_info?.experience_years || ""),
        salary_range: "",
        start_date: app.professional_info?.start_date || "",
      },
    }));
  }, [applicationsData]);

  const handleApplicantClick = (id: string) => {
    router.push(`/dashboard/job-posting/${jobId}/submissions/${id}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleReject = async () => {
    if (!applicant?.id) return;
    try {
      const { error: rejectError } = await updateStage([String(applicant.id)], "archived");
      if (!rejectError) {
        router.push(`/dashboard/job-posting/${jobId}/submissions`);
      }
    } catch (err) {
      console.error("Error rejecting applicant:", err);
    }
  };

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleMoveToAssessment = () => {
    if (!applicant?.id) return;
    setEmailDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleBack}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" sx={{ color: "grey.100" }}>{applicant?.job_title || "Job Title"}</Typography>
      </Stack>
      <Box sx={{ display: "flex", gap: 3, minHeight: "100vh" }}>
        <Sidebar
          applicants={applicants}
          currentApplicantId={applicant?.id ?? null}
          onApplicantClick={handleApplicantClick}
        />
        <Paper elevation={0} sx={{ flex: 1, p: 4, borderRadius: 2, width: "80%" }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            {detailsLoading ? (
              <DetailsSkeleton />
            ) : !applicant ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">Select an applicant to view details</Typography>
              </Box>
            ) : (
              <Fragment>
                <ApplicantHeader
                  firstname={applicant.personal_info.firstname}
                  lastname={applicant.personal_info.lastname}
                  matchScore={applicant.cv_analysis?.match_score}
                  email={applicant.personal_info.email}
                  assessmentsResults={applicant.assessments_results}
                />

                <Accordion
                  elevation={0}
                  sx={{
                    bgcolor: "rgba(17, 17, 17, 0.04)",
                    borderRadius: "8px !important",
                    mb: 2,
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Application details
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <SkillsSection skills={applicant.professional_info.skills} />
                    <KeyInfo startDate={applicant.professional_info.start_date} />
                    <CVAnalysisSection cvAnalysis={applicant.cv_analysis as any} />
                    <CustomFieldsSection jobData={jobData} applicant={applicant} />
                    <ResumeViewer
                      cvUrl={applicant.attachments?.cv}
                      externalCvLink={applicant.attachments?.external_cv_link}
                    />
                  </AccordionDetails>
                </Accordion>

                {Object.entries(applicant.assessments_results || {}).some(
                  ([_, result]: [string, any]) => result && result.assessment_id
                ) && (
                  <Accordion
                    elevation={0}
                    sx={{
                      bgcolor: "rgba(17, 17, 17, 0.04)",
                      borderRadius: "8px !important",
                      mb: 4,
                      '&:before': { display: 'none' }
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Assessment details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <ScoreAnalysisSection assessmentsResults={applicant.assessments_results} />
                      <GradingFeedbacks jobData={jobData} applicant={applicant} />
                    </AccordionDetails>
                  </Accordion>
                )}

                <ActionButtons
                  onReject={handleReject}
                  onMoveToAssessment={handleMoveToAssessment}
                />
              </Fragment>
            )}
          </Paper>
        </Paper>
      </Box>
      <EmailStageTransitionDialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        stage="skill_assessment"
        applicantIds={applicant ? [String(applicant.id)] : []}
        onSuccess={(msg) => setNotification({ open: true, message: msg, severity: "success" })}
        onError={(msg) => setNotification({ open: true, message: msg, severity: "error" })}
      />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </Container>
  );
}
