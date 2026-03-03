"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface AssessmentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  savedAssessmentId: string | null;
  router: AppRouterInstance;
}

export default function AssessmentSuccessModal({
  open,
  onClose,
  savedAssessmentId,
  router,
}: AssessmentSuccessModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: { 
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(0.4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 0,
          maxWidth: "600px",
          width: "100%",
          bgcolor: "rgba(241, 244, 249, 1)",
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 3, md: 4 },
          position: "relative",
          bgcolor: "rgba(241, 244, 249, 1)",
          minWidth: { xs: 320, md: 600 },
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 24, right: 24, zIndex: 1 }}
        >
          <CloseIcon sx={{ fontSize: 28, color: "rgba(17, 17, 17, 0.32)" }} />
        </IconButton>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 24,
              color: "rgba(17, 17, 17, 0.92)",
              mb: 2,
            }}
          >
            Assessment Saved Successfully!
          </Typography>
          <Typography
            sx={{ fontSize: 16, color: "rgba(17, 17, 17, 0.68)", mb: 4 }}
          >
            What would you like to do next?
          </Typography>
        </Box>
        <Stack spacing={2}>
          <Button
            component="a"
            href={`/assessment?assessment_id=${savedAssessmentId}`}
            fullWidth
            variant="contained"
            target="_blank"
            sx={{
              bgcolor: "#4444E2",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              borderRadius: "12px",
              py: 1.5,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#5656E6" },
            }}
          >
            View Assessment
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push("/dashboard/assessments")}
            sx={{
              borderColor: "#4444E2",
              color: "#4444E2",
              fontWeight: 600,
              fontSize: 18,
              borderRadius: "12px",
              py: 1.5,
              textTransform: "none",
              "&:hover": {
                borderColor: "#5656E6",
                bgcolor: "rgba(68, 68, 226, 0.04)",
              },
            }}
          >
            Back to Assessments
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
