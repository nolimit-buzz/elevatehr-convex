"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { ADMIN_CARD_SX } from "../styles";

export default function AdminSettingsPage() {
  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your company and workflows. Branding, domain, and global communication.
        </Typography>
      </Box>
      <Paper
        elevation={0}
        sx={{
          ...ADMIN_CARD_SX,
          p: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Settings content (white-labeling, domain, email templates) will go here.
        </Typography>
      </Paper>
    </Box>
  );
}
