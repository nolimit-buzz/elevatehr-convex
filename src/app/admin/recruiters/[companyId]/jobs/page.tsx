"use client";

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  styled,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../../../styles";
import { useAdminRecruiterDetails } from "@/queries/admin.queries";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: "20px 24px",
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

export default function RecruiterJobsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;

  const { details: recruiter, isLoading } = useAdminRecruiterDetails(companyId);

  const [jobMenuAnchorEl, setJobMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeJob, setActiveJob] = React.useState<any | null>(null);

  const handleOpenJobMenu = (event: React.MouseEvent<HTMLElement>, job: any) => {
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

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => router.push(`/admin/recruiters/${companyId}`)}
            sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          >
            <ArrowLeftIcon style={{ width: 18, height: 18 }} />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Jobs
          </Typography>
          {recruiter && (
            <Typography variant="body2" color="text.secondary">
              for {recruiter.companyName}
            </Typography>
          )}
        </Box>
      </Box>

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
            <TableRow
              sx={{
                "& th": {
                  bgcolor: "transparent",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                },
              }}
            >
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Job Title</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Status</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Created</StyledTableCell>
              <StyledTableCell align="right" sx={{ fontWeight: 600, color: "text.primary" }}>
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <StyledTableCell colSpan={4} align="center">
                  Loading...
                </StyledTableCell>
              </TableRow>
            ) : recruiter?.jobs?.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={4} align="center">
                  No jobs found.
                </StyledTableCell>
              </TableRow>
            ) : (
              recruiter?.jobs?.map((j) => (
                <TableRow key={j.id} hover>
                  <StyledTableCell>{j.title}</StyledTableCell>
                  <StyledTableCell>
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
                        color: j.status === "active" || j.status === "closed" ? "common.white" : "text.secondary",
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{j.postedDate}</StyledTableCell>
                  <StyledTableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenJobMenu(e, j)}
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
                  </StyledTableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
            <EyeIcon style={{ width: 16, height: 16, color: "rgba(17,17,17,0.58)" }} />
            <Typography variant="body2">View</Typography>
          </Box>
        </MenuItem>
        <MenuItem dense onClick={handleEditJob} sx={{ py: 0.5, px: 1.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PencilSquareIcon style={{ width: 16, height: 16, color: "rgba(17,17,17,0.58)" }} />
            <Typography variant="body2">Edit</Typography>
          </Box>
        </MenuItem>
        <MenuItem dense onClick={handleToggleJobStatus} sx={{ py: 0.5, px: 1.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {activeJob?.status === "closed" ? (
              <ArrowPathIcon style={{ width: 16, height: 16, color: "rgba(17,17,17,0.58)" }} />
            ) : (
              <XMarkIcon style={{ width: 16, height: 16, color: "rgba(17,17,17,0.58)" }} />
            )}
            <Typography variant="body2">{activeJob?.status === "closed" ? "Reopen" : "Close"}</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
}
