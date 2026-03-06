"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
  Typography,
  styled,
  SvgIcon,
  Grid,
  Box,
  IconButton,
  InputBase,
  FormControl,
  InputLabel,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { Avatar } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DashboardSkeleton from "./components/DashboardSkeleton";
import CloseIcon from "@mui/icons-material/Close";
import PageContainer from "@/app/dashboard/components/container/PageContainer";
import JobPostings from "@/app/dashboard/components/dashboard/JobPostings";
import theme from "@/utils/theme";
import DashboardCard from "./components/shared/DashboardCard";
import Notifications from "./components/dashboard/Notifications";
import EmailTemplates from "./components/dashboard/EmailTemplates";
import { useRouter, useSearchParams } from "next/navigation";
import { getProfile } from "@/app/utils/authStorage";
import Calendar from "@/app/components/Assessments";
import { CalendlyEvent } from "@/app/types/calendly";
import Assessment from "@/app/components/Assessment";
import { JobQueries, useJobsList } from "@/queries/jobs.queries";
import { useDashboardStats } from "@/queries/stats.queries";
import { useAssessmentsList } from "@/queries/assessment.queries";
import { useEmailTemplates } from "@/queries/emailTemplates.queries";
import { useNotifications } from "@/queries/notifications.queries";

const statCards = [
  {
    icon: (
      <SvgIcon>
        <svg width="120" height="120" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="60" rx="30" fill="#1CC47E" />
          <path
            d="M22.1879 22.1879L37.8128 37.8128"
            stroke="white"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M37.8125 25.3125L37.8125 37.8125L25.3125 37.8125"
            stroke="white"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SvgIcon>
    ),
    color: "#1CC47E",
    id: "active_jobs",
    title: "Open Roles",
    value: 0,
  },
  {
    icon: (
      <SvgIcon>
        <svg width="120" height="120" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="60" rx="30" fill="#5656E6" />
          <path
            d="M28.4375 41.7188H44.0626"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28.4375 30.7813H44.0626"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28.4375 19.8438H44.0626"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.9375 19.8438L17.5 21.4063L22.1875 16.7188"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.9375 30.7813L17.5 32.3438L22.1875 27.6563"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.9375 41.7188L17.5 43.2813L22.1875 38.5938"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SvgIcon>
    ),
    color: "#5656E6",
    id: "total_applicants",
    title: "Candidates",
    value: 0,
  },
  {
    icon: (
      <SvgIcon>
        <svg width="120" height="120" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="60" rx="30" fill="#FD8535" />
          <path
            d="M28.4375 41.7188H44.0626"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28.4375 30.7813H44.0626"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28.4375 19.8438H44.0626"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.9375 19.8438L17.5 21.4063L22.1875 16.7188"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.9375 30.7813L17.5 32.3438L22.1875 27.6563"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.9375 41.7188L17.5 43.2813L22.1875 38.5938"
            stroke="white"
            strokeWidth="1.875"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SvgIcon>
    ),
    color: "#FD8535",
    id: "assessments",
    title: "Assessments",
    value: 0,
  },
];

const ToolbarStyled = styled(Stack)(({ theme }) => ({
  width: "100%",
  maxWidth: "1440px",
  color: theme.palette.text.secondary,
  display: "flex",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(1.5),
    marginTop: "15px",
    alignItems: "flex-start",
  },
  [theme.breakpoints.up("sm")]: {
    marginBottom: theme.spacing(3),
    marginTop: "40px",
    alignItems: "center",
  },
}));

