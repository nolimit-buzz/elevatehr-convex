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
} from "@mui/material";
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
} from "@heroicons/react/24/outline";
import { useImpersonation } from "../../context/ImpersonationContext";
import {
  MOCK_RECRUITER_DASHBOARD_SNAPSHOT,
  MOCK_AUDIT_LOG,
  MOCK_CANDIDATES,
  MOCK_JOBS,
  MOCK_RECRUITERS,
} from "../../mock-data";
import { ADMIN_CARD_SX, ADMIN_CARD_SHADOW } from "../../styles";

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
    <Box sx={{ color: "primary.main", mt: 0.25 }}>{icon}</Box>
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
  const companyId = params.companyId as string;
  const [tab, setTab] = React.useState(0);
  const [kpiPeriod, setKpiPeriod] = React.useState("6");

  const recruiter = MOCK_RECRUITERS.find((r) => r.id === companyId);
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
    { label: "Jobs", value: MOCK_RECRUITER_DASHBOARD_SNAPSHOT.activeJobs },
    { label: "Applicants", value: MOCK_RECRUITER_DASHBOARD_SNAPSHOT.totalApplicants },
    { label: "Interviews", value: MOCK_RECRUITER_DASHBOARD_SNAPSHOT.interviewsScheduled },
  ];

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Button
        size="small"
        startIcon={<ArrowLeftIcon style={{ width: 24, height: 24 }} />}
        onClick={() => router.push("/admin/recruiters")}
        sx={{ mb: 2, textTransform: "none", fontWeight: 600, color: "text.secondary" }}
      >
        Back to Directory
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
          Workforce Detail
        </Typography>
        <Button
          variant="contained"
          startIcon={<UserIcon style={{ width: 24, height: 24 }} />}
          onClick={() => startImpersonation(recruiter.companyName)}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, boxShadow: ADMIN_CARD_SHADOW }}
        >
          Login as this Recruiter
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left column: Snapshot + detail cards */}
        <Grid item xs={12} md={5} lg={4}>
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
                src={recruiter.logoUrl}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: recruiter.logoUrl ? "transparent" : "action.hover",
                  border: recruiter.logoUrl ? "none" : "1px solid",
                  borderColor: recruiter.logoUrl ? "transparent" : "divider",
                }}
              >
                {!recruiter.logoUrl && (
                  <BuildingOffice2Icon style={{ width: 32, height: 32, color: "rgba(17,17,17,0.58)" }} />
                )}
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
            <DetailRow icon={<BuildingOffice2Icon style={{ width: 24, height: 24 }} />} label="Company" value={recruiter.companyName} />
            <DetailRow icon={<IdentificationIcon style={{ width: 24, height: 24 }} />} label="Primary Admin" value={recruiter.primaryAdmin} />
            <DetailRow icon={<CalendarDaysIcon style={{ width: 24, height: 24 }} />} label="Joined" value={recruiter.createdAt} />
            <DetailRow icon={<EnvelopeIcon style={{ width: 24, height: 24 }} />} label="Email" value={recruiter.email} />
            <Button
              variant="contained"
              fullWidth
              startIcon={<PencilSquareIcon style={{ width: 24, height: 24 }} />}
              sx={{
                mt: 2,
                py: 1.25,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: ADMIN_CARD_SHADOW,
              }}
            >
              Edit Recruiter Detail
            </Button>
          </Paper>
        </Grid>

        {/* Right column: Personal info + KPI + tabs content */}
        <Grid item xs={12} md={7} lg={8}>
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
                    minWidth: 100,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ letterSpacing: "-0.02em" }}>
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Assessment and hiring metrics.
              </Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Period</InputLabel>
                <Select value={kpiPeriod} label="Period" onChange={(e) => setKpiPeriod(e.target.value)} sx={{ borderRadius: 2 }}>
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
            <Tab label="Audit Log" icon={<ClockIcon style={{ width: 24, height: 24 }} />} iconPosition="start" />
            <Tab label="Candidates" icon={<UserIcon style={{ width: 24, height: 24 }} />} iconPosition="start" />
            <Tab label="Jobs" icon={<BriefcaseIcon style={{ width: 24, height: 24 }} />} iconPosition="start" />
          </Tabs>

          {tab === 0 && (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                ...ADMIN_CARD_SX,
                overflow: "hidden",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_AUDIT_LOG.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{entry.action}</TableCell>
                      <TableCell>{entry.details}</TableCell>
                      <TableCell>{entry.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 1 && (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                ...ADMIN_CARD_SX,
                overflow: "hidden",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Job</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Applied</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_CANDIDATES.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.jobTitle}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={c.stage.replace("_", " ")}
                          sx={{ borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell align="right">{c.assessmentScore ?? "—"}</TableCell>
                      <TableCell>{c.appliedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 2 && (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                ...ADMIN_CARD_SX,
                overflow: "hidden",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Applicants</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_JOBS.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell>{j.title}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={j.status}
                          color={j.status === "active" ? "success" : "default"}
                          sx={{ borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell align="right">{j.applicants}</TableCell>
                      <TableCell>{j.createdAt}</TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, mr: 0.5 }}>
                          Edit
                        </Button>
                        <Button size="small" variant="outlined" sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
                          Archive
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
