"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  Select,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  IconButton,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { AssessmentQueries, usePublicAssessment, type Id } from "@/queries/assessment.queries";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function CreateAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams?.get("type");
  const id = searchParams?.get("id");
  const [open, setOpen] = React.useState(!id);
  const [jobTitle, setJobTitle] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [numberOfOpenTextQuestions, setNumberOfOpenTextQuestions] = React.useState("");
  const [numberOfMultiChoiceQuestions, setNumberOfMultiChoiceQuestions] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [showFormBuilder, setShowFormBuilder] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [assessmentDescription, setAssessmentDescription] = React.useState("");
  const [value, setValue] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [assessmentOptions, setAssessmentOptions] = useState("2");
  const [generatedSkills, setGeneratedSkills] = useState<string[]>([]);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);

  // Convex assessment queries
  const { GenerateSkills, GenerateQuestions, GenerateTechnicalContent, CreateAssessment, CreateTechnicalAssessment, UpdateAssessment } =
    AssessmentQueries();
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        // [{ size: ["small", false, "large", "huge"] }],
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
    []
  );

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills((skills) => skills.filter((skill) => skill !== skillToDelete));
  };

  const handleCreateAssessment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Generate questions using Convex AI action
      const { result, error: genError } = await GenerateQuestions({
        jobTitle,
        level: level || undefined,
        skills,
        numberOfOpenTextQuestions: +numberOfOpenTextQuestions,
        numberOfMultiChoiceQuestions: +numberOfMultiChoiceQuestions,
      });

      if (genError || !result) {
        throw new Error(genError || "Failed to generate assessment");
      }

      if (result.status === "success" && result.response?.questions) {
        setQuestions(result.response.questions);
        setShowFormBuilder(true);
        setOpen(false); // Close modal
        // Set default description for online assessment
        const defaultDescription = `${jobTitle} assessment covering the following skills: ${skills.join(", ")}. This assessment includes ${numberOfOpenTextQuestions} open-text questions and ${numberOfMultiChoiceQuestions} multiple-choice questions to evaluate the candidate's knowledge and expertise.`;
        setAssessmentDescription(defaultDescription);
      } else {
        throw new Error("Invalid response from server");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      if (id) {
        // Update existing assessment
        const { result, error: updateError } = await UpdateAssessment({
          assessmentId: id as any,
          data: {
            title: jobTitle,
            description: assessmentDescription,
            level: level || undefined,
            skills,
            questions: questions.map((q) => ({
              question: q.question,
              type: q.type,
              options: q.type === "multi-choice" ? q.options : [],
            })),
          },
        });

        if (updateError || !result) {
          throw new Error(updateError || "Failed to update assessment");
        }
        setSavedAssessmentId(id);
      } else {
        // Create new assessment
        const { result, error: createError } = await CreateAssessment({
          title: jobTitle,
          description: assessmentDescription,
          type: "online_assessment_1",
          level: level || undefined,
          skills,
          questions: questions.map((q) => ({
            question: q.question,
            type: q.type,
            options: q.type === "multi-choice" ? q.options : [],
          })),
        });

        if (createError || !result) {
          throw new Error(createError || "Failed to save assessment");
        }
        setSavedAssessmentId(result.assessment_id);
      }

      setShowSuccessModal(true);
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveTechnicalAssessment = async () => {
    try {
      if (id) {
        // Update existing assessment
        const { result, error: updateError } = await UpdateAssessment({
          assessmentId: id as any,
          data: {
            title: jobTitle,
            level: level || undefined,
            skills,
            technical_content: value,
            assessment_options: parseInt(assessmentOptions),
          },
        });

        if (updateError || !result) {
          throw new Error(updateError || "Failed to update assessment");
        }
        setSavedAssessmentId(id);
      } else {
        // Create new technical assessment
        const { result, error: createError } = await CreateTechnicalAssessment({
          title: jobTitle,
          level: level || undefined,
          skills,
          technicalContent: value,
          assessmentOptions: parseInt(assessmentOptions),
        });

        if (createError || !result) {
          throw new Error(createError || "Failed to save assessment");
        }
        setSavedAssessmentId(result.assessment_id);
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setSnackbarMessage(err.message || "An error occurred while saving the assessment.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleGenerateTechnicalContent = async () => {
    if (!jobTitle || skills.length === 0) {
      setSnackbarMessage("Please enter a job title and at least one skill first.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingContent(true);
    try {
      const { result, error: genError } = await GenerateTechnicalContent({
        jobTitle,
        level: level || undefined,
        skills,
        assessmentOptions: parseInt(assessmentOptions) || 2,
      });

      if (genError || !result) {
        throw new Error(genError || "Failed to generate content");
      }

      if (result.status === "success" && result.content) {
        setValue(result.content);
        // Also generate a description
        const defaultDescription = `${jobTitle} technical assessment covering the following skills: ${skills.join(", ")}. This assessment includes ${assessmentOptions} practical tasks to evaluate candidates' hands-on expertise.`;
        setAssessmentDescription(defaultDescription);
        setSnackbarMessage("Assessment content generated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setSnackbarMessage(err.message || "An error occurred while generating content.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Fetch existing assessment if editing
  const existingAssessment = usePublicAssessment(id ? (id as Id<"assessments">) : null);

  useEffect(() => {
    if (!existingAssessment) return;

    const assessment = existingAssessment;
    if (assessment.type === "technical_assessment") {
      setJobTitle(assessment.title || "");
      setLevel(assessment.level || "");
      setSkills(assessment.skills || []);
      setAssessmentDescription(assessment.description || "");
      setValue(assessment.technical_content || "");
      setAssessmentOptions(assessment.assessment_options ? String(assessment.assessment_options) : "2");
      setShowFormBuilder(false);
      setOpen(false);
    } else {
      setJobTitle(assessment.title || "");
      setLevel(assessment.level || "");
      setSkills(assessment.skills || []);
      setAssessmentDescription(assessment.description || "");
      setQuestions(assessment.questions || []);
      setShowFormBuilder(true);
      setOpen(false);
    }
  }, [existingAssessment]);

  // Helper for updating a question
  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  // Change type and reset options if needed
  const handleTypeChange = (idx: number, newType: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? {
              ...q,
              type: newType,
              options: newType === "multi-choice" ? (q.options && q.options.length ? q.options : [""]) : [],
            }
          : q
      )
    );
  };

  // Edit multi-choice option
  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt: string, j: number) => (j === optIdx ? value : opt)),
            }
          : q
      )
    );
  };

  // Add option to multi-choice
  const handleAddOption = (qIdx: number) => {
    setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ""] } : q)));
  };

  // Remove option from multi-choice
  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.filter((_: string, j: number) => j !== optIdx),
            }
          : q
      )
    );
  };

  // Delete question
  const handleDeleteQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add new question
  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, { question: "", type: "open-text", options: [] }]);
  };

  const generateSkills = async () => {
    setIsGeneratingSkills(true);
    try {
      const { result, error } = await GenerateSkills({ jobTitle, jobDescription: "" });
      if (error) {
        console.error("Error generating skills:", error);
        return;
      }
      if (result) {
        const allSkills = [...result.technical, ...result.soft];
        setGeneratedSkills(allSkills);
      }
    } catch (error) {
      console.error("Error generating skills:", error);
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  // Add effect to set default description
  useEffect(() => {
    if (jobTitle && skills.length > 0) {
      const defaultDescription = `${jobTitle} assessment covering the following skills: ${skills.join(", ")}. This assessment is designed to evaluate candidates' knowledge and expertise in these areas.`;
      setAssessmentDescription(defaultDescription);
    }
  }, [jobTitle, skills]);

  // Reset generated skills when job title changes so they can be regenerated
  useEffect(() => {
    setGeneratedSkills([]);
  }, [jobTitle]);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => router.push("/dashboard/assessments")}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 0,
            maxWidth: "600px",
            width: "100%",
          },
        }}
      >
        <DialogContent
          sx={{
            p: { xs: 3, md: 5 },
            position: "relative",
            bgcolor: "#fff",
            minWidth: { xs: 320, md: 600 },
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <IconButton
            onClick={() => router.push("/dashboard/assessments")}
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

          {/* Common Fields */}
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
              Skills
            </Typography>
            <Autocomplete
              multiple
              freeSolo
              options={generatedSkills}
              value={skills}
              onChange={(event, newValue) => {
                setSkills(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  onFocus={() => {
                    console.log(isGeneratingSkills, jobTitle.length, generatedSkills.length);
                    if (!isGeneratingSkills && jobTitle.length > 0 && generatedSkills.length === 0) {
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
                      "&:hover": {
                        borderColor: "#4444E2",
                      },
                    }}
                  />
                ))
              }
            />
          </Box>

          {/* Technical Assessment Fields */}
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

          {/* Online Assessment Fields */}
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
                  onChange={(e) => setNumberOfMultiChoiceQuestions(e.target.value)}
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
              "&:hover": {
                bgcolor: "#5656E6",
              },
            }}
            onClick={type === "technical_assessment" ? () => setOpen(false) : handleCreateAssessment}
            disabled={Boolean(loading || !jobTitle || skills.length === 0 || (id && !level))}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
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

      {/* Technical Assessment Editor */}
      {type === "technical_assessment" && !open && (
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, mb: 4 }}>
          <Button
            component="a"
            href="/dashboard/assessments"
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            // onClick={() => router.push("/dashboard/assessments")}
            sx={{
              bgcolor: "rgba(17, 17, 17, 0.04)",
              borderRadius: "18px",
              color: "rgba(17, 17, 17, 0.68)",
              fontWeight: 600,
              fontSize: 14,
              textTransform: "none",
              mb: 2,
              "&:hover": {
                backgroundColor: "rgba(68, 68, 226, 0.04)",
              },
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: "rgba(17, 17, 17, 0.92)" }}>
                {jobTitle || "Assessment Title"} Assessment
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
              {skills.map((skill, index) => {
                const pastelColors = [
                  { bg: "#F9E0FA", text: "rgba(79, 27, 85, 0.84)" }, // Purple
                  { bg: "#E0F7FA", text: "rgba(27, 79, 85, 0.84)" }, // Teal
                  { bg: "#F0F7E0", text: "rgba(79, 85, 27, 0.84)" }, // Green
                  { bg: "#FAE0E0", text: "rgba(85, 27, 27, 0.84)" }, // Red
                  { bg: "#E0E0FA", text: "rgba(27, 27, 85, 0.84)" }, // Blue
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
                      "&:hover": {
                        opacity: 0.9,
                      },
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
                    "&::placeholder": {
                      color: "rgba(17, 17, 17, 0.32)",
                    },
                  },
                  "& fieldset": {
                    border: "none",
                  },
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      )}

      {/* Form Builder */}
      {showFormBuilder && (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, mb: 4 }}>
          {/* Header Section */}
          <Button
            component="a"
            href="/dashboard/assessments"
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              "&:hover": {
                backgroundColor: "rgba(68, 68, 226, 0.04)",
              },
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: "rgba(17, 17, 17, 0.92)" }}>
                {jobTitle || "Assessment Title"} Assessment
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
              {skills.map((skill, index) => {
                const pastelColors = [
                  { bg: "#F9E0FA", text: "rgba(79, 27, 85, 0.84)" }, // Purple
                  { bg: "#E0F7FA", text: "rgba(27, 79, 85, 0.84)" }, // Teal
                  { bg: "#F0F7E0", text: "rgba(79, 85, 27, 0.84)" }, // Green
                  { bg: "#FAE0E0", text: "rgba(85, 27, 27, 0.84)" }, // Red
                  { bg: "#E0E0FA", text: "rgba(27, 27, 85, 0.84)" }, // Blue
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
                      "&:hover": {
                        opacity: 0.9,
                      },
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
                    // padding: '6px',
                    color: "rgba(17, 17, 17, 0.62)",
                    "&::placeholder": {
                      color: "rgba(17, 17, 17, 0.32)",
                    },
                  },
                  "& fieldset": {
                    border: "none",
                  },
                },
              }}
            />
          </Box>
          {/* Questions Section */}
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
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width={"100%"}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems="center"
                    justifyContent={"space-between"}
                    width={"100%"}
                  >
                    <TextField
                      fullWidth
                      value={q.question}
                      onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
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
                          "& fieldset": {
                            border: "none",
                          },
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
                              "& div": {
                                paddingRight: 0,
                              },
                              "& fieldset": {
                                border: "none",
                              },
                            },
                          }}
                        >
                          <MenuItem value="open-text">Open Question</MenuItem>
                          <MenuItem value="multi-choice">Multi Choice</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton sx={{ padding: 0 }} onClick={() => handleDeleteQuestion(idx)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          "&::placeholder": {
                            color: "rgba(17, 17, 17, 0.32)",
                          },
                        },
                        "& fieldset": {
                          width: "100%",
                          border: "none",
                        },
                      },
                    }}
                  />
                ) : (
                  <Stack width={"100%"} gap={1} mt={1}>
                    {q.options &&
                      q.options.map((opt: string, optIdx: number) => (
                        <Stack key={optIdx} direction={"row"} gap={1} alignItems={"center"}>
                          <TextField
                            fullWidth
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
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
                                "& fieldset": {
                                  width: "100%",
                                  border: "none",
                                },
                              },
                            }}
                          />
                          <IconButton onClick={() => handleRemoveOption(idx, optIdx)}>
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
              {saveLoading ? "Saving..." : id ? "Update Assessment" : "Create Assessment"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 0,
            maxWidth: "600px",
            width: "100%",
          },
        }}
      >
        <DialogContent
          sx={{
            p: { xs: 3, md: 5 },
            position: "relative",
            bgcolor: "#fff",
            minWidth: { xs: 320, md: 600 },
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <IconButton
            onClick={() => setShowSuccessModal(false)}
            sx={{ position: "absolute", top: 24, right: 24, zIndex: 1 }}
          >
            <CloseIcon sx={{ fontSize: 28, color: "rgba(17, 17, 17, 0.32)" }} />
          </IconButton>

          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 24,
                color: "rgba(17, 17, 17, 0.92)",
                mb: 2,
              }}
            >
              Assessment Saved Successfully!
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                color: "rgba(17, 17, 17, 0.68)",
                mb: 4,
              }}
            >
              What would you like to do next?
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Button
              component="a"
              href={`/assessment?assessment_id=${savedAssessmentId}`}
              fullWidth
              variant="contained"
              target="_blank"
              sx={{
                bgcolor: "#4444E2",
                color: "#fff",
                fontWeight: 600,
                fontSize: 18,
                borderRadius: "12px",
                py: 1.5,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#5656E6",
                },
              }}
            >
              View Assessment
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => router.push("/dashboard/assessments")}
              sx={{
                borderColor: "#4444E2",
                color: "#4444E2",
                fontWeight: 600,
                fontSize: 18,
                borderRadius: "12px",
                py: 1.5,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#5656E6",
                  bgcolor: "rgba(68, 68, 226, 0.04)",
                },
              }}
            >
              Back to Assessments
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
