import ClockIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ChevronDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoneyIcon from "@mui/icons-material/MonetizationOnOutlined";
import ArrowUpRightIcon from "@mui/icons-material/OpenInNew";
import UserSearchIcon from "@mui/icons-material/PersonSearchOutlined";
import BriefcaseIcon from "@mui/icons-material/WorkOutline";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Link,
  Paper,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import React, { useState } from "react";
import NextLink from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArchiveIcon from "@mui/icons-material/Archive";
import { PHASE_OPTIONS } from "@/app/constants/phaseOptions";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";
import { PhaseOption as CandidatePhaseOption } from "@/app/dashboard/types/candidate";
import { CompanyApplication } from "@/queries/applications.queries";

interface PhaseOption {
  label: string;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string };
  action: string;
  id?: string;
}

// Define valid stage types
type StageType = "new" | "skill_assessment" | "archived" | "acceptance" | "interviews";

// Update the props interface
interface CandidateListSectionProps {
  isQuickActionsVisible?: boolean;
  isCheckboxVisible?: boolean;
  candidate: CompanyApplication;
  isSelected: boolean;
  onSelectCandidate: (id: string | number) => void;
  setSelectedEntries: (entries: string[]) => void;
  selectedEntries: string[];
  onUpdateStages: (action: string) => void;
  // disableSelection?: boolean;
  currentStage: StageType;
  onNotification?: (message: string, severity: "success" | "error") => void;
  phaseOptions: Record<StageType, CandidatePhaseOption[]>;
}

// At the top of your file or in a types file
type Skill = string;

