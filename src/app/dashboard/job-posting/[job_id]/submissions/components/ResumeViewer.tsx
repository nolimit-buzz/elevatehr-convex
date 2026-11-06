"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Link } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import { resolveStorageUrl } from "@/utils/storageUrl";

interface ResumeViewerProps {
  cvUrl?: string;
  externalCvLink?: string;
}

const PDF_TYPES = ["application/pdf"];

export default function ResumeViewer({ cvUrl, externalCvLink }: ResumeViewerProps) {
  const rawUrl = resolveStorageUrl(cvUrl || externalCvLink);

  // Convex storage URLs carry no file extension (/api/storage/<id>), so the
  // only reliable way to tell a PDF from a Word doc is the actual
  // Content-Type the server returns.
  const [isPdf, setIsPdf] = useState<boolean | null>(/\.pdf($|\?)/i.test(rawUrl) ? true : null);

  useEffect(() => {
    if (!rawUrl || isPdf !== null) return;
    let cancelled = false;
    fetch(rawUrl, { method: "HEAD" })
      .then((res) => {
        if (cancelled) return;
        const contentType = res.headers.get("content-type") || "";
        setIsPdf(PDF_TYPES.includes(contentType.split(";")[0].trim()));
      })
      .catch(() => {
        if (!cancelled) setIsPdf(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawUrl]);

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

  // Browsers can't render Word docs natively, so route those (and anything
  // we haven't confirmed is a PDF yet) through the Office Online viewer.
  // Used for both the preview iframe and the "Resume" link itself, so
  // clicking it opens a readable preview tab instead of downloading the file.
  const previewSrc = isPdf
    ? rawUrl
    : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}`;

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
          href={previewSrc}
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
