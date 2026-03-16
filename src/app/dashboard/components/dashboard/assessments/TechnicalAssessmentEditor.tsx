"use client";
import React, { useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  TextField,
  CircularProgress,
} from "@mui/material";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface TechnicalAssessmentEditorProps {
  jobTitle: string;
  skills: string[];
  assessmentDescription: string;
  setAssessmentDescription: (value: string) => void;
  value: string;
  setValue: (value: string) => void;
  isGeneratingContent: boolean;
  handleGenerateTechnicalContent: () => void;
  handleSaveTechnicalAssessment: () => void;
  backUrl?: string;
}

export default function TechnicalAssessmentEditor({
  jobTitle,
  skills,
  assessmentDescription,
  setAssessmentDescription,
  value,
  setValue,
  isGeneratingContent,
  handleGenerateTechnicalContent,
  handleSaveTechnicalAssessment,
  backUrl = "/dashboard/assessments",
}: TechnicalAssessmentEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ align: [] }],
        ["link", "image", "video", "formula"],
        ["clean"],
      ],
    }),
    [],
  );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, mb: 4 }}>
      <Button
        component="a"
        href={backUrl}
        startIcon={
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.56994 18.82C9.37994 18.82 9.18994 18.75 9.03994 18.6L2.96994 12.53C2.67994 12.24 2.67994 11.76 2.96994 11.47L9.03994 5.4C9.32994 5.11 9.80994 5.11 10.0999 5.4C10.3899 5.69 10.3899 6.17 10.0999 6.46L4.55994 12L10.0999 17.54C10.3899 17.83 10.3899 18.31 10.0999 18.6C9.95994 18.75 9.75994 18.82 9.56994 18.82Z"
              fill="#292D32"
            />
            <path
              d="M20.4999 12.75H3.66992C3.25992 12.75 2.91992 12.41 2.91992 12C2.91992 11.59 3.25992 11.25 3.66992 11.25H20.4999C20.9099 11.25 21.2499 11.59 21.2499 12C21.2499 12.41 20.9099 12.75 20.4999 12.75Z"
              fill="#292D32"
            />
          </svg>
        }
        sx={{
          bgcolor: "rgba(17, 17, 17, 0.04)",
          borderRadius: "18px",
          color: "rgba(17, 17, 17, 0.68)",
          fontWeight: 600,
          fontSize: 14,
          textTransform: "none",
          mb: 2,
          "&:hover": { backgroundColor: "rgba(68, 68, 226, 0.04)" },
        }}
      >
        Back to Assessments
      </Button>
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: "8px",
          pt: 2,
          px: { xs: 2, md: 4 },
          pb: { xs: 2, md: 4 },
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "rgba(17, 17, 17, 0.92)" }}
          >
            {jobTitle || "Assessment Title"} Assessment
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
          {skills.map((skill, index) => {
            const pastelColors = [
              { bg: "#F9E0FA", text: "rgba(79, 27, 85, 0.84)" },
              { bg: "#E0F7FA", text: "rgba(27, 79, 85, 0.84)" },
              { bg: "#F0F7E0", text: "rgba(79, 85, 27, 0.84)" },
              { bg: "#FAE0E0", text: "rgba(85, 27, 27, 0.84)" },
              { bg: "#E0E0FA", text: "rgba(27, 27, 85, 0.84)" },
            ];
            const colorIndex = index % pastelColors.length;
            return (
              <Chip
                key={skill}
                label={skill}
                sx={{
                  bgcolor: pastelColors[colorIndex].bg,
                  color: pastelColors[colorIndex].text,
                  fontWeight: 500,
                  fontSize: 15,
                  borderRadius: "20px",
                  border: "none",
                  height: 32,
                  px: 1.5,
                  "&:hover": { opacity: 0.9 },
                }}
              />
            );
          })}
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          value={assessmentDescription}
          onChange={(e) => setAssessmentDescription(e.target.value)}
          placeholder="Enter assessment description"
          sx={{
            mb: 2,
            "& .MuiInputBase-root": {
              backgroundColor: "#F4F4F6",
              borderRadius: "6px",
              border: "0.5px solid rgba(17, 17, 17, 0.08)",
              "& textarea": {
                color: "rgba(17, 17, 17, 0.62)",
                "&::placeholder": { color: "rgba(17, 17, 17, 0.32)" },
              },
              "& fieldset": { border: "none" },
            },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleGenerateTechnicalContent}
            disabled={isGeneratingContent || !jobTitle || skills.length === 0}
            startIcon={
              isGeneratingContent ? (
                <CircularProgress size={18} />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )
            }
            sx={{
              borderColor: "#4444E2",
              color: "#4444E2",
              fontWeight: 600,
              fontSize: 14,
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": {
                borderColor: "#5656E6",
                bgcolor: "rgba(68, 68, 226, 0.04)",
              },
              "&:disabled": {
                borderColor: "rgba(68, 68, 226, 0.3)",
                color: "rgba(68, 68, 226, 0.3)",
              },
            }}
          >
            {isGeneratingContent ? "Generating..." : "Generate with AI"}
          </Button>
        </Box>
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
          <style>{`
            .ql-toolbar {
              background-color: rgba(17, 17, 17, 0.03) !important;
              top: -72px !important;
              margin-top: 0 !important;
              padding: 12px !important;
              width: 100% !important;
              box-sizing: border-box;
              position: relative;
              border: 0.5px solid rgba(17, 17, 17, 0.2) !important;
              border-bottom: none !important;
              height: max-content !important;
              min-height: unset !important;
              border-radius: 6px 6px 0 0 !important;
            }
            .ql-container {
              min-height: 80vh !important;
              border: 0.5px solid rgba(17, 17, 17, 0.2) !important;
              margin-top: 96px !important;
              border-radius: 0 0 6px 6px !important;
            }
            .ql-editor {
              padding: 12px !important;
            }
          `}</style>
          <ReactQuill value={value} onChange={setValue} modules={modules} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              size="small"
              variant="contained"
              sx={{
                fontWeight: 600,
                fontSize: 15,
                borderRadius: "8px",
                bgcolor: "#4444E2",
                "&:hover": { bgcolor: "#5656E6" },
              }}
              onClick={handleSaveTechnicalAssessment}
            >
              Save Assessment
            </Button>
          </Box>
        </div>
      </Box>
    </Box>
  );
}
