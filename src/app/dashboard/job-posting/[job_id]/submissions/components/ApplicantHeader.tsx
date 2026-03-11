"use client";
import React from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";

interface ApplicantHeaderProps {
  firstname: string;
  lastname: string;
  matchScore?: number;
  email: string;
  assessmentsResults?: any;
}

export default function ApplicantHeader({
  firstname,
  lastname,
  matchScore,
  email,
  assessmentsResults
}: ApplicantHeaderProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "#4CAF50"; // Excellent - Green
    if (score >= 75) return "#1CC47E"; // Good - Light Green
    if (score >= 60) return "#FFA000"; // Fair - Orange
    if (score >= 40) return "#FF6B6B"; // Poor - Light Red
    return "#F44336"; // Very Poor - Dark Red
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" gap={"16px"} sx={{ mb: 1, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: "rgba(17, 17, 17, 0.92)" }}>
          {firstname} {lastname}
        </Typography>
        <Stack direction="row" gap={"28px"} sx={{ flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Chip
              size="small"
              label={matchScore !== undefined ? `${matchScore}% match` : "Not available"}
              sx={{
                backgroundColor: matchScore !== undefined ? getMatchScoreColor(matchScore) : "#9E9E9E",
                color: "white",
                fontWeight: 600,
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21.25H7C3.35 21.25 1.25 19.15 1.25 15.5V8.5C1.25 4.85 3.35 2.75 7 2.75H17C20.65 2.75 22.75 4.85 22.75 8.5V15.5C22.75 19.15 20.65 21.25 17 21.25ZM7 4.25C4.14 4.25 2.75 5.64 2.75 8.5V15.5C2.75 18.36 4.14 19.75 7 19.75H17C19.86 19.75 21.25 18.36 21.25 15.5V8.5C21.25 5.64 19.86 4.25 17 4.25H7Z" fill="#292D32" />
              <path d="M11.9998 12.87C11.1598 12.87 10.3098 12.61 9.65978 12.08L6.52978 9.57997C6.20978 9.31997 6.14978 8.84997 6.40978 8.52997C6.66978 8.20997 7.13978 8.14997 7.45978 8.40997L10.5898 10.91C11.3498 11.52 12.6398 11.52 13.3998 10.91L16.5298 8.40997C16.8498 8.14997 17.3298 8.19997 17.5798 8.52997C17.8398 8.84997 17.7898 9.32997 17.4598 9.57997L14.3298 12.08C13.6898 12.61 12.8398 12.87 11.9998 12.87Z" fill="#292D32" />
            </svg>
            <Typography color="text.grey[100]">{email}</Typography>
          </Box>
          {/* Assessment Status Chips */}
          {assessmentsResults &&
            Object.entries(assessmentsResults).map(([type, result]: [string, any]) => {
              if (result) {
                const status = result.assessment_submission_status || result.assessment_status;
                if (status) {
                  let label = `${type
                    .replace(/_\d+$/, "") // Remove trailing _1, _2 etc.
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}`;

                  const score = result.assessment_score;
                  if (score) {
                    label += ` (${score}%)`;
                  } else if (status === "sent") {
                    label += " (Sent)";
                  }

                  let bgColor, textColor;
                  if (type === "technical_assessment") {
                    if (status === "submitted") {
                      bgColor = "#E3F2FD";
                      textColor = "#1976D2";
                    } else if (status === "sent") {
                      bgColor = "#FFF3E0";
                      textColor = "#E65100";
                    } else {
                      bgColor = "#FFF3E0";
                      textColor = "#E65100";
                    }
                  } else {
                    if (score || status === "submitted") {
                      bgColor = "#E8F5E9";
                      textColor = "#2E7D32";
                    } else if (status === "sent") {
                      bgColor = "#E3F2FD";
                      textColor = "#1976D2";
                    } else {
                      bgColor = "#FFF3E0";
                      textColor = "#E65100";
                    }
                  }

                  return (
                    <Chip
                      key={type}
                      size="small"
                      label={label}
                      sx={{
                        backgroundColor: bgColor,
                        color: textColor,
                        fontWeight: 500,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  );
                }
              }
              return null;
            })}
        </Stack>
      </Stack>
    </Box>
  );
}
