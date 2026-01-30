import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Stack,
  styled,
  Button,
  Skeleton,
  Menu,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DashboardCard from "@/app/dashboard/components/shared/DashboardCard";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useRouter } from "next/navigation";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useJobMutations } from "@/queries/jobs.queries";
interface JobPosting {
  id: string;
  title: string;
  job_type: string;
  work_model: string;
  location: string;
  level: string;
  company_id?: string;
  stage_counts: {
    new: number;
    skill_assessment: number;
    interviews: number;
    acceptance: number;
    rejection: number;
    archived: number;
  };
  status: string;
}

interface JobPostingsProps {
  statusFilter: "all" | "active" | "closed";
  setStatusFilter: (value: "all" | "active" | "closed") => void;
  jobPostings: JobPosting[];
  customStyle?: React.CSSProperties;
  isLoading?: boolean;
  handleOpen: () => void;
  // isSubmitting: boolean;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: "1px solid rgba(17,17,17,0.082)",
  // '&:last-child': {
  //   border: 0,
  // },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: "pointer",
  transition: "background-color 0.2s ease-in-out",
  "td, th": {
    borderBottom: "1px solid rgba(17,17,17,0.082)",
  },
  "&:not(thead tr):hover": {
    backgroundColor: "#f7f8fc",
  },
  "&:not(thead tr):hover .job-title": {
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
}));

const StyledTypography = styled(Typography)({
  color: "rgba(17, 17, 17, 0.92)",
  fontSize: "19px",
  fontWeight: 600,
  lineHeight: "100%",
  letterSpacing: "0.12px",
  "@media (min-width:600px)": {
    fontSize: "18px",
  },
});

