"use client";

import React from "react";
import { Box, Button, Paper, Typography, Chip, Link, IconButton, CircularProgress } from "@mui/material";
import { PlusIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../styles";
import { useAdminAssessmentsList } from "@/queries/adminAssessments.queries";

export default function MasterAssessmentLibraryPage() {
  const assessments = useAdminAssessmentsList();
  const isLoading = assessments === undefined;

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
    </Box>
  );
}
