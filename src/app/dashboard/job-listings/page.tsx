"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  Chip,
  Container,
  IconButton,
  Paper,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  TableContainer,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import DashboardCard from "@/app/dashboard/components/shared/DashboardCard";
import zIndex from "@mui/material/styles/zIndex";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme, alpha } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import LinearProgress from "@mui/material/LinearProgress";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
// import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import CheckIcon from "@mui/icons-material/Check";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteSnackbar from "@/app/dashboard/components/DeleteSnackbar";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import { useJobMutations, useJobsList } from "@/queries/jobs.queries";

const WorkTypeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 22.75H7.99998C3.37998 22.75 2.51998 20.6 2.29998 18.51L1.54998 10.5C1.43998 9.45001 1.40998 7.90001 2.44998 6.74001C3.34998 5.74001 4.83998 5.26001 6.99998 5.26001H17C19.17 5.26001 20.66 5.75001 21.55 6.74001C22.59 7.90001 22.56 9.45001 22.45 10.51L21.7 18.5C21.48 20.6 20.62 22.75 16 22.75ZM6.99998 6.75001C5.30998 6.75001 4.14998 7.08001 3.55998 7.74001C3.06998 8.28001 2.90998 9.11001 3.03998 10.35L3.78998 18.36C3.95998 19.94 4.38998 21.25 7.99998 21.25H16C19.6 21.25 20.04 19.94 20.21 18.35L20.96 10.36C21.09 9.11001 20.93 8.28001 20.44 7.74001C19.85 7.08001 18.69 6.75001 17 6.75001H6.99998Z"
      fill="currentColor"
    />
    <path
      d="M16 6.75C15.59 6.75 15.25 6.41 15.25 6V5.2C15.25 3.42 15.25 2.75 12.8 2.75H11.2C8.75 2.75 8.75 3.42 8.75 5.2V6C8.75 6.41 8.41 6.75 8 6.75C7.59 6.75 7.25 6.41 7.25 6V5.2C7.25 3.44 7.25 1.25 11.2 1.25H12.8C16.75 1.25 16.75 3.44 16.75 5.2V6C16.75 6.41 16.41 6.75 16 6.75Z"
      fill="currentColor"
    />
    <path
      d="M12 16.75C9.25 16.75 9.25 15.05 9.25 14.03V13C9.25 11.59 9.59 11.25 11 11.25H13C14.41 11.25 14.75 11.59 14.75 13V14C14.75 15.04 14.75 16.75 12 16.75ZM10.75 12.75C10.75 12.83 10.75 12.92 10.75 13V14.03C10.75 15.06 10.75 15.25 12 15.25C13.25 15.25 13.25 15.09 13.25 14.02V13C13.25 12.92 13.25 12.83 13.25 12.75C13.17 12.75 13.08 12.75 13 12.75H11C10.92 12.75 10.83 12.75 10.75 12.75Z"
      fill="currentColor"
    />
    <path
      d="M14 14.77C13.63 14.77 13.3 14.49 13.26 14.11C13.21 13.7 13.5 13.32 13.91 13.27C16.55 12.94 19.08 11.94 21.21 10.39C21.54 10.14 22.01 10.22 22.26 10.56C22.5 10.89 22.43 11.36 22.09 11.61C19.75 13.31 16.99 14.4 14.09 14.77C14.06 14.77 14.03 14.77 14 14.77Z"
      fill="currentColor"
    />
    <path
      d="M9.99999 14.7799C9.96999 14.7799 9.93999 14.7799 9.90999 14.7799C7.16999 14.4699 4.49999 13.4699 2.18999 11.8899C1.84999 11.6599 1.75999 11.1899 1.98999 10.8499C2.21999 10.5099 2.68999 10.4199 3.02999 10.6499C5.13999 12.0899 7.56999 12.9999 10.07 13.2899C10.48 13.3399 10.78 13.7099 10.73 14.1199C10.7 14.4999 10.38 14.7799 9.99999 14.7799Z"
      fill="currentColor"
    />
  </svg>
);

const WorkModelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
      fill="currentColor"
    />
    <path
      d="M8.99999 21.75H7.99999C7.58999 21.75 7.24999 21.41 7.24999 21C7.24999 20.59 7.56999 20.26 7.97999 20.25C6.40999 14.89 6.40999 9.11 7.97999 3.75C7.56999 3.74 7.24999 3.41 7.24999 3C7.24999 2.59 7.58999 2.25 7.99999 2.25H8.99999C9.23999 2.25 9.46999 2.37 9.60999 2.56C9.74999 2.76 9.78999 3.01 9.70999 3.24C7.82999 8.89 7.82999 15.11 9.70999 20.77C9.78999 21 9.74999 21.25 9.60999 21.45C9.46999 21.63 9.23999 21.75 8.99999 21.75Z"
      fill="currentColor"
    />
    <path
      d="M15 21.7501C14.92 21.7501 14.84 21.7401 14.76 21.7101C14.37 21.5801 14.15 21.1501 14.29 20.7601C16.17 15.1101 16.17 8.89006 14.29 3.23006C14.16 2.84006 14.37 2.41006 14.76 2.28006C15.16 2.15006 15.58 2.36006 15.71 2.75006C17.7 8.71006 17.7 15.2701 15.71 21.2201C15.61 21.5501 15.31 21.7501 15 21.7501Z"
      fill="currentColor"
    />
    <path
      d="M12 17.2C9.21 17.2 6.43 16.81 3.75 16.02C3.74 16.42 3.41 16.75 3 16.75C2.59 16.75 2.25 16.41 2.25 16V15C2.25 14.76 2.37 14.53 2.56 14.39C2.76 14.25 3.01 14.21 3.24 14.29C8.89 16.17 15.12 16.17 20.77 14.29C21 14.21 21.25 14.25 21.45 14.39C21.65 14.53 21.76 14.76 21.76 15V16C21.76 16.41 21.42 16.75 21.01 16.75C20.6 16.75 20.27 16.43 20.26 16.02C17.57 16.81 14.79 17.2 12 17.2Z"
      fill="currentColor"
    />
    <path
      d="M21 9.74999C20.92 9.74999 20.84 9.73999 20.76 9.70999C15.11 7.82999 8.88003 7.82999 3.23003 9.70999C2.83003 9.83999 2.41003 9.62999 2.28003 9.23999C2.16003 8.83999 2.37003 8.41999 2.76003 8.28999C8.72003 6.29999 15.28 6.29999 21.23 8.28999C21.62 8.41999 21.84 8.84999 21.7 9.23999C21.61 9.54999 21.31 9.74999 21 9.74999Z"
      fill="currentColor"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 16.8C11.3 16.8 10.6 16.53 10.07 16L3.55002 9.48C3.26002 9.19 3.26002 8.71 3.55002 8.42C3.84002 8.13 4.32002 8.13 4.61002 8.42L11.13 14.94C11.61 15.42 12.39 15.42 12.87 14.94L19.39 8.42C19.68 8.13 20.16 8.13 20.45 8.42C20.74 8.71 20.74 9.19 20.45 9.48L13.93 16C13.4 16.53 12.7 16.8 12 16.8Z"
      fill="currentColor"
    />
  </svg>
);

