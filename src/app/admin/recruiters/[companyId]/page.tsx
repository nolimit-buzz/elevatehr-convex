"use client";

import React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Tabs,
  Tab,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
  styled,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";
import {
  UserIcon,
  BriefcaseIcon,
  ClockIcon,
  BuildingOffice2Icon,
  IdentificationIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useImpersonation } from "../../context/ImpersonationContext";
import { type MockJobRow } from "../../mock-data";
import EditRecruiterModal from "../../components/EditRecruiterModal";
import { ADMIN_CARD_SX } from "../../styles";
import { useAdminRecruiterDetails } from "@/queries/admin.queries";

const heroIconStyle = { width: 18, height: 18, color: "rgba(17,17,17,0.58)" };

const DetailTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: "20px 24px",
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

export default function RecruiterDeepDivePage() {
  const params = useParams();
  const router = useRouter();
  const { startImpersonation } = useImpersonation();
  const theme = useTheme();
  const companyId = params.companyId as string;
  const [tab, setTab] = React.useState(0);
  const [kpiPeriod, setKpiPeriod] = React.useState("6");

  const [jobMenuAnchorEl, setJobMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeJob, setActiveJob] = React.useState<MockJobRow | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const handleOpenJobMenu = (event: React.MouseEvent<HTMLElement>, job: MockJobRow) => {
    event.stopPropagation();
    setJobMenuAnchorEl(event.currentTarget);
    setActiveJob(job);
  };

  const handleCloseJobMenu = () => {
    setJobMenuAnchorEl(null);
    setActiveJob(null);
  };

  const handleViewJob = () => {
    if (!activeJob) return;
    router.push(`/admin/recruiters/${companyId}/jobs/${activeJob.id}`);
    handleCloseJobMenu();
  };

  const handleEditJob = () => {
    if (!activeJob) return;
    // Placeholder: open edit flow when implemented
    console.log("Edit job", activeJob.id);
    handleCloseJobMenu();
  };

  const handleToggleJobStatus = () => {
    if (!activeJob) return;
    // Placeholder: toggle between open/closed when backend is wired
    console.log(activeJob.status === "closed" ? "Reopen job" : "Close job", activeJob.id);
    handleCloseJobMenu();
  };

  const { details: recruiter, isLoading } = useAdminRecruiterDetails(companyId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Typography color="text.secondary">Loading recruiter details...</Typography>
      </Box>
    );
  }

  if (!recruiter) {
    return (
      <Box>
        <Typography color="text.secondary">Recruiter not found.</Typography>
        <Button onClick={() => router.push("/admin/recruiters")} sx={{ mt: 2 }} variant="contained">
          Back to Directory
        </Button>
      </Box>
    );
  }

  const stats = [
    { label: "Jobs", value: recruiter.totalJobs },
    { label: "Applicants", value: recruiter.totalCandidates },
    { label: "Assessments", value: recruiter.totalAssessments },
  ];

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          size="small"
          startIcon={<ArrowLeftIcon style={heroIconStyle} />}
          onClick={() => router.push("/admin/recruiters")}
          sx={{ mb: 2, textTransform: "none", fontWeight: 600, color: "text.secondary", padding: 0 }}
        >
          Back to Directory
        </Button>
        <Button
          variant="contained"
          startIcon={<UserIcon style={{ ...heroIconStyle, color: "white" }} />}
          onClick={() => startImpersonation(recruiter.companyName)}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
        >
          Login as this Recruiter
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left column: Snapshot + detail cards */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            elevation={0}
            sx={{
              ...ADMIN_CARD_SX,
              p: 3,
              mb: 2,
            }}
          >
            <Stack alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                src={recruiter.companyLogo}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: recruiter.companyLogo ? "transparent" : "action.hover",
                  border: recruiter.companyLogo ? "none" : "1px solid",
                  borderColor: recruiter.companyLogo ? "transparent" : "divider",
                }}
              >
                {!recruiter.companyLogo && <BuildingOffice2Icon style={heroIconStyle} />}
              </Avatar>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1.5, letterSpacing: "-0.01em" }}>
                {recruiter.companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recruiter.primaryAdmin}
              </Typography>
              <Chip
                size="small"
                label="Active"
                sx={{
                  mt: 1,
                  bgcolor: "success.light",
                  color: "success.dark",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
            </Stack>
            <DetailRow
              icon={<BuildingOffice2Icon style={heroIconStyle} />}
              label="Company"
              value={recruiter.companyName}
            />
            <DetailRow
              icon={<IdentificationIcon style={heroIconStyle} />}
              label="Primary Admin"
              value={recruiter.primaryAdmin}
            />
            <DetailRow icon={<CalendarDaysIcon style={heroIconStyle} />} label="Joined" value={recruiter.joinedAt} />
            <DetailRow icon={<EnvelopeIcon style={heroIconStyle} />} label="Email" value={recruiter.email} />
            <Button
              variant="contained"
              fullWidth
              startIcon={<PencilSquareIcon style={{ ...heroIconStyle, color: "white" }} />}
              sx={{
                mt: 2,
                py: 1.25,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
              }}
              onClick={() => setEditOpen(true)}
            >
              Edit Recruiter Detail
            </Button>
          </Paper>
        </Grid>

        {/* Right column: Personal info + KPI + tabs content */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            elevation={0}
            sx={{
              ...ADMIN_CARD_SX,
              p: 3,
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recruiter Dashboard Snapshot
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Key metrics for this recruiter.
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {stats.map((s) => (
                <Box
                  key={s.label}
                  sx={{
                    p: 2,
                    minWidth: 200,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h2" fontWeight={700} color="primary.main" sx={{ letterSpacing: "-0.02em" }}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              ...ADMIN_CARD_SX,
              p: 3,
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              KPI Performance
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Assessment and hiring metrics.
              </Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={kpiPeriod}
                  label="Period"
                  onChange={(e) => setKpiPeriod(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="6">Last 6 months</MenuItem>
                  <MenuItem value="3">Last 3 months</MenuItem>
                  <MenuItem value="1">Last month</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ letterSpacing: "-0.02em" }}>
              94.64%
            </Typography>
            <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600 }}>
              +12.4% from previous period
            </Typography>
            <Box
              sx={{
                mt: 2,
                height: 120,
                borderRadius: 2,
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "flex-end",
                gap: 0.5,
                p: 1.5,
              }}
            >
              {[72, 85, 98, 88, 91, 94].map((v, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: `${v}%`,
                    bgcolor: i === 2 ? "primary.main" : "divider",
                    borderRadius: 2,
                    minHeight: 24,
                  }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              KPI trends have remained stable over the past six months with a peak in February.
            </Typography>
          </Paper>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 2,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
            }}
          >
            <Tab
              label="Audit Log"
              icon={
                <ClockIcon
                  style={{
                    ...heroIconStyle,
                    color: tab === 0 ? theme.palette.primary.main : heroIconStyle.color,
                  }}
                />
              }
              iconPosition="start"
            />
            {/* <Tab label="Candidates" icon={<UserIcon style={heroIconStyle} />} iconPosition="start" /> */}
            <Tab
              label="Jobs"
              icon={
                <BriefcaseIcon
                  style={{
                    ...heroIconStyle,
                    color: tab === 1 ? theme.palette.primary.main : heroIconStyle.color,
                  }}
                />
              }
              iconPosition="start"
            />
          </Tabs>

          {tab === 0 && (
            <>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  ...ADMIN_CARD_SX,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <DetailTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Time</DetailTableCell>
                      <DetailTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Action</DetailTableCell>
                      <DetailTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Details</DetailTableCell>
                      <DetailTableCell sx={{ fontWeight: 600, color: "text.primary" }}>User</DetailTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recruiter.recentActivity.length === 0 ? (
                      <TableRow>
                        <DetailTableCell colSpan={4} align="center">
                          No recent activity found.
                        </DetailTableCell>
                      </TableRow>
                    ) : (
                      recruiter.recentActivity.map((entry) => (
                        <TableRow key={entry.id} sx={{ height: 72 }}>
                          <DetailTableCell>{new Date(entry.date).toLocaleString()}</DetailTableCell>
                          <DetailTableCell>{entry.action}</DetailTableCell>
                          <DetailTableCell>{entry.details}</DetailTableCell>
                          <DetailTableCell>{recruiter.primaryAdmin}</DetailTableCell>
                        </TableRow>
                      ))
                    )}
                    <TableRow>
                      <DetailTableCell colSpan={4} sx={{ borderBottom: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            size="small"
                            onClick={() => router.push(`/admin/recruiters/${companyId}/activity-logs`)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 500,
                              color: "text.secondary",
                              minWidth: 0,
                              px: 0,
                              "&:hover": { bgcolor: "transparent", color: "text.primary" },
                            }}
                            endIcon={<ChevronRightIcon style={{ width: 16, height: 16 }} />}
                          >
                            View more
                          </Button>
                        </Box>
                      </DetailTableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {tab === 1 && (
            <>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  ...ADMIN_CARD_SX,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <DetailTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Job Title</DetailTableCell>
                      <DetailTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Status</DetailTableCell>
                      <DetailTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Created</DetailTableCell>
                      <DetailTableCell align="right" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Actions
                      </DetailTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recruiter.jobs.length === 0 ? (
                      <TableRow>
                        <DetailTableCell colSpan={4} align="center">
                          No jobs found.
                        </DetailTableCell>
                      </TableRow>
                    ) : (
                      recruiter.jobs.slice(0, 5).map((j) => (
                        <TableRow key={j.id} sx={{ height: 72 }}>
                          <DetailTableCell>{j.title}</DetailTableCell>
                          <DetailTableCell>
                            <Chip
                              size="small"
                              label={j.status}
                              sx={{
                                borderRadius: 2,
                                bgcolor:
                                  j.status === "active"
                                    ? "success.dark"
                                    : j.status === "closed"
                                      ? "error.dark"
                                      : "action.hover",
                                color:
                                  j.status === "active" || j.status === "closed" ? "common.white" : "text.secondary",
                              }}
                            />
                          </DetailTableCell>
                          <DetailTableCell>{j.postedDate}</DetailTableCell>
                          <DetailTableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenJobMenu(e, j as any)}
                              sx={{
                                color: "text.secondary",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                "&:hover": { bgcolor: "action.hover" },
                              }}
                            >
                              <EllipsisHorizontalIcon style={{ width: 18, height: 18 }} />
                            </IconButton>
                          </DetailTableCell>
                        </TableRow>
                      ))
                    )}
                    <TableRow>
                      <DetailTableCell colSpan={4} sx={{ borderBottom: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            size="small"
                            onClick={() => router.push(`/admin/recruiters/${companyId}/jobs`)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 500,
                              color: "text.secondary",
                              minWidth: 0,
                              px: 0,
                              "&:hover": { bgcolor: "transparent", color: "text.primary" },
                            }}
                            endIcon={<ChevronRightIcon style={{ width: 16, height: 16 }} />}
                          >
                            View more
                          </Button>
                        </Box>
                      </DetailTableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          <Menu
            anchorEl={jobMenuAnchorEl}
            open={Boolean(jobMenuAnchorEl)}
            onClose={handleCloseJobMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                ...ADMIN_CARD_SX,
                minWidth: 150,
                p: 0.25,
              },
            }}
          >
            <MenuItem dense onClick={handleViewJob} sx={{ py: 0.5, px: 1.25 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EyeIcon style={{ width: 16, height: 16, color: heroIconStyle.color }} />
                <Typography variant="body2">View</Typography>
              </Box>
            </MenuItem>
            <MenuItem dense onClick={handleEditJob} sx={{ py: 0.5, px: 1.25 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PencilSquareIcon style={{ width: 16, height: 16, color: heroIconStyle.color }} />
                <Typography variant="body2">Edit</Typography>
              </Box>
            </MenuItem>
            <MenuItem dense onClick={handleToggleJobStatus} sx={{ py: 0.5, px: 1.25 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {activeJob?.status === "closed" ? (
                  <ArrowPathIcon style={{ width: 16, height: 16, color: heroIconStyle.color }} />
                ) : (
                  <XMarkIcon style={{ width: 16, height: 16, color: heroIconStyle.color }} />
                )}
                <Typography variant="body2">{activeJob?.status === "closed" ? "Reopen" : "Close"}</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>

      <EditRecruiterModal open={editOpen} onClose={() => setEditOpen(false)} recruiter={recruiter} />
    </Box>
  );
}
