"use client";

import React from "react";
import { Box, Button, Paper, Typography, Chip, IconButton } from "@mui/material";
import { PlusIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { MOCK_EMAIL_TEMPLATES } from "../mock-data";
import { ADMIN_CARD_SX, ADMIN_CARD_SHADOW } from "../styles";

export default function GlobalCommunicationTemplatesPage() {
  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
            Global Communication Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set the standard for recruiter-to-candidate communication.
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
            boxShadow: ADMIN_CARD_SHADOW,
          }}
        >
          + New Template
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {MOCK_EMAIL_TEMPLATES.map((t) => (
          <Paper
            key={t.id}
            elevation={0}
            sx={{
              ...ADMIN_CARD_SX,
              flex: "1 1 320px",
              maxWidth: 440,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "text.secondary",
              }}
              title="Edit template"
            >
              <Cog6ToothIcon style={{ width: 24, height: 24 }} />
            </IconButton>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase" }}>
                Subject
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                {t.subject}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase" }}>
                Body preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t.bodyPreview}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {t.variables.map((v) => (
                  <Chip
                    key={v}
                    label={v}
                    size="small"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
