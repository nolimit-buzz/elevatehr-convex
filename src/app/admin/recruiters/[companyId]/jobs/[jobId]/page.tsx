"use client";

import React from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  TextField,
  Divider,
  Checkbox,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../../../../styles";
import { MOCK_JOBS, MOCK_RECRUITERS, MOCK_CANDIDATES, type MockCandidate } from "../../../../mock-data";

const heroIconStyle = { width: 18, height: 18, color: "rgba(17,17,17,0.58)" };

const JOB_DETAILS: Record<
  string,
  {
    employmentType: string;
    workMode: string;
    location: string;
    skills: string[];
    about: string;
    responsibilities: string[];
  }
> = {
  j1: {
    employmentType: "Full‑time",
    workMode: "Onsite",
    location: "Lagos, Nigeria",
    skills: [
      "React",
      "TypeScript",
      "UI Engineering",
      "Testing",
      "Design Systems",
      "Performance",
    ],
    about:
      "As a Senior Frontend Developer, you will shape the candidate and recruiter experience across our platform. You will collaborate with product, design, and backend teams to ship accessible, performant interfaces that feel delightful to use.",
    responsibilities: [
      "Design, build, and maintain React/TypeScript frontends used by recruiters and candidates.",
      "Work closely with designers to translate Figma files into high‑quality, pixel‑perfect interfaces.",
      "Improve performance, accessibility, and reliability of existing features.",
      "Partner with backend engineers to define APIs and data contracts.",
      "Contribute to our shared component library and design system.",
    ],
  },
  j2: {
    employmentType: "Full‑time",
    workMode: "Remote",
    location: "Remote, GMT+1/+2",
    skills: [
      "Node.js",
      "API Design",
      "PostgreSQL",
      "Microservices",
      "Monitoring",
      "Security",
    ],
    about:
      "As a Backend Engineer, you will own core services that power assessments, applications, and recruiter workflows. You will design APIs that are secure, scalable, and easy to evolve.",
    responsibilities: [
      "Design and implement backend services in Node.js with a focus on reliability and observability.",
      "Collaborate with frontend engineers to design clear, well‑versioned APIs.",
      "Optimize database schemas and queries for performance.",
      "Implement monitoring, alerting, and automated tests for new features.",
    ],
  },
  j3: {
    employmentType: "Contract",
    workMode: "Hybrid",
    location: "Lagos, Nigeria",
    skills: [
      "AWS",
      "Kubernetes",
      "CI/CD",
      "Observability",
      "Security",
      "Scripting",
    ],
    about:
      "As a DevOps Engineer, you will be responsible for the health of our infrastructure and CI/CD pipelines. You will enable teams to ship confidently and frequently.",
    responsibilities: [
      "Maintain and evolve our cloud infrastructure and deployment pipelines.",
      "Work with engineering teams to design reliable, observable services.",
      "Improve security, backups, and disaster‑recovery processes.",
    ],
  },
};