const StyledSubtitleTypography = styled(Typography)(({ theme }) => ({
  fontSize: "13px",
  borderRadius: "28px",
  padding: "8px 12px",
  width: "max-content",
  textAlign: "center",
  fontWeight: 400,
  transition: "all 0.2s ease-in-out",
  "&:nth-of-type(1)": {
    backgroundColor: "#FCEBE3",
    color: "#724A3B",
  },
  "&:nth-of-type(2)": {
    backgroundColor: "#F9E8F3",
    color: "#76325F",
  },
  "&:nth-of-type(3)": {
    backgroundColor: "#D7EEF4",
    color: "#2B656E",
  },
  ".MuiTableRow-root:hover &": {
    fontWeight: 500,
  },
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  color: "rgba(17, 17, 17, 0.62)",
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "100%", // 14px
  letterSpacing: "0.14px",
  leadingTrim: "both",
  textEdge: "cap",
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  display: "inline-flex",
  padding: "6px",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "10px",
  borderRadius: "8px",
  background: theme.palette.secondary.light,
  minHeight: "28px",

  "& .Mui-selected": {
    color: "white !important",
    fontWeight: 500,
    fontSize: "14px",
  },
  "& .MuiTabs-indicator": {
    display: "block",
    height: "100%",
    width: "100%",
    background: theme.palette.secondary.main,
    color: "white",
    zIndex: 0,
    borderRadius: "4px",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  display: "flex",
  padding: "9px 12px",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  position: "relative",
  zIndex: 1,
  width: "80px",
  minWidth: "max-content",
  minHeight: "28px",
  color: theme.palette.grey[100],
  transition: "color 0.2s ease-in-out",
  "&:hover": {
    color: theme.palette.primary.main,
  },
  "&.Mui-selected": {
    color: "white !important",
  },
}));

const StyledTableHeaderRow = styled(TableRow)(({ theme }) => ({
  th: {
    borderBottom: "1px solid rgba(17,17,17,0.082)",
  },
}));

const StyledTableBodyRow = styled(TableRow)(({ theme }) => ({
  display: "table-row",
  width: "100%",
  cursor: "pointer",
  transition: "background-color 0.2s ease-in-out",
  td: {
    borderBottom: "1px solid rgba(17,17,17,0.082)",
  },
  "&:hover": {
    backgroundColor: theme.palette.secondary.light,
  },
}));

const JobPostings = ({
  statusFilter,
  setStatusFilter,
  jobPostings,
  handleOpen,
  customStyle = {},
  isLoading = false,
}: JobPostingsProps) => {
  const router = useRouter();
  const { removeJob, updateJobStatus } = useJobMutations();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [localJobPostings, setLocalJobPostings] = useState<JobPosting[] | null>(null);
  const [statusSnack, setStatusSnack] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);

  useEffect(() => {
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const userProfileData = JSON.parse(userProfile);
      setCompanyId(userProfileData.companyInfo?.company_id);
    }
  }, []);
  const handleStatusChange = (_event: React.SyntheticEvent, newValue: "all" | "active" | "closed") => {
    setStatusFilter(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value: "all" | "active" | "closed") => {
    setStatusFilter(value);
    handleMenuClose();
  };

  useEffect(() => {
    // keep local copy in sync when parent provides updates
    setLocalJobPostings(jobPostings);
  }, [jobPostings]);

  // --- IGNORE --- refetchJobs removed - Convex handles automatic updates

  const handleCloseResponses = async (job: JobPosting) => {
    try {
      setUpdatingJobId(job.id);
      const { error } = await updateJobStatus(job.id, "closed");
      if (error) throw new Error(error);
      setStatusSnack({ open: true, message: "Responses closed for this job" });
    } catch (err) {
      console.error("Error closing responses:", err);
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleDelete = async (job: JobPosting) => {
    try {
      setDeletingJobId(job.id);
      const { error } = await removeJob(job.id);
      if (error) throw new Error(error);
      setStatusSnack({ open: true, message: "Job deleted" });
    } catch (err) {
      console.error("Error deleting job:", err);
    } finally {
      setDeletingJobId(null);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const handleReopen = async (job: JobPosting) => {
    try {
      setUpdatingJobId(job.id);
      const { error } = await updateJobStatus(job.id, "active");
      if (error) throw new Error(error);
      setStatusSnack({ open: true, message: "Job reopened successfully" });
    } catch (err) {
      console.error("Error reopening job:", err);
    } finally {
      setUpdatingJobId(null);
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <>
          {[1, 2, 3, 4, 5].map((index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>
                <Stack>
                  <Skeleton variant="text" width={200} height={24} />
                  <Stack direction="row" gap={1} sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: "28px" }} />
                    <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: "28px" }} />
                    <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: "28px" }} />
                  </Stack>
                </Stack>
              </StyledTableCell>
              <StyledTableCell>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </>
      );
    }

    const sourceJobs = localJobPostings ?? jobPostings;
    return sourceJobs?.map((job) => (
      <StyledTableRow key={job.id} onClick={() => router.push(`/dashboard/job-posting/${job.id}/submissions`)}>
        <StyledTableCell>
          <Stack>
            <Stack direction="row" gap={1}>
              <StyledTypography className="job-title" textTransform={"capitalize"} mb={3}>
                {job.title}
              </StyledTypography>
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `${window.location.origin}/job-openings/${job.id}`;
                  navigator.clipboard.writeText(url);
                  setSnackbarOpen(true);
                }}
                sx={{}}
                title="Copy job link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11.4 22.75H7.6C3.21 22.75 1.25 20.79 1.25 16.4V12.6C1.25 8.21 3.21 6.25 7.6 6.25H10.6C11.01 6.25 11.35 6.59 11.35 7C11.35 7.41 11.01 7.75 10.6 7.75H7.6C4.02 7.75 2.75 9.02 2.75 12.6V16.4C2.75 19.98 4.02 21.25 7.6 21.25H11.4C14.98 21.25 16.25 19.98 16.25 16.4V13.4C16.25 12.99 16.59 12.65 17 12.65C17.41 12.65 17.75 12.99 17.75 13.4V16.4C17.75 20.79 15.79 22.75 11.4 22.75Z"
                    fill="#292D32"
                  />
                  <path
                    d="M17.0001 14.15H13.8001C10.9901 14.15 9.8501 13.01 9.8501 10.2V6.99999C9.8501 6.69999 10.0301 6.41999 10.3101 6.30999C10.5901 6.18999 10.9101 6.25999 11.1301 6.46999L17.5301 12.87C17.7401 13.08 17.8101 13.41 17.6901 13.69C17.5801 13.97 17.3001 14.15 17.0001 14.15ZM11.3501 8.80999V10.2C11.3501 12.19 11.8101 12.65 13.8001 12.65H15.1901L11.3501 8.80999Z"
                    fill="#292D32"
                  />
                  <path
                    d="M15.6001 2.75H11.6001C11.1901 2.75 10.8501 2.41 10.8501 2C10.8501 1.59 11.1901 1.25 11.6001 1.25H15.6001C16.0101 1.25 16.3501 1.59 16.3501 2C16.3501 2.41 16.0101 2.75 15.6001 2.75Z"
                    fill="#292D32"
                  />
                  <path
                    d="M7 5.75C6.59 5.75 6.25 5.41 6.25 5C6.25 2.93 7.93 1.25 10 1.25H12.62C13.03 1.25 13.37 1.59 13.37 2C13.37 2.41 13.03 2.75 12.62 2.75H10C8.76 2.75 7.75 3.76 7.75 5C7.75 5.41 7.41 5.75 7 5.75Z"
                    fill="#292D32"
                  />
                  <path
                    d="M19.1899 17.75C18.7799 17.75 18.4399 17.41 18.4399 17C18.4399 16.59 18.7799 16.25 19.1899 16.25C20.3299 16.25 21.2499 15.32 21.2499 14.19V8C21.2499 7.59 21.5899 7.25 21.9999 7.25C22.4099 7.25 22.7499 7.59 22.7499 8V14.19C22.7499 16.15 21.1499 17.75 19.1899 17.75Z"
                    fill="#292D32"
                  />
                  <path
                    d="M22 8.74999H19C16.34 8.74999 15.25 7.65999 15.25 4.99999V1.99999C15.25 1.69999 15.43 1.41999 15.71 1.30999C15.99 1.18999 16.31 1.25999 16.53 1.46999L22.53 7.46999C22.74 7.67999 22.81 8.00999 22.69 8.28999C22.58 8.56999 22.3 8.74999 22 8.74999ZM16.75 3.80999V4.99999C16.75 6.82999 17.17 7.24999 19 7.24999H20.19L16.75 3.80999Z"
                    fill="#292D32"
                  />
                </svg>
              </Box>
            </Stack>
            <Stack direction="row" gap={1}>
              <StyledSubtitleTypography>{job.job_type}</StyledSubtitleTypography>
              <StyledSubtitleTypography>{job.work_model}</StyledSubtitleTypography>
              <StyledSubtitleTypography>{job.location}</StyledSubtitleTypography>
            </Stack>
            <Box sx={{ mt: 2, display: "flex", gap: 1.25, flexWrap: "wrap" }}>
              {!(job.status && ["closed", "close"].includes(job.status.toLowerCase())) ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseResponses(job);
                  }}
                  disabled={updatingJobId === job.id}
                  startIcon={<BlockRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    textTransform: "none",
                    fontSize: "13px",
                    borderRadius: "20px",
                    px: 1.5,
                    py: 0.5,
                    borderColor: "rgba(17, 17, 17, 0.12)",
                    color: "rgba(17, 17, 17, 0.72)",
                    "&:hover": {
                      borderColor: "rgba(68, 68, 226, 0.25)",
                      backgroundColor: "rgba(68, 68, 226, 0.04)",
                    },
                  }}
                >
                  {updatingJobId === job.id ? "Closing…" : "Close responses"}
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReopen(job);
                  }}
                  disabled={updatingJobId === job.id}
                  startIcon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    textTransform: "none",
                    fontSize: "13px",
                    borderRadius: "20px",
                    px: 1.5,
                    py: 0.5,
                    borderColor: "rgba(17, 17, 17, 0.12)",
                    color: "rgba(17, 17, 17, 0.72)",
                    "&:hover": {
                      borderColor: "rgba(68, 68, 226, 0.25)",
                      backgroundColor: "rgba(68, 68, 226, 0.04)",
                    },
                  }}
                >
                  {updatingJobId === job.id ? "Reopening…" : "Reopen job"}
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setJobToDelete(job);
                  setDeleteDialogOpen(true);
                }}
                disabled={deletingJobId === job.id}
                startIcon={<DeleteRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  textTransform: "none",
                  fontSize: "13px",
                  borderRadius: "20px",
                  px: 1.5,
                  py: 0.5,
                  borderColor: "rgba(17, 17, 17, 0.12)",
                  color: "rgba(17, 17, 17, 0.72)",
                  "&:hover": {
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                    backgroundColor: "rgba(211, 47, 47, 0.04)",
                  },
                }}
              >
                {deletingJobId === job.id ? "Deleting…" : "Delete job"}
              </Button>
            </Box>
          </Stack>
        </StyledTableCell>
        <StyledTableCell>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box>
              <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                {job.stage_counts?.new ?? 0}
              </Typography>
            </Box>
          </Box>
        </StyledTableCell>
        <StyledTableCell>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box>
              <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                {job.stage_counts?.skill_assessment ?? 0}
              </Typography>
            </Box>
          </Box>
        </StyledTableCell>
        <StyledTableCell>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box>
              <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                {job.stage_counts?.interviews ?? 0}
              </Typography>
            </Box>
          </Box>
        </StyledTableCell>
        <StyledTableCell>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box>
              <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                {job.stage_counts?.acceptance ?? 0}
              </Typography>
            </Box>
          </Box>
        </StyledTableCell>
        <StyledTableCell>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box>
              <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                {job.stage_counts?.archived ?? 0}
              </Typography>
            </Box>
          </Box>
        </StyledTableCell>
      </StyledTableRow>
    ));
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const SuccessIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
        fill="#FFFFFF"
      />
      <path
        d="M10.58 15.58C10.38 15.58 10.19 15.5 10.05 15.36L7.22 12.53C6.93 12.24 6.93 11.76 7.22 11.47C7.51 11.18 7.99 11.18 8.28 11.47L10.58 13.77L15.72 8.63001C16.01 8.34001 16.49 8.34001 16.78 8.63001C17.07 8.92001 17.07 9.40001 16.78 9.69001L11.11 15.36C10.97 15.5 10.78 15.58 10.58 15.58Z"
        fill="#FFFFFF"
      />
    </svg>
  );

  return (
    <DashboardCard customStyle={{ padding: "0px", ...customStyle }}>
      <>
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              padding: "16px",
              position: "sticky",
              top: 0,
              backgroundColor: "white",
            }}
          >
            <Stack direction={"row"} alignItems={"center"} gap={1}>
              <Typography
                variant="h2"
                fontWeight={"semibold"}
                fontSize={{ xs: "18px", sm: "24px" }}
                color={"rgba(17,17,17,0.92)"}
                letterSpacing={"0.12px"}
              >
                Job Listings
              </Typography>
              <Typography
                variant="h2"
                fontWeight={"semibold"}
                fontSize={{ xs: "18px", sm: "24px" }}
                color={"rgba(17,17,17,0.52)"}
                letterSpacing={"0.12px"}
              >
                {`(${jobPostings.length})`}
              </Typography>
            </Stack>

            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{
                  border: "1px solid rgba(17,17,17,0.12)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  width: "fit-content",
                }}
              >
                <Typography color="rgba(17,17,17,0.62)" fontSize="14px">
                  {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Typography>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    padding: "4px",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <FilterListIcon sx={{ fontSize: "20px" }} />
                </IconButton>
              </Stack>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleMenuItemClick("all")} selected={statusFilter === "all"}>
                  All
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick("active")} selected={statusFilter === "active"}>
                  Active
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick("closed")} selected={statusFilter === "closed"}>
                  Closed
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <StyledTabs value={statusFilter} onChange={handleStatusChange} aria-label="job status tabs">
                <StyledTab label="All" value="all" />
                <StyledTab label="Active" value="active" />
                <StyledTab label="Closed" value="closed" />
              </StyledTabs>
            </Box>
          </Box>
          <Box
            sx={{
              overflow: "auto",
              height: "calc(600px - 100px)",
              // height: '600px',
              scrollbarWidth: "thin",
              scrollbarColor: "#032B4420 transparent",
              "&::-webkit-scrollbar": {
                height: "4px",
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
            <Box
              sx={{
                width: "100%",
                display: "table",
                tableLayout: "fixed",
                height: "max-content",
                // overflowX: 'scroll'
              }}
            >
              <Table>
                <TableHead>
                  <StyledTableHeaderRow>
                    <StyledTableHeaderCell>Role</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Applicants</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Assessment</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Interviews</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Accepted</StyledTableHeaderCell>
                    <StyledTableHeaderCell>Archived</StyledTableHeaderCell>
                  </StyledTableHeaderRow>
                </TableHead>
                <TableBody>
                  {jobPostings.length > 0 ? (
                    renderTableContent()
                  ) : (
                    <StyledTableRow>
                      <StyledTableCell colSpan={7} sx={{ textAlign: "center" }}>
                        <Box>
                          <Typography>
                            No job postings found.{" "}
                            <Typography
                              onClick={handleOpen}
                              sx={{
                                color: "primary.main",
                                fontWeight: 500,
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                            >
                              Create a new job posting
                            </Typography>
                          </Typography>
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{
            zIndex: 9999,
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            icon={<SuccessIcon />}
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
            Job opening link has been copied to clipboard
          </Alert>
        </Snackbar>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, pb: 2, px: 4, pt: 4 }}>Delete Job</DialogTitle>
          <DialogContent sx={{ px: 4, pb: 2 }}>
            <Typography sx={{ color: "rgba(17, 17, 17, 0.72)" }}>
              Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
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
              color="error"
              variant="outlined"
              onClick={() => jobToDelete && handleDelete(jobToDelete)}
              disabled={!!deletingJobId}
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
        <Snackbar
          open={statusSnack.open}
          autoHideDuration={3000}
          onClose={() => setStatusSnack({ open: false, message: "" })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{ zIndex: 1301 }}
        >
          <Alert
            onClose={() => setStatusSnack({ open: false, message: "" })}
            severity="success"
            icon={<SuccessIcon />}
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
            {statusSnack.message}
          </Alert>
        </Snackbar>
      </>
    </DashboardCard>
  );
};

export default JobPostings;
