"use client";
import React from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";

interface CVAnalysis {
  match_score: number;
  skills_match?: string[];
  missing_skills?: string[];
  experience_years?: number;
  recommendations?: string;
  summary?: string;
}

interface CVAnalysisSectionProps {
  cvAnalysis: CVAnalysis | null;
}

export default function CVAnalysisSection({ cvAnalysis }: CVAnalysisSectionProps) {
  if (!cvAnalysis) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Skills Analysis
          </Typography>
          <Stack spacing={1}>
            {(cvAnalysis.missing_skills?.length ?? 0) > 0 && (
              <Box>
                <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                  Missing Required Skills:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {cvAnalysis.missing_skills?.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      title={skill}
                      sx={{
                        bgcolor: "rgba(244, 67, 54, 0.1)",
                        color: "error.main",
                        borderRadius: "16px",
                        maxWidth: 240,
                        "& .MuiChip-label": {
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
        <Box
          sx={{
            bgcolor: "rgba(17, 17, 17, 0.04)",
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Recommendations
          </Typography>
          <Typography color="text.grey[100]" sx={{ whiteSpace: "pre-line" }}>
            {cvAnalysis.recommendations}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