export default function RecruiterJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;
  const jobId = params.jobId as string;

  const job = MOCK_JOBS.find((j) => j.id === jobId);
  const recruiter = MOCK_RECRUITERS.find((r) => r.id === companyId);
  const [tab, setTab] = React.useState<0 | 1>(1);

  const allCandidatesForJob: MockCandidate[] = React.useMemo(
    () => MOCK_CANDIDATES.filter((c) => c.jobTitle === job?.title),
    [job?.title],
  );
  const [applicationsStage, setApplicationsStage] = React.useState(0);

  const detail = JOB_DETAILS[jobId] ?? {
    employmentType: "Full‑time",
    workMode: "Onsite",
    location: recruiter ? `Office location for ${recruiter.companyName}` : "Onsite",
    skills: [],
    about:
      "This role was created as part of our mock data set. You can update this copy once real job descriptions are wired in.",
    responsibilities: [],
  };

  if (!job) {
    return (
      <Box sx={{ width: "100%", pb: 4 }}>
        <Button
          size="small"
          startIcon={<ArrowLeftIcon style={heroIconStyle} />}
          onClick={() => router.push(`/admin/recruiters/${companyId}/jobs`)}
          sx={{ mb: 2, textTransform: "none", fontWeight: 600, color: "text.secondary", px: 0 }}
        >
          Back to jobs
        </Button>
        <Typography color="text.secondary">Job not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            size="small"
            startIcon={<ArrowLeftIcon style={heroIconStyle} />}
            onClick={() => router.push(`/admin/recruiters/${companyId}/jobs`)}
            sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary", px: 0 }}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight={700}>
            {job.title}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
          variant="contained"
          color="primary"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 999,
            px: 2.5,
            boxShadow: "none",
            "&:hover": { boxShadow: "none", bgcolor: "primary.dark" },
          }}
          >
            Publish job
          </Button>
          <Button
          variant="contained"
            color="error"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 999,
            px: 2.5,
            boxShadow: "none",
            "&:hover": { boxShadow: "none", bgcolor: "error.dark" },
          }}
          >
            Delete job
          </Button>
        </Stack>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
        }}
      >
        <Tab label="Applications" />
        <Tab label="Job description" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                ...ADMIN_CARD_SX,
                p: 2.5,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Filters
                </Typography>
                <Button size="small" sx={{ textTransform: "none", fontSize: "0.75rem", px: 0 }}>
                  Clear
                </Button>
              </Box>

              <Stack spacing={2}>
                <TextField label="Years of experience" size="small" fullWidth select SelectProps={{ native: true }}>
                  <option value="" />
                  <option value="0-1">0 - 1 year</option>
                  <option value="2-4">2 - 4 years</option>
                  <option value="5+">5+ years</option>
                </TextField>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: "0.8rem" }}>
                    Salary expectation
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField size="small" label="Min" fullWidth />
                    <TextField size="small" label="Max" fullWidth />
                  </Stack>
                </Box>

                <TextField label="Required skills" size="small" fullWidth placeholder="Search or add skills" />

                <Divider sx={{ my: 1 }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: "0.8rem" }}>
                    Availability
                  </Typography>
                  <Stack spacing={0.5}>
                    <Box>
                      <Checkbox size="small" sx={{ p: 0.5 }} />
                      <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                        Immediately
                      </Typography>
                    </Box>
                    <Box>
                      <Checkbox size="small" sx={{ p: 0.5 }} />
                      <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                        In a week
                      </Typography>
                    </Box>
                    <Box>
                      <Checkbox size="small" sx={{ p: 0.5 }} />
                      <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                        In a month
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 999, mt: 1 }}
                >
                  Apply filter
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{
                ...ADMIN_CARD_SX,
                p: 2.5,
              }}
            >
              <Tabs
                value={applicationsStage}
                onChange={(_, v) => setApplicationsStage(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 2,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    minHeight: 40,
                  },
                }}
              >
                <Tab label={`All (${allCandidatesForJob.length})`} />
                <Tab label="Application review" />
                <Tab label="Skill assessment" />
                <Tab label="Interviews" />
                <Tab label="Acceptance" />
                <Tab label="Archived" />
              </Tabs>

              <Stack spacing={1.5}>
                {allCandidatesForJob.map((candidate) => (
                  <Box
                    key={candidate.id}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      p: 2,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    <Checkbox size="small" sx={{ mt: 0.5 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {candidate.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {candidate.jobTitle}
                          </Typography>
                        </Box>
                        <Chip
                          label={candidate.stage.replace("_", " ")}
                          size="small"
                          sx={{
                            borderRadius: 999,
                            bgcolor: "success.light",
                            color: "success.dark",
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        Applied on {candidate.appliedAt}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label="Communication"
                          size="small"
                          sx={{ borderRadius: 999, bgcolor: "action.hover", color: "text.secondary" }}
                        />
                        <Chip
                          label="Problem solving"
                          size="small"
                          sx={{ borderRadius: 999, bgcolor: "action.hover", color: "text.secondary" }}
                        />
                        <Chip
                          label="React"
                          size="small"
                          sx={{ borderRadius: 999, bgcolor: "action.hover", color: "text.secondary" }}
                        />
                      </Stack>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<ChevronDownIcon style={{ width: 16, height: 16 }} />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        borderRadius: 999,
                        borderColor: "divider",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Quick actions
                    </Button>
                  </Box>
                ))}

                {!allCandidatesForJob.length && (
                  <Typography variant="body2" color="text.secondary">
                    No applications for this job yet.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Paper
          elevation={0}
          sx={{
            ...ADMIN_CARD_SX,
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {job.title}
            </Typography>
            <Button
              size="small"
              startIcon={<PencilSquareIcon style={heroIconStyle} />}
              sx={{ textTransform: "none", fontWeight: 500, borderRadius: 2 }}
            >
              Edit
            </Button>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
            <Chip
              icon={<BriefcaseIcon style={heroIconStyle} />}
              label={detail.employmentType}
              size="small"
              sx={{ borderRadius: 999, "& .MuiChip-icon": { ml: 0.5 } }}
            />
            <Chip
              icon={<ClockIcon style={heroIconStyle} />}
              label={detail.workMode}
              size="small"
              sx={{ borderRadius: 999, "& .MuiChip-icon": { ml: 0.5 } }}
            />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <MapPinIcon style={heroIconStyle} />
            <Typography variant="body2" color="text.secondary">
              {detail.location}
            </Typography>
          </Stack>

          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: "text.secondary",
            }}
          >
            Skills required
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {detail.skills.length ? (
              detail.skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    bgcolor: "action.hover",
                    color: "text.secondary",
                  }}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                Add required skills for this job.
              </Typography>
            )}
          </Stack>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            About the role
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {detail.about}
          </Typography>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Job responsibilities
          </Typography>
          {detail.responsibilities.length ? (
            <Stack component="ul" sx={{ pl: 2, m: 0, listStyleType: "disc" }} spacing={0.75}>
              {detail.responsibilities.map((item) => (
                <Box component="li" key={item}>
                  <Typography variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Outline the key responsibilities for this position so candidates understand expectations.
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}

