"use client";
import React from "react";
import { Box, Stack, Typography } from "@mui/material";

interface GradingFeedbacksProps {
    jobData: any;
    applicant: any;
}

export default function GradingFeedbacks({ jobData, applicant }: GradingFeedbacksProps) {
    // Note: Currently no Convex API for actual grading feedbacks.
    // This component is hidden for now as requested.
    return null;
}