const Greeting = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[100],
  fontWeight: theme.typography.fontWeightBold,
  [theme.breakpoints.down("sm")]: {
    fontSize: "18px",
  },
  [theme.breakpoints.up("sm")]: {
    fontSize: "20px",
  },
  lineHeight: "24px",
  letterSpacing: "0.15px",
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  padding: "10px 20px",
  fontSize: theme.typography.pxToRem(16),
  color: theme.palette.secondary.light,
  fontWeight: theme.typography.fontWeightMedium,
  height: "52px",
  transition: "all 0.2s ease-in-out",
  [theme.breakpoints.down("sm")]: {
    borderRadius: "50%",
    padding: "0",
    alignItems: "center",
    justifyContent: "center",
    width: "52px",
    height: "52px",
    minWidth: "52px",
  },
  "&:hover": {
    backgroundColor: "#6666E6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
  },
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "10px", // Adjusted gap between radio buttons
  padding: "16px 60px 16px 16px",
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: { xs: "520px", md: "666px" },
    height: "666px",
    flexShrink: 0,
    borderRadius: "8px",
    background: "#FFF",
    padding: "32px",
  },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  display: "flex",
  height: "48px",
  alignItems: "center",
  gap: "8px",
  borderRadius: "6px",
  border: "0.5px solid #D7DAE0",
  background: "#F3F4F7",
  padding: "16px",
  minWidth: "145px",
  "& span": {
    padding: "0px",
  },
}));

const StyledRadio = styled(Radio)(({ theme }) => ({
  "& .MuiSvgIcon-root": {
    opacity: 0.68,
    width: "16px",
    height: "16px",
    aspectRatio: "1 / 1",
    borderColor: "rgba(17, 17, 17, 0.84)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  display: "flex",
  width: "456px",
  padding: "16px 24px",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px",
  borderRadius: "8px",
  background: "#4444E2",
  color: "#FFF",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    background: "#6666E6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
  },
}));

interface StatCardProps {
  card: {
    icon: React.ReactNode;
    color: string;
    id: string;
    title: string;
    value: number;
  };
  index: number;
  length: number;
}

const StatCard = ({ card, index, length }: StatCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (card.id === "active_jobs") {
      router.push("/dashboard/job-listings");
    } else if (card.id === "total_applicants") {
      router.push("/dashboard/applications");
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        cursor: card.id === "active_jobs" || card.id === "total_applicants" ? "pointer" : "default",
        minWidth: "200px",
        flex: 1,
        flexShrink: 0,
        flexGrow: 1,
      }}
    >
      <DashboardCard
        customStyle={{
          flex: 1,
          borderRadius: "10px",
          padding: { xs: "15px", md: "30px" },
          transition: "all 0.3s ease-in-out",
          backgroundColor: `${card.color}20`,
          "&:hover": {
            transform: card.id === "active_jobs" || card.id === "total_applicants" ? "translateY(-4px)" : "none",
            boxShadow:
              card.id === "active_jobs" || card.id === "total_applicants" ? "0 8px 24px rgba(0, 0, 0, 0.08)" : "none",
            backgroundColor: `${card.color}20`,
            "& .stat-value": {
              color: card.color,
            },
            "& .stat-title": {
              color: card.color,
            },
            "& svg rect": {
              fill: "white",
              transition: "all 0.3s ease-in-out",
              stroke: card.color,
              strokeWidth: "1.5",
            },
            "& svg path": {
              stroke: card.color,
              transition: "stroke 0.3s ease-in-out",
            },
          },
          "& svg rect": {
            transition: "all 0.3s ease-in-out",
            stroke: "transparent",
            strokeWidth: "1.5",
          },
          "& svg path": {
            transition: "stroke 0.3s ease-in-out",
          },
        }}
      >
        <Stack>
          {card.icon}
          <Typography
            className="stat-value"
            variant="h3"
            fontSize={"34px"}
            color="rgba(17,17,17,0.92)"
            marginTop={"20px"}
            marginBottom={"10px"}
            fontWeight="700"
            sx={{ transition: "color 0.3s ease-in-out" }}
          >
            {card.value?.toLocaleString()}
          </Typography>
          <Typography
            className="stat-title"
            variant="subtitle2"
            fontSize="16px"
            color="rgba(17,17,17,0.62)"
            sx={{ transition: "color 0.3s ease-in-out" }}
          >
            {card.title}
          </Typography>
        </Stack>
      </DashboardCard>
    </Box>
  );
};

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  personal: {
    first_name: string;
    last_name: string;
  };
  company: {
    name: string;
    logo: string;
    website: string;
  };
}

