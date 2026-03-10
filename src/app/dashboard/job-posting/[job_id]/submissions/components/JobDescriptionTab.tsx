"use client";
import React from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import JobDescription from "@/app/dashboard/components/JobDescription";
import { JobDetails } from "@/app/dashboard/types/candidate";

interface JobDescriptionTabProps {
  loading: boolean;
  jobDetails: JobDetails | null;
  error: string | null;
  getJobId: () => string;
  setError: (error: string | null) => void;
  setPrimaryTabValue: (value: number) => void;
}

const JobDescriptionSkeleton = () => (
  <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", width: "100%" }}>
    <Box
      sx={{
        width: { xs: "100%", md: 280 },
        minWidth: 220,
        bgcolor: "#fff",
        borderRadius: "16px",
        p: 3,
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: 240,
        overflow: "hidden",
      }}
    >
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width={80} height={28} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width={60} height={28} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width={120} height={28} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="60%" height={24} sx={{ mt: 2 }} />
    </Box>

    <Box
      sx={{
        flex: 1,
        bgcolor: "#fff",
        borderRadius: "16px",
        boxShadow: "0px 4px 24px rgba(17, 17, 17, 0.06)",
        p: 4,
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="text" width="30%" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="text" width="35%" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="text" width="25%" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
    </Box>
  </Box>
);

export default function JobDescriptionTab({
  loading,
  jobDetails,
  error,
  getJobId,
  setError,
  setPrimaryTabValue,
}: JobDescriptionTabProps) {
  return (
    <Paper sx={{ bgcolor: "transparent", boxShadow: "none" }}>
      {loading ? (
        <JobDescriptionSkeleton />
      ) : jobDetails ? (
        <JobDescription
          jobDetails={jobDetails}
          loading={loading}
          error={error}
          getJobId={getJobId}
          setError={setError}
          setPrimaryTabValue={setPrimaryTabValue}
        />
      ) : error ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="textSecondary">No job details available</Typography>
        </Box>
      )}
    </Paper>
  );
}
