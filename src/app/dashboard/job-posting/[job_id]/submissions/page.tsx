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
  Paper,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Pagination,
  Skeleton,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Menu,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CandidateListSection from "@/app/dashboard/components/dashboard/CandidatesListSection";
import { useTheme } from "@mui/material/styles";
import { PHASE_OPTIONS } from "@/app/constants/phaseOptions";
import { styled } from "@mui/material/styles";
import { getSkillsForRole, Skill } from "@/app/lib/skills";
import JobDescription from "@/app/dashboard/components/JobDescription";
import FilterSection from "@/app/dashboard/components/FilterSection";
import Notification from "@/app/dashboard/components/Notification";
import DeleteSnackbar from "@/app/dashboard/components/DeleteSnackbar";
import MobileCandidateGrid from "@/app/dashboard/components/MobileCandidateGrid";
import EmptyState from "@/app/dashboard/components/EmptyState";
import {
  JobDetails,
  FilterState,
  CandidateResponse,
  SkillColor,
  StageType,
  Assessment,
  PhaseOption,
} from "@/app/dashboard/types/candidate";
import MobileStageDropdown from "@/app/dashboard/components/MobileStageDropdown";
import CandidateSkeletonLoader from "@/app/dashboard/components/CandidateSkeletonLoader";
import AssessmentIcon from "@/app/dashboard/components/AssessmentIcon";
import Link from "next/link";
import { useJob, useJobMutations, useJobAssessments } from "@/queries/jobs.queries";
import {
  useApplications,
  useApplicationsWithFilters,
  useApplicationMutations,
  StageType as ConvexStageType,
  CompanyApplication,
} from "@/queries/applications.queries";
import { useEmailTemplates } from "@/queries/emailTemplates.queries";
import { SpaceDashboard } from "@mui/icons-material";

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
  const { sendAssessment: sendAssessmentMutation, moveToStageWithEmail } = useApplicationMutations();

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
  const [quickActionsAnchor, setQuickActionsAnchor] = useState<HTMLElement | null>(null);
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
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateResponse>({ applications: [] });
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
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [dynamicPhaseOptions, setDynamicPhaseOptions] = useState<Record<StageType, PhaseOption[]>>(PHASE_OPTIONS);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [bulkActionsAnchor, setBulkActionsAnchor] = useState<null | HTMLElement>(null);
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
  const currentStage = subTabValue === 0 ? undefined : getStageValue(subTabValue);
  const currentAssessmentType =
    subTabValue === 2 && selectedAssessmentType > 0 ? assessments[selectedAssessmentType - 1]?.type : undefined;

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
  const parseExperienceFilter = useCallback((yearsOfExperience: string) => {
    if (!yearsOfExperience) return { minExperience: undefined, experienceRange: undefined };
    const [min, max] = yearsOfExperience.split("-").map(Number);
    if (min && !max) return { minExperience: min, experienceRange: undefined };
    if (min && max) return { minExperience: undefined, experienceRange: `${min}-${max}` };
    return { minExperience: undefined, experienceRange: undefined };
  }, []);

  const getFilteredAppsParams = useCallback(() => {
    if (!jobId || !activeFilters) return null;
    const { minExperience, experienceRange } = parseExperienceFilter(activeFilters.yearsOfExperience);
    return {
      jobId,
      stage: (subTabValue === 0 ? "new" : getStageValue(subTabValue)) as ConvexStageType,
      minExperience,
      experienceRange,
      minSalary: activeFilters.salaryMin ? Number(activeFilters.salaryMin) : undefined,
      maxSalary: activeFilters.salaryMax ? Number(activeFilters.salaryMax) : undefined,
      skills: activeFilters.requiredSkills.length > 0 ? activeFilters.requiredSkills : undefined,
      availability: activeFilters.availability || undefined,
      trial: activeFilters.trial || undefined,
      page,
      perPage,
    };
  }, [jobId, activeFilters, subTabValue, getStageValue, parseExperienceFilter, page, perPage]);

  const convexFilteredApplications = useApplicationsWithFilters(isApplyingFilters ? getFilteredAppsParams() : null);

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
    const data = isApplyingFilters ? convexFilteredApplications : convexApplications;
    if (data !== undefined) {
      // Transform to match CandidateResponse interface
      const transformedData: CandidateResponse = {
        applications: (data?.applications || []).map((app: any) => ({
          ...app,
          id: typeof app.id === "string" ? app.id : app.id,
        })),
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
        skill_assessment: [...PHASE_OPTIONS.skill_assessment, ...assessmentOptions],
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // No need for fetchCandidates useEffect - Convex queries are reactive

  useEffect(() => {
    // console.log("Job details received:", jobDetails);
    const loadSkills = async () => {
      if (jobDetails) {
        const skills = await getSkillsForRole(jobDetails.title, jobDetails.about_role);
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

  const handleFilterChange = (filterName: keyof FilterState, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Apply filters - sets flag to use filtered query
  const applyFilters = () => {
    setLoading(true);
    // Explicitly set active filters only when button is clicked
    setActiveFilters({ ...filters });
    setIsApplyingFilters(true);
  };

  const clearFilters = () => {
    const defaultFilters = {
      yearsOfExperience: "",
      salaryMin: "",
      salaryMax: "",
      requiredSkills: [],
      availability: "",
      trial: "",
    };
    setFilters(defaultFilters);
    setActiveFilters(null);
    setIsApplyingFilters(false);
    // Convex will auto-refetch with the new parameters
  };

  const handlePrimaryTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setPrimaryTabValue(newValue);
  };

  const handleSubTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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
      Math.abs(skill.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % skillColors.length;
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

  const handleCardClick = (candidateId: string | number, event: React.MouseEvent<HTMLElement>) => {
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
    router.push(`/dashboard/job-posting/${jobIdFromPath}/submissions/${candidateId}`);
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
      const { error } = await sendAssessmentMutation(application_ids, assessment_id, emailContent);

      if (error) {
        throw new Error(error);
      }

      setEmailModalOpen(false);
      setPendingAction(null);
      setSelectedEntries([]);

      const matchedAssessment = assessments.find((a: any) => a.id === assessment_id);
      const assessmentName = matchedAssessment ? matchedAssessment.title : assessment_id.replace("_", " ");

      handleNotification(
        `Successfully sent ${application_ids.length} candidate${
          application_ids.length > 1 ? "s" : ""
        } to ${assessmentName}`,
        "success",
      );
      // Convex will auto-update the data
    } catch (error) {
      console.error("Error updating stage:", error);
      handleNotification(error instanceof Error ? error.message : "Failed to update stage", "error");
    } finally {
      setIsMovingStage("");
      setSelectedEntries([]);
    }
  };

  const handleCloseNotification = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleNotification = (message: string, severity: "success" | "error") => {
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
  const ReactQuill = React.useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);
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
    () => ["header", "bold", "italic", "underline", "strike", "list", "bullet", "link"],
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
      return (matchedAssessment as any).type === "technical_assessment" ? "technical_assessment" : "skill_assessment";
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
      key && convexEmailTemplates?.templates?.[key]?.content ? convexEmailTemplates.templates[key].content : "";
    setEmailContent(content);
    setEmailModalOpen(true);
    setEmailLoading(false);
  };

  const handleSendBulkEmailAndMoveStage = async () => {
    if (!pendingAction || !selectedEntries || selectedEntries.length === 0) return;
    const selectedAssessment = assessments.find((a: any) => a.id === pendingAction);
    if (
      selectedAssessment ||
      pendingAction === "technical_assessment" ||
      pendingAction === "online_assessment_1" ||
      pendingAction === "online_assessment_2" ||
      (pendingAction === "skill_assessment" && jobDetails?.assessment_id)
    ) {
      handleSendAssessment({
        application_ids: selectedEntries,
        assessment_id: selectedAssessment ? pendingAction : jobDetails?.assessment_id,
        emailContent,
      });
      return;
    }
    try {
      setEmailLoading(true);

      const { error } = await moveToStageWithEmail(selectedEntries, pendingAction as ConvexStageType, emailContent);

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

    const selectedApps = candidates.applications.filter((app: any) => selectedEntries.includes(String(app.id)));

    let count = 0;
    for (const app of selectedApps) {
      const cvUrl = (app as any).attachments?.cv;
      if (cvUrl) {
        try {
          const response = await fetch(cvUrl);
          if (!response.ok) throw new Error("Network response was not ok");
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          const fileName = `CV_${(app as any).personal_info?.firstname || "Candidate"}_${(app as any).personal_info?.lastname || ""}.pdf`;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          count++;
        } catch (error) {
          console.error("Direct download failed, opening in new tab:", error);
          // Fallback to opening in new tab
          window.open(cvUrl, "_blank");
          count++;
        }
      }
    }

    if (count > 0) {
      handleNotification(`${count} CV(s) download initiated`, "success");
    } else {
      handleNotification("No CVs found for selected candidates", "error");
    }
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

  const JobDescriptionSkeleton = () => (
    <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", width: "100%" }}>
      <Box
        sx={{
          width: { xs: "100%", md: 280 },
          minWidth: 220,
          bgcolor: "#fff", // Changed to white
          borderRadius: "16px",
          p: 3,
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: 240,
          overflow: "hidden",
        }}
      >
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width={80} height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width={60} height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width={120} height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="60%" height={24} sx={{ mt: 2 }} />
      </Box>

      {/* Main Job Details Skeleton */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#fff",
          borderRadius: "16px",
          boxShadow: "0px 4px 24px rgba(17, 17, 17, 0.06)",
          p: 4,
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="text" width="30%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="text" width="35%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="text" width="25%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );

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
                <span className="public-link" style={{ display: "inline-flex", alignItems: "center" }}>
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
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, pb: 2, px: 4, pt: 4 }}>Delete Job</DialogTitle>
          <DialogContent sx={{ px: 4, pb: 2 }}>
            <Typography sx={{ color: "rgba(17, 17, 17, 0.72)" }}>
              Are you sure you want to delete this job? This action cannot be undone.
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
            onChange={(_event: React.SyntheticEvent, newValue: number) => setPrimaryTabValue(newValue)}
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
                color: primaryTabValue === 0 ? theme.palette.secondary.main : theme.palette.grey[100],
              }}
            />
            <Tab
              label="Job description"
              sx={{
                textTransform: "none",
                fontWeight: primaryTabValue === 1 ? "bold" : "normal",
                color: primaryTabValue === 1 ? theme.palette.secondary.main : theme.palette.grey[100],
              }}
            />
            <Tab
              label="CV repositories"
              sx={{
                textTransform: "none",
                fontWeight: primaryTabValue === 2 ? "bold" : "normal",
                color: primaryTabValue === 2 ? theme.palette.secondary.main : theme.palette.grey[100],
              }}
            />
          </Tabs>
        </Box>

        {/* Analytics Cards Section */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 2,
            mt: 2,
            mb: 1,
            width: "100%",
          }}
        >
          {[
            {
              label: "Application Review",
              value: stageTotals.new,
              color: "#4444E2",
            },
            {
              label: "Skill Assessment",
              value: stageTotals.skill_assessment,
              color: "#2B656E",
            },
            {
              label: "Interviews",
              value: stageTotals.interviews,
              color: "#76325F",
            },
            {
              label: "Acceptance",
              value: stageTotals.acceptance,
              color: "#1B5E20",
            },
            {
              label: "Archived",
              value: stageTotals.archived,
              color: "#724A3B",
            },
          ].map((card, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "white",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                  borderColor: card.color + "40",
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "10px",
                }}
              >
                {card.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: card.color,
                  }}
                >
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {card.value === 1 ? "candidate" : "candidates"}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {primaryTabValue === 0 ? (
          <Stack direction="row" maxWidth={"100%"} gap={isFilterExpanded ? 3 : 0} sx={{ position: "relative" }}>
            {!isFilterExpanded && (
              <IconButton
                onClick={() => setIsFilterExpanded(true)}
                sx={{
                  position: "relative",
                  left: 0,
                  top: "-72vh",
                  color: "#000000",
                  zIndex: 50,
                  "&:hover": { bgcolor: "transparent" },
                }}
              >
                <SpaceDashboard sx={{ height: "30px", width: "30px" }} />
              </IconButton>
            )}

            <Box
              sx={{
                display: { xs: "none", lg: "block" },
                width: isFilterExpanded ? 308 : 0,
                transition: "width 0.3s ease-in-out",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box sx={{ width: 308, pt: 4, bgcolor: "#FFFFFF", borderRadius: 2 }}>
                <FilterSection
                  filters={filters}
                  availableSkills={availableSkills}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  onApplyFilters={applyFilters}
                  hasActiveFilters={hasActiveFilters}
                  sx={{ p: 2 }}
                />
              </Box>
            </Box>

            {isFilterExpanded && (
              <IconButton
                onClick={() => setIsFilterExpanded(false)}
                sx={{
                  position: "absolute",
                  left: 260,
                  top: 10,
                  zIndex: 20,
                  color: theme.palette.grey[200],
                  "&:hover": { color: theme.palette.secondary.main },
                }}
              >
                <MenuOpenIcon />
              </IconButton>
            )}

            {/* Mobile Filter Dialog */}
            <FilterSection
              filters={filters}
              availableSkills={availableSkills}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onApplyFilters={applyFilters}
              hasActiveFilters={hasActiveFilters}
              isMobile
              open={Boolean(filterMenuAnchor)}
              onClose={handleFilterMenuClose}
              sx={{ bgcolor: "#FFFFFF", p: 2 }}
            />

            <Box sx={{ flex: 1, width: "80%", py: 0, bg: "#ffffff" }}>
              {/* Your existing tabs */}
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  // mb: 3,
                  backgroundColor: "#ffffff !important",
                  borderRadius: "10px",
                  paddingX: "20px",
                }}
              >
                {/* Tabs for large screens */}
                <Box sx={{ display: { xs: "none", lg: "block" }, px: { lg: 4 } }}>
                  <Tabs
                    value={subTabValue}
                    onChange={(_event: React.SyntheticEvent, newValue: number) => {
                      handleSubTabChange(_event, newValue);
                    }}
                    indicatorColor="secondary"
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="submission tabs"
                    sx={{
                      // width: "100%",
                      alignItems: "center",
                      "& .MuiTabs-flexContainer": {
                        justifyContent: "space-between",
                      },
                      "& .MuiTab-root": {
                        transition: "all 0.2s ease-in-out",
                        minWidth: "auto",
                        px: 1.5,
                        whiteSpace: "nowrap",
                        "&:hover": {
                          color: theme.palette.secondary.main,
                        },
                      },
                    }}
                  >
                    <Tab
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>All</span>
                        </Box>
                      }
                      sx={{
                        textTransform: "none",
                        color: subTabValue === 0 ? theme.palette.grey[100] : theme.palette.grey[200],
                        minWidth: "auto",
                        px: 1,
                        whiteSpace: "nowrap",
                      }}
                    />
                    <Tab
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>Application Review</span>
                        </Box>
                      }
                      sx={{
                        textTransform: "none",
                        color: subTabValue === 1 ? theme.palette.grey[100] : theme.palette.grey[200],
                        minWidth: "auto",
                        px: 1,
                        whiteSpace: "nowrap",
                      }}
                    />
                    <Tab
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>Skill assessment</span>
                        </Box>
                      }
                      sx={{
                        textTransform: "none",
                        color: subTabValue === 2 ? theme.palette.grey[100] : theme.palette.grey[200],
                        minWidth: "auto",
                        px: 1,
                        whiteSpace: "nowrap",
                      }}
                    />
                    <Tab
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>Interviews</span>
                        </Box>
                      }
                      sx={{
                        textTransform: "none",
                        color: subTabValue === 3 ? theme.palette.grey[100] : theme.palette.grey[200],
                        minWidth: "auto",
                        px: 1,
                        whiteSpace: "nowrap",
                      }}
                    />
                    <Tab
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>Acceptance</span>
                        </Box>
                      }
                      sx={{
                        textTransform: "none",
                        color: subTabValue === 4 ? theme.palette.grey[100] : theme.palette.grey[200],
                        minWidth: "auto",
                        px: 1,
                        whiteSpace: "nowrap",
                      }}
                    />
                    <Tab
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>Archived</span>
                        </Box>
                      }
                      sx={{
                        textTransform: "none",
                        color: subTabValue === 5 ? theme.palette.grey[100] : theme.palette.grey[200],
                        minWidth: "auto",
                        px: 1,
                        whiteSpace: "nowrap",
                      }}
                    />
                  </Tabs>
                </Box>

                {/* Mobile Dropdown */}
                <MobileStageDropdown
                  subTabValue={subTabValue}
                  stageTotals={stageTotals}
                  onTabChange={handleSubTabChange}
                  onFilterClick={handleFilterMenuOpen}
                />
              </Box>
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "transparent",
                  borderRadius: 2,
                  position: "relative",
                  height: `calc(170vh - 270px)`,
                }}
              >
                {/* Select All control and Bulk Actions Menu */}
                {filteredCandidates?.applications?.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      gap: 1,
                      my: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      {(() => {
                        const allVisibleIds = filteredCandidates?.applications?.map((c) => String(c.id)) || [];
                        const allSelected =
                          allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedEntries?.includes(id));
                        return (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (allSelected) {
                                setSelectedEntries([]);
                              } else {
                                setSelectedEntries(allVisibleIds);
                              }
                            }}
                            sx={{
                              width: "max-content",
                              flexWrap: "nowrap",
                              py: 1,
                              px: 1.5,
                              color: "rgba(17, 17, 17, 0.84)",
                              borderColor: "rgba(17, 17, 17, 0.12)",
                              "&:hover": {
                                borderColor: "rgba(17, 17, 17, 0.24)",
                              },
                            }}
                          >
                            {allSelected ? "Clear selection" : "Select all candidates"}
                          </Button>
                        );
                      })()}
                    </Box>

                    {selectedEntries?.length > 0 && subTabValue !== 4 && (
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          onClick={handleExportCVs}
                          sx={{
                            color: "rgba(17, 17, 17, 0.84)",
                            borderColor: "rgba(17, 17, 17, 0.12)",
                            textTransform: "none",
                            fontWeight: 500,
                            py: 0.5,
                            px: 1.5,
                            "&:hover": {
                              borderColor: "rgba(17, 17, 17, 0.24)",
                              bgcolor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          Export CV ({selectedEntries.length})
                        </Button>
                        <IconButton
                          onClick={handleBulkActionsOpen}
                          sx={{
                            color: "rgba(17, 17, 17, 0.84)",
                            bgcolor: "rgba(0, 0, 0, 0.04)",
                            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={bulkActionsAnchor}
                          open={Boolean(bulkActionsAnchor)}
                          onClose={handleBulkActionsClose}
                          PaperProps={{
                            sx: {
                              mt: 1,
                              minWidth: 220,
                              borderRadius: "12px",
                              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                            },
                          }}
                        >
                          <MenuItem disabled sx={{ opacity: "1 !important" }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                              {selectedEntries.length} candidates selected
                            </Typography>
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setSelectedEntries([]);
                              handleBulkActionsClose();
                            }}
                          >
                            <ListItemIcon>
                              <CloseIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Clear selection" />
                          </MenuItem>
                          <Divider />
                          {dynamicPhaseOptions[getStageValue(subTabValue)]?.map((option) => (
                            <MenuItem
                              key={option.action}
                              onClick={() => {
                                openEmailModalForAction(option.action);
                                handleBulkActionsClose();
                              }}
                              disabled={isMovingStage.length > 0}
                            >
                              <ListItemIcon>
                                {isMovingStage === option.action ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <option.icon fontSize="small" />
                                )}
                              </ListItemIcon>
                              <ListItemText primary={option.label} />
                            </MenuItem>
                          ))}
                        </Menu>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Assessment Tabs */}
                {subTabValue === 2 && (
                  <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                    {(() => {
                      return null;
                    })()}
                    <Tabs
                      value={selectedAssessmentType}
                      onChange={(_, newValue) => {
                        setSelectedAssessmentType(newValue);
                      }}
                      aria-label="skill assessment tabs"
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        "& .MuiTabs-indicator": {
                          backgroundColor: theme.palette.secondary.main,
                        },
                        "& .MuiTab-root": {
                          minWidth: "auto",
                          px: 1.5,
                          whiteSpace: "nowrap",
                        },
                      }}
                    >
                      <Tab
                        label="All"
                        sx={{
                          textTransform: "none",
                          color: theme.palette.grey[100],
                          "&.Mui-selected": {
                            color: theme.palette.secondary.main,
                          },
                        }}
                      />
                      {assessments?.map((assessment, index) => {
                        const title =
                          assessment.title ||
                          assessment.type
                            .split("_")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ");

                        let label = title;
                        if (
                          assessment.type === "online_assessment" ||
                          assessment.type === "online_assessment_1" ||
                          assessment.type === "online_assessment_2"
                        ) {
                          label = `Quiz (${title})`;
                        } else if (assessment.type === "technical_assessment") {
                          label = `Technical (${title})`;
                        }

                        return (
                          <Tab
                            key={index}
                            label={label}
                            sx={{
                              textTransform: "none",
                              color: theme.palette.grey[100],
                              "&.Mui-selected": {
                                color: theme.palette.secondary.main,
                              },
                            }}
                          />
                        );
                      })}
                    </Tabs>
                  </Box>
                )}

                {loading ? (
                  <CandidateSkeletonLoader />
                ) : filteredCandidates?.applications?.length === 0 ? (
                  <EmptyState
                    subTabValue={subTabValue}
                    assessmentType={subTabValue === 1 ? assessments[selectedAssessmentType]?.type : undefined}
                  />
                ) : (
                  <>
                    {/* Desktop View */}
                    <Box
                      sx={{
                        maxWidth: "100%",
                        width: "100%",
                        overflowX: "hidden",
                        height: "100%",
                        pt: 0,
                        pb: 2,
                        display: { xs: "none", lg: "block" },
                      }}
                    >
                      {filteredCandidates?.applications?.map((candidate) => (
                        <Box
                          width={"100%"}
                          key={candidate.id}
                          sx={{
                            backgroundColor: "white",
                            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                            "&:last-child": {
                              borderBottom: "none",
                            },
                          }}
                        >
                          <CandidateListSection
                            isQuickActionsVisible={true}
                            isCheckboxVisible={true}
                            candidate={candidate}
                            isSelected={selectedEntries?.includes(String(candidate.id))}
                            onSelectCandidate={handleSelectCandidate}
                            onUpdateStages={(action) => openEmailModalForAction(action)}
                            currentStage={getStageValue(subTabValue)}
                            selectedEntries={selectedEntries}
                            setSelectedEntries={setSelectedEntries}
                            onNotification={handleNotification}
                            phaseOptions={dynamicPhaseOptions}
                          />
                        </Box>
                      ))}
                    </Box>
                    <MobileCandidateGrid
                      candidates={(filteredCandidates?.applications || []).map((app) => ({
                        id: app.id,
                        name: `${app.personal_info?.firstname || ""} ${app.personal_info?.lastname || ""}`.trim(),
                        email: "",
                        phone: "",
                        cv_url: app.attachments?.cv || "",
                        status: "",
                        created_at: "",
                        professional_info: {
                          experience_years: Number(app.professional_info?.experience) || 0,
                          skills: app.professional_info?.skills || "",
                          education: [],
                          start_date: app.professional_info?.start_date || "",
                        },
                        cv_analysis: app.cv_analysis
                          ? {
                              experience_years: app.cv_analysis.experience_years || 0,
                              skills: app.cv_analysis.skills || [],
                              education: app.cv_analysis.education || [],
                              ...app.cv_analysis,
                            }
                          : undefined,
                        attachments: app.attachments,
                      }))}
                      selectedEntries={selectedEntries}
                      subTabValue={subTabValue}
                      isMovingStage={isMovingStage}
                      getStageValue={getStageValue}
                      handleSelectCandidate={handleSelectCandidate}
                      handleCardClick={handleCardClick}
                      handleUpdateStages={openEmailModalForAction}
                      getSkillChipColor={getSkillChipColor}
                      theme={theme}
                    />
                  </>
                )}

                {/* Pagination controls */}
                {primaryTabValue === 0 && totalPages > 0 && (
                  <Box
                    sx={{
                      mx: "auto",
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "space-between",
                      mt: 3,
                      mb: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                          "& .MuiPaginationItem-root": {
                            fontSize: "16px",
                            fontWeight: 500,
                          },
                          "& .Mui-selected": {
                            backgroundColor: "primary.main",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "primary.dark",
                            },
                          },
                        }}
                      />
                      <Typography variant="body2" color="grey.200" align="center" sx={{ mb: 3 }}>
                        Showing <span style={{ fontWeight: 600 }}>{(page - 1) * perPage + 1}</span> to{" "}
                        <span style={{ fontWeight: 600 }}>{Math.min(page * perPage, totalItems)}</span> of{" "}
                        <span style={{ fontWeight: 600 }}>{totalItems}</span> entries
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="grey.200">
                        Show per Page:
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 72, borderRadius: "1000px" }}>
                        <Select
                          value={perPage}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            setPerPage(next);
                            setPage(1);
                          }}
                        >
                          <MenuItem value={5}>5</MenuItem>
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={20}>20</MenuItem>
                          <MenuItem value={30}>30</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                )}
              </Paper>
              {/* Custom Email Modal */}
              <Dialog open={emailModalOpen} onClose={() => setEmailModalOpen(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ fontWeight: 600, color: "rgba(17, 17, 17, 0.92)" }}>
                  {pendingAction
                    ? `Send email for ${(() => {
                        const matched = assessments.find((a: any) => a.id === pendingAction);
                        return matched
                          ? (matched as any).title ||
                              (matched as any).type
                                .split("_")
                                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(" ")
                          : pendingAction.replace("_", " ");
                      })()}`
                    : "Send Email"}
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: theme.palette.background.paper }}>
                  {emailLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        "& .quill": {
                          bgcolor: "#FFF",
                          borderRadius: "8px",
                          border: "0.8px solid rgba(17, 17, 17, 0.14)",
                          transition: "all 0.3s ease",
                          "&:focus-within": {
                            border: `0.8px solid ${theme.palette.primary.main}`,
                            boxShadow: `0 0 0 1px ${theme.palette.primary.main}25`,
                          },
                          "& .ql-toolbar": {
                            borderTopLeftRadius: "8px",
                            borderTopRightRadius: "8px",
                            border: "none",
                            borderBottom: "0.8px solid rgba(17, 17, 17, 0.14)",
                          },
                          "& .ql-container": {
                            border: "none",
                            borderBottomLeftRadius: "8px",
                            borderBottomRightRadius: "8px",
                          },
                        },
                      }}
                    >
                      {/* @ts-ignore - ReactQuill loaded dynamically */}
                      <ReactQuill
                        className="quill"
                        theme="snow"
                        value={emailContent}
                        onChange={setEmailContent}
                        modules={quillModules}
                        formats={quillFormats}
                      />
                    </Box>
                  )}
                  {emailError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {emailError}
                    </Alert>
                  )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button onClick={() => setEmailModalOpen(false)} variant="outlined" color="primary">
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => await handleSendBulkEmailAndMoveStage()}
                    variant="contained"
                    color="secondary"
                    disabled={emailLoading || !emailContent}
                  >
                    {emailLoading ? <CircularProgress size={20} color="inherit" /> : "Send"}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Stack>
        ) : primaryTabValue === 2 ? (
          /* ── CV Repositories ── */
          <Box
            sx={{
              bgcolor: "#ffffff",
              borderRadius: "16px",
              p: { xs: 3, md: 4 },
              minHeight: 480,
              boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Header row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "rgba(17,17,17,0.84)" }}>
                  CV Repository
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(17,17,17,0.54)", mt: 0.5 }}>
                  All CVs submitted for this role in one place.
                </Typography>
              </Box>

              {/* Right controls: view toggle + export */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* List / Grid toggle */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setCvViewMode("list")}
                    sx={{
                      borderRadius: 0,
                      px: 1.5,
                      py: 1,
                      bgcolor: cvViewMode === "list" ? "rgba(68,68,226,0.1)" : "transparent",
                      color: cvViewMode === "list" ? "#4444E2" : "rgba(17,17,17,0.54)",
                      transition: "all 0.15s ease",
                      "&:hover": { bgcolor: "rgba(68,68,226,0.06)" },
                    }}
                  >
                    <ViewListIcon fontSize="small" />
                  </IconButton>
                  <Box
                    sx={{
                      width: "1px",
                      height: 24,
                      bgcolor: "rgba(0,0,0,0.12)",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setCvViewMode("grid")}
                    sx={{
                      borderRadius: 0,
                      px: 1.5,
                      py: 1,
                      bgcolor: cvViewMode === "grid" ? "rgba(68,68,226,0.1)" : "transparent",
                      color: cvViewMode === "grid" ? "#4444E2" : "rgba(17,17,17,0.54)",
                      transition: "all 0.15s ease",
                      "&:hover": { bgcolor: "rgba(68,68,226,0.06)" },
                    }}
                  >
                    <GridViewIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<FileDownloadIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    bgcolor: "#4444E2",
                    "&:hover": { bgcolor: "#6666E6" },
                  }}
                  onClick={handleExportCVs}
                  disabled={selectedEntries.length === 0}
                >
                  Export selected CVs
                </Button>
              </Box>
            </Box>

            {/* Stats strip */}
            {/* <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "nowrap" }}>
              {[
                { label: "Total CVs", value: totalItems, color: "#4444E2" },
                {
                  label: "With CV attached",
                  value: candidates.applications.filter(
                    (a: any) => !!a.attachments?.cv,
                  ).length,
                  color: "#2B656E",
                },
                {
                  label: "Selected",
                  value: selectedEntries.length,
                  color: "#76325F",
                },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    flex: 1,
                    px: 3,
                    py: 1.5,
                    borderRadius: "10px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.25,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: stat.color }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Box> */}

            {/* ── Selection toolbar ── */}
            {!loading && candidates.applications.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  px: 0.5,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {/* Left: select controls */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const allIds = candidates.applications.map((a: any) => String(a.id));
                      const allSelected = allIds.every((id) => selectedEntries.includes(id));
                      if (allSelected) {
                        setSelectedEntries([]);
                      } else {
                        setSelectedEntries(allIds);
                      }
                    }}
                    sx={{
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 500,
                      borderColor: "rgba(17,17,17,0.16)",
                      color: "rgba(17,17,17,0.72)",
                      "&:hover": {
                        borderColor: "#4444E2",
                        color: "#4444E2",
                      },
                    }}
                  >
                    {candidates.applications.every((a: any) => selectedEntries.includes(String(a.id)))
                      ? "Clear selection"
                      : "Select all"}
                  </Button>

                  {selectedEntries.length > 0 && (
                    <Chip
                      label={`${selectedEntries.length} selected`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(68,68,226,0.1)",
                        color: "#4444E2",
                        fontWeight: 600,
                        fontSize: 12,
                        borderRadius: "6px",
                      }}
                      onDelete={() => setSelectedEntries([])}
                    />
                  )}
                </Box>

                {/* Right: export */}
                {selectedEntries.length > 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportCVs}
                    sx={{
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      bgcolor: "#4444E2",
                      "&:hover": { bgcolor: "#6666E6" },
                    }}
                  >
                    Export {selectedEntries.length} CV
                    {selectedEntries.length > 1 ? "s" : ""}
                  </Button>
                )}
              </Box>
            )}

            {/* ── Content area ── */}
            {loading ? (
              <CandidateSkeletonLoader />
            ) : candidates.applications.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                  gap: 2,
                  color: "rgba(17,17,17,0.38)",
                }}
              >
                <PictureAsPdfIcon sx={{ fontSize: 56, opacity: 0.3 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  No CVs found for this job yet.
                </Typography>
              </Box>
            ) : cvViewMode === "grid" ? (
              /* ════ GRID VIEW ════ */
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                  },
                  gap: 2.5,
                }}
              >
                {candidates.applications.map((app: any) => {
                  const name =
                    `${app.personal_info?.firstname || ""} ${app.personal_info?.lastname || ""}`.trim() || "Unknown";
                  const cvUrl = app.attachments?.cv;
                  const isSelected = selectedEntries.includes(String(app.id));

                  return (
                    <Box
                      key={app.id}
                      onClick={() => handleSelectCandidate(app.id)}
                      sx={{
                        borderRadius: "5px",
                        border: isSelected ? "2px solid #4444E2" : "1px solid rgba(0,0,0,0.10)",
                        bgcolor: "#fff",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        flexDirection: "column",
                        width: 300,
                        boxShadow: isSelected ? "0 0 0 3px rgba(68,68,226,0.15)" : "0px 2px 6px rgba(0,0,0,0.04)",
                        "&:hover": {
                          // border: "2px solid #4444E2",
                          // boxShadow: "0 0 0 3px rgba(68,68,226,0.12)",
                          bgcolor: "rgba(68,68,226,0.04)",
                        },
                      }}
                    >
                      {/* ── Card header: filename + 3-dot ── */}
                      <Box
                        sx={{
                          px: 2,
                          py: 1.25,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            minWidth: 0,
                          }}
                        >
                          <PictureAsPdfIcon
                            sx={{
                              fontSize: 18,
                              color: cvUrl ? "#E53935" : "rgba(17,17,17,0.3)",
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "rgba(17,17,17,0.84)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: 13,
                            }}
                          >
                            {`${name} CV`}
                          </Typography>
                        </Box>
                        {/* 3-dot button lives here now */}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cvUrl) {
                              setCvCardMenuAnchor({
                                el: e.currentTarget,
                                appId: String(app.id),
                                cvUrl,
                                name,
                              });
                            }
                          }}
                          disabled={!cvUrl}
                          sx={{
                            ml: 0.5,
                            flexShrink: 0,
                            color: "rgba(17,17,17,0.48)",
                            "&:hover": { color: "#4444E2" },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* ── PDF preview pane ── */}
                      <Box
                        sx={{
                          height: 200,
                          position: "relative",
                          bgcolor: cvUrl ? "#F7F7FF" : "#F5F5F5",
                          overflow: "hidden",
                        }}
                      >
                        {cvUrl ? (
                          <Box
                            sx={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                              borderRadius: "5px",
                              p: 4,
                            }}
                          >
                            <PictureAsPdfIcon
                              sx={{
                                fontSize: 64,
                                color: "#E53935",
                                filter: "drop-shadow(0 2px 8px rgba(229,57,53,0.25))",
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(17,17,17,0.48)",
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            >
                              PDF FILE
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                              color: "rgba(17,17,17,0.28)",
                            }}
                          >
                            <PictureAsPdfIcon sx={{ fontSize: 48 }} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              No CV uploaded
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}

                {/* Shared 3-dot menu for grid cards */}
                <Menu
                  anchorEl={cvCardMenuAnchor?.el}
                  open={Boolean(cvCardMenuAnchor)}
                  onClose={() => setCvCardMenuAnchor(null)}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 190,
                      borderRadius: "10px",
                      boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      if (cvCardMenuAnchor?.cvUrl) window.open(cvCardMenuAnchor.cvUrl, "_blank");
                      setCvCardMenuAnchor(null);
                    }}
                  >
                    <ListItemIcon>
                      <OpenInNewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="View CV" />
                  </MenuItem>
                  <MenuItem
                    onClick={async () => {
                      if (!cvCardMenuAnchor) return;
                      const { cvUrl, name } = cvCardMenuAnchor;
                      try {
                        const res = await fetch(cvUrl);
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `CV_${name}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      } catch {
                        window.open(cvUrl, "_blank");
                      }
                      setCvCardMenuAnchor(null);
                    }}
                  >
                    <ListItemIcon>
                      <FileDownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Download CV" />
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              /* ════ LIST VIEW ════ */
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {candidates.applications.map((app: any) => {
                  const name =
                    `${app.personal_info?.firstname || ""} ${app.personal_info?.lastname || ""}`.trim() || "Unknown";
                  const cvUrl = app.attachments?.cv;
                  const isSelected = selectedEntries.includes(String(app.id));
                  return (
                    <Box
                      key={app.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 3,
                        py: 2,
                        borderRadius: "12px",
                        border: isSelected ? "1.5px solid #4444E2" : "1px solid rgba(0,0,0,0.08)",
                        bgcolor: isSelected ? "rgba(68,68,226,0.04)" : "#fafafa",
                        transition: "all 0.15s ease",
                        cursor: "pointer",
                        "&:hover": {
                          // border: "1.5px solid #4444E2",
                          bgcolor: "rgba(68,68,226,0.04)",
                        },
                      }}
                      onClick={() => handleSelectCandidate(app.id)}
                    >
                      {/* Left: avatar + name */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: isSelected ? "#4444E2" : "#E8E8F9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 15,
                            color: isSelected ? "#fff" : "#4444E2",
                            flexShrink: 0,
                            transition: "all 0.15s ease",
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "rgba(17,17,17,0.84)",
                            }}
                          >
                            {name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "rgba(17,17,17,0.48)" }}>
                            {app.professional_info?.current_role || app.stage || "Applicant"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right: actions */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }} onClick={(e) => e.stopPropagation()}>
                        {cvUrl ? (
                          <>
                            <Chip
                              label="CV available"
                              size="small"
                              sx={{
                                bgcolor: "rgba(43,101,110,0.1)",
                                color: "#2B656E",
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                              href={cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              component="a"
                              sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                fontWeight: 500,
                                borderColor: "rgba(17,17,17,0.16)",
                                color: "rgba(17,17,17,0.72)",
                                "&:hover": {
                                  borderColor: "#4444E2",
                                  color: "#4444E2",
                                },
                              }}
                            >
                              View CV
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
                              onClick={async () => {
                                try {
                                  const res = await fetch(cvUrl);
                                  const blob = await res.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `CV_${name}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  window.URL.revokeObjectURL(url);
                                } catch {
                                  window.open(cvUrl, "_blank");
                                }
                              }}
                              sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                fontWeight: 500,
                                borderColor: "rgba(17,17,17,0.16)",
                                color: "rgba(17,17,17,0.72)",
                                "&:hover": {
                                  borderColor: "#4444E2",
                                  color: "#4444E2",
                                },
                              }}
                            >
                              Download CV
                            </Button>
                          </>
                        ) : (
                          <Chip
                            label="No CV"
                            size="small"
                            sx={{
                              bgcolor: "rgba(17,17,17,0.06)",
                              color: "rgba(17,17,17,0.38)",
                              fontWeight: 500,
                              fontSize: 11,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        ) : (
          <Paper sx={{ bgcolor: "transparent", boxShadow: "none" }}>
            {loading ? (
              <JobDescriptionSkeleton />
            ) : jobDetails ? (
              <JobDescription
                jobDetails={jobDetails}
                loading={loading}
                error={error}
                getJobId={getJobId}
                setError={setError}
                setPrimaryTabValue={setPrimaryTabValue}
              />
            ) : error ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="error">{error}</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">No job details available</Typography>
              </Box>
            )}
          </Paper>
        )}
      </Container>
      <DeleteSnackbar
        open={notification.open}
        message={notification.message}
        onClose={() => setNotification({ open: false, message: "", severity: "success" })}
      />
    </Box>
  );
}
