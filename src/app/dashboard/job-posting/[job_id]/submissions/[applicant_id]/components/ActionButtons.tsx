"use client";
import React from "react";
import { Box, Button } from "@mui/material";

interface ActionButtonsProps {
  onReject: () => void;
  onMoveToAssessment: () => void;
}

export default function ActionButtons({ onReject, onMoveToAssessment }: ActionButtonsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        mt: 4,
        position: "sticky",
        bottom: 0,
        bgcolor: "background.paper",
        py: 2,
        zIndex: 10,
      }}
    >
      <Button
        variant="outlined"
        onClick={onReject}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          px: 3,
          py: 1.5,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(68, 68, 226, 0.08)",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(68, 68, 226, 0.1)",
          },
        }}
      >
        Reject
      </Button>
      <Button
        variant="contained"
        onClick={onMoveToAssessment}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          px: 3,
          py: 1.5,
          bgcolor: "primary.main",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: "#6666E6",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
          },
        }}
      >
        Move to Assessment
      </Button>
    </Box>
  );
}