const ShareLinkIcon = () => {
  const theme = useTheme();
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.1 22.75H6.9C2.99 22.75 1.25 21.01 1.25 17.1V12.9C1.25 8.99 2.99 7.25 6.9 7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V17.1C16.75 21.01 15.01 22.75 11.1 22.75ZM6.9 8.75C3.8 8.75 2.75 9.8 2.75 12.9V17.1C2.75 20.2 3.8 21.25 6.9 21.25H11.1C14.2 21.25 15.25 20.2 15.25 17.1V12.9C15.25 9.8 14.2 8.75 11.1 8.75H6.9Z"
        fill={theme.palette.grey[100]}
      />
      <path
        d="M17.1 16.75H16C15.59 16.75 15.25 16.41 15.25 16V12.9C15.25 9.8 14.2 8.75 11.1 8.75H8C7.59 8.75 7.25 8.41 7.25 8V6.9C7.25 2.99 8.99 1.25 12.9 1.25H17.1C21.01 1.25 22.75 2.99 22.75 6.9V11.1C22.75 15.01 21.01 16.75 17.1 16.75ZM16.75 15.25H17.1C20.2 15.25 21.25 14.2 21.25 11.1V6.9C21.25 3.8 20.2 2.75 17.1 2.75H12.9C9.8 2.75 8.75 3.8 8.75 6.9V7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V15.25Z"
        fill={theme.palette.grey[100]}
      />
    </svg>
  );
};

interface JobPosting {
  id: string;
  title: string;
  job_type: string;
  work_model: string;
  location: string;
  stage_counts: {
    new: number;
    skill_assessment: number;
    interviews: number;
    acceptance: number;
    rejection: number;
  };
  status: string;
}

interface JobPostingsProps {
  statusFilter: "all" | "active" | "closed";
  setStatusFilter: (value: "all" | "active" | "closed") => void;
  jobPostings: JobPosting[];
  customStyle?: React.CSSProperties;
  isLoading?: boolean;
}

interface FilterState {
  job_title: string;
  location: string;
  work_model: string;
  job_type: string;
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
    backgroundColor: "#f7f8fc", // Updated hover color
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: "rgba(17, 17, 17, 0.92)",
  fontSize: " 18px",
  fontWeight: 600,
  lineHeight: "100%",
  letterSpacing: "0.27px",
  marginBottom: "16px",
}));

