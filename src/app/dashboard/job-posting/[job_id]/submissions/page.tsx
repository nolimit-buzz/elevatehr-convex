"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getProfile } from "@/app/utils/authStorage";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import { useTheme } from "@mui/material/styles";
import { PHASE_OPTIONS } from "@/app/constants/phaseOptions";
import { styled } from "@mui/material/styles";
import { getSkillsForRole, Skill } from "@/app/lib/skills";
import Notification from "@/app/dashboard/components/Notification";
import DeleteSnackbar from "@/app/dashboard/components/DeleteSnackbar";
import {
  JobDetails,
  FilterState,
  CandidateResponse,
  SkillColor,
  StageType,
  Assessment,
  PhaseOption,
} from "@/app/dashboard/types/candidate";
import Link from "next/link";
import {
  useJob,
  useJobMutations,
  useJobAssessments,
} from "@/queries/jobs.queries";
import {
  useApplications,
  useApplicationsWithFilters,
  useApplicationMutations,
  StageType as ConvexStageType,
} from "@/queries/applications.queries";
import { useEmailTemplates } from "@/queries/emailTemplates.queries";
import ApplicationsTab from "./components/ApplicationsTab";
import JobDescriptionTab from "./components/JobDescriptionTab";
import CVRepositoryTab from "./components/CVRepositoryTab";