export default function CandidateListSection({
  isQuickActionsVisible,
  isCheckboxVisible,
  candidate,
  isSelected,
  onSelectCandidate,
  setSelectedEntries,
  selectedEntries,
  onUpdateStages,
  // disableSelection,
  currentStage,
  onNotification,
  phaseOptions,
}: CandidateListSectionProps) {
  const router = useRouter();
  const theme = useTheme();
  const rawSkills = candidate?.professional_info?.skills;
  const skills: Skill[] = (
    Array.isArray(rawSkills)
      ? rawSkills
      : typeof rawSkills === "string"
        ? rawSkills.split(",").map((s) => s.trim())
        : []
  ).filter((skill: string) => skill.length > 0);

  // Candidate info data for mapping
  const candidateInfo = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      ),
      text: candidate?.cv_analysis?.experience_years
        ? candidate?.cv_analysis?.experience_years + " experience"
        : "Not available",
    },
    // {
    //   icon: <MoneyIcon fontSize="small" />,
    //   text: candidate?.professional_info?.salary_range,
    // },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      ),
      text: "Available " + candidate?.professional_info?.start_date.toLowerCase(),
    },
    // { icon: <UserSearchIcon fontSize="small" />, text: "Open to trial" },
  ];

  // Pastel colors for skill chips
  const skillColors = [
    { bg: "rgba(114, 74, 59, 0.15)", color: "#724A3B" },
    { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
    { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
    { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
  ];

  // Limit skills to 4
  const limitedSkills = skills.slice(0, 4);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    // Prevent redirection if clicking on checkbox or quick actions button
    if (
      (event.target as HTMLElement).closest(".checkbox-container") ||
      (event.target as HTMLElement).closest(".quick-actions-button")
    ) {
      return;
    }

    // Get the job_id from the URL
    const pathParts = window.location.pathname.split("/");
    const jobId = pathParts[pathParts.length - 2];
    // Navigate to the applicant details page
    // router.push(`/dashboard/job-posting/${jobId}/submissions/${candidate.id}`);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "#4CAF50"; // Excellent - Green
    if (score >= 75) return "#1CC47E"; // Good - Light Green
    if (score >= 60) return "#FFA000"; // Fair - Orange
    if (score >= 40) return "#FF6B6B"; // Poor - Light Red
    return "#F44336"; // Very Poor - Dark Red
  };

  // Replace PHASE_OPTIONS with phaseOptions prop in the component
  const options = phaseOptions[currentStage] || [];

  // Filter out assessment options that have already been sent
  const filteredOptions = options.filter((option) => {
    if (!option.action.startsWith("assessment_")) {
      return true; // Keep non-assessment options
    }

    // For assessment options, check if it's already been sent or submitted
    const assessmentType = option.action.replace("assessment_", "");
    const assessmentResult = candidate?.assessments_results?.[assessmentType];

    // Only keep the option if the assessment hasn't been sent or submitted
    return (
      !assessmentResult ||
      (assessmentResult.assessment_submission_status !== "submitted" && assessmentResult.assessment_status !== "sent")
    );
  });

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        p: 2,
        // borderBottom: "0.8px solid rgba(17, 17, 17, 0.08)",
        "&:hover": {
          backgroundColor: theme.palette.secondary.light,
          "& .quick-actions-button": {
            borderColor: "primary.main",
            backgroundColor: "transparent",
          },
        },
      }}
    >
      {/* {!disableSelection && ( */}
      {isCheckboxVisible && (
        <Box sx={{ p: 0 }} className="checkbox-container">
          <Checkbox
            sx={{ p: 0 }}
            onChange={() => onSelectCandidate(candidate.id)}
            checked={isSelected}
            icon={
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: 1,
                  border: "1px solid grey",
                }}
              />
            }
            checkedIcon={
              <Box
                sx={{
                  p: 0,
                  width: 16,
                  height: 16,
                  borderRadius: 1,
                  bgcolor: "secondary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon sx={{ fontSize: 12, color: "white" }} />
              </Box>
            }
          />
        </Box>
      )}
      {/* )} */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          position: "relative",
        }}
      >
        {/* Update Checkbox */}

        {/* Candidate name and chips row */}
        <Box sx={{ ml: "12px", display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(17, 17, 17, 0.92)",
              leadingTrim: "both",
              textEdge: "cap",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "100%",
              letterSpacing: "0.27px",
              textTransform: "capitalize",
            }}
          >
            {candidate?.personal_info?.firstname} {candidate?.personal_info?.lastname}
          </Typography>
          <Chip
            size="small"
            label={candidate?.cv_analysis ? `${candidate.cv_analysis.match_score}%` : "Not available"}
            sx={{
              backgroundColor: candidate?.cv_analysis
                ? getMatchScoreColor(candidate.cv_analysis.match_score)
                : "#9E9E9E",
              color: "white",
              fontWeight: 600,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
          {/* Add assessment status chips */}
          {candidate?.assessments_results &&
            Object.entries(candidate.assessments_results).map(([type, result]: [string, any]) => {
              if (result) {
                const status = result.assessment_submission_status || result.assessment_status;
                if (status) {
                  // Try to find a better label from phaseOptions
                  let assessmentName = "";
                  // Search through all stages in phaseOptions for a matching assessment ID
                  Object.values(phaseOptions).some((stageOptions) => {
                    const match = stageOptions.find((opt) => opt.id === result.assessment_id);
                    if (match) {
                      // Remove "Send " prefix if it exists to get just the title
                      assessmentName = match.label.replace(/^Send\s+/, "");
                      return true;
                    }
                    return false;
                  });

                  let label = assessmentName || `${type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}`;

                  const score = result.assessment_score ?? (candidate as any).assessment_score;
                  // Add score if available
                  if (score) {
                    label += ` (${score}%)`;
                  } else if (status === "sent") {
                    label += " (Sent)";
                  }

                  // Determine colors based on assessment type and status
                  let bgColor, textColor;
                  const isTechnical = type === "technical_assessment" || (result.assessment_type === "technical_assessment");

                  if (isTechnical) {
                    if (result.assessment_submission_link || status === "submitted") {
                      bgColor = "#E3F2FD"; // Light blue for technical assessment submitted
                      textColor = "#1976D2"; // Dark blue text
                    } else if (status === "sent") {
                      bgColor = "#FFF3E0"; // Light orange for sent
                      textColor = "#E65100"; // Dark orange text
                    } else {
                      bgColor = "#FFF3E0";
                      textColor = "#E65100";
                    }
                  } else {
                    // For other assessment types (like online assessment)
                    if (score) {
                      bgColor = "#E8F5E9"; // Light green for scored
                      textColor = "#2E7D32"; // Dark green text
                    } else if (status === "submitted") {
                      bgColor = "#E8F5E9";
                      textColor = "#2E7D32";
                    } else if (status === "sent") {
                      bgColor = "#E3F2FD";
                      textColor = "#1976D2";
                    } else {
                      bgColor = "#FFF3E0";
                      textColor = "#E65100";
                    }
                  }

                  const chip = (
                    <Chip
                      key={type}
                      size="small"
                      label={label}
                      sx={{
                        backgroundColor: bgColor,
                        color: textColor,
                        fontWeight: 500,
                        cursor: isTechnical ? "pointer" : "default",
                        textDecoration: isTechnical ? "underline" : "none",
                        "& .MuiChip-label": {
                          px: 1,
                        },
                      }}
                    />
                  );

                  if (isTechnical) {
                    return (
                      <NextLink
                        key={type}
                        href={`/dashboard/job-posting/${candidate.job_id}/submissions/${candidate.id}/assessment/${result.assessment_id}/grade`}
                        style={{ textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                        passHref
                      >
                        {chip}
                      </NextLink>
                    );
                  }

                  return chip;
                }
              }
              return null;
            })}
        </Box>

        {/* Candidate info row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3.5,
            mt: 1,
            ml: "12px",
          }}
        >
          {/* Map through candidate info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3.5 }}>
            {candidateInfo.map((item, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {item.icon}
                <Typography
                  sx={{
                    color: theme.palette.grey[200],
                    fontSize: 16,
                    lineHeight: "16px",
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Resume link */}
          <Link
            href={candidate?.attachments?.cv || ""}
            target="_blank"
            underline="always"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: theme.palette.grey[100],
              fontSize: 16,
              lineHeight: "16px",
              textDecoration: "underline",
              textDecorationColor: theme.palette.grey[100],
            }}
          >
            Resume <ArrowUpRightIcon sx={{ fontSize: 20 }} />
          </Link>
        </Box>

        {/* Skills chips */}
        <Box sx={{ display: "flex", gap: 1, mt: 2, ml: "12px", flexWrap: "wrap" }}>
          {limitedSkills.map((skill, index) => (
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

        {/* Quick Actions Button - Always visible */}
        {isQuickActionsVisible && (
          <Button
            variant="outlined"
            onClick={handleClick}
            endIcon={loadingStage ? <CircularProgress size={20} /> : <ChevronDownIcon />}
            className="quick-actions-button"
            disabled={loadingStage !== null}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              textTransform: "none",
              borderColor: "rgba(17, 17, 17, 0.4)",
              color: "rgba(17, 17, 17, 0.4)",
              borderRadius: "24px",
              transition: "all 0.2s ease-in-out",
              "&.Mui-disabled": {
                backgroundColor: "transparent",
              },
            }}
          >
            {loadingStage ? "Updating..." : "Quick actions"}
          </Button>
        )}
        {/* Quick Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {/* View Application Menu Item - Always shown */}
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              // handleCardClick(e as any);
              router.push(`/dashboard/job-posting/${candidate?.job_id}/submissions/${candidate.id}`);
              handleClose();
            }}
            disabled={loadingStage !== null}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 1.5,
              px: 2,
            }}
          >
            <ListItemIcon>
              <VisibilityIcon />
            </ListItemIcon>
            <ListItemText primary="View application" />
          </MenuItem>

          {/* Divider between View application and other actions */}
          <Divider />

          {/* Phase-specific options */}
          {filteredOptions.map((option: CandidatePhaseOption) => {
            // console.log("option", option);
            const IconComponent = option.icon;
            return (
              <MenuItem
                key={option.action}
                onClick={async (e) => {
                  e.stopPropagation();
                  handleClose();
                  setSelectedEntries([candidate.id]);
                  onUpdateStages(option.action);
                }}
                disabled={loadingStage !== null}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 1.5,
                  px: 2,
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={option.label} />
              </MenuItem>
            );
          })}
        </Menu>
      </Box>
    </Paper>
  );
}
