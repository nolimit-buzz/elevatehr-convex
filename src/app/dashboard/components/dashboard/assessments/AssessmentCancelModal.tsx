"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
  Box,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

interface AssessmentCancelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AssessmentCancelModal({
  open,
  onClose,
  onConfirm,
}: AssessmentCancelModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: { 
            backgroundColor: "rgba(17, 17, 17, 0.32)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          bgcolor: "rgba(241, 244, 249, 1)",
        },
      }}
    >
      <DialogContent sx={{ p: 4, textAlign: "center", bgcolor: "rgba(241, 244, 249, 1)" }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "rgba(255, 71, 71, 0.1)",
            color: "#FF4747",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 700,
            color: "rgba(34, 34, 79, 1)",
            mb: 1.5,
          }}
        >
          Stop Importing?
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            color: "rgba(34, 34, 79, 0.72)",
            mb: 4,
            lineHeight: 1.5
          }}
        >
          Are you sure you want to stop the import? Any records already processed will be saved, but the rest will be skipped.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 16,
              py: 1.5,
              borderColor: "rgba(34, 34, 79, 0.12)",
              color: "rgba(34, 34, 79, 0.84)",
              "&:hover": {
                bgcolor: "rgba(34, 34, 79, 0.04)",
                borderColor: "rgba(34, 34, 79, 0.24)",
              },
            }}
          >
            No, continue
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={onConfirm}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 16,
              py: 1.5,
              bgcolor: "#FF4747",
              boxShadow: "none",
              "&:hover": { 
                bgcolor: "#E63E3E",
                boxShadow: "0 4px 12px rgba(255, 71, 71, 0.2)",
              },
            }}
          >
            Yes, stop
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