// Remove unused styled components
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
  "&:hover": {
    backgroundColor: "#6666E6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
  },
}));

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Get job ID from URL params
  const jobId = params["job_id"] as string | undefined;

  // Convex hooks for job data and mutations
  const convexJobDetails = useJob(jobId);
  const { removeJob, updateJobStatus } = useJobMutations();

  // Convex hooks for applications
  const { sendAssessment: sendAssessmentMutation, moveToStageWithEmail } =
    useApplicationMutations();

  // Convex hook for email templates
  const convexEmailTemplates = useEmailTemplates();

  // Convex hook for job assessments
  const convexJobAssessments = useJobAssessments(jobId);

  // Get the view parameter from URL
  const viewParam = searchParams.get("view");

  // Set initial primary tab value based on view parameter
  const [primaryTabValue, setPrimaryTabValue] = useState(() => {
    return viewParam === "1" ? 1 : 0;
  });
  const [subTabValue, setSubTabValue] = useState(0);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(0);
  const [quickActionsAnchor, setQuickActionsAnchor] =
    useState<HTMLElement | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [stageTotals, setStageTotals] = useState({
    new: 0,
    skill_assessment: 0,
    interviews: 0,
    acceptance: 0,
    archived: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    yearsOfExperience: "",
    salaryMin: "",
    salaryMax: "",
    requiredSkills: [],
    availability: "",
    trial: "",
  });
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [filteredCandidates, setFilteredCandidates] =
    useState<CandidateResponse>({ applications: [] });
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateResponse>({
    applications: [],
  });
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [isMovingStage, setIsMovingStage] = useState("");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [dynamicPhaseOptions, setDynamicPhaseOptions] =
    useState<Record<StageType, PhaseOption[]>>(PHASE_OPTIONS);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [bulkActionsAnchor, setBulkActionsAnchor] =
    useState<null | HTMLElement>(null);
  // CV Repositories view mode: 'grid' (default) or 'list'
  const [cvViewMode, setCvViewMode] = useState<"grid" | "list">("grid");
  // Per-card 3-dot menu anchor for grid view
  const [cvCardMenuAnchor, setCvCardMenuAnchor] = useState<{
    el: HTMLElement;
    appId: string;
    cvUrl: string;
    name: string;
  } | null>(null);

  // Helper to get stage value from tab index
  const getStageValue = useCallback((tabValue: number): StageType => {
    switch (tabValue) {
      case 1:
        return "new";
      case 2:
        return "skill_assessment";
      case 3:
        return "interviews";
      case 4:
        return "acceptance";
      case 5:
        return "archived";
      default:
        return "new";
    }
  }, []);

  // Convex applications query based on filters
  const currentStage =
    subTabValue === 0 ? undefined : getStageValue(subTabValue);
  const currentAssessmentType =
    subTabValue === 2 && selectedAssessmentType > 0
      ? assessments[selectedAssessmentType - 1]?.type
      : undefined;

  const convexApplications = useApplications(
    jobId && !isApplyingFilters
      ? {
          jobId,
          stage: currentStage as ConvexStageType | undefined,
          assessmentType: currentAssessmentType,
          page,
          perPage,
        }
      : null,
  );

  // Parse filter values for filtered query
  const parseExperienceFilter = useCallback(() => {
    if (!filters.yearsOfExperience)
      return { minExperience: undefined, experienceRange: undefined };
    const [min, max] = filters.yearsOfExperience.split("-").map(Number);
    if (min && !max) return { minExperience: min, experienceRange: undefined };
    if (min && max)
      return { minExperience: undefined, experienceRange: `${min}-${max}` };
    return { minExperience: undefined, experienceRange: undefined };
  }, [filters.yearsOfExperience]);

  const { minExperience, experienceRange } = parseExperienceFilter();

  const convexFilteredApplications = useApplicationsWithFilters(
    jobId && isApplyingFilters
      ? {
          jobId,
          stage: (subTabValue === 0
            ? "new"
            : getStageValue(subTabValue)) as ConvexStageType,
          minExperience,
          experienceRange,
          minSalary: filters.salaryMin ? Number(filters.salaryMin) : undefined,
          maxSalary: filters.salaryMax ? Number(filters.salaryMax) : undefined,
          skills:
            filters.requiredSkills.length > 0
              ? filters.requiredSkills
              : undefined,
          availability: filters.availability || undefined,
          trial: filters.trial || undefined,
          page,
          perPage,
        }
      : null,
  );

  // Simplified getJobId function
  const getJobId = useCallback((): string => {
    return params["job_id"] as string;
  }, [params]);

  // Update jobDetails state when Convex data changes
  useEffect(() => {
    if (convexJobDetails !== undefined) {
      // Transform Convex job data to match JobDetails interface
      const transformedJob = convexJobDetails
        ? ({
            ...convexJobDetails,
            id: (convexJobDetails as any)._id || (convexJobDetails as any).id,
            // Map description to about_role for compatibility
            about_role: (convexJobDetails as any).description || "",
          } as unknown as JobDetails)
        : null;
      setJobDetails(transformedJob);
      setLoading(false);
      // Set stage totals from job details
      if (transformedJob?.stage_counts) {
        setStageTotals(transformedJob.stage_counts);
      }
    }
  }, [convexJobDetails]);

  // Update candidates state when Convex applications data changes
  useEffect(() => {
    const data = isApplyingFilters
      ? convexFilteredApplications
      : convexApplications;
    if (data !== undefined) {
      // Transform to match CandidateResponse interface
      const transformedData: CandidateResponse = {
        applications: (data?.applications || []).map((app: any) => ({
          ...app,
          id: typeof app.id === "string" ? app.id : app.id,
        })),
        total: data?.total || 0,
      };
      setCandidates(transformedData);
      setFilteredCandidates(transformedData);
      setTotalPages(data?.total_pages || 1);
      setTotalItems(data?.total || 0);
      setLoading(false);
      setError(null);
    }
  }, [convexApplications, convexFilteredApplications, isApplyingFilters]);

  // Update assessments when Convex job assessments data changes
  useEffect(() => {
    if (convexJobAssessments && convexJobAssessments.status === "success") {
      const fetchedAssessments = convexJobAssessments.assessments || [];
      setAssessments(fetchedAssessments as Assessment[]);

      // Update dynamic phase options with assessment options
      const assessmentOptions = fetchedAssessments.map((assessment: any) => ({
        label: `Send ${
          assessment.title ||
          assessment.type
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        }`,
        icon: AssessmentIcon,
        action: assessment.id,
        id: assessment.id,
      }));

      setDynamicPhaseOptions((prev) => ({
        ...prev,
        skill_assessment: [
          ...PHASE_OPTIONS.skill_assessment,
          ...assessmentOptions,
        ],
      }));
      setLoadingAssessments(false);
    } else if (convexJobAssessments === undefined) {
      // Still loading
      setLoadingAssessments(subTabValue === 2);
    }
  }, [convexJobAssessments, subTabValue]);

  const handleDeleteJob = async () => {
    try {
      const jobIdToDelete = getJobId();
      const { error } = await removeJob(jobIdToDelete);

      if (error) {
        throw new Error(error);
      }

      setNotification({
        open: true,
        message: "Job deleted",
        severity: "success",
      });
      router.push("/dashboard/job-listings");
    } catch (err) {
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : "Failed to delete job",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  // No need for fetchCandidates useEffect - Convex queries are reactive

  useEffect(() => {
    // console.log("Job details received:", jobDetails);
    const loadSkills = async () => {
      if (jobDetails) {
        const skills = await getSkillsForRole(
          jobDetails.title,
          jobDetails.about_role,
        );
        setAvailableSkills(skills);
      }
    };

    if (jobDetails) {
      loadSkills();
    }
  }, [jobDetails]);

  useEffect(() => {
    const profile = getProfile<any>();
    if (profile) {
      try {
        setCompanyId(profile.companyInfo.company_id || profile.user_id || null);
      } catch {
        setCompanyId(null);
      }
    }
  }, []);

  const handleFilterChange = (
    filterName: keyof FilterState,
    value: string | string[],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Apply filters - sets flag to use filtered query
  const applyFilters = () => {
    setLoading(true);
    setIsApplyingFilters(true);
    // The filtered data will be fetched automatically by the convexFilteredApplications hook
  };

  const clearFilters = () => {
    setFilters({
      yearsOfExperience: "",
      salaryMin: "",
      salaryMax: "",
      requiredSkills: [],
      availability: "",
      trial: "",
    });
    setIsApplyingFilters(false);
    // Convex will auto-refetch with the new parameters
  };

  const handlePrimaryTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setPrimaryTabValue(newValue);
  };

  const handleSubTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setSelectedEntries([]);
    setSubTabValue(newValue);
    setSelectedAssessmentType(0);
  };

  const handleQuickActionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setQuickActionsAnchor(event.currentTarget);
  };

  const handleQuickActionsClose = () => {
    setQuickActionsAnchor(null);
  };

  const getSkillChipColor = (skill: string): SkillColor => {
    const skillColors = [
      { bg: "rgba(114, 74, 59, 0.15)", color: "#724A3B" },
      { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
      { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
      { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
    ];

    // Use modulo to cycle through colors if there are more skills than colors
    const colorIndex =
      Math.abs(
        skill.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0),
      ) % skillColors.length;
    return skillColors[colorIndex];
  };

  const handleSelectCandidate = (id: string | number) => {
    const stringId = String(id);
    setSelectedEntries((prev) => {
      if (prev.includes(stringId)) {
        return prev.filter((entryId) => entryId !== stringId);
      } else {
        return [...prev, stringId];
      }
    });
  };

  const handleCardClick = (
    candidateId: string | number,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    // Prevent redirection if clicking on checkbox or quick actions button
    if (
      (event.target as HTMLElement).closest(".checkbox-container") ||
      (event.target as HTMLElement).closest(".quick-actions-button")
    ) {
      return;
    }

    // Get the job_id from the URL
    const pathParts = window.location.pathname.split("/");
    const jobIdFromPath = pathParts[pathParts.length - 2];

    // Navigate to the applicant details page
    router.push(
      `/dashboard/job-posting/${jobIdFromPath}/submissions/${candidateId}`,
    );
  };

  const handleSendAssessment = async ({
    application_ids,
    assessment_id,
    emailContent,
  }: {
    application_ids: string[];
    assessment_id?: string;
    emailContent?: string;
  }) => {
    if (!application_ids?.length || !assessment_id) return;

    setIsMovingStage(assessment_id);
    try {
      const { error } = await sendAssessmentMutation(
        application_ids,
        assessment_id,
        emailContent,
      );

      if (error) {
        throw new Error(error);
      }

      setEmailModalOpen(false);
      setPendingAction(null);
      setSelectedEntries([]);

      const matchedAssessment = assessments.find(
        (a: any) => a.id === assessment_id,
      );
      const assessmentName = matchedAssessment
        ? matchedAssessment.title
        : assessment_id.replace("_", " ");

      handleNotification(
        `Successfully sent ${application_ids.length} candidate${
          application_ids.length > 1 ? "s" : ""
        } to ${assessmentName}`,
        "success",
      );
      // Convex will auto-update the data
    } catch (error) {
      console.error("Error updating stage:", error);
      handleNotification(
        error instanceof Error ? error.message : "Failed to update stage",
        "error",
      );
    } finally {
      setIsMovingStage("");
      setSelectedEntries([]);
    }
  };

  const handleCloseNotification = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleNotification = (
    message: string,
    severity: "success" | "error",
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.yearsOfExperience !== "" ||
      filters.salaryMin !== "" ||
      filters.salaryMax !== "" ||
      filters.requiredSkills.length > 0 ||
      filters.availability !== "" ||
      filters.trial !== ""
    );
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("An unexpected error occurred");
    }
  };

  // Bulk email editor (client-only) with stable reference
  const ReactQuill = React.useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    [],
  );
  const quillModules = React.useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  );
  const quillFormats = React.useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "link",
    ],
    [],
  );

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const mapActionToTemplateKey = (action: string): string | null => {
    const matchedAssessment = assessments.find((a: any) => a.id === action);
    if (matchedAssessment) {
      return (matchedAssessment as any).type === "technical_assessment"
        ? "technical_assessment"
        : "skill_assessment";
    }
    switch (action) {
      case "skill_assessment":
        return "skill_assessment";
      case "technical_assessment":
        return "technical_assessment";
      case "online_assessment_1":
        return "online_assessment_1";
      case "online_assessment_2":
        return "online_assessment_2";
      case "interviews":
        return "interviews";
      case "acceptance":
        return "acceptance";
      case "archived":
        return "archived";
      default:
        return null;
    }
  };

  const openEmailModalForAction = (action: string) => {
    console.log("action", action);
    setPendingAction(action);
    setEmailLoading(true);
    setEmailError("");
    setEmailContent("");

    // Use Convex email templates data (reactive)
    const key = mapActionToTemplateKey(action);
    const content =
      key && convexEmailTemplates?.templates?.[key]?.content
        ? convexEmailTemplates.templates[key].content
        : "";
    setEmailContent(content);
    setEmailModalOpen(true);
    setEmailLoading(false);
  };

  const handleSendBulkEmailAndMoveStage = async () => {
    if (!pendingAction || !selectedEntries || selectedEntries.length === 0)
      return;
    const selectedAssessment = assessments.find(
      (a: any) => a.id === pendingAction,
    );
    if (
      selectedAssessment ||
      pendingAction === "technical_assessment" ||
      pendingAction === "online_assessment_1" ||
      pendingAction === "online_assessment_2" ||
      (pendingAction === "skill_assessment" && jobDetails?.assessment_id)
    ) {
      handleSendAssessment({
        application_ids: selectedEntries,
        assessment_id: selectedAssessment
          ? pendingAction
          : jobDetails?.assessment_id,
        emailContent,
      });
      return;
    }
    try {
      setEmailLoading(true);

      const { error } = await moveToStageWithEmail(
        selectedEntries,
        pendingAction as ConvexStageType,
        emailContent,
      );

      if (error) {
        throw new Error(error);
      }

      setNotification({
        open: true,
        message: `Email sent and ${selectedEntries.length} candidate(s) moved to '${pendingAction.replace("_", " ")}'`,
        severity: "success",
      });
      setEmailModalOpen(false);
      setPendingAction(null);
      setSelectedEntries([]);
      // Convex will auto-update the data
    } catch (err) {
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : "Failed to send email",
        severity: "error",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleExportCVs = useCallback(async () => {
    if (!selectedEntries.length) return;

    let count = 0;
    const selectedApps = candidates.applications.filter((app: any) =>
      selectedEntries.includes(String(app.id)),
    );

    for (const app of selectedApps) {
      if (app.attachments?.cv) {
        window.open(app.attachments.cv, "_blank");
        count++;
      }
    }

    handleNotification(
      `Successfully opened ${count} CV${count !== 1 ? "s" : ""} in new tabs.`,
      "success",
    );
  }, [selectedEntries, candidates.applications, handleNotification]);


  const handleCloseResponses = async () => {
    try {
      const jobIdToUpdate = getJobId();
      // Determine new status based on current status
      let newStatus: "active" | "closed" | "draft";
      if (jobDetails?.status === "active") {
        newStatus = "closed";
      } else if (jobDetails?.status === "draft") {
        newStatus = "active";
      } else {
        // closed -> active (reopen)
        newStatus = "active";
      }

      const { error } = await updateJobStatus(jobIdToUpdate, newStatus);

      if (error) {
        throw new Error(error);
      }

      // Show success notification based on action
      let successMessage = "";
      if (jobDetails?.status === "active") {
        successMessage = "Job posting closed successfully";
      } else if (jobDetails?.status === "draft") {
        successMessage = "Job published successfully";
      } else {
        successMessage = "Job posting reopened successfully";
      }

      setNotification({
        open: true,
        message: successMessage,
        severity: "success",
      });

      // If closing, redirect to dashboard after a delay
      if (newStatus === "closed") {
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
      // Convex will auto-update the data when reopening or publishing
    } catch (error) {
      if (error instanceof Error) {
        setNotification({
          open: true,
          message: error.message,
          severity: "error",
        });
      } else {
        setNotification({
          open: true,
          message: "An unexpected error occurred while updating the job status",
          severity: "error",
        });
      }
    }
  };

  // Assessments are now fetched via the useJobAssessments hook (reactive)
  // No need for fetchAssessments function - data comes from convexJobAssessments

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleBulkActionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setBulkActionsAnchor(event.currentTarget);
  };

  const handleBulkActionsClose = () => {
    setBulkActionsAnchor(null);
  };



  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#F5F7FA",
      }}
    >
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        <Notification
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={handleCloseNotification}
        />
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            sx={{
              mr: 1,
              padding: 0,
              display: { xs: "flex", sm: "none" },
            }}
            aria-label="back"
            onClick={() => router.back()}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "15px", sm: "18px" },
              color: "grey.200",
              display: { xs: "block", sm: "none" },
            }}
          >
            Back
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              sx={{
                mr: 1,
                display: { xs: "none", sm: "flex" },
              }}
              aria-label="back"
              onClick={() => router.back()}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              className="job-title"
              variant="h5"
              sx={{
                fontSize: { xs: "18px", sm: "24px" },
                fontWeight: 600,
                color: "rgba(17, 17, 17, 0.84)",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {getJobId() ? (
                <span
                  className="public-link"
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <span className="job-title">{jobDetails?.title}</span>
                  <Link
                    href={`/job-openings/${getJobId()}${companyId ? `?company_id=${companyId}` : ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      marginLeft: 8,
                    }}
                    title="View public job posting"
                  >
                    <svg
                      style={{ transform: "rotate(45deg)" }}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.0701 10.32C17.8801 10.32 17.6901 10.25 17.5401 10.1L12.0001 4.56L6.46012 10.1C6.17012 10.39 5.69012 10.39 5.40012 10.1C5.11012 9.81 5.11012 9.33 5.40012 9.04L11.4701 2.97C11.7601 2.68 12.2401 2.68 12.5301 2.97L18.6001 9.04C18.8901 9.33 18.8901 9.81 18.6001 10.1C18.4601 10.25 18.2601 10.32 18.0701 10.32Z"
                        fill="#292D32"
                      />
                      <path
                        d="M12 21.25C11.59 21.25 11.25 20.91 11.25 20.5V3.67C11.25 3.26 11.59 2.92 12 2.92C12.41 2.92 12.75 3.26 12.75 3.67V20.5C12.75 20.91 12.41 21.25 12 21.25Z"
                        fill="#292D32"
                      />
                    </svg>
                  </Link>
                </span>
              ) : (
                jobDetails?.title
              )}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <PrimaryButton
              variant="contained"
              onClick={handleCloseResponses}
              sx={{
                height: { xs: "36px", sm: "52px" },
                "& .MuiButton-startIcon": {
                  marginRight: { xs: "4px", sm: "8px" },
                },
              }}
            >
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                {jobDetails?.status === "active"
                  ? "Close Responses for this Job"
                  : jobDetails?.status === "draft"
                    ? "Publish Job"
                    : "Reopen Job Posting"}
              </Box>
              <Box sx={{ display: { xs: "block", sm: "none" } }}>
                {jobDetails?.status === "active"
                  ? "Close Responses"
                  : jobDetails?.status === "draft"
                    ? "Publish"
                    : "Reopen"}
              </Box>
            </PrimaryButton>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{
                height: { xs: "36px", sm: "52px" },
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "#d32f2f",
                color: "#d32f2f",
                "&:hover": {
                  borderColor: "#b71c1c",
                  color: "#b71c1c",
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              Delete Job
            </Button>
          </Box>
        </Box>
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600, pb: 2, px: 4, pt: 4 }}>
            Delete Job
          </DialogTitle>
          <DialogContent sx={{ px: 4, pb: 2 }}>
            <Typography sx={{ color: "rgba(17, 17, 17, 0.72)" }}>
              Are you sure you want to delete this job? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={handleDeleteJob}
              sx={{
                textTransform: "none",
                borderColor: "#d32f2f",
                color: "#d32f2f",
                "&:hover": {
                  borderColor: "#b71c1c",
                  color: "#b71c1c",
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={primaryTabValue}
            onChange={(_event: React.SyntheticEvent, newValue: number) =>
              setPrimaryTabValue(newValue)
            }
            aria-label="primary tabs"
            sx={{
              minHeight: "auto",
              "& .MuiTabs-indicator": {
                backgroundColor: "#4444E2",
              },
              "& .MuiTab-root": {
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  color: theme.palette.secondary.main,
                },
              },
            }}
          >
            <Tab
              label="Applications"
              sx={{
                textTransform: "none",
                fontWeight: primaryTabValue === 0 ? "bold" : "normal",
                color:
                  primaryTabValue === 0
                    ? theme.palette.secondary.main
                    : theme.palette.grey[100],
              }}
            />
            <Tab
              label="Job description"
              sx={{
                textTransform: "none",
                fontWeight: primaryTabValue === 1 ? "bold" : "normal",
                color:
                  primaryTabValue === 1
                    ? theme.palette.secondary.main
                    : theme.palette.grey[100],
              }}
            />
            <Tab
              label="CV Repository"
              sx={{
                textTransform: "none",
                fontWeight: primaryTabValue === 2 ? "bold" : "normal",
                color:
                  primaryTabValue === 2
                    ? theme.palette.secondary.main
                    : theme.palette.grey[100],
              }}
            />
          </Tabs>
        </Box>

        {primaryTabValue === 0 ? (
          <ApplicationsTab
            theme={theme}
            loading={loading}
            stageTotals={stageTotals}
            subTabValue={subTabValue}
            handleSubTabChange={handleSubTabChange}
            isFilterExpanded={isFilterExpanded}
            setIsFilterExpanded={setIsFilterExpanded}
            filters={filters}
            availableSkills={availableSkills}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            applyFilters={applyFilters}
            hasActiveFilters={hasActiveFilters}
            filterMenuAnchor={filterMenuAnchor}
            handleFilterMenuClose={handleFilterMenuClose}
            filteredCandidates={filteredCandidates}
            selectedEntries={selectedEntries}
            setSelectedEntries={setSelectedEntries}
            handleExportCVs={handleExportCVs}
            bulkActionsAnchor={bulkActionsAnchor}
            handleBulkActionsOpen={handleBulkActionsOpen}
            handleBulkActionsClose={handleBulkActionsClose}
            getStageValue={getStageValue}
            dynamicPhaseOptions={dynamicPhaseOptions}
            openEmailModalForAction={openEmailModalForAction}
            isMovingStage={isMovingStage}
            selectedAssessmentType={selectedAssessmentType}
            setSelectedAssessmentType={setSelectedAssessmentType}
            assessments={assessments}
            handleSelectCandidate={handleSelectCandidate}
            handleCardClick={handleCardClick}
            handleNotification={handleNotification}
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            perPage={perPage}
            setPerPage={setPerPage}
            setPage={setPage}
            getSkillChipColor={getSkillChipColor}
            emailModalOpen={emailModalOpen}
            setEmailModalOpen={setEmailModalOpen}
            emailLoading={emailLoading}
            emailContent={emailContent}
            setEmailContent={setEmailContent}
            emailError={emailError}
            handleSendBulkEmailAndMoveStage={handleSendBulkEmailAndMoveStage}
            pendingAction={pendingAction}
            quillModules={quillModules}
            quillFormats={quillFormats}
            ReactQuill={ReactQuill}
          />
        ) : primaryTabValue === 2 ? (
          <CVRepositoryTab
            loading={loading}
            candidates={candidates}
            cvViewMode={cvViewMode}
            setCvViewMode={setCvViewMode}
            cvCardMenuAnchor={cvCardMenuAnchor}
            setCvCardMenuAnchor={setCvCardMenuAnchor}
            selectedEntries={selectedEntries}
            totalPages={totalPages}
            page={page}
            handlePageChange={handlePageChange}
          />
        ) : (
          <JobDescriptionTab
            loading={loading}
            jobDetails={jobDetails}
            error={error}
            getJobId={getJobId}
            setError={setError}
            setPrimaryTabValue={setPrimaryTabValue}
          />
        )}
      </Container>

      <DeleteSnackbar
        open={notification.open}
        message={notification.message}
        onClose={() =>
          setNotification({ open: false, message: "", severity: "success" })
        }
      />
    </Box>
  );
}
