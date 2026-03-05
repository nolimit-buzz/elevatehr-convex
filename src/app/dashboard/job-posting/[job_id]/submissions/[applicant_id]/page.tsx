"use client";
import { useState, Fragment, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { pdfjs } from "react-pdf";
import mammoth from "mammoth";
import axios from "axios";
import LaunchIcon from "@mui/icons-material/Launch";
import { useApplication, useApplications, useApplicationMutations } from "@/queries/applications.queries";
import EmailStageTransitionDialog from "@/app/dashboard/components/EmailStageTransitionDialog";
import Notification from "@/app/dashboard/components/Notification";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Define TypeScript interfaces for the API response
interface PersonalInfo {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  location?: string;
}

interface ProfessionalInfo {
  experience: string;
  salary_range: string;
  start_date: string;
  skills: string;
  summary: string;
  portfolio_url?: string;
  experience_list: Array<{
    company: string;
    location: string;
    title: string;
    start_date: string;
    end_date?: string;
    responsibilities: string;
  }>;
}

interface EducationInfo {
  school: string;
  location: string;
  degree: string;
  graduation_date: string;
  details?: string;
}

interface Certification {
  name: string;
  issuer: string;
}

interface ApplicationInfo {
  cover_letter: string;
}

interface CVAnalysis {
  match_score: number;
  skills_match?: string[];
  missing_skills?: string[];
  experience_years?: number;
  education_level?: string;
  recommendations?: string;
  skills?: string[];
  education?: string[];
  summary?: string;
}

interface Applicant {
  id: string | number;
  personal_info: PersonalInfo;
  professional_info: ProfessionalInfo;
  education_info: EducationInfo[];
  certifications: Certification[];
  application_info: ApplicationInfo;
  attachments?: {
    cv?: string;
    external_cv_link?: string;
  };
  cv_analysis?: CVAnalysis;
  custom_fields?: {
    [key: string]: {
      value: string;
    };
  };
  job_title?: string;
  assessments_results?: {
    [key: string]: {
      assessment_id?: number | string;
      assessment_submitted_date?: string;
      assessment_submission_status?: string;
      assessment_submission_link?: string;
      assessment_status?: string;
      assessment_score?: number;
    };
  };
}

interface ApplicantListItem {
  id: string | number;
  personal_info: {
    firstname: string;
    lastname: string;
    location?: string;
  };
  professional_info: {
    experience: string;
    salary_range: string;
    start_date: string;
  };
}

interface CVContent {
  type: "pdf" | "html" | "text";
  data: string | ArrayBuffer;
}

export const dynamic = "force-dynamic";

export default function ApplicantDetails() {
  const router = useRouter();
  const params = useParams();
  const [cvContent, setCvContent] = useState<CVContent | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  // Get applicant_id and job_id from params
  const applicantId = typeof params.applicant_id === "string" ? params.applicant_id : null;
  const jobId = typeof params.job_id === "string" ? params.job_id : null;

  // Fetch single applicant details using Convex
  const applicantData = useApplication(applicantId);

  // Fetch all applications for this job (for sidebar)
  const applicationsData = useApplications(jobId ? { jobId: jobId } : null);

  // Get mutations for reject and move to stage
  const { updateStage } = useApplicationMutations();

  // Derive loading and error states
  const detailsLoading = applicantData === undefined;
  const loading = applicationsData === undefined;
  const error = applicantData === null ? "Failed to fetch applicant details" : null;

  // Transform applicant data to match expected interface
  const applicant = useMemo(() => {
    if (!applicantData) return null;
    return {
      id: applicantData.id,
      personal_info: {
        firstname: applicantData.personal_info?.firstname || "",
        lastname: applicantData.personal_info?.lastname || "",
        email: applicantData.personal_info?.email || "",
        phone: applicantData.personal_info?.phone || "",
        location: "",
      },
      professional_info: {
        experience: String(applicantData.professional_info?.experience_years || ""),
        salary_range: "",
        start_date: applicantData.professional_info?.start_date || "",
        skills: Array.isArray(applicantData.professional_info?.skills)
          ? applicantData.professional_info.skills.join(", ")
          : "",
        summary: "",
        portfolio_url: "",
        experience_list: [],
      },
      education_info: [],
      certifications: [],
      application_info: {
        cover_letter: "",
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
        location: "",
      },
      professional_info: {
        experience: app.professional_info?.experience || "",
        salary_range: app.professional_info?.salary_range || "",
        start_date: app.professional_info?.start_date || "",
      },
    }));
  }, [applicationsData]);

  const cvAnalysis = applicant?.cv_analysis || null;

  const fetchAndParseCV = async (cvUrl: string) => {
    try {
      const fileExtension = cvUrl.split(".").pop()?.toLowerCase() || "";
      const response = await axios.get(cvUrl, {
        responseType: "arraybuffer",
      });

      if (fileExtension === "pdf") {
        setCvContent({ type: "pdf", data: response.data });
      } else if (fileExtension === "docx") {
        const arrayBuffer = response.data;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setCvContent({ type: "html", data: result.value });
      } else if (fileExtension === "txt" || fileExtension === "md") {
        const text = new TextDecoder().decode(response.data);
        setCvContent({ type: "text", data: text });
      } else {
        setCvError(`Unsupported file format: ${fileExtension}`);
      }
    } catch (error: unknown) {
      console.error("Error fetching or parsing CV:", error);
      if (error instanceof Error) {
        setCvError(error.message);
      } else {
        setCvError("Failed to load CV");
      }
    }
  };

  // Navigate to a different applicant
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
      if (rejectError) {
        console.error("Error rejecting applicant:", rejectError);
      } else {
        // Navigate back to the job submissions page
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!applicant) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">No applicant data found</Alert>
        <Button onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: "grey.100" }}>
          {applicant?.job_title || "Job Title"}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          minHeight: "100vh",
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            width: "30%",
            position: "sticky",
            top: "32px",
            height: "fit-content",
            alignSelf: "flex-start",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              height: "70vh",
              borderRadius: 2,
              bgcolor: "#fff",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#032B4420 transparent",
              "&::-webkit-scrollbar": {
                height: "4px",
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#032B44",
                width: "4px",
                borderRadius: "4px",
                "&:hover": {
                  background: "rgba(68, 68, 226, 0.3)",
                },
              },
            }}
          >
            <List
              sx={{
                textOverflow: "wrap",
                p: 0,
                overflowX: "hidden",
              }}
            >
              {applicants.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "24px 16px",
                    cursor: "pointer",
                    borderBottom: "0.8px solid rgba(17, 17, 17, 0.08)",
                    bgcolor: item.id === applicant?.id ? "rgba(68, 68, 226, 0.04)" : "transparent",
                    border: item.id === applicant?.id ? "1px solid" : "none",
                    borderColor: item.id === applicant?.id ? "secondary.main" : "transparent",
                    borderLeft: item.id === applicant?.id ? "5px solid" : "none",
                    borderLeftColor: item.id === applicant?.id ? "secondary.main" : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                    },
                    opacity: item.id === applicant?.id ? 1 : 0.68,
                  }}
                  onClick={() => {
                    handleApplicantClick(String(item.id));
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontSize: "18px",
                      color: item.id === applicant?.id ? "secondary.main" : "text.grey[100]",
                      mb: 1,
                      textTransform: "capitalize",
                    }}
                  >
                    {item.personal_info.firstname} {item.personal_info.lastname}
                  </Typography>

                  <Stack width="100%" direction="row" flexWrap="wrap" gap={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
                          fill="#292D32"
                        />
                        <path
                          d="M15.7101 15.93C15.5801 15.93 15.4501 15.9 15.3301 15.82L12.2301 13.97C11.4601 13.51 10.8901 12.5 10.8901 11.61V7.51001C10.8901 7.10001 11.2301 6.76001 11.6401 6.76001C12.0501 6.76001 12.3901 7.10001 12.3901 7.51001V11.61C12.3901 11.97 12.6901 12.5 13.0001 12.68L16.1001 14.53C16.4601 14.74 16.5701 15.2 16.3601 15.56C16.2101 15.8 15.9601 15.93 15.7101 15.93Z"
                          fill="#292D32"
                        />
                      </svg>
                      <Typography
                        sx={{
                          color: "rgba(17, 17, 17, 0.68)",
                          fontSize: "16px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "0.16px",
                          width: "max-content",
                        }}
                      >
                        Available{" "}
                        {new Date(applicant?.professional_info?.start_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 14.1699C9.87 14.1699 8.13 12.4399 8.13 10.2999C8.13 8.15994 9.87 6.43994 12 6.43994C14.13 6.43994 15.87 8.16994 15.87 10.3099C15.87 12.4499 14.13 14.1699 12 14.1699ZM12 7.93994C10.7 7.93994 9.63 8.99994 9.63 10.3099C9.63 11.6199 10.69 12.6799 12 12.6799C13.31 12.6799 14.37 11.6199 14.37 10.3099C14.37 8.99994 13.3 7.93994 12 7.93994Z"
                          fill="#292D32"
                        />
                        <path
                          d="M12.0001 22.76C10.5201 22.76 9.03005 22.2 7.87005 21.09C4.92005 18.25 1.66005 13.72 2.89005 8.33C4.00005 3.44 8.27005 1.25 12.0001 1.25C12.0001 1.25 12.0001 1.25 12.0101 1.25C15.7401 1.25 20.0101 3.44 21.1201 8.34C22.3401 13.73 19.0801 18.25 16.1301 21.09C14.9701 22.2 13.4801 22.76 12.0001 22.76ZM12.0001 2.75C9.09005 2.75 5.35005 4.3 4.36005 8.66C3.28005 13.37 6.24005 17.43 8.92005 20C10.6501 21.67 13.3601 21.67 15.0901 20C17.7601 17.43 20.7201 13.37 19.6601 8.66C18.6601 4.3 14.9101 2.75 12.0001 2.75Z"
                          fill="#292D32"
                        />
                      </svg>
                      <Typography
                        sx={{
                          color: "rgba(17, 17, 17, 0.68)",
                          fontSize: "16px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "0.16px",
                          width: "max-content",
                        }}
                      >
                        {item.personal_info.location}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.66685 18.3333H13.3335C16.6835 18.3333 17.2835 16.9917 17.4585 15.3583L18.0835 8.69167C18.3085 6.65833 17.7252 5 14.1668 5H5.83351C2.27518 5 1.69185 6.65833 1.91685 8.69167L2.54185 15.3583C2.71685 16.9917 3.31685 18.3333 6.66685 18.3333Z"
                          stroke="#111111"
                          strokeOpacity="0.62"
                          strokeWidth="1.25"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.6665 5.00008V4.33341C6.6665 2.85841 6.6665 1.66675 9.33317 1.66675H10.6665C13.3332 1.66675 13.3332 2.85841 13.3332 4.33341V5.00008"
                          stroke="#111111"
                          strokeOpacity="0.62"
                          strokeWidth="1.25"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11.6668 10.8333V11.6667C11.6668 11.675 11.6668 11.675 11.6668 11.6833C11.6668 12.5917 11.6585 13.3333 10.0002 13.3333C8.35016 13.3333 8.3335 12.6 8.3335 11.6917V10.8333C8.3335 10 8.3335 10 9.16683 10H10.8335C11.6668 10 11.6668 10 11.6668 10.8333Z"
                          stroke="#111111"
                          strokeOpacity="0.62"
                          strokeWidth="1.25"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.0415 9.16675C16.1165 10.5667 13.9165 11.4001 11.6665 11.6834"
                          stroke="#111111"
                          strokeOpacity="0.62"
                          strokeWidth="1.25"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2.18311 9.3916C4.05811 10.6749 6.17477 11.4499 8.33311 11.6916"
                          stroke="#111111"
                          strokeOpacity="0.62"
                          strokeWidth="1.25"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <Typography
                        sx={{
                          color: "rgba(17, 17, 17, 0.68)",
                          fontSize: "16px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "0.16px",
                          width: "max-content",
                        }}
                      >
                        {item.professional_info.experience} experience
                      </Typography>
                    </Box>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Main Content - Applicant Details */}
        <Paper elevation={0} sx={{ flex: 1, p: 4, borderRadius: 2, width: "80%" }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            {detailsLoading ? (
              <Box>
                {/* Header Skeleton */}
                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" gap={"16px"} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: "200px",
                        height: "32px",
                        bgcolor: "rgba(0, 0, 0, 0.03)",
                        borderRadius: 1,
                      }}
                    />
                    <Stack direction="row" gap={"28px"}>
                      <Box
                        sx={{
                          width: "150px",
                          height: "24px",
                          bgcolor: "rgba(0, 0, 0, 0.03)",
                          borderRadius: 1,
                        }}
                      />
                      <Box
                        sx={{
                          width: "200px",
                          height: "24px",
                          bgcolor: "rgba(0, 0, 0, 0.03)",
                          borderRadius: 1,
                        }}
                      />
                    </Stack>
                  </Stack>

                  {/* Skills Skeleton */}
                  <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: "80px",
                          height: "24px",
                          bgcolor: "rgba(0, 0, 0, 0.03)",
                          borderRadius: "16px",
                        }}
                      />
                    ))}
                  </Stack>

                  {/* Key Info Skeleton */}
                  <Stack direction="row" spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: "120px",
                          height: "24px",
                          bgcolor: "rgba(0, 0, 0, 0.03)",
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Why hire section Skeleton */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      width: "200px",
                      height: "24px",
                      bgcolor: "rgba(0, 0, 0, 0.03)",
                      borderRadius: 1,
                      mb: 2,
                    }}
                  />
                  <Box
                    sx={{
                      width: "100%",
                      height: "100px",
                      bgcolor: "rgba(0, 0, 0, 0.03)",
                      borderRadius: 1,
                    }}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Resume section Skeleton */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100px",
                        height: "24px",
                        bgcolor: "rgba(0, 0, 0, 0.03)",
                        borderRadius: 1,
                      }}
                    />
                    <Box
                      sx={{
                        width: "120px",
                        height: "36px",
                        bgcolor: "rgba(0, 0, 0, 0.03)",
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      height: "800px",
                      bgcolor: "rgba(0, 0, 0, 0.03)",
                      borderRadius: 2,
                    }}
                  />
                </Box>

                {/* Action Buttons Skeleton */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 4,
                  }}
                >
                  <Box
                    sx={{
                      width: "100px",
                      height: "36px",
                      bgcolor: "rgba(0, 0, 0, 0.03)",
                      borderRadius: 2,
                    }}
                  />
                  <Box
                    sx={{
                      width: "160px",
                      height: "36px",
                      bgcolor: "rgba(0, 0, 0, 0.03)",
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </Box>
            ) : !applicant ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 8,
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Select an applicant to view details
                </Typography>
              </Box>
            ) : (
              <Fragment>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" gap={"16px"} sx={{ mb: 1, flexWrap: "wrap", gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: "rgba(17, 17, 17, 0.92)" }}>
                      {applicant?.personal_info?.firstname} {applicant?.personal_info?.lastname}
                    </Typography>
                    <Stack direction="row" gap={"28px"} sx={{ flexWrap: "wrap", gap: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 14.1699C9.87 14.1699 8.13 12.4399 8.13 10.2999C8.13 8.15994 9.87 6.43994 12 6.43994C14.13 6.43994 15.87 8.16994 15.87 10.3099C15.87 12.4499 14.13 14.1699 12 14.1699ZM12 7.93994C10.7 7.93994 9.63 8.99994 9.63 10.3099C9.63 11.6199 10.69 12.6799 12 12.6799C13.31 12.6799 14.37 11.6199 14.37 10.3099C14.37 8.99994 13.3 7.93994 12 7.93994Z"
                            fill="#292D32"
                          />
                          <path
                            d="M12.0001 22.76C10.5201 22.76 9.03005 22.2 7.87005 21.09C4.92005 18.25 1.66005 13.72 2.89005 8.33C4.00005 3.44 8.27005 1.25 12.0001 1.25C12.0001 1.25 12.0001 1.25 12.0101 1.25C15.7401 1.25 20.0101 3.44 21.1201 8.34C22.3401 13.73 19.0801 18.25 16.1301 21.09C14.9701 22.2 13.4801 22.76 12.0001 22.76ZM12.0001 2.75C9.09005 2.75 5.35005 4.3 4.36005 8.66C3.28005 13.37 6.24005 17.43 8.92005 20C10.6501 21.67 13.3601 21.67 15.0901 20C17.7601 17.43 20.7201 13.37 19.6601 8.66C18.6601 4.3 14.9101 2.75 12.0001 2.75Z"
                            fill="#292D32"
                          />
                        </svg>
                        <Typography color="text.grey[100]">{applicant?.personal_info?.location}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M17 21.25H7C3.35 21.25 1.25 19.15 1.25 15.5V8.5C1.25 4.85 3.35 2.75 7 2.75H17C20.65 2.75 22.75 4.85 22.75 8.5V15.5C22.75 19.15 20.65 21.25 17 21.25ZM7 4.25C4.14 4.25 2.75 5.64 2.75 8.5V15.5C2.75 18.36 4.14 19.75 7 19.75H17C19.86 19.75 21.25 18.36 21.25 15.5V8.5C21.25 5.64 19.86 4.25 17 4.25H7Z"
                            fill="#292D32"
                          />
                          <path
                            d="M11.9998 12.87C11.1598 12.87 10.3098 12.61 9.65978 12.08L6.52978 9.57997C6.20978 9.31997 6.14978 8.84997 6.40978 8.52997C6.66978 8.20997 7.13978 8.14997 7.45978 8.40997L10.5898 10.91C11.3498 11.52 12.6398 11.52 13.3998 10.91L16.5298 8.40997C16.8498 8.14997 17.3298 8.19997 17.5798 8.52997C17.8398 8.84997 17.7898 9.32997 17.4598 9.57997L14.3298 12.08C13.6898 12.61 12.8398 12.87 11.9998 12.87Z"
                            fill="#292D32"
                          />
                        </svg>
                        <Typography color="text.grey[100]">{applicant?.personal_info?.email}</Typography>
                      </Box>
                      {/* Assessment Status Chips */}
                      {applicant?.assessments_results &&
                        Object.entries(applicant.assessments_results).map(([type, result]: [string, any]) => {
                          if (result) {
                            const status = result.assessment_submission_status || result.assessment_status;
                            if (status) {
                              let label = `${type
                                .split("_")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}`;

                              const score = result.assessment_score ?? (applicant as any).assessment_score;
                              // Add score if available
                              if (score) {
                                label += ` (${score}%)`;
                              } else if (status === "sent") {
                                label += " (Sent)";
                              }

                              // Determine colors based on assessment type and status
                              let bgColor, textColor;
                              if (type === "technical_assessment") {
                                if (status === "submitted") {
                                  bgColor = "#E3F2FD"; // Light blue for submitted
                                  textColor = "#1976D2"; // Dark blue text
                                } else if (status === "sent") {
                                  bgColor = "#FFF3E0"; // Light orange for sent
                                  textColor = "#E65100"; // Dark orange text
                                } else {
                                  bgColor = "#FFF3E0"; // Light orange for other states
                                  textColor = "#E65100"; // Dark orange text
                                }
                              } else {
                                // For online assessment
                                if (score) {
                                  bgColor = "#E8F5E9"; // Light green for scored
                                  textColor = "#2E7D32"; // Dark green text
                                } else if (status === "submitted") {
                                  bgColor = "#E8F5E9";
                                  textColor = "#2E7D32";
                                } else if (status === "sent") {
                                  bgColor = "#E3F2FD"; // Light blue for sent
                                  textColor = "#1976D2"; // Dark blue text
                                } else {
                                  bgColor = "#FFF3E0"; // Light orange for other states
                                  textColor = "#E65100"; // Dark orange text
                                }
                              }

                              return (
                                <Chip
                                  key={type}
                                  size="small"
                                  label={label}
                                  sx={{
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    fontWeight: 500,
                                    "& .MuiChip-label": {
                                      px: 1,
                                    },
                                  }}
                                />
                              );
                            }
                          }
                          return null;
                        })}
                    </Stack>
                  </Stack>

                  {/* Skills */}
                  <Stack direction="row" spacing={1} sx={{ my: 3, flexWrap: "wrap", gap: 1 }}>
                    {applicant?.professional_info?.skills?.split(",").map((skill: string, index: number) => {
                      const colorIndex = index % 4;
                      const colors = [
                        { bg: "rgba(114, 74, 59, 0.15)", color: "rgba(114, 74, 59, 1)" },
                        { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
                        { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
                        { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
                      ];
                      return (
                        <Chip
                          key={index}
                          label={skill.trim()}
                          title={skill.trim()}
                          sx={{
                            bgcolor: colors[colorIndex].bg,
                            color: colors[colorIndex].color,
                            borderRadius: "16px",
                            maxWidth: 240,
                            "& .MuiChip-label": {
                              px: 2,
                              py: 0.5,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            },
                          }}
                        />
                      );
                    })}
                  </Stack>

                  {/* Key Info */}
                  <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
                          fill="#292D32"
                        />
                        <path
                          d="M15.7101 15.93C15.5801 15.93 15.4501 15.9 15.3301 15.82L12.2301 13.97C11.4601 13.51 10.8901 12.5 10.8901 11.61V7.51001C10.8901 7.10001 11.2301 6.76001 11.6401 6.76001C12.0501 6.76001 12.3901 7.10001 12.3901 7.51001V11.61C12.3901 11.97 12.6901 12.5 13.0001 12.68L16.1001 14.53C16.4601 14.74 16.5701 15.2 16.3601 15.56C16.2101 15.8 15.9601 15.93 15.7101 15.93Z"
                          fill="#292D32"
                        />
                      </svg>
                      <Typography
                        sx={{
                          color: "rgba(17, 17, 17, 0.68)",
                          fontSize: "16px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "0.16px",
                        }}
                      >
                        Available{" "}
                        {new Date(applicant?.professional_info?.start_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* CV Analysis Section */}
                {typeof cvAnalysis === "object" && cvAnalysis && (
                  <Box sx={{ mb: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          Skills Analysis
                        </Typography>
                        <Stack spacing={1}>
                          {(cvAnalysis?.missing_skills?.length ?? 0) > 0 && (
                            <Box>
                              <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                                Missing Required Skills:
                              </Typography>
                              <Stack direction="row" flexWrap="wrap" gap={1}>
                                {cvAnalysis?.missing_skills?.map((skill, index) => (
                                  <Chip
                                    key={index}
                                    label={skill}
                                    title={skill}
                                    sx={{
                                      bgcolor: "rgba(244, 67, 54, 0.1)",
                                      color: "error.main",
                                      borderRadius: "16px",
                                      maxWidth: 240,
                                      "& .MuiChip-label": {
                                        maxWidth: "100%",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        display: "block",
                                      },
                                    }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: "rgba(17, 17, 17, 0.04)",
                          p: 2,
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Recommendations
                        </Typography>
                        <Typography color="text.grey[100]" sx={{ whiteSpace: "pre-line" }}>
                          {cvAnalysis.recommendations}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Resume section */}
                <Box>
                  {/* CV Preview */}
                  {applicant?.attachments?.cv || applicant?.attachments?.external_cv_link ? (
                    <Box
                      sx={{
                        mb: 4,
                        p: 3,
                        bgcolor: "rgba(17, 17, 17, 0.04)",
                        borderRadius: 2,
                        height: "800px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 3,
                        }}
                      >
                        <Link
                          sx={{
                            textDecoration: "underline",
                            textDecorationColor: "rgba(17, 17, 17, 0.68)",
                          }}
                          href={applicant.attachments?.cv || applicant.attachments?.external_cv_link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: "rgba(17, 17, 17, 0.92)",
                                cursor: "pointer",
                                "&:hover": {
                                  color: "primary.main",
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              Resume
                            </Typography>
                            <LaunchIcon
                              sx={{
                                fontSize: 16,
                                color: "rgba(17, 17, 17, 0.68)",
                              }}
                            />
                          </Box>
                        </Link>
                      </Box>

                      {(() => {
                        const rawUrl = applicant.attachments?.cv || applicant.attachments?.external_cv_link || "#";
                        // Always embed directly - Convex storage URLs and most PDFs work in iframes
                        // Only fall back to Google Docs for known non-PDF formats like .docx
                        const isDocx = /\.docx?($|\?)/i.test(rawUrl);
                        const previewSrc = isDocx
                          ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}`
                          : rawUrl;
                        return (
                          <iframe
                            allowFullScreen
                            unselectable="on"
                            src={previewSrc}
                            referrerPolicy="no-referrer"
                            style={{
                              width: "100%",
                              height: "100%",
                              border: "none",
                            }}
                            title="CV Preview"
                          />
                        );
                      })()}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        mb: 4,
                        p: 3,
                        bgcolor: "rgba(17, 17, 17, 0.04)",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.grey[100]">No CV available</Typography>
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 4,
                    position: "sticky",
                    bottom: 0,
                    bgcolor: "background.paper",
                    py: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleReject}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      px: 3,
                      py: 1.5,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "rgba(68, 68, 226, 0.08)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(68, 68, 226, 0.1)",
                      },
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleMoveToAssessment}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      px: 3,
                      py: 1.5,
                      bgcolor: "primary.main",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        bgcolor: "#6666E6",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
                      },
                    }}
                  >
                    Move to Assessment
                  </Button>
                </Box>
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
