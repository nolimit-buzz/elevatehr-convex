"use client";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Button,
  Snackbar,
  useTheme,
  Container,
  Grid,
  Stack,
  styled,
  FormControl,
  Select,
  MenuItem,
  Link,
  Skeleton,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Banner } from "@/app/components/Banner";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { usePublicAssessment, type Id } from "@/queries/assessment.queries";
import { usePublicApplicationMutations } from "@/queries/applications.queries";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  backgroundColor: theme.palette.primary.main,
  padding: "16px 44px",
  color: "#FFFFFF !important",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "100%",
  letterSpacing: "0.16px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#6666E6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
  },
}));

const pastelColors = [
  { bg: "#F9E8F3", text: "#76325F" }, // Pink
  { bg: "#E8F4F9", text: "#256B8F" }, // Blue
  { bg: "#F0F9E8", text: "#4B7F2C" }, // Green
  { bg: "#F9F0E8", text: "#8F5E2C" }, // Orange
  { bg: "#F0E8F9", text: "#5E2C8F" }, // Purple
  { bg: "#E8F9F0", text: "#2C8F5E" }, // Mint
];

export default function AssessmentPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id");
  const assessmentId = searchParams.get("assessment_id");
  const applicationId = searchParams.get("application_id");

  // Use Convex public query for assessment
  const assessment = usePublicAssessment(assessmentId ? (assessmentId as Id<"assessments">) : null);
  const loading = assessment === undefined;

  const { submitAssessment } = usePublicApplicationMutations();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isJobClosed, setIsJobClosed] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    if (!jobId) return;

    fetch(`https://app.elevatehr.ai/wp-json/elevatehr/v1/active-jobs/${jobId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch job details");
        return res.json();
      })
      .then((data) => {
        // Handle both "close" (legacy) and "closed" (new) status values
        if (data.success && data.jobs && (data.jobs.status === "closed" || data.jobs.status === "close")) {
          setIsJobClosed(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching job status:", error);
      });
  }, [jobId]);

  // useEffect(() => {
  //   if (!jobId || !assessmentId || !applicationId) return;

  //   // Format current date to "YYYY-MM-DD HH:MMam/pm"
  //   const now = new Date();
  //   const hours = now.getHours();
  //   const minutes = now.getMinutes();
  //   const ampm = hours >= 12 ? 'pm' : 'am';
  //   const formattedHours = hours % 12 || 12;
  //   const formattedMinutes = minutes.toString().padStart(2, '0');
  //   const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${formattedHours}:${formattedMinutes}${ampm}`;

  //   // Make the POST request
  //   fetch('https://app.elevatehr.ai/wp-json/elevatehr/v1/applications/submit-technical-assessment', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       application_id: parseInt(applicationId),
  //       job_id: parseInt(jobId),
  //       assessment_id: parseInt(assessmentId),
  //       is_assessment_clicked_date: formattedDate,
  //       is_assessment_clicked: "yes"
  //     })
  //   }).catch(error => {
  //     console.error('Error submitting assessment click:', error);
  //   });
  // }, [jobId, assessmentId, applicationId]);

  useEffect(() => {
    // Check if already submitted
    const submissionKey = `assessment_submission_${jobId}_${assessmentId}_${applicationId}`;
    const hasSubmitted = localStorage.getItem(submissionKey);
    if (hasSubmitted) {
      setIsSubmitted(true);
    }
  }, [jobId, assessmentId, applicationId]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleOnlineAssessmentSubmit = async () => {
    if (!applicationId || !jobId || !assessmentId) {
      setError("Missing required parameters");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionIndex, answer]) => ({
        question_index: parseInt(questionIndex),
        answer,
      }));

      const { result, error: submitError } = await submitAssessment({
        applicationId,
        jobId,
        assessmentId,
        answers: formattedAnswers.length > 0 ? formattedAnswers : undefined,
        submissionUrl: submissionUrl || undefined,
        selectedOption: selectedOption || undefined,
      });

      if (submitError) {
        throw new Error(submitError);
      }

      setSuccess("Assessment submitted successfully!");
      setIsSubmitted(true);
      // Store submission in localStorage
      const submissionKey = `assessment_submission_${jobId}_${assessmentId}_${applicationId}`;
      localStorage.setItem(submissionKey, "true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting");
    } finally {
      setSubmitting(false);
    }
  };

  if (isJobClosed) {
    return (
      <Box sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
        <Banner
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.primary.main,
            backgroundImage: "url(/images/backgrounds/banner-bg-img.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
          }}
          height={"304px"}
        />
        <Container sx={{ maxWidth: "1200px !important", mt: 8, p: 4 }}>
          <Box
            sx={{
              maxWidth: 800,
              mx: "auto",
              textAlign: "center",
              bgcolor: "#fff",
              borderRadius: 2,
              boxShadow: 1,
              p: 4,
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: "rgba(17, 17, 17, 0.92)",
                mb: 2,
              }}
            >
              Job Posting Closed
            </Typography>
            <Typography
              variant="body1"
              color="grey.600"
              sx={{
                maxWidth: 600,
                mx: "auto",
                fontSize: "17px",
              }}
            >
              We're sorry, but this job posting has been closed and is no longer accepting submissions.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (isSubmitted) {
    return (
      <Box sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
        <Banner
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.primary.main,
            backgroundImage: "url(/images/backgrounds/banner-bg-img.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
          }}
          height={"304px"}
        />
        <Container sx={{ maxWidth: "1063px !important", mt: 8, p: 4 }}>
          <Box
            sx={{
              maxWidth: 800,
              mx: "auto",
              textAlign: "center",
              bgcolor: "#fff",
              borderRadius: 2,
              boxShadow: 1,
              p: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 4 }}>
              <CheckCircleIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                }}
              />
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  background: "linear-gradient(90deg, #4444E2 0%, #6B6BFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Submission Received!
              </Typography>
            </Box>

            <Typography
              variant="body1"
              color="grey.600"
              sx={{
                maxWidth: 600,
                mx: "auto",
                fontSize: "17px",
              }}
            >
              Thank you for submitting your assessment. We will review your submission and get back to you soon.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Banner
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.palette.primary.main,
          backgroundImage: "url(/images/backgrounds/banner-bg-img.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
        }}
        height={"304px"}
      />
      <Container sx={{ maxWidth: "1200px !important", mt: 8, p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                p: 4,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                mb={2}
                sx={{
                  lineHeight: 1.2,
                  color: "rgba(17, 17, 17, 0.92)",
                  fontSize: "32px",
                  textTransform: "capitalize",
                }}
              >
                {assessment?.title} {assessment?.type === "technical_assessment" ? "Technical" : ""} Assessment
              </Typography>

              {loading && (
                <Stack spacing={3}>
                  <Skeleton variant="text" width="60%" height={48} />
                  <Skeleton variant="text" width="90%" height={24} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Skeleton variant="rounded" width={100} height={32} />
                    <Skeleton variant="rounded" width={120} height={32} />
                    <Skeleton variant="rounded" width={90} height={32} />
                  </Box>
                  <Skeleton variant="text" width="40%" height={36} />
                  <Skeleton variant="rounded" width="100%" height={200} />
                </Stack>
              )}

              {assessment && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="subtitle1" color="grey.200" mb={2}>
                      {assessment.description}
                    </Typography>
                    <Box mb={2} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {assessment.skills &&
                        assessment.skills.map((skill: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={skill.trim()}
                            sx={{
                              fontWeight: 500,
                              bgcolor: pastelColors[idx % pastelColors.length].bg,
                              color: pastelColors[idx % pastelColors.length].text,
                            }}
                          />
                        ))}
                    </Box>
                  </Box>

                  {assessment.type === "technical_assessment" ? (
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        mb={2}
                        sx={{
                          color: "rgba(17, 17, 17, 0.92)",
                        }}
                      >
                        Assessment Details
                      </Typography>
                      <Box
                        sx={{
                          color: "rgba(17, 17, 17, 0.84)",
                          bgcolor: "#F5F5F5",
                          p: 3,
                          borderRadius: 2,
                          "& h2": {
                            fontSize: "20px",
                            fontWeight: 600,
                            mb: 2,
                            mt: 3,
                            "&:first-child": {
                              color: "rgb(37, 107, 143) !important",
                            },
                          },
                          "& h3": {
                            fontSize: "16px",
                            fontWeight: 600,
                            mb: 1,
                            mt: 2,
                            "&:first-of-type": {
                              mt: 0,
                            },
                          },
                          "& p": {
                            fontSize: "15px",
                            lineHeight: 1.6,
                            mb: 1.5,
                          },
                          "& ul": {
                            pl: 2,
                            mb: 1.5,
                          },
                          "& li": {
                            fontSize: "15px",
                            lineHeight: 1.6,
                            mb: 1,
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: assessment.technical_content || "" }}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        mb={3}
                        sx={{
                          color: "rgba(17, 17, 17, 0.92)",
                        }}
                      >
                        Questions
                      </Typography>
                      <Stack spacing={4}>
                        {assessment.questions?.map((question: any, index: number) => (
                          <Box key={index} sx={{ mb: 3 }}>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              sx={{
                                color: "rgba(17, 17, 17, 0.92)",
                                mb: 2,
                              }}
                            >
                              {index + 1}. {question.question}
                            </Typography>
                            {question.type === "open-text" ? (
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={answers[index] || ""}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                placeholder="Type your answer here..."
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                              />
                            ) : (
                              <FormControl component="fieldset">
                                <RadioGroup
                                  value={answers[index] || ""}
                                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                                >
                                  {question.options.map((option: string, optIndex: number) => (
                                    <FormControlLabel
                                      key={optIndex}
                                      value={option}
                                      control={<Radio />}
                                      label={option}
                                      sx={{
                                        "& .MuiFormControlLabel-label": {
                                          color: "rgba(17, 17, 17, 0.84)",
                                        },
                                        "& .MuiSvgIcon-root": {
                                          color: "rgba(17, 17, 17, 0.64)",
                                          borderWidth: "1px",
                                          width: "20px",
                                          height: "20px",
                                        },
                                      }}
                                    />
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                p: 4,
                border: "1px solid #E0E0E0",
                position: "sticky",
                top: 24,
                maxWidth: "calc(100% - 5px)",
                ml: "auto",
                mr: "auto",
              }}
            >
              <Stack spacing={3}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    color: "rgba(17, 17, 17, 0.92)",
                    fontSize: "18px",
                  }}
                >
                  {assessment?.type === "technical_assessment" ? "Submit Your Assessment" : "Submit Your Answers"}
                </Typography>
                <Stack spacing={2}>
                  {assessment?.type === "technical_assessment" ? (
                    <>
                      <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                        • Please ensure your submission is complete and follows all requirements
                      </Typography>
                      <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                        • Make sure your submission URL is accessible
                      </Typography>
                      <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>• You can only submit once</Typography>
                      <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                        • Please review the{" "}
                        <Link
                          href={`/assessment/instructions?job_id=${jobId}&assessment_id=${assessmentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: "rgb(37, 107, 143)",
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          assessment instructions
                        </Link>{" "}
                        before submitting
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                        • Please answer all questions before submitting
                      </Typography>
                      <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>• You can only submit once</Typography>
                      <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                        • Make sure to review your answers before submitting
                      </Typography>
                    </>
                  )}
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Stack spacing={2}>
                    {assessment?.type === "technical_assessment" ? (
                      <>
                        {assessment?.assessment_options && (
                          <FormControl fullWidth>
                            <Typography sx={{ mb: 1, color: "rgba(17, 17, 17, 0.84)", fontWeight: 600 }}>
                              Select Assessment Option
                            </Typography>
                            <Select
                              value={selectedOption}
                              onChange={(e) => setSelectedOption(e.target.value)}
                              displayEmpty
                              renderValue={(value) =>
                                value ? `Option ${String.fromCharCode(64 + parseInt(value))}` : "Select an option"
                              }
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                  "& fieldset": {
                                    borderRadius: "10px",
                                  },
                                },
                                "& .MuiSelect-select": {
                                  color: selectedOption ? "rgba(17, 17, 17, 0.84)" : "rgba(17, 17, 17, 0.48)",
                                  borderRadius: "10px",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderRadius: "10px",
                                },
                              }}
                            >
                              {Array.from({ length: assessment.assessment_options }, (_, i) => (
                                <MenuItem key={i + 1} value={String(i + 1)}>
                                  Option {String.fromCharCode(65 + i)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        <TextField
                          fullWidth
                          label="Submission URL"
                          variant="outlined"
                          value={submissionUrl}
                          onChange={(e) => setSubmissionUrl(e.target.value)}
                          placeholder="Enter the URL where your assessment can be found"
                          error={!!error}
                          helperText={error}
                          disabled={submitting}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                            "& label": {
                              color: "grey.200",
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleOnlineAssessmentSubmit}
                          disabled={
                            submitting || !submissionUrl.trim() || (!!assessment?.assessment_options && !selectedOption)
                          }
                          sx={{
                            width: "100%",
                            height: 56,
                            bgcolor: "primary.main",
                            color: "white",
                            borderRadius: "8px",
                            "&:hover": {
                              bgcolor: "primary.dark",
                            },
                          }}
                        >
                          {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleOnlineAssessmentSubmit}
                        disabled={
                          submitting ||
                          (assessment?.type === "online_assessment_1" &&
                            Object.keys(answers).length !== assessment?.questions?.length)
                        }
                        sx={{
                          width: "100%",
                          height: 56,
                          bgcolor: "primary.main",
                          color: "white",
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        }}
                      >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Answers"}
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Success Alert */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={handleCloseAlert}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            width: "100%",
            bgcolor: "primary.main",
            color: "white",
            borderRadius: "24px",
            "& .MuiAlert-message": {
              fontSize: "1rem",
              fontWeight: 500,
              color: "white",
            },
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Error Alert */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={handleCloseAlert}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            width: "100%",
            bgcolor: "primary.main",
            color: "white",
            borderRadius: "24px",
            "& .MuiAlert-message": {
              fontSize: "1rem",
              fontWeight: 500,
              color: "white",
            },
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