const StyledSubtitleTypography = styled(Typography)(({ theme }) => ({
  fontSize: "13px",
  borderRadius: "28px",
  background: theme.palette.secondary.light,
  padding: "8px 12px",
  width: "max-content",
  textAlign: "center",
  color: theme.palette.primary.main,
  fontWeight: 400,
  transition: "all 0.2s ease-in-out",
  ".MuiTableRow-root:hover &": {
    background: theme.palette.secondary.dark,
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
  position: "sticky",
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  display: "inline-flex",
  padding: "6px",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
  borderRadius: "8px",
  background: theme.palette.secondary.light,
  minHeight: "28px",
  width: "100%",

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
  flex: 1,
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

const StatusBadge = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: 500,
  textTransform: "capitalize",
  gap: "4px",
  transition: "all 0.3s ease-in-out",
  transform: "scale(1)",
  position: "relative",
  minWidth: "80px",
  "&:hover": {
    transform: "scale(1.05)",
  },
  "&.active": {
    backgroundColor: "rgba(0, 150, 136, 0.08)",
    color: "#009688",
    "&:hover": {
      backgroundColor: "rgba(0, 150, 136, 0.12)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  },
  "&.closed": {
    backgroundColor: "rgba(235, 87, 87, 0.1)",
    color: "#EB5757",
    "&:hover": {
      backgroundColor: "rgba(235, 87, 87, 0.14)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  },
  "&.loading": {
    "& .status-text": {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    "& .MuiCircularProgress-root": {
      width: "12px",
      height: "12px",
    },
  },
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.05)",
    },
    "100%": {
      transform: "scale(1)",
    },
  },
  "&.status-changing": {
    animation: "pulse 0.3s ease-in-out",
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

const ShareModal = React.memo(
  ({ open, onClose, jobTitle, jobId }: { open: boolean; onClose: () => void; jobTitle: string; jobId: string }) => {
    const theme = useTheme();
    const jobUrl = useMemo(() => `${process.env.NEXT_PUBLIC_HOST}/job-openings/${jobId}`, [jobId]);
    const shareText = useMemo(() => `Check out this job opportunity: ${jobTitle}`, [jobTitle]);

    const handleShare = (platform: string) => {
      let shareUrl = "";
      switch (platform) {
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`;
          break;
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${jobUrl}`)}`;
          break;
        case "copy":
          navigator.clipboard.writeText(jobUrl);
          break;
      }
      if (shareUrl) {
        window.open(shareUrl, "_blank");
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionProps={{ timeout: 0 }}>
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            color: "rgba(17, 17, 17, 0.92)",
            pb: 1,
          }}
        >
          Share Job Posting
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem
              button
              onClick={() => handleShare("linkedin")}
              sx={{
                borderRadius: "8px",
                mb: 1,
                "&:hover": {
                  backgroundColor: "rgba(68, 68, 226, 0.04)",
                },
              }}
            >
              <ListItemIcon>
                <LinkedInIcon sx={{ color: "#0077B5" }} />
              </ListItemIcon>
              <ListItemText
                primary="Share on LinkedIn"
                primaryTypographyProps={{
                  color: "rgba(17, 17, 17, 0.92)",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => handleShare("twitter")}
              sx={{
                borderRadius: "8px",
                mb: 1,
                "&:hover": {
                  backgroundColor: "rgba(68, 68, 226, 0.04)",
                },
              }}
            >
              <ListItemIcon>
                <TwitterIcon sx={{ color: "#1DA1F2" }} />
              </ListItemIcon>
              <ListItemText
                primary="Share on Twitter"
                primaryTypographyProps={{
                  color: "rgba(17, 17, 17, 0.92)",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => handleShare("whatsapp")}
              sx={{
                borderRadius: "8px",
                mb: 1,
                "&:hover": {
                  backgroundColor: "rgba(68, 68, 226, 0.04)",
                },
              }}
            >
              <ListItemIcon>
                <WhatsAppIcon sx={{ color: "#25D366" }} />
              </ListItemIcon>
              <ListItemText
                primary="Share on WhatsApp"
                primaryTypographyProps={{
                  color: "rgba(17, 17, 17, 0.92)",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem
              button
              onClick={() => handleShare("copy")}
              sx={{
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "rgba(68, 68, 226, 0.04)",
                },
              }}
            >
              <ListItemIcon>
                <ContentCopyIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary="Copy Link"
                primaryTypographyProps={{
                  color: "rgba(17, 17, 17, 0.92)",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              />
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    );
  },
);

ShareModal.displayName = "ShareModal";

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 14.1699C9.87 14.1699 8.13 12.4399 8.13 10.2999C8.13 8.15994 9.87 6.43994 12 6.43994C14.13 6.43994 15.87 8.16994 15.87 10.3099C15.87 12.4499 14.13 14.1699 12 14.1699ZM12 7.93994C10.7 7.93994 9.63 8.99994 9.63 10.3099C9.63 11.6199 10.69 12.6799 12 12.6799C13.31 12.6799 14.37 11.6199 14.37 10.3099C14.37 8.99994 13.3 7.93994 12 7.93994Z"
      fill="currentColor"
    />
    <path
      d="M12.0001 22.76C10.5201 22.76 9.03005 22.2 7.87005 21.09C4.92005 18.25 1.66005 13.72 2.89005 8.33C4.00005 3.44 8.27005 1.25 12.0001 1.25C12.0001 1.25 12.0001 1.25 12.0101 1.25C15.7401 1.25 20.0101 3.44 21.1201 8.34C22.3401 13.73 19.0801 18.25 16.1301 21.09C14.9701 22.2 13.4801 22.76 12.0001 22.76ZM12.0001 2.75C9.09005 2.75 5.35005 4.3 4.36005 8.66C3.28005 13.37 6.24005 17.43 8.92005 20C10.6501 21.67 13.3601 21.67 15.0901 20C17.7601 17.43 20.7201 13.37 19.6601 8.66C18.6601 4.3 14.9101 2.75 12.0001 2.75Z"
      fill="currentColor"
    />
  </svg>
);

const JobPostings = () => {
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "closed">("active");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    job_title: "",
    location: "",
    work_model: "",
    job_type: "",
  });
  const [tempFilters, setTempFilters] = useState<FilterState>({
    job_title: "",
    location: "",
    work_model: "",
    job_type: "",
  });
  const [tempStatusFilter, setTempStatusFilter] = useState<"" | "active" | "closed">("active");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [statusSnack, setStatusSnack] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  // Convex hooks
  const { updateJobStatus, removeJob } = useJobMutations();
  const convexJobs = useJobsList(statusFilter === "" ? undefined : (statusFilter as any));

  // Derive jobPostings from Convex data
  const jobPostings: JobPosting[] = useMemo(() => {
    if (convexJobs === undefined) return [];
    return (convexJobs || []).map((job: any) => ({
      ...job,
      id: job._id,
      job_type: job.job_type === "fulltime" ? "Full-time" : job.job_type === "contract" ? "Contract" : job.job_type,
      work_model:
        job.work_model === "onsite"
          ? "On-site"
          : job.work_model === "remote"
            ? "Remote"
            : job.work_model === "hybrid"
              ? "Hybrid"
              : job.work_model,
    }));
  }, [convexJobs]);

  // Loading state based on Convex query
  const isLoading = convexJobs === undefined;

  useEffect(() => {
    // Set view mode based on screen size
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        // lg breakpoint
        setViewMode("grid");
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStatusChange = async (_event: React.SyntheticEvent, newValue: "" | "active" | "closed") => {
    setStatusFilter(newValue as any);
    // Convex query will automatically refetch with new status filter
  };

  const handleFilterChange = (filterName: keyof FilterState, value: string) => {
    setTempFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setTempFilters({
      job_title: "",
      location: "",
      work_model: "",
      job_type: "",
    });
    setTempStatusFilter("active");
    setFilters({
      job_title: "",
      location: "",
      work_model: "",
      job_type: "",
    });
    setStatusFilter("active");
  };

  const applyFilters = async () => {
    setFilters(tempFilters);
    setStatusFilter(tempStatusFilter as any);
    // Filtering is done client-side in filteredJobPostings useMemo
    // Convex query will automatically refetch if statusFilter changes
  };

  const hasActiveFilters = () => {
    return (
      (tempStatusFilter as any) !== statusFilter ||
      tempFilters.job_title !== filters.job_title ||
      tempFilters.location !== filters.location ||
      tempFilters.work_model !== filters.work_model ||
      tempFilters.job_type !== filters.job_type
    );
  };

  const filteredJobPostings = useMemo(() => {
    return (jobPostings || []).filter((job) => {
      if (filters.job_title && !job.title.toLowerCase().includes(filters.job_title.toLowerCase())) {
        return false;
      }
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.work_model && job.work_model !== filters.work_model) {
        return false;
      }
      if (filters.job_type && job.job_type !== filters.job_type) {
        return false;
      }

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          job.title.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower) ||
          job.job_type.toLowerCase().includes(searchLower) ||
          job.work_model.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [jobPostings, filters, searchQuery]);

  const copyToClipboard = (jobId: string) => {
    const link = `${process.env.NEXT_PUBLIC_HOST}/job-openings/${jobId}`;
    navigator.clipboard.writeText(link).then(() => {
      setSnackbarOpen(true);
    });
  };

  const handleQuickActionsClick = (event: React.MouseEvent<HTMLElement>, job: JobPosting) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleQuickActionsClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleShareClick = () => {
    handleQuickActionsClose();
    setShareModalOpen(true);
  };

  const handleViewSubmissions = () => {
    if (selectedJob) {
      router.push(`/dashboard/job-posting/${selectedJob.id}/submissions`);
    }
    handleQuickActionsClose();
  };

  const handleEdit = () => {
    if (selectedJob) {
      router.push(`/dashboard/create-job-posting/${selectedJob.id}`);
    }
    handleQuickActionsClose();
  };

  const handleStatusToggle = async (job: JobPosting) => {
    // Reopen job when currently closed
    try {
      setUpdatingJobId(job.id);
      const { error } = await updateJobStatus(job.id, "active");
      if (error) {
        throw new Error(error);
      }
      // Convex will automatically refetch the list after mutation
      setStatusSnack({ open: true, message: "Job reopened successfully" });
    } catch (error) {
      console.error("Error updating job status:", error);
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleCloseResponses = async (job: JobPosting) => {
    try {
      setUpdatingJobId(job.id);
      const { error } = await updateJobStatus(job.id, "closed");
      if (error) {
        throw new Error(error);
      }
      // Convex will automatically refetch the list after mutation
      setStatusSnack({ open: true, message: "Responses closed for this job" });
    } catch (error) {
      console.error("Error closing job responses:", error);
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleDeleteClick = () => {
    if (selectedJob) {
      setJobToDelete(selectedJob);
      setDeleteDialogOpen(true);
    }
    handleQuickActionsClose();
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    try {
      const { error } = await removeJob(jobToDelete.id);
      if (error) {
        throw new Error(error);
      }
      // Convex will automatically refetch the list after mutation
      setStatusSnack({ open: true, message: "Job deleted" });
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setJobToDelete(null);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <>
          {[1, 2, 3, 4, 5].map((index) => (
            <StyledTableBodyRow key={index}>
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
              <StyledTableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </StyledTableCell>
            </StyledTableBodyRow>
          ))}
        </>
      );
    }

    return filteredJobPostings?.map((job, index) => {
      const colorIndex = index % 4;
      const colors = [
        { bg: "rgba(114, 74, 59, 0.15)", color: "#724A3B" },
        { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
        { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
        { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
      ];
      const currentColor = colors[colorIndex];

      return (
        <StyledTableBodyRow key={job.id}>
          <StyledTableCell>
            <Stack>
              <Stack direction="row" alignItems="center" gap={1}>
                <StyledTypography textTransform={"capitalize"}>{job.title}</StyledTypography>
                <Tooltip
                  title="Click to copy application page link"
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.secondary.light,
                        border: `1px solid ${theme.palette.primary.main}`,
                        borderRadius: "12px",
                        "& .MuiTooltip-arrow": {
                          color: theme.palette.primary.main,
                        },
                      },
                    },
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(job.id);
                    }}
                    sx={{
                      color: "rgba(17, 17, 17, 0.48)",
                      padding: "3px",
                      marginTop: "-10px",
                      marginLeft: "-2px",
                      "&:hover": {
                        backgroundColor: "rgba(68, 68, 226, 0.04)",
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <ShareLinkIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ my: 1, mb: 1, flexWrap: "wrap" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: colors[0].bg,
                    color: colors[0].color,
                    px: 2,
                    py: 0.75,
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: 400,
                    textTransform: "capitalize",
                    width: "max-content",
                  }}
                >
                  {/* <WorkTypeIcon /> */}
                  {job.job_type}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: colors[1].bg,
                    color: colors[1].color,
                    px: 2,
                    py: 0.75,
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: 400,
                    textTransform: "capitalize",
                    width: "max-content",
                  }}
                >
                  {/* <LocationIcon /> */}
                  {job.location}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: colors[2].bg,
                    color: colors[2].color,
                    px: 2,
                    py: 0.75,
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: 400,
                    textTransform: "capitalize",
                    width: "max-content",
                  }}
                >
                  {/* <WorkModelIcon /> */}
                  {job.work_model}
                </Box>
              </Stack>
              <Box sx={{ mt: 2, display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                {!(job.status && ["closed", "close"].includes(job.status.toLowerCase())) ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<BlockRoundedIcon sx={{ fontSize: 18 }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseResponses(job);
                    }}
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
                    Close responses
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(job);
                    }}
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
                    Reopen job
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteRoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setJobToDelete(job);
                    setDeleteDialogOpen(true);
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: "13px",
                    borderRadius: "20px",
                    px: 1.5,
                    py: 0.5,
                    "&:hover": {
                      backgroundColor: (theme) =>
                        theme.palette.error[theme.palette.mode === "dark" ? "dark" : "main"] + "1F",
                    },
                  }}
                >
                  Delete job
                </Button>
              </Box>
            </Stack>
          </StyledTableCell>
          <StyledTableCell>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box>
                <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                  {job.stage_counts.new}
                </Typography>
              </Box>
            </Box>
          </StyledTableCell>
          <StyledTableCell>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box>
                <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                  {job.stage_counts.skill_assessment}
                </Typography>
              </Box>
            </Box>
          </StyledTableCell>
          <StyledTableCell>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box>
                <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                  {job.stage_counts.interviews}
                </Typography>
              </Box>
            </Box>
          </StyledTableCell>
          <StyledTableCell>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box>
                <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                  {job.stage_counts.acceptance}
                </Typography>
              </Box>
            </Box>
          </StyledTableCell>
          <StyledTableCell>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box>
                <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                  {job.stage_counts.rejection}
                </Typography>
              </Box>
            </Box>
          </StyledTableCell>
          <StyledTableCell>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => handleQuickActionsClick(e, job)}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  color: "rgba(17, 17, 17, 0.72)",
                  borderColor: "rgba(17, 17, 17, 0.12)",
                  textTransform: "none",
                  fontSize: "14px",
                  padding: "4px 12px",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    backgroundColor: "rgba(68, 68, 226, 0.04)",
                  },
                }}
              >
                Quick Actions
              </Button>
            </Box>
          </StyledTableCell>
        </StyledTableBodyRow>
      );
    });
  };

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
              Job Listings
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" gap={3}>
          <Box
            sx={{
              width: { xs: "100%", sm: 300 },
              flexShrink: 0,
              display: { xs: "none", sm: "none", md: "none", lg: "block" },
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
                <TextField
                  fullWidth
                  placeholder="Search by Job Title"
                  value={tempFilters.job_title}
                  onChange={(e) => handleFilterChange("job_title", e.target.value)}
                  sx={{
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
                  Location
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Search by Location"
                  value={tempFilters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  sx={{
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
                  Work Model
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={tempFilters.work_model}
                    onChange={(e) => handleFilterChange("work_model", e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid rgba(17, 17, 17, 0.08)",
                      "& .MuiSelect-select": {
                        padding: "16px",
                        color: "rgba(17, 17, 17, 0.84)",
                      },
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover fieldset": {
                        border: "none",
                      },
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    }}
                  >
                    <MenuItem value="">All Work Models</MenuItem>
                    <MenuItem value="Remote">Remote</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                    <MenuItem value="On-site">On-site</MenuItem>
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
                  Job Type
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={tempFilters.job_type}
                    onChange={(e) => handleFilterChange("job_type", e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid rgba(17, 17, 17, 0.08)",
                      "& .MuiSelect-select": {
                        padding: "16px",
                        color: "rgba(17, 17, 17, 0.84)",
                      },
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover fieldset": {
                        border: "none",
                      },
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    }}
                  >
                    <MenuItem value="">All Job Types</MenuItem>
                    <MenuItem value="Full-time">Full-time</MenuItem>
                    <MenuItem value="Part-time">Part-time</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={applyFilters}
                  disabled={!hasActiveFilters()}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                    padding: "12px",
                    borderRadius: "12px",
                    textTransform: "none",
                    fontSize: "16px",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(17, 17, 17, 0.12)",
                      color: "rgba(17, 17, 17, 0.38)",
                    },
                  }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <DashboardCard customStyle={{ padding: "0px" }}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                  }}
                >
                  <Stack direction={"row"} alignItems={"center"} gap={1} sx={{ display: { xs: "none", lg: "block" } }}>
                    <Typography
                      variant="h2"
                      fontWeight={"semibold"}
                      fontSize={"24px"}
                      color={"rgba(17,17,17,0.92)"}
                      letterSpacing={"0.12px"}
                    >
                      Job Listings
                    </Typography>
                    <Typography
                      variant="h2"
                      fontWeight={"semibold"}
                      fontSize={"24px"}
                      color={"rgba(17,17,17,0.52)"}
                      letterSpacing={"0.12px"}
                      sx={{ display: { xs: "none", sm: "none", md: "none", lg: "block" } }}
                    >
                      {`(${filteredJobPostings.length})`}
                    </Typography>
                  </Stack>
                  <TextField
                    placeholder="Search job title"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      display: { xs: "none", sm: "block" },
                      width: { xs: "100%", sm: "300px" },
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
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent={{ xs: "space-between", sm: "" }}
                  >
                    <FormControl sx={{ minWidth: 150 }}>
                      <Select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e as any, e.target.value as "" | "active" | "closed")}
                        displayEmpty
                        sx={{
                          backgroundColor: "#fff",
                          borderRadius: "12px",
                          border: "1px solid rgba(17, 17, 17, 0.08)",
                          height: "40px",
                          "& .MuiSelect-select": {
                            padding: "0 16px",
                            color: "rgba(17, 17, 17, 0.84)",
                          },
                          "& fieldset": {
                            border: "none",
                          },
                          "&:hover fieldset": {
                            border: "none",
                          },
                          "&.Mui-focused fieldset": {
                            border: "none",
                          },
                        }}
                      >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                    <Box sx={{ display: { xs: "flex", sm: "none" } }}>
                      <IconButton
                        onClick={() => setSearchDialogOpen(true)}
                        sx={{
                          color: "rgba(17, 17, 17, 0.48)",
                          "&:hover": {
                            backgroundColor: "rgba(68, 68, 226, 0.04)",
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        <Typography sx={{ mr: 1, fontSize: "14px", color: "rgba(17, 17, 17, 0.48)" }}>
                          Search
                        </Typography>
                        <SearchIcon />
                      </IconButton>
                    </Box>
                    <Box
                      sx={{
                        display: { xs: "none", sm: "none", md: "none", lg: "flex" },
                        bgcolor: "rgba(17, 17, 17, 0.04)",
                        borderRadius: "12px",
                        p: 0.5,
                        minHeight: "40px",
                        transition: "all 0.3s ease-in-out",
                        width: { xs: "100%", sm: "auto" },
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
                            padding: "8px",
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
                        <Tab value="list" icon={<ViewListIcon />} aria-label="list view" />
                        <Tab value="grid" icon={<ViewModuleIcon />} aria-label="grid view" />
                      </Tabs>
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ overflow: "auto" }}>
                  {viewMode === "list" ? (
                    <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
                      <Table>
                        <TableHead>
                          <StyledTableHeaderRow>
                            <StyledTableHeaderCell>Role</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Applicants</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Assessment</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Interviews</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Accepted</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Rejected</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Actions</StyledTableHeaderCell>
                          </StyledTableHeaderRow>
                        </TableHead>
                        <TableBody>
                          {filteredJobPostings.map((job, index) => {
                            const colorIndex = index % 4;
                            const colors = [
                              { bg: "rgba(114, 74, 59, 0.15)", color: "#724A3B" },
                              { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
                              { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
                              { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
                            ];
                            const currentColor = colors[colorIndex];

                            return (
                              <StyledTableRow key={job.id}>
                                <StyledTableCell>
                                  <Stack>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                      <StyledTypography textTransform={"capitalize"}>
                                        {job.title}{" "}
                                        <StatusBadge
                                          className={`${job.status === "active" ? "active" : "closed"} ${updatingJobId === job.id ? "status-changing loading" : ""}`}
                                          onClick={(e) => {
                                            if (updatingJobId === job.id) return; // Prevent click when updating
                                            e.stopPropagation();
                                            handleStatusToggle(job);
                                          }}
                                          sx={{
                                            ml: 1,
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            pointerEvents: updatingJobId === job.id ? "none" : "auto", // Disable pointer events when updating
                                          }}
                                        >
                                          <span className="status-text">
                                            {updatingJobId === job.id ? (
                                              <>
                                                Updating...
                                                <CircularProgress
                                                  size={12}
                                                  sx={{ color: job.status === "active" ? "#2B656E" : "#EB5757" }}
                                                />
                                              </>
                                            ) : (
                                              job.status
                                            )}
                                          </span>
                                          {updatingJobId !== job.id && <ChevronDownIcon />}
                                        </StatusBadge>
                                      </StyledTypography>
                                      <Tooltip
                                        title="Click to copy application page link"
                                        arrow
                                        placement="top"
                                        componentsProps={{
                                          tooltip: {
                                            sx: {
                                              bgcolor: theme.palette.primary.main,
                                              color: theme.palette.secondary.light,
                                              border: `1px solid ${theme.palette.primary.main}`,
                                              borderRadius: "12px",
                                              "& .MuiTooltip-arrow": {
                                                color: theme.palette.primary.main,
                                              },
                                            },
                                          },
                                        }}
                                      >
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(job.id);
                                          }}
                                          sx={{
                                            color: "rgba(17, 17, 17, 0.48)",
                                            padding: "3px",
                                            marginTop: "-10px",
                                            marginLeft: "-2px",
                                            "&:hover": {
                                              backgroundColor: "rgba(68, 68, 226, 0.04)",
                                              color: theme.palette.primary.main,
                                            },
                                          }}
                                        >
                                          <ShareLinkIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                    <Stack direction="row" spacing={1} sx={{ my: 1, mb: 1, flexWrap: "wrap" }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          bgcolor: colors[0].bg,
                                          color: colors[0].color,
                                          px: 2,
                                          py: 0.75,
                                          borderRadius: "20px",
                                          fontSize: "14px",
                                          fontWeight: 400,
                                          textTransform: "capitalize",
                                          width: "max-content",
                                        }}
                                      >
                                        {/* <WorkTypeIcon /> */}
                                        {job.job_type}
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          bgcolor: colors[1].bg,
                                          color: colors[1].color,
                                          px: 2,
                                          py: 0.75,
                                          borderRadius: "20px",
                                          fontSize: "14px",
                                          fontWeight: 400,
                                          textTransform: "capitalize",
                                          width: "max-content",
                                        }}
                                      >
                                        {/* <LocationIcon /> */}
                                        {job.location}
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          bgcolor: colors[2].bg,
                                          color: colors[2].color,
                                          px: 2,
                                          py: 0.75,
                                          borderRadius: "20px",
                                          fontSize: "14px",
                                          fontWeight: 400,
                                          textTransform: "capitalize",
                                          width: "max-content",
                                        }}
                                      >
                                        {/* <WorkModelIcon /> */}
                                        {job.work_model}
                                      </Box>
                                    </Stack>
                                  </Stack>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                                        {job.stage_counts.new}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                                        {job.stage_counts.skill_assessment}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                                        {job.stage_counts.interviews}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                                        {job.stage_counts.acceptance}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography color="rgba(17, 17, 17, 0.84)" fontWeight={500} fontSize={"16px"}>
                                        {job.stage_counts.rejection}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </StyledTableCell>
                                <StyledTableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={(e) => handleQuickActionsClick(e, job)}
                                      endIcon={<KeyboardArrowDownIcon />}
                                      sx={{
                                        color: "rgba(17, 17, 17, 0.72)",
                                        borderColor: "rgba(17, 17, 17, 0.12)",
                                        textTransform: "none",
                                        fontSize: "14px",
                                        padding: "4px 12px",
                                        "&:hover": {
                                          borderColor: theme.palette.primary.main,
                                          color: theme.palette.primary.main,
                                          backgroundColor: "rgba(68, 68, 226, 0.04)",
                                        },
                                      }}
                                    >
                                      Quick Actions
                                    </Button>
                                  </Box>
                                </StyledTableCell>
                              </StyledTableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: 2,
                        p: 2,
                      }}
                    >
                      {filteredJobPostings.map((job, index) => {
                        const colorIndex = index % 4;
                        const colors = [
                          { bg: "rgba(114, 74, 59, 0.15)", color: "#724A3B" },
                          { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
                          { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
                          { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
                        ];
                        const currentColor = colors[colorIndex];

                        return (
                          <Paper
                            key={job.id}
                            elevation={0}
                            onClick={() => {
                              router.push(`/dashboard/job-posting/${job.id}/submissions`);
                              setSearchDialogOpen(false);
                            }}
                            sx={{
                              // p: 1,
                              mb: 2,
                              borderRadius: 2,
                              border: "1px solid rgba(17, 17, 17, 0.08)",
                              cursor: "pointer",
                              transition: "all 0.3s ease-in-out",
                              "&:hover": {
                                borderColor: "rgba(17, 17, 17, 0.16)",
                                backgroundColor: "rgba(17, 17, 17, 0.02)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                              },
                            }}
                          >
                            <Stack spacing={2}>
                              <Box p={2}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                  sx={{ mb: 2 }}
                                >
                                  <StatusBadge
                                    className={`${job.status === "active" ? "active" : "closed"} ${updatingJobId === job.id ? "status-changing loading" : ""}`}
                                    onClick={(e) => {
                                      if (updatingJobId === job.id) return; // Prevent click when updating
                                      e.stopPropagation();
                                      handleStatusToggle(job);
                                    }}
                                    sx={{
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      pointerEvents: updatingJobId === job.id ? "none" : "auto", // Disable pointer events when updating
                                    }}
                                  >
                                    <span className="status-text">
                                      {updatingJobId === job.id ? (
                                        <>
                                          Updating...
                                          <CircularProgress
                                            size={12}
                                            sx={{ color: job.status === "active" ? "#2B656E" : "#EB5757" }}
                                          />
                                        </>
                                      ) : (
                                        job.status
                                      )}
                                    </span>
                                    {updatingJobId !== job.id && <ChevronDownIcon />}
                                  </StatusBadge>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(job.id);
                                    }}
                                    sx={{
                                      color: "rgba(17, 17, 17, 0.48)",
                                      padding: "3px",
                                      "&:hover": {
                                        backgroundColor: "rgba(68, 68, 226, 0.04)",
                                        color: theme.palette.primary.main,
                                      },
                                    }}
                                  >
                                    <ShareLinkIcon />
                                  </IconButton>
                                </Stack>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "18px",
                                    color: "rgba(17, 17, 17, 0.92)",
                                    mb: 3,
                                  }}
                                >
                                  {job.title}
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ my: 1, mb: 1, flexWrap: "wrap" }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      color: "rgba(17, 17, 17, 0.72)",
                                      fontSize: "14px",
                                      fontWeight: 400,
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    <WorkTypeIcon />
                                    {job.job_type}
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      color: "rgba(17, 17, 17, 0.72)",
                                      fontSize: "14px",
                                      fontWeight: 400,
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    <LocationIcon />
                                    {job.location}
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      color: "rgba(17, 17, 17, 0.72)",
                                      fontSize: "14px",
                                      fontWeight: 400,
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    <WorkModelIcon />
                                    {job.work_model}
                                  </Box>
                                </Stack>
                              </Box>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: "8px",
                                }}
                              >
                                <Grid
                                  container
                                  alignItems="center"
                                  spacing={2}
                                  sx={{
                                    borderRadius: "8px",
                                    margin: "auto",
                                    width: "100%",
                                    flexWrap: "wrap",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={`${job.stage_counts.new} Applicants`}
                                    size="medium"
                                    sx={{
                                      borderRadius: "12px",
                                      fontSize: "14px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "flex-start",
                                      bgcolor: "rgba(114, 74, 59, 0.15)",
                                      color: "#724A3B",
                                    }}
                                  />
                                  <Chip
                                    label={`${job.stage_counts.skill_assessment} Completed Assessments`}
                                    size="medium"
                                    sx={{
                                      borderRadius: "12px",
                                      fontSize: "14px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "flex-start",
                                      bgcolor: "rgba(43, 101, 110, 0.15)",
                                      color: "#2B656E",
                                    }}
                                  />
                                  <Chip
                                    label={`${job.stage_counts.interviews} In interviews`}
                                    size="medium"
                                    sx={{
                                      borderRadius: "12px",
                                      fontSize: "14px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "flex-start",
                                      bgcolor: "rgba(118, 50, 95, 0.15)",
                                      color: "#76325F",
                                    }}
                                  />
                                  <Chip
                                    label={`${job.stage_counts.acceptance} Candidates accepted`}
                                    size="medium"
                                    sx={{
                                      borderRadius: "12px",
                                      fontSize: "14px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "flex-start",
                                      bgcolor: "rgba(59, 95, 158, 0.15)",
                                      color: "#3B5F9E",
                                    }}
                                  />
                                </Grid>
                              </Box>
                              <Divider sx={{ my: 2, borderColor: "rgba(17, 17, 17, 0.08)" }} />
                              <Box
                                sx={{
                                  px: 2,
                                  pb: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setJobToDelete(job);
                                    setDeleteDialogOpen(true);
                                  }}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    color: "rgba(17, 17, 17, 0.72)",
                                    transition: "all 0.3s ease-in-out",
                                    cursor: "pointer",
                                    "&:hover": {
                                      color: "#d32f2f",
                                      transform: "translateX(-4px)",
                                    },
                                  }}
                                >
                                  <DeleteOutlineIcon
                                    sx={{
                                      fontSize: "16px",
                                      mr: 0.5,
                                      transition: "all 0.3s ease-in-out",
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: "14px",
                                      fontWeight: 500,
                                      transition: "all 0.3s ease-in-out",
                                    }}
                                  >
                                    Delete
                                  </Typography>
                                </Box>
                                <Divider
                                  orientation="vertical"
                                  flexItem
                                  sx={{
                                    borderColor: "rgba(17, 17, 17, 0.08)",
                                    height: "20px",
                                    alignSelf: "center",
                                  }}
                                />
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "rgba(17, 17, 17, 0.72)",
                                    transition: "all 0.3s ease-in-out",
                                    cursor: "pointer",
                                    flex: 1,
                                    "&:hover": {
                                      color: theme.palette.primary.main,
                                      transform: "translateX(4px)",
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: "14px",
                                      fontWeight: 500,
                                      mr: 1,
                                      transition: "all 0.3s ease-in-out",
                                    }}
                                  >
                                    View submissions
                                  </Typography>
                                  <ArrowForwardIcon
                                    sx={{
                                      fontSize: "16px",
                                      transition: "all 0.3s ease-in-out",
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            </DashboardCard>
          </Box>
        </Stack>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleQuickActionsClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "12px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            minWidth: "200px",
          },
        }}
      >
        <MenuItem
          onClick={handleViewSubmissions}
          sx={{
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(68, 68, 226, 0.04)",
            },
          }}
        >
          <VisibilityRoundedIcon
            sx={{
              mr: 1.5,
              color: "rgba(17, 17, 17, 0.48)",
              fontSize: "20px",
            }}
          />
          <Typography sx={{ color: "rgba(17, 17, 17, 0.92)", fontSize: "14px" }}>View Submissions</Typography>
        </MenuItem>
        <MenuItem
          onClick={handleEdit}
          sx={{
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(68, 68, 226, 0.04)",
            },
          }}
        >
          <EditRoundedIcon
            sx={{
              mr: 1.5,
              color: "rgba(17, 17, 17, 0.48)",
              fontSize: "20px",
            }}
          />
          <Typography sx={{ color: "rgba(17, 17, 17, 0.92)", fontSize: "14px" }}>Edit</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedJob &&
            (selectedJob.status === "active" ? handleCloseResponses(selectedJob) : handleStatusToggle(selectedJob))
          }
          sx={{
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(68, 68, 226, 0.04)",
            },
          }}
        >
          {selectedJob?.status === "active" ? (
            <>
              <BlockRoundedIcon
                sx={{
                  mr: 1.5,
                  color: "rgba(17, 17, 17, 0.48)",
                  fontSize: "20px",
                }}
              />
              <Typography sx={{ color: "rgba(17, 17, 17, 0.92)", fontSize: "14px" }}>Close responses</Typography>
            </>
          ) : (
            <>
              <CheckCircleOutlineOutlinedIcon
                sx={{
                  mr: 1.5,
                  color: "rgba(17, 17, 17, 0.48)",
                  fontSize: "20px",
                }}
              />
              <Typography sx={{ color: "rgba(17, 17, 17, 0.92)", fontSize: "14px" }}>Reopen Job</Typography>
            </>
          )}
        </MenuItem>
        <MenuItem
          onClick={handleShareClick}
          sx={{
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(68, 68, 226, 0.04)",
            },
          }}
        >
          <ShareRoundedIcon
            sx={{
              mr: 1.5,
              color: "rgba(17, 17, 17, 0.48)",
              fontSize: "20px",
            }}
          />
          <Typography sx={{ color: "rgba(17, 17, 17, 0.92)", fontSize: "14px" }}>Share</Typography>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.error[theme.palette.mode === "dark" ? "dark" : "main"] + "1F",
            },
          }}
        >
          <DeleteRoundedIcon
            sx={{
              mr: 1.5,
              color: (theme) => theme.palette.error.main,
              fontSize: "20px",
            }}
          />
          <Typography sx={{ color: "rgba(17, 17, 17, 0.92)", fontSize: "14px" }}>Delete</Typography>
        </MenuItem>
      </Menu>

      {selectedJob && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          jobTitle={selectedJob.title}
          jobId={selectedJob.id}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
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
            onClick={handleDeleteCancel}
            sx={{ textTransform: "none", "&:hover": { backgroundColor: theme.palette.primary.dark } }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteConfirm}
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

      {/* Add Search Modal */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: "#F5F7FA",
            p: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton onClick={() => setSearchDialogOpen(false)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Search Jobs
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              autoFocus
              fullWidth
              placeholder="Search job title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setSearchDialogOpen(false);
                }
              }}
              sx={{
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
              }}
            />
            <Button
              variant="contained"
              onClick={() => setSearchDialogOpen(false)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Search
            </Button>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            {filteredJobPostings.map((job, index) => {
              const colorIndex = index % 4;
              const colors = [
                { bg: "rgba(114, 74, 59, 0.15)", color: "#724A3B" },
                { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
                { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
                { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
              ];
              const currentColor = colors[colorIndex];

              return (
                <Paper
                  key={job.id}
                  elevation={0}
                  onClick={() => {
                    router.push(`/dashboard/job-posting/${job.id}/submissions`);
                    setSearchDialogOpen(false);
                  }}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(17, 17, 17, 0.08)",
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      borderColor: "rgba(17, 17, 17, 0.16)",
                      backgroundColor: "rgba(17, 17, 17, 0.02)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "rgba(17, 17, 17, 0.92)",
                          mb: 1,
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ my: 1, mb: 1, flexWrap: "wrap" }}>
                        <Box
                          sx={{
                            bgcolor: colors[0].bg,
                            color: colors[0].color,
                            px: 2,
                            py: 0.75,
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: 400,
                            textTransform: "capitalize",
                            width: "max-content",
                          }}
                        >
                          <WorkTypeIcon />
                          {job.job_type}
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "rgba(17, 17, 17, 0.72)",
                            fontSize: "14px",
                            fontWeight: 400,
                            textTransform: "capitalize",
                          }}
                        >
                          <LocationIcon />
                          {job.location}
                        </Box>
                        <Box
                          sx={{
                            bgcolor: colors[2].bg,
                            color: colors[2].color,
                            px: 2,
                            py: 0.75,
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: 400,
                            textTransform: "capitalize",
                            width: "max-content",
                          }}
                        >
                          <WorkModelIcon />
                          {job.work_model}
                        </Box>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <Box
                        sx={{
                          bgcolor: "rgba(17, 17, 17, 0.04)",
                          p: 1.5,
                          borderRadius: "8px",
                          flex: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#1CC47E",
                            fontSize: "12px",
                            mb: 0.5,
                            textAlign: "center",
                          }}
                        >
                          Candidates applied
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#1CC47E",
                            textAlign: "center",
                          }}
                        >
                          {job.stage_counts.new}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: "rgba(17, 17, 17, 0.04)",
                          p: 1.5,
                          borderRadius: "8px",
                          flex: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(17, 17, 17, 0.48)",
                            fontSize: "12px",
                            mb: 0.5,
                          }}
                        >
                          In assessment
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "rgba(17, 17, 17, 0.92)",
                          }}
                        >
                          {job.stage_counts.skill_assessment}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: "rgba(17, 17, 17, 0.04)",
                          p: 1.5,
                          borderRadius: "8px",
                          flex: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(17, 17, 17, 0.48)",
                            fontSize: "12px",
                            mb: 0.5,
                          }}
                        >
                          In interviews
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "rgba(17, 17, 17, 0.92)",
                          }}
                        >
                          {job.stage_counts.interviews}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        </Box>
      </Dialog>

      <DeleteSnackbar
        open={statusSnack.open}
        message={statusSnack.message}
        onClose={() => setStatusSnack({ open: false, message: "" })}
      />

      <DeleteSnackbar
        open={snackbarOpen}
        message="Job opening link has been copied to clipboard"
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={4000}
      />
    </Box>
  );
};

export default JobPostings;
