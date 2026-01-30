import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

interface CandidateSkeletonLoaderProps {
  count?: number;
}

const CandidateSkeletonLoader: React.FC<CandidateSkeletonLoaderProps> = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            backgroundColor: "white",
            display: "flex",
            alignItems: "flex-start",
            p: 2,
            borderBottom: "0.8px solid rgba(17, 17, 17, 0.08)",
            mb: 2,
            height: "120px",
          }}
        >
          {/* Checkbox skeleton */}
          <Box sx={{ p: 0 }}>
            <Skeleton
              variant="rectangular"
              width={16}
              height={16}
              sx={{
                borderRadius: 1,
                bgcolor: "rgba(17, 17, 17, 0.04)",
              }}
            />
          </Box>

          {/* Content skeleton */}
          <Box sx={{ ml: "12px", width: "100%" }}>
            {/* Name skeleton */}
            <Skeleton
              variant="text"
              width={200}
              height={24}
              sx={{
                mb: 1,
                bgcolor: "rgba(17, 17, 17, 0.04)",
              }}
            />

            {/* Info row skeleton */}
            <Box sx={{ display: "flex", gap: 3.5, mb: 2 }}>
              <Skeleton
                variant="text"
                width={100}
                height={20}
                sx={{ bgcolor: "rgba(17, 17, 17, 0.04)" }}
              />
              <Skeleton
                variant="text"
                width={100}
                height={20}
                sx={{ bgcolor: "rgba(17, 17, 17, 0.04)" }}
              />
            </Box>

            {/* Skills skeleton */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {[1, 2, 3, 4].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={80}
                  height={24}
                  sx={{
                    borderRadius: "28px",
                    bgcolor: "rgba(17, 17, 17, 0.04)",
                  }}
                />
              ))}
            </Box>

            {/* Quick actions button skeleton */}
            <Skeleton
              variant="rectangular"
              width={120}
              height={36}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                borderRadius: "8px",
                bgcolor: "rgba(17, 17, 17, 0.02)",
              }}
            />
          </Box>
        </Paper>
      ))}
    </>
  );
};

export default CandidateSkeletonLoader; 