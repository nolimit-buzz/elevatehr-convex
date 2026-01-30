"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Stack,
  TextField,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import { Banner } from '@/app/components/Banner';

export default function AssessmentInstructionsPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job_id');
  const assessmentId = searchParams.get('assessment_id');
  const applicationId = searchParams.get('application_id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!jobId || !assessmentId) return;
    setLoading(true);
    setError(null);
    fetch(`https://app.elevatehr.ai/wp-json/elevatehr/v1/get-assessment-public?assessment_id=${assessmentId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch assessment details');
        return res.json();
      })
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.assessments) && data.assessments.length > 0) {
          setAssessment(data.assessments[0]);
          if (data.assessments[0].options) {
            setSelectedOption('1');
          }
        } else {
          setError('Assessment not found.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'An error occurred');
        setLoading(false);
      });
  }, [jobId, assessmentId]);

  const handleBack = () => {
    router.push(`/assessment?job_id=${jobId}&assessment_id=${assessmentId}&application_id=${applicationId}`);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const submissionData = {
      application_id: parseInt(applicationId || '0'),
      job_id: parseInt(jobId || '0'),
      assessment_id: parseInt(assessmentId || '0'),
      assessment_submission_link: submissionUrl,
      select_assessment_option: parseInt(selectedOption)
    };

    fetch('https://app.elevatehr.ai/wp-json/elevatehr/v1/applications/submit-technical-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }
      setSnackbarMessage('Assessment submitted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    })
    .catch(error => {
      setSnackbarMessage(error.message || 'An error occurred while submitting the assessment.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    })
    .finally(() => {
      setSubmitting(false);
    });
  };

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
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              color: 'grey.600',
              pl: 2,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Back to Assessment
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Box sx={{ 
              bgcolor: '#fff', 
              borderRadius: 2, 
              p: 4
            }}>
              <Typography 
                variant="h5" 
                fontWeight={600} 
                mb={2}
                sx={{
                  color: "rgba(17, 17, 17, 0.92)",
                  fontSize: "24px",
                  textTransform: "capitalize",
                }}
              >
                {assessment?.title} Technical Assessment Instructions
              </Typography>
              
              {loading && (
                <Stack spacing={3}>
                  <Skeleton variant="text" width="60%" height={48} />
                  <Skeleton variant="text" width="90%" height={24} />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Skeleton variant="rounded" width={100} height={32} />
                    <Skeleton variant="rounded" width={120} height={32} />
                    <Skeleton variant="rounded" width={90} height={32} />
                </Box>
                  <Skeleton variant="text" width="40%" height={36} />
                  <Stack spacing={2}>
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="90%" height={24} />
                    <Skeleton variant="text" width="95%" height={24} />
                    <Skeleton variant="text" width="85%" height={24} />
                    <Skeleton variant="text" width="92%" height={24} />
                  </Stack>
                </Stack>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {assessment && (
                <Stack spacing={4}>
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      color="grey.200" 
                      mb={2}
                    >
                      {assessment.description}
                    </Typography>
                    <Box mb={2} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {assessment.skills && assessment.skills.split(',').map((skill: string, idx: number) => (
                        <Chip 
                          key={idx} 
                          label={skill.trim()} 
                          sx={{ 
                            fontWeight: 500,
                            bgcolor: '#F9E8F3',
                            color: '#76325F',
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight={600} 
                      mb={2}
                      sx={{
                        color: "rgba(17, 17, 17, 0.92)",
                      }}
                    >
                      Assessment Guidelines
                    </Typography>
                    <Box 
                      sx={{ 
                        color: "rgba(17, 17, 17, 0.84)",
                        '& h3': {
                          fontSize: '16px',
                          fontWeight: 600,
                          mb: 1,
                          mt: 2,
                          '&:first-of-type': {
                            mt: 0
                          }
                        },
                        '& p': {
                          fontSize: '15px',
                          lineHeight: 1.6,
                          mb: 1.5
                        },
                        '& ul': {
                          pl: 2,
                          mb: 1.5
                        },
                        '& li': {
                          fontSize: '15px',
                          lineHeight: 1.6,
                          mb: 1
                        }
                      }}
                    >
                      <Typography sx={{ mb: 2 }}>
                        You are required to complete only one of the two options provided — Option A or Option B.
                        Please choose the one that best aligns with your strengths.
                      </Typography>

                      <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 600, mb: 1, mt: 3 }}>
                        Your final submission must be in one of the following formats:
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • PowerPoint (PPT or PDF)
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • Word Document (DOC or PDF)
                      </Typography>

                      <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 600, mb: 1, mt: 3 }}>
                        Ensure that Page One of your document includes:
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • The title of the assessment
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • The option you selected (Option A or Option B)
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • Your full name and email address
                      </Typography>

                      <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 600, mb: 1, mt: 3 }}>
                        📂 Submission Format
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • Upload your completed work to Google Drive.
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • Set the document permissions to: "Anyone with the link can view"
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • Submit the shareable link via the designated field on the submission page.
                      </Typography>

                      <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 600, mb: 1, mt: 3 }}>
                        ⏱ Timing
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • You are expected to spend a maximum of 3 hours on this assessment.
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • While the submission page will remain accessible beyond the 3-hour mark, your completion time will be reviewed as part of your overall performance.
                      </Typography>

                      <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 600, mb: 1, mt: 3 }}>
                        ⚠️ Important Notes
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • Carefully read all instructions and requirements before you begin.
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • Evaluation will focus on:
                      </Typography>
                      <Typography sx={{ pl: 2, mb: 1 }}>
                        - Clarity of thought
                      </Typography>
                      <Typography sx={{ pl: 2, mb: 1 }}>
                        - Analytical reasoning
                      </Typography>
                      <Typography sx={{ pl: 2, mb: 1 }}>
                        - Presentation style
                      </Typography>
                      <Typography sx={{ pl: 2, mb: 2 }}>
                        - Practical problem-solving approach
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        • Only one option should be submitted. Submitting both may result in disqualification.
                      </Typography>

                      <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 600, mb: 1, mt: 3 }}>
                        📌 Final Checklist
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        Before you submit, make sure to:
                      </Typography>
                      <Typography sx={{ pl: 2, mb: 1 }}>
                        ✅ Double-check your work
                      </Typography>
                      <Typography sx={{ pl: 2, mb: 1 }}>
                        ✅ Upload it to Google Drive
                      </Typography>
                      <Typography sx={{ pl: 2, mb: 1 }}>
                        ✅ Set sharing to "Anyone with the link can view"
                      </Typography>
                      <Typography sx={{ pl: 2, mb: 1 }}>
                        ✅ Submit your shareable link via the submission form
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ 
              bgcolor: '#fff', 
              borderRadius: 2, 
              p: 4,
              border: "1px solid #E0E0E0",
              position: 'sticky',
              top: 24,
              maxWidth: 'calc(100% - 20px)',
              ml: 'auto',
              mr: 'auto'
            }}>
              <Stack spacing={3}>
                <Typography 
                  variant="h6" 
                  fontWeight={600}
                  sx={{
                    color: "rgba(17, 17, 17, 0.92)",
                    fontSize: "18px"
                  }}
                >
                  Ready to Submit?
                </Typography>
                <Stack spacing={2}>
                  <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                    • Please ensure your submission is complete and follows all requirements
                  </Typography>
                  <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                    • Make sure your submission URL is accessible
                  </Typography>
                  <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                    • You can only submit once
                  </Typography>
                  {assessment?.review_time && (
                    <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                      • We will review your submission within {assessment.review_time}
                    </Typography>
                  )}
                </Stack>

                <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleBack}
                      fullWidth
                      sx={{
                        height: 56,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      Go to Assessment Page
                    </Button>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 