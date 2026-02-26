"use client";

import React from "react";
import { Box, Button, Paper, Typography, Chip, IconButton, CircularProgress } from "@mui/material";
import { PlusIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../styles";
import { useAdminEmailTemplatesList } from "@/queries/adminEmailTemplates.queries";

export default function GlobalCommunicationTemplatesPage() {
  const templates = useAdminEmailTemplatesList();

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 4 }}
      >
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
          }}
        >
          + New Template
        </Button>
      </Box>

      {templates === undefined ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Typography color="text.secondary">No global communication templates found.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {templates.map((t) => (
            <Paper
              key={t._id}
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
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ textTransform: "capitalize" }}>
                  {t.type.replace(/_/g, " ")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase" }}
                >
                  Subject
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  {t.subject || "No subject"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase" }}
                >
                  Body preview
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {t.content.replace(/<[^>]*>?/gm, "")}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
