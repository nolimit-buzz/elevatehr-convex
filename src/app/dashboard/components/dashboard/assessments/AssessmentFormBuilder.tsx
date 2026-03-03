"use client";
import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  TextField,
  FormControl,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";

interface AssessmentFormBuilderProps {
  jobTitle: string;
  skills: string[];
  assessmentDescription: string;
  setAssessmentDescription: (value: string) => void;
  questions: any[];
  handleQuestionChange: (idx: number, field: string, value: any) => void;
  handleTypeChange: (idx: number, newType: string) => void;
  handleOptionChange: (qIdx: number, optIdx: number, value: string) => void;
  handleAddOption: (qIdx: number) => void;
  handleRemoveOption: (qIdx: number, optIdx: number) => void;
  handleDeleteQuestion: (idx: number) => void;
  handleAddQuestion: () => void;
  saveError: string | null;
  saveSuccess: boolean;
  saveLoading: boolean;
  handleSaveAssessment: () => void;
  id: string | null;
}

export default function AssessmentFormBuilder({
  jobTitle,
  skills,
  assessmentDescription,
  setAssessmentDescription,
  questions,
  handleQuestionChange,
  handleTypeChange,
  handleOptionChange,
  handleAddOption,
  handleRemoveOption,
  handleDeleteQuestion,
  handleAddQuestion,
  saveError,
  saveSuccess,
  saveLoading,
  handleSaveAssessment,
  id,
}: AssessmentFormBuilderProps) {
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, mb: 4 }}>
      <Button
        component="a"
        href="/dashboard/assessments"
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
          p: { xs: 2, md: 4 },
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
      </Box>
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: "8px",
          p: { xs: 2, md: 4 },
          mb: 3,
        }}
      >
        {questions.map((q, idx) => (
          <Stack
            key={idx}
            alignItems="flex-start"
            width={"100%"}
            sx={{
              padding: "20px 22px",
              border: "1px solid rgba(17, 17, 17, 0.14)",
              borderRadius: "8px",
              mb: 2,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              width={"100%"}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                justifyContent={"space-between"}
                width={"100%"}
              >
                <TextField
                  fullWidth
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(idx, "question", e.target.value)
                  }
                  placeholder="Type Question"
                  multiline
                  minRows={1}
                  maxRows={3}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      padding: 0,
                      "& textarea": {
                        lineHeight: 1.2,
                        padding: "8px 0",
                        fontSize: "16px !important",
                        color: "black",
                        fontWeight: 500,
                        letterSpacing: "0.16px",
                        border: "none",
                      },
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
                <Stack
                  direction={"row"}
                  gap={2}
                  alignItems={"center"}
                  justifyContent={{ xs: "space-between", sm: "flex-start" }}
                  width={{ xs: "100%", sm: "max-content" }}
                  mb={{ xs: 2, sm: 0 }}
                >
                  <FormControl variant="outlined" style={{ minWidth: 150 }}>
                    <Select
                      value={q.type}
                      onChange={(e) => handleTypeChange(idx, e.target.value)}
                      sx={{
                        "& .MuiSelect-select": {
                          padding: "5px 8px",
                          paddingRight: "10px",
                          borderRadius: "5px",
                          backgroundColor: "#F4F4F6",
                          color: "rgba(17, 17, 17, 0.84)",
                          fontSize: "14px",
                          fontWeight: 500,
                          letterSpacing: "0.14px",
                          "& div": { paddingRight: 0 },
                          "& fieldset": { border: "none" },
                        },
                      }}
                    >
                      <MenuItem value="open-text">Open Question</MenuItem>
                      <MenuItem value="multi-choice">Multi Choice</MenuItem>
                    </Select>
                  </FormControl>
                  <IconButton
                    sx={{ padding: 0 }}
                    onClick={() => handleDeleteQuestion(idx)}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 6.73001C20.98 6.73001 20.95 6.73001 20.92 6.73001C15.63 6.20001 10.35 6.00001 5.12 6.53001L3.08 6.73001C2.66 6.77001 2.29 6.47001 2.25 6.05001C2.21 5.63001 2.51 5.27001 2.92 5.23001L4.96 5.03001C10.28 4.49001 15.67 4.70001 21.07 5.23001C21.48 5.27001 21.78 5.64001 21.74 6.05001C21.71 6.44001 21.38 6.73001 21 6.73001Z"
                        fill="#292D32"
                      />
                      <path
                        d="M8.5 5.72C8.46 5.72 8.42 5.72 8.37 5.71C7.97 5.64 7.69 5.25 7.76 4.85L7.98 3.54C8.14 2.58 8.36 1.25 10.69 1.25H13.31C15.65 1.25 15.87 2.63 16.02 3.55L16.24 4.85C16.31 5.26 16.03 5.65 15.63 5.71C15.22 5.78 14.83 5.5 14.77 5.1L14.55 3.8C14.41 2.93 14.38 2.76 13.32 2.76H10.7C9.64 2.76 9.62 2.9 9.47 3.79L9.24 5.09C9.18 5.46 8.86 5.72 8.5 5.72Z"
                        fill="#292D32"
                      />
                      <path
                        d="M15.21 22.75H8.79C5.3 22.75 5.16 20.82 5.05 19.26L4.4 9.19C4.37 8.78 4.69 8.42 5.1 8.39C5.52 8.37 5.87 8.68 5.9 9.09L6.55 19.16C6.66 20.68 6.7 21.25 8.79 21.25H15.21C17.31 21.25 17.35 20.68 17.45 19.16L18.1 9.09C18.13 8.68 18.49 8.37 18.9 8.39C19.31 8.42 19.63 8.77 19.6 9.19L18.95 19.26C18.84 20.82 18.7 22.75 15.21 22.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M13.66 17.25H10.33C9.92 17.25 9.58 16.91 9.58 16.5C9.58 16.09 9.92 15.75 10.33 15.75H13.66C14.07 15.75 14.41 16.09 14.41 16.5C14.41 16.91 14.07 17.25 13.66 17.25Z"
                        fill="#292D32"
                      />
                      <path
                        d="M14.5 13.25H9.5C9.09 13.25 8.75 12.91 8.75 12.5C8.75 12.09 9.09 11.75 9.5 11.75H14.5C14.91 11.75 15.25 12.09 15.25 12.5C15.25 12.91 14.91 13.25 14.5 13.25Z"
                        fill="#292D32"
                      />
                    </svg>
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
            {q.type === "open-text" ? (
              <TextField
                fullWidth
                disabled
                multiline
                minRows={1}
                placeholder="Response field"
                sx={{
                  marginTop: 1,
                  flex: 1,
                  "& .MuiInputBase-root": {
                    width: "100%",
                    padding: 0,
                    backgroundColor: "#F4F4F6",
                    borderRadius: "6px",
                    border: "0.5px solid rgba(17, 17, 17, 0.08)",
                    "& textarea": {
                      width: "100%",
                      padding: "12px 12px",
                      borderRadius: "5px",
                      backgroundColor: "#F4F4F6",
                      color: "rgba(17, 17, 17, 0.32)",
                      "&::placeholder": { color: "rgba(17, 17, 17, 0.32)" },
                    },
                    "& fieldset": { width: "100%", border: "none" },
                  },
                }}
              />
            ) : (
              <Stack width={"100%"} gap={1} mt={1}>
                {q.options &&
                  q.options.map((opt: string, optIdx: number) => (
                    <Stack
                      key={optIdx}
                      direction={"row"}
                      gap={1}
                      alignItems={"center"}
                    >
                      <TextField
                        fullWidth
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(idx, optIdx, e.target.value)
                        }
                        placeholder="Option"
                        multiline
                        minRows={1}
                        maxRows={3}
                        sx={{
                          width: "100%",
                          "& .MuiInputBase-root": {
                            width: "100%",
                            padding: 0,
                            backgroundColor: "#F4F4F6",
                            borderRadius: "6px",
                            border: "0.5px solid rgba(17, 17, 17, 0.08)",
                            "& textarea, & input": {
                              width: "100%",
                              padding: "12px 12px",
                              borderRadius: "5px",
                              backgroundColor: "#F4F4F6",
                              color: "rgba(17, 17, 17, 0.32)",
                              "&::placeholder": {
                                color: "rgba(17, 17, 17, 0.32)",
                              },
                            },
                            "& fieldset": { width: "100%", border: "none" },
                          },
                        }}
                      />
                      <IconButton
                        onClick={() => handleRemoveOption(idx, optIdx)}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18"
                            stroke="#292D32"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6 6L18 18"
                            stroke="#292D32"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </IconButton>
                    </Stack>
                  ))}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleAddOption(idx)}
                  sx={{
                    marginTop: 1,
                    alignSelf: "flex-start",
                    textTransform: "none",
                    color: "#4444E2",
                    borderColor: "#4444E2",
                    "&:hover": {
                      borderColor: "#5656E6",
                      bgcolor: "rgba(68, 68, 226, 0.04)",
                    },
                  }}
                >
                  Add Option
                </Button>
              </Stack>
            )}
          </Stack>
        ))}
        <Button
          variant="outlined"
          onClick={handleAddQuestion}
          sx={{
            mt: 2,
            borderRadius: "8px",
            fontWeight: 600,
            color: "#4444E2",
            borderColor: "#4444E2",
            textTransform: "none",
            "&:hover": {
              borderColor: "#5656E6",
              bgcolor: "rgba(68, 68, 226, 0.04)",
            },
          }}
        >
          + Add Question
        </Button>
      </Box>
      {saveError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {saveError}
        </Typography>
      )}
      {saveSuccess && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          Assessment saved successfully!
        </Typography>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          sx={{
            fontSize: 16,
            borderRadius: "8px",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            bgcolor: "#4444E2",
            "&:hover": { bgcolor: "#5656E6" },
          }}
          onClick={handleSaveAssessment}
          disabled={saveLoading}
        >
          {saveLoading
            ? "Saving..."
            : id
              ? "Update Assessment"
              : "Create Assessment"}
        </Button>
      </Box>
    </Box>
  );
}
