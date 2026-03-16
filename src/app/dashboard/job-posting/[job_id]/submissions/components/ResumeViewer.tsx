"use client";
import React from "react";
import { Box, Typography, Link } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";

interface ResumeViewerProps {
  cvUrl?: string;
  externalCvLink?: string;
}

export default function ResumeViewer({ cvUrl, externalCvLink }: ResumeViewerProps) {
  const rawUrl = cvUrl || externalCvLink;

  if (!rawUrl) {
    return (
      <Box
        sx={{
          mb: 4,
          p: 3,
          bgcolor: "rgba(17, 17, 17, 0.04)",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.grey[100]">No CV available</Typography>
      </Box>
    );
  }

  const isDocx = /\.docx?($|\?)/i.test(rawUrl);
  const previewSrc = isDocx
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}`
    : rawUrl;

  return (
    <Box
      sx={{
        mb: 4,
        p: 3,
        bgcolor: "rgba(17, 17, 17, 0.04)",
        borderRadius: 2,
        height: "800px",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Link
          sx={{
            textDecoration: "underline",
            textDecorationColor: "rgba(17, 17, 17, 0.68)",
          }}
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "rgba(17, 17, 17, 0.92)",
                cursor: "pointer",
                "&:hover": {
                  color: "primary.main",
                  textDecoration: "underline",
                },
              }}
            >
              Resume
            </Typography>
            <LaunchIcon
              sx={{
                fontSize: 16,
                color: "rgba(17, 17, 17, 0.68)",
              }}
            />
          </Box>
        </Link>
      </Box>

      <iframe
        allowFullScreen
        unselectable="on"
        src={previewSrc}
        referrerPolicy="no-referrer"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="CV Preview"
      />
    </Box>
  );
}
