"use client";
import React from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";

interface ApplicantHeaderProps {
  firstname: string;
  lastname: string;
  location?: string;
  email: string;
  assessmentsResults?: any;
}

export default function ApplicantHeader({ 
  firstname, 
  lastname, 
  location, 
  email, 
  assessmentsResults 
}: ApplicantHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" gap={"16px"} sx={{ mb: 1, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: "rgba(17, 17, 17, 0.92)" }}>
          {firstname} {lastname}
        </Typography>
        <Stack direction="row" gap={"28px"} sx={{ flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14.1699C9.87 14.1699 8.13 12.4399 8.13 10.2999C8.13 8.15994 9.87 6.43994 12 6.43994C14.13 6.43994 15.87 8.16994 15.87 10.3099C15.87 12.4499 14.13 14.1699 12 14.1699ZM12 7.93994C10.7 7.93994 9.63 8.99994 9.63 10.3099C9.63 11.6199 10.69 12.6799 12 12.6799C13.31 12.6799 14.37 11.6199 14.37 10.3099C14.37 8.99994 13.3 7.93994 12 7.93994Z" fill="#292D32" />
              <path d="M12.0001 22.76C10.5201 22.76 9.03005 22.2 7.87005 21.09C4.92005 18.25 1.66005 13.72 2.89005 8.33C4.00005 3.44 8.27005 1.25 12.0001 1.25C12.0001 1.25 12.0001 1.25 12.0101 1.25C15.7401 1.25 20.0101 3.44 21.1201 8.34C22.3401 13.73 19.0801 18.25 16.1301 21.09C14.9701 22.2 13.4801 22.76 12.0001 22.76ZM12.0001 2.75C9.09005 2.75 5.35005 4.3 4.36005 8.66C3.28005 13.37 6.24005 17.43 8.92005 20C10.6501 21.67 13.3601 21.67 15.0901 20C17.7601 17.43 20.7201 13.37 19.6601 8.66C18.6601 4.3 14.9101 2.75 12.0001 2.75Z" fill="#292D32" />
            </svg>
            <Typography color="text.grey[100]">{location || "N/A"}</Typography>
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
