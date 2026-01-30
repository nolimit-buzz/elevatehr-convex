"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
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
  MenuItem,
  Select,
  FormControl,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Snackbar,
  Alert,
  Grid,
  TableCell,
  TableRow,
  Pagination,
} from "@mui/material";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import CandidateListSection from "@/app/dashboard/components/dashboard/CandidatesListSection";
import { useTheme } from "@mui/material/styles";
import { PHASE_OPTIONS } from "@/app/constants/phaseOptions";
import { styled } from "@mui/material/styles";
import CreatableSelect from "react-select/creatable";
import { Skill } from "@/app/lib/skills";
import CheckIcon from "@mui/icons-material/Check";
import FilterListIcon from "@mui/icons-material/FilterList";
import { SelectChangeEvent } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import {
  useCompanyApplications,
  useApplicationMutations,
  StageType,
  CompanyApplicationsParams,
} from "@/queries/applications.queries";

interface FilterState {
  jobTitle: string;
  yearsOfExperience: string;
  salaryMin: string;
  salaryMax: string;
  requiredSkills: string[];
  availability: string;
}

interface Candidate {
  id: number;
  job_title: string;
  personal_info: {
    firstname: string;
    lastname: string;
  };
  professional_info: {
    experience: string;
    salary_range: string;
    start_date: string;
    skills?: string;
  };
  attachments?: {
    cv?: string;
  };
}

interface CandidateResponse {
  applications: Candidate[];
}

interface SkillColor {
  bg: string;
  color: string;
}

interface SkillColors {
  [key: string]: SkillColor;
}

// Add QuickActionOption type definition
interface QuickActionOption {
  label: string;
  icon: React.ComponentType;
  action: string;
}

// Add QuickActions type definition
interface QuickActions {
  [key: string]: QuickActionOption[];
}

// Define PhaseOption interface
interface PhaseOption {
  label: string;
  icon: React.ComponentType;
  action: string;
}

const StyledSelect = styled(Select)({
  "& .MuiSelect-select": {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid rgba(17, 17, 17, 0.08)",
    padding: "16px",
    color: "rgba(17, 17, 17, 0.84)",
    "&:focus": {
      backgroundColor: "#fff",
    },
  },
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid rgba(17, 17, 17, 0.08)",
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
  "& .MuiInputBase-input": {
    padding: "16px",
    color: "rgba(17, 17, 17, 0.84)",
    "&::placeholder": {
      color: "rgba(17, 17, 17, 0.48)",
    },
  },
});

const StyledRadio = styled(Radio)({
  color: "rgba(17, 17, 17, 0.6)",
  // borderWidth: '0.5px',
  // borderRadius: "40px",
  // border: "1px solid rgba(17, 17, 17, 0.84)",
  opacity: 0.68,
  "&.Mui-checked": {
    color: "#4444E2",
  },
});

// Update TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      sx={{ p: 3 }}
      {...other}
    >
      {value === index && children}
    </Box>
  );
};

const TabSelect = styled(Select)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("sm")]: {
    display: "block",
    width: "100%",
    mb: 3,
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      gap: 1,
    },
  },
}));

const TabContainer = styled(Box)(({ theme }) => ({
  display: "block",
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

const FilterModal = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#fff",
  zIndex: 1400,
  overflowY: "auto",
  padding: theme.spacing(2),
  paddingTop: theme.spacing(8),
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

const FilterModalHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}));

const skillColors = [
  { bg: "rgba(114, 74, 59, 0.15)", color: "#724A3B" },
  { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
  { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
  { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
];

const StyledTableHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
}));

