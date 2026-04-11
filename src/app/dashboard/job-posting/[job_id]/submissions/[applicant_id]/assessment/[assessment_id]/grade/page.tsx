"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Paper, Stack, Divider, TextField, IconButton, Link } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useApplication } from "@/queries/applications.queries";
import { useAssessment, AssessmentQueries } from "@/queries/assessment.queries";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";

export default function GradingPage() {
  const params = useParams();
  const router = useRouter();
  const { applicant_id, assessment_id } = params;

  const applicant = useApplication(applicant_id as string);
  const assessment = useAssessment(assessment_id as any);
  const { GradeTechnicalSubmission } = AssessmentQueries();

  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    router.back();
  };

  if (!applicant || !assessment) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography>Loading assessment details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={600}>
          Grade Technical Assessment: {assessment.title}
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid rgba(0,0,0,0.1)" }}>
        <Typography variant="h6" gutterBottom>
          Candidate: {applicant.personal_info?.firstname} {applicant.personal_info?.lastname}
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Technical Submission
            </Typography>
            <Typography color="text.secondary">
              View the candidate's submission link and add a score based on their performance.
            </Typography>

            {/* coming back to chang this to !submissionLink  */}
            {(() => {
              const submissionLink =
                applicant.assessments_results?.[assessment_id as string]?.assessment_submission_link;
              if (submissionLink) return null;
              return (
                <Button
                  component="a"
                  variant="outlined"
                  href={submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 2, borderRadius: "24px", textTransform: "none" }}
                >
                  View Submission
                </Button>
              );
            })()}
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Score (%)
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="Enter score (0-100)"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              sx={{ maxWidth: 200 }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Feedback / Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add your evaluation notes here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Box>

          <Box sx={{ pt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="large"
              disabled={saving || !score}
              sx={{ borderRadius: "24px", px: 4, textTransform: "none" }}
              onClick={async () => {
                const numScore = Number(score);
                if (isNaN(numScore) || numScore < 0 || numScore > 100) {
                  alert("Please enter a valid score between 0 and 100");
                  return;
                }
                setSaving(true);
                const { error } = await GradeTechnicalSubmission({
                  applicationId: applicant_id as Id<"applications">,
                  assessmentId: assessment_id as Id<"assessments">,
                  score: numScore,
                  feedback: feedback || undefined,
                });
                setSaving(false);
                if (error) {
                  alert(error);
                } else {
                  router.back();
                }
              }}
            >
              {saving ? "Saving..." : "Save Grade"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
