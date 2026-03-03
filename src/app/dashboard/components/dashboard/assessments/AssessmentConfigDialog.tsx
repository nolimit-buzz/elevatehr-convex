"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  TextField,
  Autocomplete,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface AssessmentConfigDialogProps {
  open: boolean;
  onClose: () => void;
  type: string | null;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  skills: string[];
  setSkills: (value: string[]) => void;
  generatedSkills: string[];
  isGeneratingSkills: boolean;
  generateSkills: () => void;
  handleDeleteSkill: (skill: string) => void;
  assessmentOptions: string;
  setAssessmentOptions: (value: string) => void;
  numberOfOpenTextQuestions: string;
  setNumberOfOpenTextQuestions: (value: string) => void;
  numberOfMultiChoiceQuestions: string;
  setNumberOfMultiChoiceQuestions: (value: string) => void;
  error: string | null;
  success: boolean;
  loading: boolean;
  onSubmit: () => void;
  id: string | null;
  level: string;
}

export default function AssessmentConfigDialog({
  open,
  onClose,
  type,
  jobTitle,
  setJobTitle,
  skills,
  setSkills,
  generatedSkills,
  isGeneratingSkills,
  generateSkills,
  handleDeleteSkill,
  assessmentOptions,
  setAssessmentOptions,
  numberOfOpenTextQuestions,
  setNumberOfOpenTextQuestions,
  numberOfMultiChoiceQuestions,
  setNumberOfMultiChoiceQuestions,
  error,
  success,
  loading,
  onSubmit,
  id,
  level,
}: AssessmentConfigDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: { 
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(0.4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 0,
          maxWidth: "600px",
          width: "100%",
          bgcolor: "rgba(241, 244, 249, 1)",
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 3, md: 4 },
          position: "relative",
          bgcolor: "rgba(241, 244, 249, 1)",
          minWidth: { xs: 320, md: 600 },
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 24, right: 24, zIndex: 1 }}
        >
          <CloseIcon sx={{ fontSize: 28, color: "rgba(17, 17, 17, 0.32)" }} />
        </IconButton>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 32,
            color: "rgba(17, 17, 17, 0.92)",
            mb: 3,
          }}
        >
          Create Assessment
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 18,
              color: "rgba(17, 17, 17, 0.92)",
              mb: 1.5,
            }}
          >
            Who is this assessment for?
          </Typography>
          <TextField
            fullWidth
            placeholder="Add job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            sx={{
              bgcolor: "#F4F5F7",
              borderRadius: "12px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                fontSize: 16,
                bgcolor: "#F4F5F7",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E7EC" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4444E2",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4444E2",
                borderWidth: "1.5px",
              },
            }}
            InputProps={{
              style: { fontWeight: 400, color: "rgba(17, 17, 17, 0.68)" },
            }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 18,
              color: "rgba(17, 17, 17, 0.92)",
              mb: 1.5,
            }}
          >
            Skills
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={generatedSkills}
            value={skills}
            onChange={(event, newValue) => setSkills(newValue)}
            renderInput={(params) => (
              <TextField
                onFocus={() => {
                  if (
                    !isGeneratingSkills &&
                    jobTitle.length > 0 &&
                    generatedSkills.length === 0
                  ) {
                    generateSkills();
                  }
                }}
                {...params}
                placeholder="Select or type skills"
                sx={{
                  bgcolor: "#F4F5F7",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    fontSize: 16,
                    bgcolor: "#F4F5F7",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E4E7EC",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4444E2",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4444E2",
                    borderWidth: "1.5px",
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  style: { fontWeight: 400, color: "rgba(17, 17, 17, 0.68)" },
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  onDelete={() => handleDeleteSkill(option)}
                  sx={{
                    bgcolor: "#F4F5F7",
                    color: "rgba(17, 17, 17, 0.84)",
                    fontWeight: 500,
                    fontSize: 15,
                    borderRadius: "12px",
                    border: "1.5px solid #E4E7EC",
                    "&:hover": { borderColor: "#4444E2" },
                  }}
                />
              ))
            }
          />
        </Box>

        {type === "technical_assessment" && (
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 18,
                color: "rgba(17, 17, 17, 0.92)",
                mb: 1.5,
              }}
            >
              Number of Assessment Options
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={assessmentOptions}
              onChange={(e) => setAssessmentOptions(e.target.value)}
              inputProps={{ min: 1, max: 10 }}
              multiline
              minRows={1}
              maxRows={3}
              sx={{
                bgcolor: "#F4F5F7",
                borderRadius: "12px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontSize: 16,
                  bgcolor: "#F4F5F7",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E4E7EC",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4444E2",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4444E2",
                  borderWidth: "1.5px",
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(17, 17, 17, 0.68)",
                  fontSize: 14,
                  mt: 1,
                  bgcolor: "transparent !important",
                  borderRadius: 0,
                },
              }}
              InputProps={{
                style: { fontWeight: 400, color: "rgba(17, 17, 17, 0.68)" },
              }}
            />
          </Box>
        )}

        {type !== "technical_assessment" && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 18,
                  color: "rgba(17, 17, 17, 0.92)",
                  mb: 1.5,
                }}
              >
                Number of open text questions
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Enter number"
                value={numberOfOpenTextQuestions}
                onChange={(e) => setNumberOfOpenTextQuestions(e.target.value)}
                multiline
                minRows={1}
                maxRows={3}
                sx={{
                  bgcolor: "#F4F5F7",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    fontSize: 16,
                    bgcolor: "#F4F5F7",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E4E7EC",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4444E2",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4444E2",
                    borderWidth: "1.5px",
                  },
                }}
                InputProps={{
                  style: { fontWeight: 400, color: "rgba(17, 17, 17, 0.68)" },
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 18,
                  color: "rgba(17, 17, 17, 0.92)",
                  mb: 1.5,
                }}
              >
                Number of multi-choice questions
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Enter number"
                value={numberOfMultiChoiceQuestions}
                onChange={(e) =>
                  setNumberOfMultiChoiceQuestions(e.target.value)
                }
                multiline
                minRows={1}
                maxRows={3}
                sx={{
                  bgcolor: "#F4F5F7",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    fontSize: 16,
                    bgcolor: "#F4F5F7",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E4E7EC",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4444E2",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4444E2",
                    borderWidth: "1.5px",
                  },
                }}
                InputProps={{
                  style: { fontWeight: 400, color: "rgba(17, 17, 17, 0.68)" },
                }}
              />
            </Box>
          </>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success.main" sx={{ mb: 3 }}>
            Assessment generated successfully!
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#4444E2",
            color: "#fff",
            fontWeight: 500,
            fontSize: 16,
            borderRadius: "12px",
            py: 1.5,
            textTransform: "none",
            boxShadow: "none",
            mt: 3,
            "&:hover": { bgcolor: "#5656E6" },
          }}
          onClick={onSubmit}
          disabled={Boolean(
            loading || !jobTitle || skills.length === 0 || (id && !level),
          )}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <span>Generating assessment</span>
              <CircularProgress size={20} />
            </div>
          ) : type === "technical_assessment" ? (
            "Continue"
          ) : (
            "Create Assessment"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
