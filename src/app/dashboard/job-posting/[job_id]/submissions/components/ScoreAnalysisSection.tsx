"use client";
import React from "react";
import { Box, Stack, Typography, Chip, Paper } from "@mui/material";
import TurnedInNotOutlinedIcon from "@mui/icons-material/TurnedInNotOutlined";

interface CVAnalysis {
    match_score: number;
    skills_match?: string[];
    missing_skills?: string[];
    experience_years?: number;
    recommendations?: string;
    summary?: string;
}

interface ScoreAnalysisSectionProps {
    assessmentsResults: any;
}

export default function ScoreAnalysisSection({
    assessmentsResults,
}: ScoreAnalysisSectionProps) {
    if (!assessmentsResults) return null;

    const assessmentEntries = Object.entries(assessmentsResults).filter(
        ([_, result]: [string, any]) => result && result.assessment_id,
    );

    if (assessmentEntries.length === 0) return null;

    return (
        <Box sx={{ mb: 2 }}>
            <Stack spacing={2}>
                <Box>
                    <Stack direction="row" flexWrap="wrap" gap={2}>
                        {assessmentEntries.map(([type, result]: [string, any]) => {
                            const score = result.assessment_score;
                            const status =
                                result.assessment_submission_status || result.assessment_status;
                            const isTechnical = type === "technical_assessment";
                            const labelPrefix = isTechnical
                                ? "Technical score"
                                : "Quiz Score";

                            let scoreDisplay;
                            if (score !== undefined) {
                                scoreDisplay = `${score}%`;
                            } else if (status === "submitted") {
                                scoreDisplay = "Pending";
                            } else {
                                scoreDisplay = "Not submitted";
                            }

                            return (
                                <Box key={type}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            bgcolor: isTechnical
                                                ? "rgba(25, 118, 210, 0.04)"
                                                : "rgba(46, 125, 50, 0.04)",
                                            border: "1px solid",
                                            borderColor: isTechnical
                                                ? "rgba(25, 118, 210, 0.12)"
                                                : "rgba(46, 125, 50, 0.12)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <TurnedInNotOutlinedIcon />
                                        <Stack direction="row" alignItems="baseline" spacing={1}>
                                            <Typography
                                                variant="body1"
                                                sx={{ color: "text.grey[100]" }}
                                            >
                                                {labelPrefix}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: isTechnical ? "primary.main" : "success.main",
                                                }}
                                            >
                                                {scoreDisplay}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}
