"use client";

import React from "react";
import { Box, Button, Paper, Typography, Chip, IconButton, CircularProgress } from "@mui/material";
import { PlusIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../styles";
import { useAdminEmailTemplatesList } from "@/queries/adminEmailTemplates.queries";

const DEFAULT_TEMPLATES = [
  { id: "blank", title: "UI/UX Designer" },
  { id: "software", title: "Software develop..." },
  { id: "resume-serif", title: "Frontend" },
  { id: "privacy", title: "Quality Assurence" },
  { id: "privacy", title: "Mobile Developer" },

];

function TemplateCard({ template }: { template: (typeof DEFAULT_TEMPLATES)[0] }) {
  return (
    <Box sx={{ width: "100%", cursor: "pointer", "&:hover .preview": { borderColor: "primary.main" } }}>
      <Paper
        className="preview"
        elevation={0}
        sx={{
          aspectRatio: "140 / 180",
          borderRadius: "4px",
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
          bgcolor: "#fff",
          mb: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "border-color 0.2s",
        }}
      >

        <Box sx={{ flex: 1, p: 1.5 }}>
          <Box sx={{ width: "100%", height: "100%", bgcolor: "rgba(0,0,0,0.02)", borderRadius: "2px", p: 1 }}>
            <Box sx={{ width: "60%", height: 4, bgcolor: "rgba(0,0,0,0.06)", mb: 1 }} />
            <Box sx={{ width: "100%", height: 2, bgcolor: "rgba(0,0,0,0.04)", mb: 0.5 }} />
            <Box sx={{ width: "100%", height: 2, bgcolor: "rgba(0,0,0,0.04)", mb: 0.5 }} />
            <Box sx={{ width: "80%", height: 2, bgcolor: "rgba(0,0,0,0.04)", mb: 2 }} />
            <Box sx={{ width: "40%", height: 4, bgcolor: "rgba(0,0,0,0.06)", mb: 1 }} />
            <Box sx={{ width: "100%", height: 2, bgcolor: "rgba(0,0,0,0.04)", mb: 0.5 }} />
            <Box sx={{ width: "90%", height: 2, bgcolor: "rgba(0,0,0,0.04)" }} />
          </Box>
        </Box>

      </Paper>
      <Typography variant="body2" fontWeight={500} noWrap sx={{ color: "text.primary", fontSize: "0.875rem" }}>
        {template.title}
      </Typography>
    </Box>
  );
}

export default function GlobalCommunicationTemplatesPage() {
  const templates = useAdminEmailTemplatesList();

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <Box
        sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 4 }}
      >
        {/* <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
            Global Communication Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set the standard for recruiter-to-candidate communication.
          </Typography>
        </Box> */}
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
          New Template
        </Button>
      </Box>

      {/* ─── Template Gallery ─────────────────────────────────────────────────── */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: "text.primary" }}>
          Start a new template
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 3,
            pb: 2,
          }}
        >
          {DEFAULT_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </Box>
      </Box>

      {/* ─── Existing Templates List ─────────────────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: "text.primary" }}>
        Recent templates
      </Typography>
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
