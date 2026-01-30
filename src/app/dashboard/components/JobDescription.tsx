import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Card,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
} from "@mui/material";
import Link from "next/link";
import ClockIcon from "@mui/icons-material/AccessTime";
import FlashIcon from "@mui/icons-material/BoltSharp";
import LocationIcon from "@mui/icons-material/LocationOnOutlined";
import WorkOutline from "@mui/icons-material/WorkOutline";
import Edit from "@mui/icons-material/Edit";

// Types
interface JobDetails {
  title: string;
  about_role: string;
  job_type: string;
  work_model: string;
  location: string;
  responsibilities?: string;
  expectations?: string;
  stage_counts: {
    new: number;
    skill_assessment: number;
    interviews: number;
    acceptance: number;
    archived: number;
  };
  requirements?: string[];
  experience_level?: string;
  status: string;
  skills?: string[];
}

interface JobDescriptionProps {
  jobDetails: JobDetails | null;
  loading: boolean;
  error: string | null;
  getJobId: () => string;
  setError: (error: string | null) => void;
  setPrimaryTabValue: (value: number) => void;
}

const JobDescription = ({
  jobDetails,
  loading,
  error,
  getJobId,
  setError,
  setPrimaryTabValue,
}: JobDescriptionProps) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          Error loading job details
        </Typography>
        <Typography color="textSecondary">{error}</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            setError(null);
            setPrimaryTabValue(1);
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const jobData = jobDetails;

  return (
    <Stack direction={{ xs: "column", lg: "row" }} gap={{ xs: 2, lg: 4 }}>
      <Card
        sx={{
          boxShadow: "none",
          width: { xs: "100%", lg: 308 },
          height: "auto",
          borderRadius: 2,
          overflow: "visible",
          p: 3,
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          color="rgba(17, 17, 17, 0.92)"
          mb={2}
          sx={{
            color: "rgba(17, 17, 17, 0.92)",
            textTransform: "capitalize",
            fontSize: { xs: "20px", lg: "24px" },
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: "0.12px",
          }}
        >
          {jobData?.title || ""}
        </Typography>

        <Stack spacing={2} mb={3}>
          <Chip
            icon={<ClockIcon />}
            label={jobData?.job_type}
            sx={{
              bgcolor: "#FCEBE3",
              color: "#724A3B",
              borderRadius: "28px",
              height: 36,
              width: "fit-content",
              "& .MuiChip-label": {
                fontSize: 14,
                fontWeight: 400,
              },
              "& .MuiChip-icon": {
                color: "#724A3B",
              },
            }}
          />
          <Chip
            icon={<LocationIcon />}
            label={jobData?.work_model}
            sx={{
              bgcolor: "#F9E8F3",
              color: "#76325F",
              borderRadius: "28px",
              height: 36,
              width: "fit-content",
              "& .MuiChip-label": {
                fontSize: 14,
                fontWeight: 400,
              },
              "& .MuiChip-icon": {
                color: "#76325F",
              },
            }}
          />
          <Chip
            icon={<LocationIcon />}
            label={jobData?.location?.split(" ")?.join(", ")}
            sx={{
              bgcolor: "#D7EEF4",
              color: "#2B656E",
              borderRadius: "28px",
              height: 36,
              width: "fit-content",
              "& .MuiChip-label": {
                fontSize: 14,
                fontWeight: 400,
              },
              "& .MuiChip-icon": {
                color: "#2B656E",
              },
            }}
          />
        </Stack>

        <Divider sx={{ width: "100%", my: 2 }} />

        {jobData?.experience_level && (
          <Stack spacing={2.5} mt={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <FlashIcon sx={{ color: "#00C853", width: 20, height: 20 }} />
              <Typography fontWeight={500} color="rgba(17, 17, 17, 0.84)" fontSize={16}>
                {jobData?.experience_level}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* Skills Section */}
        {jobData?.skills && jobData.skills.length > 0 && (
          <>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} color="rgba(17, 17, 17, 0.92)" mb={1.5} fontSize={16}>
                Skills Required
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {jobData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: "rgba(68, 68, 226, 0.08)",
                      color: "#4444E2",
                      borderRadius: "16px",
                      height: 28,
                      "& .MuiChip-label": {
                        fontSize: 13,
                        fontWeight: 500,
                        px: 1.5,
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Card>
      <Paper
        elevation={0}
        sx={{
          width: { xs: "100%", lg: 956 },
          height: { xs: "auto" },
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
          p: { xs: 2, lg: 4 },
        }}
      >
        <Card
          sx={{
            boxShadow: "none",
            borderRadius: 2,
            overflow: "hidden",
            pt: 3,
            display: { xs: "flex", lg: "none" },
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            color="rgba(17, 17, 17, 0.92)"
            mb={2}
            sx={{
              color: "rgba(17, 17, 17, 0.92)",
              textTransform: "capitalize",
              fontSize: { xs: "20px", lg: "24px" },
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "0.12px",
            }}
          >
            {jobData?.title || ""}
          </Typography>

          <Stack spacing={2} mb={3} direction="row" flexWrap="wrap" gap={1}>
            <Chip
              icon={<ClockIcon />}
              label={jobData?.job_type}
              sx={{
                bgcolor: "#FCEBE3",
                color: "#724A3B",
                borderRadius: "28px",
                height: 36,
                width: "fit-content",
                "& .MuiChip-label": {
                  fontSize: 14,
                  fontWeight: 400,
                },
                "& .MuiChip-icon": {
                  color: "#724A3B",
                },
              }}
            />
            <Chip
              icon={<LocationIcon />}
              label={jobData?.work_model}
              sx={{
                bgcolor: "#F9E8F3",
                color: "#76325F",
                borderRadius: "28px",
                height: 36,
                width: "fit-content",
                "& .MuiChip-label": {
                  fontSize: 14,
                  fontWeight: 400,
                },
                "& .MuiChip-icon": {
                  color: "#76325F",
                },
              }}
            />
            <Chip
              icon={<LocationIcon />}
              label={jobData?.location?.split(" ")?.join(", ")}
              sx={{
                bgcolor: "#D7EEF4",
                color: "#2B656E",
                borderRadius: "28px",
                height: 36,
                width: "fit-content",
                "& .MuiChip-label": {
                  fontSize: 14,
                  fontWeight: 400,
                },
                "& .MuiChip-icon": {
                  color: "#2B656E",
                },
              }}
            />
          </Stack>

          {jobData?.experience_level && (
            <Stack spacing={2.5} mt={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <FlashIcon sx={{ color: "#00C853", width: 20, height: 20 }} />
                <Typography fontWeight={500} color="rgba(17, 17, 17, 0.84)" fontSize={16}>
                  {jobData?.experience_level} Level
                </Typography>
              </Box>
            </Stack>
          )}

          {/* Skills Section - Mobile */}
          {jobData?.skills && jobData.skills.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} color="rgba(17, 17, 17, 0.92)" mb={1} fontSize={14}>
                Skills Required
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {jobData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: "rgba(68, 68, 226, 0.08)",
                      color: "#4444E2",
                      borderRadius: "16px",
                      height: 24,
                      "& .MuiChip-label": {
                        fontSize: 12,
                        fontWeight: 500,
                        px: 1,
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          <Divider sx={{ width: "100%", my: 2 }} />
        </Card>
        {/* Icon */}
        <Box
          sx={{
            width: { xs: 80, lg: 108 },
            height: { xs: 80, lg: 108 },
            bgcolor: "#e6f9f1",
            borderRadius: "80px",
            display: { xs: "none", lg: "flex" },
            justifyContent: "center",
            alignItems: "center",
            border: "0.8px solid rgba(67, 67, 225, 0.12)",
            mb: { xs: 2, lg: 4 },
          }}
        >
          <WorkOutline sx={{ width: { xs: 36, lg: 48 }, height: { xs: 36, lg: 48 } }} />
        </Box>

        {/* Edit Button */}
        <Link href={`/dashboard/create-job-posting/${getJobId()}?step=1`}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            sx={{
              position: "absolute",
              top: { xs: 16, lg: 32 },
              right: { xs: 16, lg: 32 },
              bgcolor: "#f4f4f6",
              color: "rgba(17, 17, 17, 0.84)",
              textTransform: "none",
              borderRadius: 2,
              border: "0.5px solid rgba(17, 17, 17, 0.08)",
              py: 1.25,
              px: 2.5,
              "&:hover": {
                bgcolor: "#e8e8ea",
              },
            }}
          >
            Edit
          </Button>
        </Link>

        {/* About the Role Section */}
        <Box sx={{ mb: { xs: 3, lg: 4 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "rgba(17, 17, 17, 0.92)",
              fontSize: { xs: 18, lg: 20 },
              mb: 1.5,
              letterSpacing: "0.1px",
              lineHeight: "20px",
            }}
          >
            About the Role
          </Typography>
          <Typography
            component="div"
            variant="body1"
            dangerouslySetInnerHTML={{ __html: jobDetails?.about_role || "" }}
            sx={{
              color: "rgba(17, 17, 17, 0.84)",
              maxWidth: 800,
              letterSpacing: "0.15px",
              lineHeight: "1.5",
              fontSize: { xs: 14, lg: 16 },
            }}
          />
        </Box>

        <Divider sx={{ my: { xs: 2, lg: 3 } }} />

        {/* Job Responsibilities Section */}
        <Box sx={{ mb: { xs: 3, lg: 4 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "rgba(17, 17, 17, 0.92)",
              fontSize: { xs: 18, lg: 20 },
              mb: 1.5,
              letterSpacing: "0.1px",
              lineHeight: "20px",
            }}
          >
            Job Responsibilities
          </Typography>
          <Box
            component="div"
            dangerouslySetInnerHTML={{ __html: jobData?.responsibilities || "" }}
            sx={{
              "& ul": {
                marginBlockStart: 0,
                paddingInlineStart: "20px !important",
                "& li": {
                  display: "list-item",
                  listStyleType: "disc",
                  p: 0,
                  pb: 0.5,
                  color: "rgba(17, 17, 17, 0.84)",
                  letterSpacing: "0.16px",
                  lineHeight: "24px",
                  fontSize: { xs: 14, lg: 16 },
                },
              },
            }}
          />
        </Box>

        <Divider sx={{ my: { xs: 2, lg: 3 } }} />

        {/* Expectations Section */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "rgba(17, 17, 17, 0.92)",
              fontSize: { xs: 18, lg: 20 },
              mb: 1.5,
              letterSpacing: "0.1px",
              lineHeight: "20px",
            }}
          >
            Expectations of the Role
          </Typography>
          <List sx={{ maxWidth: 660, pl: 2 }}>
            {(jobData?.requirements || jobData?.expectations?.split("|||"))?.map((expectation, index) => (
              <ListItem
                key={index}
                sx={{
                  display: "list-item",
                  listStyleType: "disc",
                  p: 0,
                  pb: 0.5,
                }}
              >
                <ListItemText
                  primary={expectation}
                  primaryTypographyProps={{
                    variant: "body1",
                    sx: {
                      color: "rgba(17, 17, 17, 0.84)",
                      letterSpacing: "0.16px",
                      lineHeight: "24px",
                      fontSize: { xs: 14, lg: 16 },
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Stack>
  );
};

export default JobDescription;
