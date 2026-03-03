"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
  TextField,
  InputAdornment,
  Container,
  Divider,
  Dialog,
  DialogContent,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import Select from "@mui/material/Select";
import { useRouter } from "next/navigation";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useAssessmentsList, AssessmentQueries, type Id } from "@/queries/assessment.queries";

export interface Assessment {
  _id: Id<"assessments">;
  level?: string;
  type: string;
  color?: string;
  text_color?: string;
  title: string;
  description?: string;
  responses?: number;
  duration?: string;
}

export default function AssessmentsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [selectTypeOpen, setSelectTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("technical_assessment");

  // Use Convex query for assessments
  const assessmentsData = useAssessmentsList();
  const assessments = assessmentsData ?? [];
  const loading = assessmentsData === undefined;

  // Convex mutations
  const { RemoveAssessment } = AssessmentQueries();

  // Menu and delete state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Header menu state
  const [headerMenuAnchorEl, setHeaderMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const formatType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Handle menu open for assessment cards
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, assessment: Assessment) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAssessment(assessment);
  };

  // Handle menu close for assessment cards
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedAssessment(null);
  };

  // Handle delete from menu
  const handleDeleteFromMenu = () => {
    if (selectedAssessment) {
      setAssessmentToDelete(selectedAssessment);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;

    setDeleting(true);
    try {
      const { error } = await RemoveAssessment(assessmentToDelete._id);

      if (error) {
        throw new Error(error);
      }

      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);

      // Show success message
      setSnackbarMessage("Assessment deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error("Error deleting assessment:", err);
      // Show error message
      setSnackbarMessage("Failed to delete assessment. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssessmentToDelete(null);
  };

  // Handle header menu open
  const handleHeaderMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHeaderMenuAnchorEl(event.currentTarget);
  };

  // Handle header menu close
  const handleHeaderMenuClose = () => {
    setHeaderMenuAnchorEl(null);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ bgcolor: "#F6F7FB", minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ maxWidth: "1440px", py: 4 }}>
        {/* Banner */}
        <Box
          sx={{
            backgroundColor: `primary.main`,
            backgroundImage: "url(/images/backgrounds/banner-bg.svg)",
            backgroundSize: "cover",
            backgroundPosition: "right center",
            borderRadius: "12px",
            p: { xs: 3, md: 4 },
            mb: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700, fontSize: { xs: 20, md: 24 } }}>
            Assessments
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: { xs: 2, md: 0 } }}>
            <TextField
              placeholder="Search"
              size="small"
              sx={{
                "& fieldset": {
                  border: "none !important",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255)",
                  opacity: 0.84,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(255, 255, 255, 0.84)" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#fff",
                color: "rgba(17, 17, 17, 0.92)",
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "100%",
                letterSpacing: "0.16px",
                borderRadius: "8px",
                boxShadow: "none",
                px: 3,
                py: 1.5,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#F4F4FF",
                },
              }}
              onClick={() => setSelectTypeOpen(true)}
            >
              + New Assessment
            </Button>
          </Stack>
        </Box>
        {/* No error message for failed to fetch assessments */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box sx={{ p: 3, borderRadius: "12px", bgcolor: "#fff", border: "1px solid #E4E7EC", minHeight: 220 }}>
                  <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: "20px", mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={16} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: "20px", mt: "auto" }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : assessments.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              mt: 10,
              color: "rgba(17, 17, 17, 0.48)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <AssignmentOutlinedIcon sx={{ fontSize: 64, color: "#D6D6F6", mb: 3 }} />
            <Typography sx={{ fontSize: 24, fontWeight: 500, color: "rgba(17, 17, 17, 0.48)" }}>
              Your assessments will appear here
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {assessments.map((a, idx) => (
              <Grid item xs={12} sm={6} md={3} key={a._id || idx}>
                <Card
                  sx={{
                    height: "100%",
                    // p: 3,
                    borderRadius: "12px",
                    boxShadow: "none",
                    bgcolor: "#fff",
                    border: "1px solid #E4E7EC",
                    minHeight: 220,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    transition: "box-shadow 0.2s",
                    position: "relative",
                  }}
                >
                  {/* Menu Icon - Already Added */}
                  <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, a)}
                      sx={{
                        color: "rgba(17, 17, 17, 0.48)",
                        "&:hover": {
                          backgroundColor: "rgba(17, 17, 17, 0.08)",
                          color: "rgba(17, 17, 17, 0.68)",
                        },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Card Content */}
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        bgcolor: a.color,
                        borderRadius: "20px",
                        // px: '12px',
                        py: "6px",
                        mb: 1.5,
                        height: 32,
                        minWidth: 0,
                        width: "max-content",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", height: 20 }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M2.5 18.3333H17.5"
                            stroke={
                              a.level === "Senior"
                                ? "rgba(79, 27, 85, 0.72)"
                                : a.level === "Junior"
                                  ? "rgba(125, 88, 15, 0.72)"
                                  : a.level === "Mid-level"
                                    ? "rgba(36, 115, 127, 0.72)"
                                    : "#4F1B55"
                            }
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4.66665 6.98315H3.33333C2.875 6.98315 2.5 7.35815 2.5 7.81649V14.9998C2.5 15.4582 2.875 15.8332 3.33333 15.8332H4.66665C5.12498 15.8332 5.49998 15.4582 5.49998 14.9998V7.81649C5.49998 7.35815 5.12498 6.98315 4.66665 6.98315Z"
                            stroke={
                              a.level === "Senior"
                                ? "rgba(79, 27, 85, 0.72)"
                                : a.level === "Junior"
                                  ? "rgba(125, 88, 15, 0.72)"
                                  : a.level === "Mid-level"
                                    ? "rgba(36, 115, 127, 0.72)"
                                    : "#4F1B55"
                            }
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.6666 4.32495H9.33333C8.875 4.32495 8.5 4.69995 8.5 5.15828V14.9999C8.5 15.4583 8.875 15.8333 9.33333 15.8333H10.6666C11.125 15.8333 11.5 15.4583 11.5 14.9999V5.15828C11.5 4.69995 11.125 4.32495 10.6666 4.32495Z"
                            stroke={
                              a.level === "Senior"
                                ? "rgba(79, 27, 85, 0.72)"
                                : a.level === "Junior"
                                  ? "rgba(125, 88, 15, 0.72)"
                                  : a.level === "Mid-level"
                                    ? "rgba(36, 115, 127, 0.72)"
                                    : "#4F1B55"
                            }
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16.6666 1.66675H15.3333C14.875 1.66675 14.5 2.04175 14.5 2.50008V15.0001C14.5 15.4584 14.875 15.8334 15.3333 15.8334H16.6666C17.125 15.8334 17.5 15.4584 17.5 15.0001V2.50008C17.5 2.04175 17.125 1.66675 16.6666 1.66675Z"
                            stroke={
                              a.level === "Senior"
                                ? "rgba(79, 27, 85, 0.72)"
                                : a.level === "Junior"
                                  ? "rgba(125, 88, 15, 0.72)"
                                  : a.level === "Mid-level"
                                    ? "rgba(36, 115, 127, 0.72)"
                                    : "#4F1B55"
                            }
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Box>
                      <Typography
                        sx={{ color: a.text_color, fontWeight: 600, fontSize: 16, ml: 0.5, mr: 0.5, lineHeight: 1 }}
                      >
                        {formatType(a.type)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        fontSize: "20px",
                        fontStyle: "normal",
                        color: "rgba(17, 17, 17, 0.92)",
                        lineHeight: "120%", // 24px
                        letterSpacing: "0.1px",
                        mb: 0.5,
                        leadingTrim: "both",
                        textEdge: "cap",
                        maxWidth: "280px",
                      }}
                    >
                      {a.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(17, 17, 17, 0.84)",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: 400,
                        lineHeight: "138%",
                        letterSpacing: "0.14px",
                        mb: 2,
                      }}
                    >
                      {a.description}
                    </Typography>
                  </Box>
                  {/* Custom Badge */}

                  {/* Card Footer */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 3,
                      borderTop: "1px solid #EEEFF2",
                      borderBottomLeftRadius: "12px",
                      borderBottomRightRadius: "12px",
                      bgcolor: "#fff",
                      mt: "auto",
                      px: 2,
                      // py: 1.5,
                    }}
                  >
                    <Button
                      // variant="outlined"
                      size="small"
                      sx={{
                        borderColor: "#D0D5DD",
                        color: "#111",
                        fontWeight: 500,
                        fontSize: "14px",
                        borderRadius: "8px",
                        px: 1,
                        py: 0.5,
                        my: 1.2,
                        textTransform: "none",
                        boxShadow: "none",
                        bgcolor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        "&:hover": {
                          borderColor: "#B0B5C0",
                          bgcolor: "#F9F9FB",
                        },
                      }}
                      onClick={() => router.push(`/dashboard/assessments/new?type=${a.type}&id=${a._id}`)}
                    >
                      <Box component="span" sx={{ display: "flex", alignItems: "center", mr: 0.5 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5.53999 19.5201C4.92999 19.5201 4.35999 19.31 3.94999 18.92C3.42999 18.43 3.17999 17.69 3.26999 16.89L3.63999 13.65C3.70999 13.04 4.07999 12.23 4.50999 11.79L12.72 3.10005C14.77 0.930049 16.91 0.870049 19.08 2.92005C21.25 4.97005 21.31 7.11005 19.26 9.28005L11.05 17.97C10.63 18.42 9.84999 18.84 9.23999 18.9401L6.01999 19.49C5.84999 19.5 5.69999 19.5201 5.53999 19.5201ZM15.93 2.91005C15.16 2.91005 14.49 3.39005 13.81 4.11005L5.59999 12.8101C5.39999 13.0201 5.16999 13.5201 5.12999 13.8101L4.75999 17.05C4.71999 17.38 4.79999 17.65 4.97999 17.82C5.15999 17.99 5.42999 18.05 5.75999 18L8.97999 17.4501C9.26999 17.4001 9.74999 17.14 9.94999 16.93L18.16 8.24005C19.4 6.92005 19.85 5.70005 18.04 4.00005C17.24 3.23005 16.55 2.91005 15.93 2.91005Z"
                            fill="#292D32"
                          />
                          <path
                            d="M17.3399 10.95C17.3199 10.95 17.2899 10.95 17.2699 10.95C14.1499 10.64 11.6399 8.26997 11.1599 5.16997C11.0999 4.75997 11.3799 4.37997 11.7899 4.30997C12.1999 4.24997 12.5799 4.52997 12.6499 4.93997C13.0299 7.35997 14.9899 9.21997 17.4299 9.45997C17.8399 9.49997 18.1399 9.86997 18.0999 10.28C18.0499 10.66 17.7199 10.95 17.3399 10.95Z"
                            fill="#292D32"
                          />
                          <path
                            d="M21 22.75H3C2.59 22.75 2.25 22.41 2.25 22C2.25 21.59 2.59 21.25 3 21.25H21C21.41 21.25 21.75 21.59 21.75 22C21.75 22.41 21.41 22.75 21 22.75Z"
                            fill="#292D32"
                          />
                        </svg>
                      </Box>
                      Edit
                    </Button>
                    <Divider orientation="vertical" flexItem />
                    <Typography
                      component="a"
                      target="_blank"
                      href={`/assessment?assessment_id=${a._id}`}
                      sx={{
                        color: "#757575",
                        fontSize: "14px",
                        fontWeight: 500,
                        textDecoration: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        "&:hover": {
                          textDecoration: "underline",
                          color: "#757575",
                        },
                      }}
                    >
                      <Box component="span" sx={{ display: "flex", alignItems: "center", mr: 0.5 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M11.9999 16.3299C9.60992 16.3299 7.66992 14.3899 7.66992 11.9999C7.66992 9.60992 9.60992 7.66992 11.9999 7.66992C14.3899 7.66992 16.3299 9.60992 16.3299 11.9999C16.3299 14.3899 14.3899 16.3299 11.9999 16.3299ZM11.9999 9.16992C10.4399 9.16992 9.16992 10.4399 9.16992 11.9999C9.16992 13.5599 10.4399 14.8299 11.9999 14.8299C13.5599 14.8299 14.8299 13.5599 14.8299 11.9999C14.8299 10.4399 13.5599 9.16992 11.9999 9.16992Z"
                            fill="#292D32"
                          />
                          <path
                            d="M12.0001 21.02C8.24008 21.02 4.69008 18.82 2.25008 15C1.19008 13.35 1.19008 10.66 2.25008 8.99998C4.70008 5.17998 8.25008 2.97998 12.0001 2.97998C15.7501 2.97998 19.3001 5.17998 21.7401 8.99998C22.8001 10.65 22.8001 13.34 21.7401 15C19.3001 18.82 15.7501 21.02 12.0001 21.02ZM12.0001 4.47998C8.77008 4.47998 5.68008 6.41998 3.52008 9.80998C2.77008 10.98 2.77008 13.02 3.52008 14.19C5.68008 17.58 8.77008 19.52 12.0001 19.52C15.2301 19.52 18.3201 17.58 20.4801 14.19C21.2301 13.02 21.2301 10.98 20.4801 9.80998C18.3201 6.41998 15.2301 4.47998 12.0001 4.47998Z"
                            fill="#292D32"
                          />
                        </svg>
                      </Box>
                      View Assessment
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      {/* New Assessment Modal */}
      <Dialog
        open={selectTypeOpen}
        onClose={() => setSelectTypeOpen(false)}
        maxWidth="xs"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(0.4px)",
            },
          },
        }}
        PaperProps={{ sx: { borderRadius: "20px", p: 0, bgcolor: "rgba(241, 244, 249, 1)" } }}
      >
        <DialogContent
          sx={{ p: { xs: 3, md: 4 }, position: "relative", bgcolor: "rgba(241, 244, 249, 1)", minWidth: { xs: 320, md: 400 } }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: "rgba(17, 17, 17, 0.92)", mb: 3, textAlign: "left" }}>
            Select Assessment Type
          </Typography>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            fullWidth
            displayEmpty
            sx={{
              mb: 3,
              bgcolor: "#F6F7FB",
              borderRadius: "10px",
              fontWeight: 500,
              fontSize: 16,
              "& .MuiSelect-select": {
                color: "rgba(17, 17, 17, 0.92)",
                fontWeight: 500,
                fontSize: 16,
                py: 2,
              },
            }}
          >
            <MenuItem value="technical_assessment" sx={{ fontWeight: 400, fontSize: 15 }}>
              Technical assessment
            </MenuItem>
            <MenuItem value="online_assessment_1" sx={{ fontWeight: 400, fontSize: 15 }}>
              Online assessment
            </MenuItem>
          </Select>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setSelectTypeOpen(false)}
              color="inherit"
              sx={{ fontWeight: 500, fontSize: 16, borderRadius: "8px", px: 3, py: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSelectTypeOpen(false);
                router.push(`/dashboard/assessments/new?type=${selectedType}`);
              }}
              sx={{
                fontWeight: 600,
                fontSize: 16,
                borderRadius: "8px",
                px: 3,
                py: 1,
                bgcolor: "#4444E2",
                "&:hover": { bgcolor: "#5656E6" },
              }}
            >
              Continue
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Assessment Card Menu Dropdown */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            minWidth: 160,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={handleDeleteFromMenu}
          sx={{
            color: "#DC3545",
            fontSize: "14px",
            fontWeight: 500,
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(220, 53, 69, 0.08)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 6.73001C20.98 6.73001 20.95 6.73001 20.92 6.73001C15.63 6.20001 10.35 6.00001 5.12 6.53001L3.08 6.73001C2.66 6.77001 2.29 6.47001 2.25 6.05001C2.21 5.63001 2.51 5.27001 2.92 5.23001L4.96 5.03001C10.28 4.49001 15.67 4.70001 21.07 5.23001C21.48 5.27001 21.78 5.64001 21.74 6.05001C21.71 6.44001 21.38 6.73001 21 6.73001Z"
                fill="#DC3545"
              />
              <path
                d="M8.5 5.72C8.46 5.72 8.42 5.72 8.37 5.71C7.97 5.64 7.69 5.25 7.76 4.85L7.98 3.54C8.14 2.58 8.36 1.25 10.69 1.25H13.31C15.65 1.25 15.87 2.63 16.02 3.55L16.24 4.85C16.31 5.26 16.03 5.65 15.63 5.71C15.22 5.78 14.83 5.5 14.77 5.1L14.55 3.8C14.41 2.93 14.38 2.76 13.32 2.76H10.7C9.64 2.76 9.62 2.9 9.47 3.79L9.24 5.09C9.18 5.46 8.86 5.72 8.5 5.72Z"
                fill="#DC3545"
              />
              <path
                d="M15.21 22.75H8.79C5.3 22.75 5.16 20.82 5.05 19.26L4.4 9.19C4.37 8.78 4.69 8.42 5.10 8.39C5.52 8.37 5.87 8.68 5.90 9.09L6.55 19.16C6.66 20.68 6.70 21.25 8.79 21.25H15.21C17.31 21.25 17.35 20.68 17.45 19.16L18.10 9.09C18.13 8.68 18.49 8.37 18.90 8.39C19.31 8.42 19.63 8.77 19.60 9.19L18.95 19.26C18.84 20.82 18.70 22.75 15.21 22.75Z"
                fill="#DC3545"
              />
              <path
                d="M13.66 17.25H10.33C9.92 17.25 9.58 16.91 9.58 16.5C9.58 16.09 9.92 15.75 10.33 15.75H13.66C14.07 15.75 14.41 16.09 14.41 16.5C14.41 16.91 14.07 17.25 13.66 17.25Z"
                fill="#DC3545"
              />
              <path
                d="M14.5 13.25H9.5C9.09 13.25 8.75 12.91 8.75 12.5C8.75 12.09 9.09 11.75 9.5 11.75H14.5C14.91 11.75 15.25 12.09 15.25 12.5C15.25 12.91 14.91 13.25 14.5 13.25Z"
                fill="#DC3545"
              />
            </svg>
          </Box>
          Delete
        </MenuItem>
      </Menu>

      {/* Header Menu Dropdown */}
      <Menu
        anchorEl={headerMenuAnchorEl}
        open={Boolean(headerMenuAnchorEl)}
        onClose={handleHeaderMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            minWidth: 180,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            // Add your header menu action here
            handleHeaderMenuClose();
          }}
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(68, 68, 226, 0.08)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 9H14V4H5V21H19V9Z"
                fill="#292D32"
              />
            </svg>
          </Box>
          Export Data
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Add your header menu action here
            handleHeaderMenuClose();
          }}
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(68, 68, 226, 0.08)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
                fill="#292D32"
              />
              <path d="M7 12H9V17H7V12Z" fill="#292D32" />
              <path d="M11 7H13V17H11V7Z" fill="#292D32" />
              <path d="M15 10H17V17H15V10Z" fill="#292D32" />
            </svg>
          </Box>
          View Analytics
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Add your header menu action here
            handleHeaderMenuClose();
          }}
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            py: 1.5,
            px: 2,
            "&:hover": {
              backgroundColor: "rgba(68, 68, 226, 0.08)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                fill="#292D32"
              />
            </svg>
          </Box>
          Help & Support
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(0.4px)",
            },
          },
        }}
        PaperProps={{ sx: { borderRadius: "20px", p: 0, bgcolor: "rgba(241, 244, 249, 1)" } }}
      >
        <DialogContent
          sx={{ p: { xs: 3, md: 4 }, position: "relative", bgcolor: "rgba(241, 244, 249, 1)", minWidth: { xs: 320, md: 400 } }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: "rgba(17, 17, 17, 0.92)", mb: 2, textAlign: "left" }}>
            Delete Assessment
          </Typography>
          <Typography sx={{ fontSize: 16, color: "rgba(17, 17, 17, 0.68)", mb: 3, textAlign: "left" }}>
            Are you sure you want to delete "{assessmentToDelete?.title}"? This action cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleDeleteCancel}
              // color="secondary.main"
              sx={{
                bgcolor: "primary.main",
                fontWeight: 500,
                fontSize: 16,
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": {
                  bgcolor: "primary.main",
                  opacity: 0.95,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              sx={{
                fontWeight: 600,
                fontSize: 16,
                borderRadius: "8px",
                px: 3,
                py: 1,
                borderColor: "#DC3545",
                color: "#DC3545",
                "&:hover": {
                  borderColor: "#C82333",
                  color: "#C82333",
                  backgroundColor: "rgba(220, 53, 69, 0.04)",
                },
                "&:disabled": {
                  borderColor: "#DC3545",
                  color: "#DC3545",
                  opacity: 0.6,
                },
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            borderRadius: "8px",
            "& .MuiAlert-icon": {
              fontSize: "20px",
            },
            "& .MuiAlert-message": {
              fontSize: "14px",
              fontWeight: 500,
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
