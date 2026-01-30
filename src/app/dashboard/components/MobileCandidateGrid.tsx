import React from "react";
import { Grid, Paper, Box, Checkbox, Typography, Button, Stack, Chip, CircularProgress } from "@mui/material";
import Link from "next/link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { PHASE_OPTIONS } from "@/app/constants/phaseOptions";
import { useTheme } from "@mui/material/styles";
import { Theme } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Candidate, StageType, SkillColor } from "@/app/dashboard/types/candidate";

interface MobileCandidateGridProps {
  candidates: Candidate[];
  selectedEntries: string[];
  subTabValue: number;
  isMovingStage: string;
  getStageValue: (tabValue: number) => StageType;
  handleSelectCandidate: (id: string | number) => void;
  handleCardClick: (candidateId: string | number, event: React.MouseEvent<HTMLElement>) => void;
  handleUpdateStages: (action: string, entries?: (string | number)[]) => void;
  getSkillChipColor: (skill: string) => SkillColor;
  theme: Theme;
}

const MobileCandidateGrid: React.FC<MobileCandidateGridProps> = ({
  candidates,
  selectedEntries,
  subTabValue,
  isMovingStage,
  getStageValue,
  handleSelectCandidate,
  handleCardClick,
  handleUpdateStages,
  getSkillChipColor,
  theme,
}) => {
  return (
    <Grid
      container
      spacing={2}
      sx={{
        display: { xs: "flex", lg: "none", marginLeft: "0px" },
      }}
    >
      {candidates.map((candidate) => (
        <Grid item xs={12} sm={6} key={candidate.id}>
          <Paper
            elevation={0}
            sx={{
              height: "100%",
              p: { xs: 2, sm: 3 },
              backgroundColor: "#fff",
              borderRadius: 2,
              border: "1px solid rgba(0, 0, 0, 0.12)",
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.5, sm: 2 },
              minHeight: { xs: "380px", sm: "420px" },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {subTabValue !== 3 && candidates.length !== 1 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={selectedEntries.includes(String(candidate.id))}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectCandidate(candidate.id);
                    }}
                    sx={{
                      padding: "0px",
                      color: theme.palette.grey[200],
                      "&.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "rgba(17, 17, 17, 0.92)",
                        fontSize: { xs: "14px", sm: "16px" },
                        mb: 0.5,
                      }}
                    >
                      {candidate.personal_info?.firstname} {candidate.personal_info?.lastname}
                    </Typography>
                  </Box>
                </Box>
              )}
              {(subTabValue === 3 || candidates.length === 1) && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "rgba(17, 17, 17, 0.92)",
                      fontSize: { xs: "16px", sm: "18px" },
                      mb: 0.5,
                    }}
                  >
                    {candidate.name}
                  </Typography>
                </Box>
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(candidate.id, e as any);
                }}
                sx={{
                  color: "rgba(17, 17, 17, 0.84)",
                  textDecoration: "underline",
                  textTransform: "none",
                  fontSize: { xs: "12px", sm: "14px" },
                  p: 0,
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                View
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Experience SVG and text */}
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
                <Typography variant="body2" sx={{ color: "rgba(17, 17, 17, 0.48)", fontSize: "14px" }}>
                  {candidate?.cv_analysis?.experience_years} experience
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Availability SVG and text */}
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
                <Typography variant="body2" sx={{ color: "rgba(17, 17, 17, 0.48)", fontSize: "14px" }}>
                  Available{" "}
                  {candidate.professional_info?.start_date
                    ? new Date(candidate.professional_info.start_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not specified"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {(Array.isArray(candidate.professional_info?.skills)
                ? candidate.professional_info?.skills
                : candidate.professional_info?.skills?.split(",")
              )?.map((skill: string, index: number) => (
                <Chip
                  key={index}
                  label={skill.trim()}
                  title={skill.trim()}
                  size="small"
                  sx={{
                    bgcolor: getSkillChipColor(skill).bg,
                    color: getSkillChipColor(skill).color,
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

            <Box sx={{ mt: 2, display: "flex", flexDirection: { xs: "column" }, gap: 1 }}>
              {PHASE_OPTIONS[getStageValue(subTabValue)]?.map((option) => (
                <Button
                  key={option.action}
                  variant="outlined"
                  startIcon={isMovingStage === option.action ? <CircularProgress size={20} /> : <option.icon />}
                  onClick={() => handleUpdateStages(option.action, [candidate.id])}
                  disabled={isMovingStage.length > 0}
                  fullWidth
                  sx={{
                    color: "rgba(17, 17, 17, 0.84)",
                    borderColor: "rgba(17, 17, 17, 0.12)",
                    "&:hover": {
                      borderColor: "rgba(17, 17, 17, 0.24)",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.12)",
                      color: "rgba(0, 0, 0, 0.26)",
                    },
                    height: { xs: "36px", sm: "40px" },
                    "& .MuiButton-startIcon": {
                      marginRight: { xs: "4px", sm: "8px" },
                    },
                  }}
                >
                  {isMovingStage ? "Moving..." : option.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default MobileCandidateGrid;
