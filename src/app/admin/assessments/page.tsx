"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Link,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Stack,
  TextField,
  InputAdornment,
  Backdrop,
} from "@mui/material";
import { PlusIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../styles";
import { useAdminAssessmentsList } from "@/queries/adminAssessments.queries";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { pdfjs } from "react-pdf";
import mammoth from "mammoth";
import { AssessmentQueries, type Id } from "@/queries/assessment.queries";
import AssessmentTypeDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentTypeDialog";
import AssessmentUploadDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentUploadDialog";
import AssessmentConfigDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentConfigDialog";
import TechnicalAssessmentEditor from "@/app/dashboard/components/dashboard/assessments/TechnicalAssessmentEditor";
import AssessmentFormBuilder from "@/app/dashboard/components/dashboard/assessments/AssessmentFormBuilder";
import AssessmentSuccessModal from "@/app/dashboard/components/dashboard/assessments/AssessmentSuccessModal";

export default function MasterAssessmentLibraryPage() {
  const router = useRouter();
  const assessments = useAdminAssessmentsList();
  const isLoading = assessments === undefined;

  const {
    RemoveAssessment,
    GenerateSkills,
    GenerateQuestions,
    GenerateTechnicalContent,
    CreateAssessment,
    CreateTechnicalAssessment,
    UpdateAssessment,
  } = AssessmentQueries();

  // ─── Creation flow state ───────────────────────────────────────────────────
  const [selectTypeOpen, setSelectTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("technical_assessment");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const handleContinueFromTypeSelect = () => {
    setSelectTypeOpen(false);
    router.push(`/admin/assessments/new?type=${selectedType}`);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
            Master Assessment Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and distribute test templates to your recruiters.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon style={{ width: 24, height: 24 }} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
          }}
          onClick={() => setSelectTypeOpen(true)}
        >
          + New Master Template
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {assessments?.map((t: any) => (
            <Paper
              key={t._id}
              elevation={0}
              sx={{
                ...ADMIN_CARD_SX,
                width: 320,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Chip
                  label={t.type === "technical_assessment" ? "TECHNICAL" : "QUIZ"}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    borderRadius: 2,
                  }}
                  variant="outlined"
                />
                <Chip
                  label="GLOBAL"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    border: "none",
                  }}
                />
              </Box>
              <Box sx={{ px: 2, pb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {t.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Level: {t.level || "N/A"}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link href="#" underline="hover" sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                  Edit Content
                </Link>
                <IconButton size="small" sx={{ color: "text.secondary" }} title="Settings">
                  <Cog6ToothIcon style={{ width: 24, height: 24 }} />
                </IconButton>
              </Box>
            </Paper>
          ))}
          <Paper
            elevation={0}
            component={Button}
            onClick={() => setSelectTypeOpen(true)}
            sx={{
              width: 320,
              height: 200,
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              textTransform: "none",
              color: "text.secondary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <PlusIcon style={{ width: 24, height: 24 }} />
            <Typography fontWeight={600} sx={{ letterSpacing: "0.04em" }}>
              ADD TEMPLATE
            </Typography>
          </Paper>
        </Box>
      )}


      {/* ─── Step 1: Select Type Dialog (stays on page) ─────────────────────── */}
      <Dialog
        open={selectTypeOpen}
        onClose={() => setSelectTypeOpen(false)}
        maxWidth="xs"
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(17, 17, 17, 0.32)", backdropFilter: "blur(4px)" } } }}
        PaperProps={{ sx: { borderRadius: "8px", p: 0, bgcolor: "rgba(241, 244, 249, 1)" } }}
      >
        <DialogContent
          sx={{
            p: { xs: 3, md: 4 },
            position: "relative",
            bgcolor: "rgba(241, 244, 249, 1)",
            minWidth: { xs: 320, md: 400 },
          }}
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
              "& .MuiSelect-select": { color: "rgba(17, 17, 17, 0.92)", fontWeight: 500, fontSize: 16, py: 2 },
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
              onClick={handleContinueFromTypeSelect}
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

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