export default function Home() {
  const theme = useTheme();
  const [primaryTabValue, setPrimaryTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
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
    jobTitle: "",
    yearsOfExperience: "",
    salaryMin: "",
    salaryMax: "",
    requiredSkills: [],
    availability: "",
  });
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [isMovingStage, setIsMovingStage] = useState<string>("");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState<"success" | "error">("success");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);

  const router = useRouter();
  const params = useParams();

  // Get the mutations hook
  const { updateStage } = useApplicationMutations();

  // Compute stage from tab value
  const getStageValue = (tabValue: number): StageType => {
    switch (tabValue) {
      case 0:
        return "new";
      case 1:
        return "skill_assessment";
      case 2:
        return "interviews";
      case 3:
        return "acceptance";
      case 4:
        return "archived";
      default:
        return "new";
    }
  };

  // Build query params for Convex
  const queryParams = useMemo((): CompanyApplicationsParams => {
    const params: CompanyApplicationsParams = {
      stage: getStageValue(primaryTabValue),
      page,
      perPage,
    };

    // Add search query if present
    if (filters.jobTitle) {
      params.searchQuery = filters.jobTitle;
    }

    // Add applied filters
    if (appliedFilters) {
      if (appliedFilters.yearsOfExperience) {
        params.experienceRange = appliedFilters.yearsOfExperience;
      }
      if (appliedFilters.requiredSkills.length > 0) {
        params.skills = appliedFilters.requiredSkills;
      }
      if (appliedFilters.availability) {
        params.availability = appliedFilters.availability;
      }
    }

    return params;
  }, [primaryTabValue, page, perPage, filters.jobTitle, appliedFilters]);

  // Fetch applications using Convex hook
  const applicationsData = useCompanyApplications(queryParams);

  // Derive loading and data states from the query
  const loading = applicationsData === undefined;
  const error = applicationsData === null ? "Failed to fetch applications" : null;
  const filteredCandidates = applicationsData || { applications: [], total: 0, total_pages: 1, page: 1, per_page: 10 };
  const candidates = filteredCandidates;
  const totalPages = filteredCandidates.total_pages || 1;
  const totalItems = filteredCandidates.total || 0;

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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (filterName: keyof FilterState, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const applyFilters = () => {
    // Set applied filters to trigger the Convex query with new params
    setAppliedFilters({ ...filters });
    setPage(1); // Reset to first page when applying filters
  };

  const clearFilters = () => {
    setFilters({
      jobTitle: "",
      yearsOfExperience: "",
      salaryMin: "",
      salaryMax: "",
      requiredSkills: [],
      availability: "",
    });
    setAppliedFilters(null);
  };

  const handlePrimaryTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setPrimaryTabValue(newValue);
  };

  const handleSubTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedEntries([]);
    setSubTabValue(newValue);
  };

  const handleDropdownChange = (event: SelectChangeEvent<number>) => {
    setSelectedEntries([]);
    setSubTabValue(event.target.value as number);
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleQuickActionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setQuickActionsAnchor(event.currentTarget);
  };

  const handleQuickActionsClose = () => {
    setQuickActionsAnchor(null);
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

  const handleUpdateStages = async ({ stage, entries = [] }: { stage: StageType; entries?: string[] }) => {
    setIsMovingStage(stage);
    try {
      const entriesToUpdate = entries.length ? entries : selectedEntries;

      const { result, error } = await updateStage(entriesToUpdate, stage);

      if (error) {
        throw new Error(error);
      }

      setSelectedEntries([]);

      // Show success notification
      setNotification({
        open: true,
        message: `Successfully moved ${entriesToUpdate.length} candidate${entriesToUpdate.length > 1 ? "s" : ""} to ${stage.replace("_", " ")}`,
        severity: "success",
      });
      setIsOpen(true);
      setNotificationMessage(
        `Successfully moved ${entriesToUpdate.length} candidate${entriesToUpdate.length > 1 ? "s" : ""} to ${stage.replace("_", " ")}`,
      );
      setNotificationSeverity("success");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while updating stages";
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      setIsOpen(true);
      setNotificationMessage(errorMessage);
      setNotificationSeverity("error");
    } finally {
      setIsMovingStage("");
    }
  };

  const handleCloseNotification = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setIsOpen(false);
  };

  const handleNotification = (message: string, severity: "success" | "error") => {
    setNotificationMessage(message);
    setNotificationSeverity(severity);
    setIsOpen(true);
  };

  const hasActiveFilters = () => {
    return (
      filters.yearsOfExperience !== "" ||
      filters.salaryMin !== "" ||
      filters.salaryMax !== "" ||
      filters.requiredSkills.length > 0 ||
      filters.availability !== "" ||
      filters.jobTitle !== ""
    );
  };

  // const handleUpdateStagesWrapper = (stage: string, entries: number[]) => {
  //   handleUpdateStages({ stage: stage as StageType, entries });
  // };

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton sx={{ mr: 1 }} aria-label="back" onClick={() => router.push("/dashboard")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              sx={{
                color: theme.palette.grey[100],
                fontSize: "24px",
                fontWeight: 600,
                lineHeight: "100%",
                letterSpacing: "0.12px",
              }}
            >
              Applications
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" gap={3}>
          <Box
            sx={{
              height: "100vh",
              width: 300,
              flexShrink: 0,
              display: { xs: "none", lg: "block" },
            }}
          >
            <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "rgba(17, 17, 17, 0.92)",
                  }}
                >
                  Filters:
                </Typography>
                <Button
                  startIcon={<CloseIcon />}
                  sx={{
                    color: "rgba(17, 17, 17, 0.72)",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 400,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      color: theme.palette.primary.main,
                      backgroundColor: "rgba(68, 68, 226, 0.04)",
                    },
                  }}
                  onClick={clearFilters}
                >
                  Clear filter
                </Button>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    mb: 1.5,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "rgba(17, 17, 17, 0.92)",
                  }}
                >
                  Job Title
                </Typography>
                <FormControl fullWidth>
                  <StyledTextField
                    placeholder="Search by Job Title"
                    fullWidth
                    value={filters.jobTitle}
                    onChange={(e) => handleFilterChange("jobTitle", e.target.value)}
                  />
                </FormControl>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    mb: 1.5,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "rgba(17, 17, 17, 0.92)",
                  }}
                >
                  Years of experience
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={filters.yearsOfExperience}
                    displayEmpty
                    renderValue={(selected) => selected || "Select years"}
                    sx={{
                      boxShadow: "none",
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      // border: '1px solid rgba(17, 17, 17, 0.12)',
                      "& .MuiSelect-select": {
                        padding: "16px",
                        border: "none",
                        boxShadow: "none",
                        color: filters.yearsOfExperience ? "rgba(17, 17, 17, 0.84)" : "rgba(17, 17, 17, 0.48)",
                      },
                    }}
                    onChange={(e) => handleFilterChange("yearsOfExperience", e.target.value)}
                  >
                    <MenuItem value="">All years</MenuItem>
                    <MenuItem value="1-3">1-3 years</MenuItem>
                    <MenuItem value="4-6">4-6 years</MenuItem>
                    <MenuItem value="7+">7+ years</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    mb: 1.5,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "rgba(17, 17, 17, 0.92)",
                  }}
                >
                  Salary expectation:
                </Typography>
                <Stack spacing={1.5}>
                  <StyledTextField
                    placeholder="Min: 000000"
                    fullWidth
                    value={filters.salaryMin}
                    onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
                    type="number"
                  />
                  <StyledTextField
                    placeholder="Max: 000000"
                    fullWidth
                    value={filters.salaryMax}
                    onChange={(e) => handleFilterChange("salaryMax", e.target.value)}
                    type="number"
                  />
                </Stack>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    mb: 1.5,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "rgba(17, 17, 17, 0.92)",
                  }}
                >
                  Required skills
                </Typography>
                <CreatableSelect
                  isMulti
                  options={availableSkills}
                  value={filters.requiredSkills.map((skill) => ({ value: skill, label: skill }))}
                  onChange={(selectedOptions: any) => {
                    const selectedSkills = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                    handleFilterChange("requiredSkills", selectedSkills);
                  }}
                  onCreateOption={(inputValue: string) => {
                    const newSkill = { value: inputValue, label: inputValue };
                    handleFilterChange("requiredSkills", [...filters.requiredSkills, inputValue]);
                  }}
                  placeholder="Select or create skills"
                  formatCreateLabel={(inputValue: string) => `Create "${inputValue}"`}
                  styles={{
                    control: (base: any) => ({
                      ...base,
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid rgba(17, 17, 17, 0.08)",
                      minHeight: "52px",
                      boxShadow: "none",
                      "&:hover": {
                        borderColor: "rgba(17, 17, 17, 0.08)",
                      },
                    }),
                    menu: (base: any) => ({
                      ...base,
                      zIndex: 2,
                    }),
                    option: (base: any, state: any) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "#F8F9FB" : "white",
                      color: "rgba(17, 17, 17, 0.84)",
                      cursor: "pointer",
                      padding: "12px 16px",
                    }),
                    multiValue: (base: any) => ({
                      ...base,
                      backgroundColor: "#E8EAFD",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      margin: "2px",
                    }),
                    multiValueLabel: (base: any) => ({
                      ...base,
                      color: "#4444E2",
                      fontSize: "14px",
                    }),
                    multiValueRemove: (base: any) => ({
                      ...base,
                      color: "#4444E2",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#D8DAFD",
                        color: "#4444E2",
                      },
                    }),
                    placeholder: (base: any) => ({
                      ...base,
                      color: "rgba(17, 17, 17, 0.48)",
                    }),
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    mb: 1.5,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "rgba(17, 17, 17, 0.92)",
                  }}
                >
                  Availability:
                </Typography>
                <RadioGroup
                  value={filters.availability}
                  onChange={(e) => handleFilterChange("availability", e.target.value)}
                >
                  <FormControlLabel
                    value="immediately"
                    control={
                      <StyledRadio
                        icon={
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.68">
                              <rect
                                x="0.5"
                                y="0.5"
                                width="19"
                                height="19"
                                rx="9.5"
                                stroke="#111111"
                                strokeOpacity="0.84"
                              />
                            </g>
                          </svg>
                        }
                      />
                    }
                    label="Immediately"
                    sx={{
                      "& .MuiTypography-root": {
                        fontSize: "16px",
                        color: "rgba(17, 17, 17, 0.84)",
                      },
                    }}
                  />
                  <FormControlLabel
                    value="in-a-week"
                    control={
                      <StyledRadio
                        icon={
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.68">
                              <rect
                                x="0.5"
                                y="0.5"
                                width="19"
                                height="19"
                                rx="9.5"
                                stroke="#111111"
                                strokeOpacity="0.84"
                              />
                            </g>
                          </svg>
                        }
                      />
                    }
                    label="In a week"
                    sx={{
                      "& .MuiTypography-root": {
                        fontSize: "16px",
                        color: "rgba(17, 17, 17, 0.84)",
                      },
                    }}
                  />
                  <FormControlLabel
                    value="in-a-month"
                    control={
                      <StyledRadio
                        icon={
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.68">
                              <rect
                                x="0.5"
                                y="0.5"
                                width="19"
                                height="19"
                                rx="9.5"
                                stroke="#111111"
                                strokeOpacity="0.84"
                              />
                            </g>
                          </svg>
                        }
                      />
                    }
                    label="In a month"
                    sx={{
                      "& .MuiTypography-root": {
                        fontSize: "16px",
                        color: "rgba(17, 17, 17, 0.84)",
                      },
                    }}
                  />
                  <FormControlLabel
                    value="in-two-months"
                    control={
                      <StyledRadio
                        icon={
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.68">
                              <rect
                                x="0.5"
                                y="0.5"
                                width="19"
                                height="19"
                                rx="9.5"
                                stroke="#111111"
                                strokeOpacity="0.84"
                              />
                            </g>
                          </svg>
                        }
                      />
                    }
                    label="In two months"
                    sx={{
                      "& .MuiTypography-root": {
                        fontSize: "16px",
                        color: "rgba(17, 17, 17, 0.84)",
                      },
                    }}
                  />
                </RadioGroup>
              </Box>

              <Button
                variant="contained"
                fullWidth
                disabled={!hasActiveFilters()}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.secondary.light,
                  textTransform: "none",
                  borderRadius: "12px",
                  padding: "16px",
                  fontSize: "16px",
                  fontWeight: 500,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: theme.palette.primary.main,
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.12)",
                    color: "rgba(0, 0, 0, 0.26)",
                  },
                }}
                onClick={() => {
                  applyFilters();
                  setShowFilterModal(false);
                }}
              >
                Apply Filter
              </Button>
            </Paper>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            {/* Dropdown for small screens */}
            <Box sx={{ display: { xs: "block", lg: "none" }, py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FormControl fullWidth>
                  <Select
                    value={subTabValue}
                    onChange={handleDropdownChange}
                    displayEmpty
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      "& .MuiSelect-select": {
                        padding: "12px",
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "rgba(17, 17, 17, 0.84)",
                      },
                    }}
                  >
                    <MenuItem value={0}>Application Review</MenuItem>
                    <MenuItem value={1}>Skill Assessment</MenuItem>
                    <MenuItem value={2}>Interviews</MenuItem>
                    <MenuItem value={3}>Acceptance</MenuItem>
                    <MenuItem value={4}>Archived</MenuItem>
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => setShowFilterModal(true)}
                  sx={{
                    color: "rgba(17, 17, 17, 0.48)",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid rgba(17, 17, 17, 0.08)",
                    "&:hover": {
                      backgroundColor: "rgba(68, 68, 226, 0.04)",
                    },
                  }}
                >
                  <FilterListIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: { xs: "none", lg: "block" } }}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  mb: 3,
                  backgroundColor: "#ffffff !important",
                  borderRadius: "10px",
                  paddingX: "20px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                  }}
                >
                  <Stack direction={"row"} alignItems={"center"} gap={1}>
                    <Typography
                      variant="h2"
                      fontWeight={"semibold"}
                      fontSize={"24px"}
                      color={"rgba(17,17,17,0.92)"}
                      letterSpacing={"0.12px"}
                    >
                      Applications
                    </Typography>
                    <Typography
                      variant="h2"
                      fontWeight={"semibold"}
                      fontSize={"24px"}
                      color={"rgba(17,17,17,0.52)"}
                      letterSpacing={"0.12px"}
                    >
                      {`(${filteredCandidates?.applications?.length || 0})`}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      placeholder="Search applications"
                      value={filters.jobTitle}
                      onChange={(e) => handleFilterChange("jobTitle", e.target.value)}
                      sx={{
                        width: "300px",
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fff",
                          borderRadius: "12px",
                          border: "1px solid rgba(17, 17, 17, 0.08)",
                          "& fieldset": {
                            border: "none",
                          },
                          "&:hover fieldset": {
                            border: "none",
                          },
                          "&.Mui-focused fieldset": {
                            border: "none",
                          },
                        },
                        "& .MuiInputBase-input": {
                          padding: "12px 16px",
                          color: "rgba(17, 17, 17, 0.84)",
                          "&::placeholder": {
                            color: "rgba(17, 17, 17, 0.48)",
                          },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        bgcolor: "rgba(17, 17, 17, 0.04)",
                        borderRadius: "12px",
                        p: 0.5,
                        minHeight: "40px",
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      <Tabs
                        value={viewMode}
                        onChange={(_, newValue) => setViewMode(newValue)}
                        sx={{
                          minHeight: "40px",
                          "& .MuiTabs-indicator": {
                            display: "none",
                          },

                          "& .MuiTab-root": {
                            minHeight: "40px",
                            minWidth: "40px",
                            // padding: '8px',
                            color: "rgba(17, 17, 17, 0.48)",
                            transition: "all 0.3s ease-in-out",
                            "&.Mui-selected": {
                              color: theme.palette.primary.main,
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
                              transform: "scale(1.05)",
                            },
                            "&:hover": {
                              color: theme.palette.primary.main,
                              transform: "scale(1.05)",
                            },
                          },
                        }}
                      >
                        <Tab
                          sx={{
                            "&button .MuiTab-root": {
                              padding: "0px !important",
                              backgroundColor: "red",
                            },
                          }}
                          value="list"
                          icon={<ViewListIcon />}
                          aria-label="list view"
                        />
                        <Tab value="grid" icon={<GridViewIcon />} aria-label="grid view" />
                      </Tabs>
                    </Box>
                  </Stack>
                </Box>
                <Tabs
                  value={primaryTabValue}
                  onChange={(e, newValue) => handlePrimaryTabChange(e, newValue)}
                  indicatorColor="secondary"
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="submission tabs"
                  sx={{
                    width: "100%",
                    alignItems: "center",
                    "& .MuiButtonBase-root": {
                      padding: "0px !important",
                      // backgroundColor: 'rd',
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
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>Application Review</span>
                        {/* <Chip
                          label={stageTotals.new}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.secondary.main,
                            color: 'white',
                            height: '20px',
                            '& .MuiChip-label': {
                              px: 1,
                              fontSize: '12px',
                              fontWeight: 500
                            }
                          }}
                        /> */}
                      </Box>
                    }
                    sx={{
                      textTransform: "none",
                      color: subTabValue === 0 ? theme.palette.grey[100] : theme.palette.grey[200],
                      flex: 1,
                      "&.Mui-selected": {
                        color: "primary.main",
                      },
                      padding: "0px !important",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        color: theme.palette.secondary.main,
                      },
                    }}
                  />
                  <Tab
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>Skill assessment</span>
                        {/* <Chip
                          label={stageTotals.skill_assessment}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.secondary.main,
                            color: 'white',
                            height: '20px',
                            '& .MuiChip-label': {
                              px: 1,
                              fontSize: '12px',
                              fontWeight: 500
                            }
                          }}
                        /> */}
                      </Box>
                    }
                    sx={{
                      textTransform: "none",
                      color: subTabValue === 1 ? theme.palette.grey[100] : theme.palette.grey[200],
                      flex: 1,
                    }}
                  />
                  <Tab
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>Interviews</span>
                        {/* <Chip
                          label={stageTotals.interviews}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.secondary.main,
                            color: 'white',
                            height: '20px',
                            '& .MuiChip-label': {
                              px: 1,
                              fontSize: '12px',
                              fontWeight: 500
                            }
                          }}
                        /> */}
                      </Box>
                    }
                    sx={{
                      textTransform: "none",
                      color: subTabValue === 2 ? theme.palette.grey[100] : theme.palette.grey[200],
                      flex: 1,
                    }}
                  />
                  <Tab
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>Acceptance</span>
                        {/* <Chip
                          label={stageTotals.acceptance}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.secondary.main,
                            color: 'white',
                            height: '20px',
                            '& .MuiChip-label': {
                              px: 1,
                              fontSize: '12px',
                              fontWeight: 500
                            }
                          }}
                        /> */}
                      </Box>
                    }
                    sx={{
                      textTransform: "none",
                      color: subTabValue === 3 ? theme.palette.grey[100] : theme.palette.grey[200],
                      flex: 1,
                    }}
                  />
                  <Tab
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>Archived</span>
                        {/* <Chip
                          label={stageTotals.archived}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.secondary.main,
                            color: 'white',
                            height: '20px',
                            '& .MuiChip-label': {
                              px: 1,
                              fontSize: '12px',
                              fontWeight: 500
                            }
                          }}
                        /> */}
                      </Box>
                    }
                    sx={{
                      textTransform: "none",
                      color: subTabValue === 4 ? theme.palette.grey[100] : theme.palette.grey[200],
                      flex: 1,
                    }}
                  />
                </Tabs>
              </Box>
            </Box>
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                minHeight: "700px",
                backgroundColor: "transparent !important",
              }}
            >
              {/* Grid View */}
              <Box
                sx={{
                  display: { xs: "block", md: viewMode === "grid" ? "block" : "none" },
                  width: "100%",
                  height: "calc(100vh - 325px)",
                  overflow: "auto",
                  bgcolor: "transparent !important",
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
                <Grid container spacing={3}>
                  {filteredCandidates?.applications?.map((candidate) => (
                    <Grid item xs={12} sm={6} lg={4} key={candidate.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          height: "100%",
                          p: { xs: 2, sm: 3 },
                          backgroundColor: "#fff",
                          borderRadius: 2,
                          boxShadow: "1px 2px 10px 0px rgba(0, 0, 0, 0.051)",
                          // border: '1px solid rgba(0, 0, 0, 0.12)',
                          display: "flex",
                          flexDirection: "column",
                          gap: { xs: 1.5, sm: 2 },
                          minHeight: { xs: "300px", sm: "300px" },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexDirection: "column",
                          }}
                        >
                          {/* <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: '' }}> */}
                          {/* <Checkbox
                              checked={selectedEntries.includes(candidate.id)}
                              onChange={() => handleSelectCandidate(candidate.id)}
                              disabled={subTabValue === 3 || filteredCandidates?.applications?.length === 1}
                              sx={{
                                color: theme.palette.grey[100],
                                '&.Mui-checked': {
                                  color: theme.palette.grey[100],
                                },
                                padding: 0,
                                '& .MuiSvgIcon-root': {
                                  fontSize: 20
                                }
                              }}
                            /> */}
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontSize: "16px",
                                mb: 2,
                                fontWeight: 600,
                                color: "rgba(17, 17, 17, 0.92)",
                                textTransform: "capitalize",
                              }}
                            >
                              {candidate.personal_info.firstname} {candidate.personal_info.lastname}
                            </Typography>
                          </Box>
                          {/* </Box> */}
                          <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, sm: 2 } }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.66662 18.3333H13.3333C16.6833 18.3333 17.2833 16.9917 17.4583 15.3583L18.0833 8.69167C18.3083 6.65833 17.725 5 14.1666 5H5.83329C2.27496 5 1.69162 6.65833 1.91662 8.69167L2.54162 15.3583C2.71662 16.9917 3.31662 18.3333 6.66662 18.3333Z"
                                  stroke="#111111"
                                  strokeOpacity="0.62"
                                  strokeWidth="1.25"
                                  strokeMiterlimit="10"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6.66667 5.00008V4.33341C6.66667 2.85841 6.66667 1.66675 9.33333 1.66675H10.6667C13.3333 1.66675 13.3333 2.85841 13.3333 4.33341V5.00008"
                                  stroke="#111111"
                                  strokeOpacity="0.62"
                                  strokeWidth="1.25"
                                  strokeMiterlimit="10"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M11.6667 10.8333V11.6667C11.6667 11.675 11.6667 11.675 11.6667 11.6833C11.6667 12.5917 11.6583 13.3333 10 13.3333C8.35 13.3333 8.33333 12.6 8.33333 11.6917V10.8333C8.33333 10 8.33333 10 9.16667 10H10.8333C11.6667 10 11.6667 10 11.6667 10.8333Z"
                                  stroke="#111111"
                                  strokeOpacity="0.62"
                                  strokeWidth="1.25"
                                  strokeMiterlimit="10"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M18.0417 9.16675C16.1167 10.5667 13.9167 11.4001 11.6667 11.6834"
                                  stroke="#111111"
                                  strokeOpacity="0.62"
                                  strokeWidth="1.25"
                                  strokeMiterlimit="10"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M2.18333 9.3916C4.05833 10.6749 6.175 11.4499 8.33333 11.6916"
                                  stroke="#111111"
                                  strokeOpacity="0.62"
                                  strokeWidth="1.25"
                                  strokeMiterlimit="10"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "rgba(17, 17, 17, 0.48)",
                                  fontSize: "14px",
                                }}
                              >
                                {candidate.professional_info.experience} experience
                              </Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M18.3333 10.0001C18.3333 14.6001 14.6 18.3334 9.99999 18.3334C5.39999 18.3334 1.66666 14.6001 1.66666 10.0001C1.66666 5.40008 5.39999 1.66675 9.99999 1.66675C14.6 1.66675 18.3333 5.40008 18.3333 10.0001Z"
                                  stroke="#111111"
                                  strokeOpacity="0.62"
                                  strokeWidth="1.25"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M13.0917 12.65L10.5083 11.1083C10.0583 10.8416 9.69168 10.2 9.69168 9.67497V6.2583"
                                  stroke="#111111"
                                  strokeOpacity="0.62"
                                  strokeWidth="1.25"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "rgba(17, 17, 17, 0.48)",
                                  fontSize: "14px",
                                }}
                              >
                                Available {candidate.professional_info.start_date.toLowerCase()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {candidate.professional_info.skills?.split(",").map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              title={skill}
                              size="small"
                              sx={{
                                bgcolor: skillColors[index % skillColors.length].bg,
                                color: skillColors[index % skillColors.length].color,
                                height: "28px",
                                maxWidth: 240,
                                "& .MuiChip-label": {
                                  px: 1.5,
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  display: "block",
                                },
                              }}
                            />
                          ))}
                        </Box>

                        <Link href={candidate.attachments?.cv || ""} target="_blank">
                          <Stack
                            direction="row"
                            alignItems="center"
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 0.5,
                              fontSize: "14px",
                              lineHeight: "16px",
                              textDecoration: "underline",
                              textDecorationColor: theme.palette.grey[100],
                              mt: 1,
                            }}
                          >
                            <Typography sx={{ color: "grey.100" }}>Resume</Typography>{" "}
                            <OpenInNewIcon sx={{ fontSize: 16, color: theme.palette.grey[100] }} />
                          </Stack>
                        </Link>

                        {/* <Box sx={{
                          mt: 2,
                          display: 'flex',
                          flexDirection: {
                            xs: 'column',
                            // sm: PHASE_OPTIONS[getStageValue(subTabValue)]?.length === 2 ? 'row' : 'column' 
                          },
                          gap: 1
                        }}>
                          {PHASE_OPTIONS[getStageValue(subTabValue)]?.map((option) => (
                            <Button
                              key={option.action}
                              variant="outlined"
                              startIcon={isMovingStage === option.action ? <CircularProgress size={20} /> : <option.icon />}
                              onClick={() => handleUpdateStagesWrapper(option.action, selectedEntries)}
                              disabled={isMovingStage.length > 0}
                              fullWidth
                              sx={{
                                color: 'rgba(17, 17, 17, 0.84)',
                                borderColor: 'rgba(17, 17, 17, 0.12)',
                                '&:hover': {
                                  borderColor: 'rgba(17, 17, 17, 0.24)',
                                },
                                '&.Mui-disabled': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                  color: 'rgba(0, 0, 0, 0.26)'
                                },
                                height: { xs: '36px', sm: '40px' },
                                '& .MuiButton-startIcon': {
                                  marginRight: { xs: '4px', sm: '8px' }
                                }
                              }}
                            >
                              {isMovingStage ? 'Moving...' : option.label}
                            </Button>
                          ))}
                        </Box> */}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* List View */}
              <Box
                sx={{
                  display: { xs: "none", md: viewMode === "list" ? "block" : "none" },
                  width: "100%",
                  height: "calc(100vh - 325px)",
                  overflowY: "scroll",
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
                {filteredCandidates?.applications?.map((candidate) => (
                  <Box
                    key={candidate.id}
                    sx={{
                      backgroundColor: "white",
                      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                      "&:last-child": {
                        borderBottom: "none",
                      },
                      // p: 2,
                    }}
                  >
                    <CandidateListSection
                      setSelectedEntries={setSelectedEntries}
                      isQuickActionsVisible={false}
                      isCheckboxVisible={false}
                      key={candidate.id}
                      candidate={candidate}
                      isSelected={selectedEntries.includes(String(candidate.id))}
                      onSelectCandidate={handleSelectCandidate}
                      selectedEntries={selectedEntries}
                      onUpdateStages={(action: string) => {
                        console.log("action", action);
                      }}
                      currentStage={getStageValue(subTabValue)}
                      onNotification={(message, severity) => {
                        setNotificationMessage(message);
                        setNotificationSeverity(severity);
                        setIsOpen(true);
                      }}
                      phaseOptions={PHASE_OPTIONS}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Stack>

        {/* Add pagination controls */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
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
        </Box>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalItems)} of {totalItems} entries
        </Typography>
      </Container>

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={isOpen}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          zIndex: 9999,
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notificationSeverity}
          icon={notificationSeverity === "success" ? <CheckIcon /> : undefined}
          sx={{
            minWidth: "300px",
            backgroundColor: "primary.main",
            color: "secondary.light",
            borderRadius: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& .MuiAlert-icon": {
              color: "#fff",
              marginRight: "8px",
              padding: 0,
            },
            "& .MuiAlert-message": {
              padding: "6px 0",
              fontSize: "15px",
              textAlign: "center",
              flex: "unset",
            },
            "& .MuiAlert-action": {
              padding: "0 8px 0 0",
              marginRight: 0,
              "& .MuiButtonBase-root": {
                color: "#fff",
                padding: 1,
              },
            },
          }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      {/* Filter Modal for Mobile */}
      {showFilterModal && (
        <FilterModal>
          <FilterModalHeader>
            <Typography variant="h6" sx={{ fontSize: "20px", fontWeight: 600, color: "rgba(17, 17, 17, 0.92)" }}>
              Filters
            </Typography>
            <IconButton onClick={() => setShowFilterModal(false)}>
              <CloseIcon />
            </IconButton>
          </FilterModalHeader>

          {/* Copy all the filter content from the sidebar */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1.5, fontSize: "16px", fontWeight: 500, color: "rgba(17, 17, 17, 0.92)" }}>
              Job Title
            </Typography>
            <FormControl fullWidth>
              <StyledTextField
                placeholder="Search by Job Title"
                fullWidth
                value={filters.jobTitle}
                onChange={(e) => handleFilterChange("jobTitle", e.target.value)}
              />
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1.5, fontSize: "16px", fontWeight: 500, color: "rgba(17, 17, 17, 0.92)" }}>
              Years of experience
            </Typography>
            <FormControl fullWidth>
              <Select
                value={filters.yearsOfExperience}
                displayEmpty
                renderValue={(selected) => selected || "Select years"}
                sx={{
                  boxShadow: "none",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  "& .MuiSelect-select": {
                    padding: "16px",
                    border: "none",
                    boxShadow: "none",
                    color: filters.yearsOfExperience ? "rgba(17, 17, 17, 0.84)" : "rgba(17, 17, 17, 0.48)",
                  },
                }}
                onChange={(e) => handleFilterChange("yearsOfExperience", e.target.value)}
              >
                <MenuItem value="">All years</MenuItem>
                <MenuItem value="1-3">1-3 years</MenuItem>
                <MenuItem value="4-6">4-6 years</MenuItem>
                <MenuItem value="7+">7+ years</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1.5, fontSize: "16px", fontWeight: 500, color: "rgba(17, 17, 17, 0.92)" }}>
              Salary expectation:
            </Typography>
            <Stack spacing={1.5}>
              <StyledTextField
                placeholder="Min: 000000"
                fullWidth
                value={filters.salaryMin}
                onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
                type="number"
              />
              <StyledTextField
                placeholder="Max: 000000"
                fullWidth
                value={filters.salaryMax}
                onChange={(e) => handleFilterChange("salaryMax", e.target.value)}
                type="number"
              />
            </Stack>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1.5, fontSize: "16px", fontWeight: 500, color: "rgba(17, 17, 17, 0.92)" }}>
              Required skills
            </Typography>
            <CreatableSelect
              isMulti
              options={availableSkills}
              value={filters.requiredSkills.map((skill) => ({ value: skill, label: skill }))}
              onChange={(selectedOptions: any) => {
                const selectedSkills = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                handleFilterChange("requiredSkills", selectedSkills);
              }}
              onCreateOption={(inputValue: string) => {
                const newSkill = { value: inputValue, label: inputValue };
                handleFilterChange("requiredSkills", [...filters.requiredSkills, inputValue]);
              }}
              placeholder="Select or create skills"
              formatCreateLabel={(inputValue: string) => `Create "${inputValue}"`}
              styles={{
                control: (base: any) => ({
                  ...base,
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid rgba(17, 17, 17, 0.08)",
                  minHeight: "52px",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "rgba(17, 17, 17, 0.08)",
                  },
                }),
                menu: (base: any) => ({
                  ...base,
                  zIndex: 2,
                }),
                option: (base: any, state: any) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#F8F9FB" : "white",
                  color: "rgba(17, 17, 17, 0.84)",
                  cursor: "pointer",
                  padding: "12px 16px",
                }),
                multiValue: (base: any) => ({
                  ...base,
                  backgroundColor: "#E8EAFD",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  margin: "2px",
                }),
                multiValueLabel: (base: any) => ({
                  ...base,
                  color: "#4444E2",
                  fontSize: "14px",
                }),
                multiValueRemove: (base: any) => ({
                  ...base,
                  color: "#4444E2",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#D8DAFD",
                    color: "#4444E2",
                  },
                }),
                placeholder: (base: any) => ({
                  ...base,
                  color: "rgba(17, 17, 17, 0.48)",
                }),
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1.5, fontSize: "16px", fontWeight: 500, color: "rgba(17, 17, 17, 0.92)" }}>
              Availability:
            </Typography>
            <RadioGroup
              value={filters.availability}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
            >
              <FormControlLabel
                value="immediately"
                control={<StyledRadio />}
                label="Immediately"
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "16px",
                    color: "rgba(17, 17, 17, 0.84)",
                  },
                }}
              />
              <FormControlLabel
                value="in-a-week"
                control={<StyledRadio />}
                label="In a week"
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "16px",
                    color: "rgba(17, 17, 17, 0.84)",
                  },
                }}
              />
              <FormControlLabel
                value="in-a-month"
                control={<StyledRadio />}
                label="In a month"
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "16px",
                    color: "rgba(17, 17, 17, 0.84)",
                  },
                }}
              />
              <FormControlLabel
                value="in-two-months"
                control={<StyledRadio />}
                label="In two months"
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "16px",
                    color: "rgba(17, 17, 17, 0.84)",
                  },
                }}
              />
            </RadioGroup>
          </Box>

          <Button
            variant="contained"
            fullWidth
            disabled={!hasActiveFilters()}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.secondary.light,
              textTransform: "none",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "16px",
              fontWeight: 500,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: theme.palette.primary.main,
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
              },
            }}
            onClick={() => {
              applyFilters();
              setShowFilterModal(false);
            }}
          >
            Apply Filter
          </Button>
        </FilterModal>
      )}
    </Box>
  );
}