interface NotificationData {
  id: string | number;
  title: string;
  content: string;
  date: string;
  read: boolean;
  type: string;
}

interface Template {
  id: string | number;
  name: string;
  title: string;
}

interface TemplatesResponse {
  templates: Record<string, { title: string }>;
}

const elevate_base_url = process.env.NEXT_PUBLIC_ELEVATE_BASE_URL || ""; // or hardcode your base URL

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobPostings, setJobPostings] = useState([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: 0,
    name: "",
    email: "",
    role: "",
    personal: {
      first_name: "",
      last_name: "",
    },
    company: {
      name: "",
      logo: "",
      website: "",
    },
  });
  const [formData, setFormData] = useState<{
    title: string;
    job_type: "fulltime" | "contract";
    work_model: "onsite" | "remote" | "hybrid";
    location: string;
  }>({
    title: "",
    job_type: "fulltime",
    work_model: "onsite",
    location: "",
  });

  // Initialize Convex job queries
  const { CreateJob } = JobQueries();

  // Use Convex hook for dashboard statistics
  const convexStats = useDashboardStats();

  // Use Convex hook for jobs list
  const convexStatusFilter = statusFilter === "all" ? undefined : statusFilter;
  const convexJobs = useJobsList(convexStatusFilter as "draft" | "active" | "closed" | undefined);

  // Use Convex hook for assessments
  const convexAssessments = useAssessmentsList();

  // Use Convex hook for email templates
  const convexEmailTemplates = useEmailTemplates();

  // Use Convex hook for notifications
  const convexNotifications = useNotifications(20);

  const [statistics, setStatistics] = useState(statCards);
  const [calendlyEvents, setCalendlyEvents] = useState<CalendlyEvent[]>([]);
  const [calendlyLoading, setCalendlyLoading] = useState(true);
  const [calendlyError, setCalendlyError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<Template[]>([]);
  const [assessments, setAssessments] = useState([]);
  const [assessmentsError, setAssessmentsError] = useState<string | null>(null);

  // Add a state to track if all data is loaded
  const [isAllDataLoaded, setIsAllDataLoaded] = useState(false);

  const searchParams = useSearchParams();
  const company_id = searchParams.get("company_id");

  useEffect(() => {
    // Get profile data from sessionStorage via getProfile helper
    const profile = getProfile<any>();
    if (profile) {
      console.log("Loaded profile from sessionStorage:", profile);

      // Map localStorage data to our state structure
      setProfileData({
        id: profile.id || 0,
        name: profile.name || "",
        email: profile.email || "",
        role: profile.role || "",
        personal: {
          first_name: profile.personalInfo?.first_name || "",
          last_name: profile.personalInfo?.last_name || "",
        },
        company: {
          name: profile.companyInfo?.company_name || "",
          logo: profile.companyInfo?.company_logo || "",
          website: profile.companyInfo?.company_website || "",
        },
      });
    }
    setLoading(false);
  }, []);

  // Add an effect to check if all data is loaded
  useEffect(() => {
    const allDataLoaded =
      !calendlyLoading &&
      !isTabLoading &&
      convexEmailTemplates !== undefined &&
      convexAssessments !== undefined &&
      convexNotifications !== undefined;
    if (allDataLoaded) {
      setIsAllDataLoaded(true);
      setShowSkeleton(false);
    }
  }, [calendlyLoading, isTabLoading, convexEmailTemplates, convexAssessments, convexNotifications, calendlyEvents]);

  // Update job postings from Convex data
  useEffect(() => {
    if (convexJobs !== undefined) {
      // Transform Convex jobs to include `id` field (Convex uses `_id`)
      const transformedJobs = (convexJobs as any[]).map((job: any) => ({
        ...job,
        id: job._id || job.id, // Map _id to id for component compatibility
      }));
      setJobPostings(transformedJobs as any);
      setIsTabLoading(false);
    }
  }, [convexJobs]);

  // Update assessments from Convex data
  useEffect(() => {
    if (convexAssessments !== undefined) {
      setAssessments(convexAssessments as any);
      setAssessmentsError(null);
      setLoading(false);
    }
  }, [convexAssessments]);

  // Update email templates from Convex data
  useEffect(() => {
    if (convexEmailTemplates !== undefined && convexEmailTemplates?.templates) {
      // Transform Convex templates to match the Template interface
      const transformedTemplates = Object.entries(convexEmailTemplates.templates).map(([type, template]) => ({
        id: type.toLowerCase().replace(/\s+/g, "-"),
        name: type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
        title: template.subject || type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      }));
      setEmailTemplates(transformedTemplates);
    }
  }, [convexEmailTemplates]);

  // Update statistics from Convex data
  useEffect(() => {
    if (convexStats) {
      const updatedStats = statCards.map((card) => ({
        ...card,
        value: convexStats[card.id as keyof typeof convexStats] ?? 0,
      }));
      setStatistics(updatedStats);
    }
  }, [convexStats]);

  useEffect(() => {
    const fetchCalendlyEvents = async () => {
      try {
        setCalendlyLoading(true);
        const personalAccessToken = process.env.NEXT_PUBLIC_PERSONAL_ACCESS_TOKEN;

        if (!personalAccessToken) {
          throw new Error("Personal access token is not configured");
        }

        // First get the user profile
        const userResponse = await fetch("https://api.calendly.com/users/me", {
          headers: {
            Authorization: `Bearer ${personalAccessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const userData = await userResponse.json();
        const userUri = userData.resource.uri;

        // Then fetch events using the user's URI
        const eventsResponse = await fetch(`https://api.calendly.com/scheduled_events?user=${userUri}`, {
          headers: {
            Authorization: `Bearer ${personalAccessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!eventsResponse.ok) {
          throw new Error("Failed to fetch events");
        }

        const eventsData = await eventsResponse.json();
        setCalendlyEvents(eventsData.collection || []);
      } catch (error) {
        console.error("Error fetching Calendly events:", error);
        setCalendlyError("Failed to fetch events. Please try again later.");
      } finally {
        setCalendlyLoading(false);
      }
    };

    fetchCalendlyEvents();
  }, []);

  // Update notifications from Convex data
  useEffect(() => {
    if (convexNotifications !== undefined) {
      setNotifications(convexNotifications as NotificationData[]);
    }
  }, [convexNotifications]);

  // Note: Email templates are now fetched via Convex useEmailTemplates hook

  // Note: Assessments are now fetched via Convex useAssessmentsList hook

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const router = useRouter();
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { result, error } = await CreateJob({
        title: formData.title,
        job_type: formData.job_type,
        work_model: formData.work_model,
        location: formData.location,
      });

      if (error) {
        console.error("Error creating job posting:", error);
        setIsSubmitting(false);
        return;
      }

      if (result?.id) {
        router.push(`/dashboard/create-job-posting/${result.id}`);
        handleClose();
      } else {
        console.error("Job ID not found in response:", result);
      }
    } catch (error) {
      console.error("Error creating job posting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (showSkeleton || !isAllDataLoaded) {
    return <DashboardSkeleton />;
  }
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      {/* <ToolbarStyled direction='row' alignItems='center' justifyContent='space-between'>
        <Stack 
          spacing={2} 
          sx={{
            [theme.breakpoints.up('sm')]: {
              mb: 3,
              mt: 3
            },
            [theme.breakpoints.down('sm')]: {
              mb: 2,
              mt: 1
            }
          }}
        >
          <Greeting variant='body1' fontWeight='semibold'>Hello Recruiter,</Greeting>
          <Typography 
            variant='body2' 
            fontWeight='semibold' 
            fontSize='16px' 
            color={'rgba(17,17,17,0.62)'}
            sx={{
              [theme.breakpoints.up('sm')]: {
                mt: '16px !important'
              },
              [theme.breakpoints.down('sm')]: {
                mt: '8px !important'
              }
            }}
          >
            Welcome to your Dashboard
          </Typography>
        </Stack>
        <PrimaryButton onClick={handleOpen}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Typography fontWeight={'medium'} sx={{ display: { xs: 'none', sm: 'block' } }}>
            Create new Position
          </Typography>
        </PrimaryButton>
      </ToolbarStyled> */}
      <Paper
        elevation={0}
        sx={{
          my: 4,
          borderRadius: "10px",
          overflow: "hidden",
          maxWidth: "1440px",
        }}
      >
        {/* Header Background */}
        <Box
          sx={{
            height: "120px",
            bgcolor: "primary.main",
            position: "relative",
            backgroundImage: 'url("/images/backgrounds/banner-bg.svg")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />

        {/* Profile Info Section */}
        <Box
          sx={{
            px: 4,
            pb: 3,
            pt: 3,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          {/* Logo and Company Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              // justifyContent: 'space-between',
              gap: 3,
              width: "100%",
              height: "50px",
            }}
          >
            {/* Logo */}
            {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1,  }}> */}
            <Avatar
              src={profileData.company.logo || "/images/logos/logo.svg"}
              alt={profileData.company.name}
              sx={{
                width: 130,
                height: 130,
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                position: "relative",
                top: -80,
                bgcolor: "white",
                padding: 1.5,
                "& img": {
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                },
              }}
            />

            {/* Company Name and Website */}
            <Box sx={{ pb: 0, mt: -1 }}>
              <Typography variant="h4" fontWeight={600} sx={{ color: "rgba(17, 17, 17, 0.92)", fontSize: "28px" }}>
                {profileData.company.name}
              </Typography>

              {profileData.company.website && (
                <Typography
                  component="a"
                  href={
                    profileData.company.website
                      ? profileData.company.website.startsWith("http")
                        ? profileData.company.website
                        : `https://${profileData.company.website}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "rgba(17, 17, 17, 0.6)",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: 500,
                    mt: 0.5,
                    "&:hover": {
                      color: theme.palette.primary.main,
                      textDecoration: "underline",
                    },
                  }}
                >
                  {profileData.company.website}
                  <Box component="span" sx={{ display: "inline-block", ml: 0.5, transform: "translateY(1px)" }}>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10 10.5H1.5V2H5.25V0.75H0.75C0.335786 0.75 0 1.08579 0 1.5V11.25C0 11.6642 0.335786 12 0.75 12H10.75C11.1642 12 11.5 11.6642 11.5 11.25V6.75H10V10.5ZM6.75 0.75V2H9.4425L3.2175 8.2275L4.2725 9.2825L10.5 3.0575V5.75H11.75V0.75H6.75Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Box>
                </Typography>
              )}
            </Box>
            {/* </Box> */}
            <Button
              variant="contained"
              onClick={handleOpen}
              startIcon={<AddIcon />}
              sx={{
                position: "absolute",
                right: "40px",
                backgroundColor: "primary.main",
                color: "#fff",
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "primary.main",
                },
              }}
            >
              Create Job Posting
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box>
        {/* <Grid container> */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          padding={0}
          sx={{ margin: 0, marginBottom: 3, alignItems: "stretch" }}
        >
          <Box
            sx={{
              flex: 1,
              margin: 0,
              overflowX: "hidden",
              height: "300px",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              flexDirection: "column",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "rgba(17, 17, 17, 0.92)",
                fontSize: 24,
                lineHeight: "24px",
                letterSpacing: "0.36px",
                mb: 2,
              }}
            >
              Your Stats
            </Typography>
            <Stack
              direction={"row"}
              gap={3}
              flexWrap={"nowrap"}
              sx={{
                padding: 0,
                margin: 0,
                width: "100%",
                overflowX: "scroll",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {statistics.map((card, index) => {
                return <StatCard key={index} card={card} index={index} length={statistics.length} />;
              })}
            </Stack>
          </Box>
          <Box
            sx={{
              maxWidth: { xs: "100%", lg: "400px" },
              width: "100%",
              flex: 1,
              margin: 0,
              overflowX: "hidden",
              height: "300px",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Notifications
              notifications={notifications.slice(0, 20)}
              loading={convexNotifications === undefined}
              error={null}
              customStyle={{ height: "300px" }}
            />
          </Box>
        </Stack>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          gap={2}
          padding={0}
          sx={{ margin: 0, marginBottom: 3, alignItems: "stretch" }}
        >
          <Box
            sx={{
              flex: 1,
              margin: 0,
              overflowX: "scroll",
              height: "612px",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "0px !important",
            }}
          >
            <JobPostings
              jobPostings={jobPostings}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              isLoading={false}
              handleOpen={handleOpen}
            />
          </Box>

          <Stack
            direction={"column"}
            gap={2}
            sx={{
              maxWidth: { xs: "100%", lg: "400px" },
              width: "100%",
              flex: 1,
              margin: 0,
              overflowX: "hidden",
              height: "612px",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Assessment
              customStyle={{ height: "100%" }}
              assessments={assessments.slice(0, 5)}
              loading={convexAssessments === undefined}
              error={assessmentsError}
            />
            {/* </Box> */}
            {/* <Box item xs={12} md={6} lg={12} flex={1} height={'50%'}> */}
            <EmailTemplates
              customStyle={{ height: "100%" }}
              templates={emailTemplates}
              loading={convexEmailTemplates === undefined}
              error={null}
            />
            {/* </Box> */}
          </Stack>
        </Stack>

        {/* </Grid> */}
      </Box>
      <StyledDialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ padding: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600} color="rgba(17, 17, 17, 0.92)" fontSize={"20px"}>
              Create Job Posting
            </Typography>
            <IconButton
              size="small"
              sx={{ bgcolor: "#eaeaea", borderRadius: "20px", width: 24, height: 24 }}
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography variant="body1" fontWeight={600} color="rgba(17, 17, 17, 0.84)">
                Job title
              </Typography>
              <TextField
                fullWidth
                placeholder="Add job title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f2f4f6",
                  "& .MuiOutlinedInput-root": { borderColor: "#d7dadf", borderWidth: "0.5px" },
                }}
              />
            </Stack>
            {/* <Stack spacing={1}>
              <Typography variant="body1" fontWeight={600} color="rgba(17, 17, 17, 0.84)">
                Level
              </Typography>
              <FormControl>
                <RadioGroup row value={formData.level} onChange={handleChange} name="level" sx={{ gap: '10px' }}>
                  {["Junior", "Mid", "Senior"].map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option.toLowerCase()}
                      control={<Radio sx={{ color: "rgba(17, 17, 17, 0.68)", "&.Mui-checked": { color: "rgba(17, 17, 17, 0.84)" } }} />}
                      label={option}
                      sx={{ m: 0, width: 145, height: 48, bgcolor: "#f2f4f6", borderRadius: 1, border: "0.5px solid #d7dadf", "& .MuiFormControlLabel-label": { color: "rgba(17, 17, 17, 0.84)", fontWeight: 400 } }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Stack> */}
            <Stack spacing={1}>
              <Typography variant="body1" fontWeight={600} color="rgba(17, 17, 17, 0.84)">
                Job type
              </Typography>
              <FormControl>
                <RadioGroup row value={formData.job_type} onChange={handleChange} name="job_type" sx={{ gap: "10px" }}>
                  {["Full-time", "Contract"].map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option.toLowerCase().replace("-", "")}
                      control={
                        <Radio
                          sx={{ color: "rgba(17, 17, 17, 0.68)", "&.Mui-checked": { color: "rgba(17, 17, 17, 0.84)" } }}
                        />
                      }
                      label={option}
                      sx={{
                        m: 0,
                        width: 145,
                        height: 48,
                        bgcolor: "#f2f4f6",
                        borderRadius: 1,
                        border: "0.5px solid #d7dadf",
                        "& .MuiFormControlLabel-label": { color: "rgba(17, 17, 17, 0.84)", fontWeight: 400 },
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="body1" fontWeight={600} color="rgba(17, 17, 17, 0.84)">
                Office presence
              </Typography>
              <FormControl>
                <RadioGroup
                  row
                  value={formData.work_model}
                  onChange={handleChange}
                  name="work_model"
                  sx={{ gap: "10px" }}
                >
                  {["On-site", "Remote", "Hybrid"].map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option.toLowerCase().replace("-", "")}
                      control={
                        <Radio
                          sx={{ color: "rgba(17, 17, 17, 0.68)", "&.Mui-checked": { color: "rgba(17, 17, 17, 0.84)" } }}
                        />
                      }
                      label={option}
                      sx={{
                        m: 0,
                        width: 145,
                        height: 48,
                        bgcolor: "#f2f4f6",
                        borderRadius: 1,
                        border: "0.5px solid #d7dadf",
                        "& .MuiFormControlLabel-label": { color: "rgba(17, 17, 17, 0.84)", fontWeight: 400 },
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="body1" fontWeight={600} color="rgba(17, 17, 17, 0.84)">
                Location
              </Typography>
              <TextField
                fullWidth
                placeholder="Add location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f2f4f6",
                  "& .MuiOutlinedInput-root": { borderColor: "#d7dadf", borderWidth: "0.5px" },
                }}
              />
            </Stack>
            <Button
              variant="contained"
              fullWidth
              sx={{
                color: "secondary.light",
                mt: 2,
                py: 2,
                bgcolor: "primary.main",
                borderRadius: 2,
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "primary.main",
                },
              }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Create Job Posting"}
            </Button>
          </Stack>
        </DialogContent>
      </StyledDialog>
    </PageContainer>
  );
};

export default Dashboard;

interface CustomInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

const CustomInput = ({ label, value, onChange, name }: CustomInputProps) => {
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    width: "456px",
    height: "48px",
    padding: "16px 354px 16px 16px",
    borderRadius: "6px",
    border: "0.5px solid #D7DAE0",
    background: "#F3F4F7",
    display: "flex",
    alignItems: "center",
  }));

  const StyledFormControl = styled(FormControl)(({ theme }) => ({
    width: "456px",
  }));

  const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
    color: "rgba(17, 17, 17, 0.84)",
    position: "relative",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "16px",
    marginBottom: "8px", // Space between label and input
    transform: "translate(0, -50)", // Ensure the label stays in place
    display: "block",
  }));

  return (
    <StyledFormControl variant="standard">
      <StyledInputLabel shrink htmlFor={name}>
        {label}
      </StyledInputLabel>
      <StyledInputBase id={name} value={value} onChange={onChange} name={name} />
    </StyledFormControl>
  );
};

const LevelRadioGroup = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <FormControl component="fieldset">
      <Typography variant="subtitle1" marginBottom={1}>
        Level
      </Typography>
      <StyledRadioGroup row value={value} onChange={onChange} name="level">
        <StyledFormControlLabel value="junior" control={<StyledRadio />} label="Junior" />
        <StyledFormControlLabel value="mid-level" control={<StyledRadio />} label="Mid-Level" />
        <StyledFormControlLabel value="senior" control={<StyledRadio />} label="Senior" />
      </StyledRadioGroup>
    </FormControl>
  );
};
