"use client";
import React from "react";
import { Box, Skeleton, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

const StatCardSkeleton = styled(Box)<{ index: number; length: number }>(({ theme, index, length }) => ({
  height: "180px",
  background: "#FFFFFF",
  borderRadius: index === 0 ? '10px 0 0 10px' : (index === length - 1 ? '0 10px 10px 0' : '0px'),
  borderRight: index < length - 1 ? '1px solid rgba(17,17,17,0.12)' : 'none',
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "all 0.3s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    "& .stat-value": {
      color: theme.palette.primary.main,
    },
    "& .stat-title": {
      color: theme.palette.primary.main,
    },
  },
}));

const DashboardSkeleton = () => {
  const statCards = [1, 2, 3, 4, 5, 6];
  
  return (
    <Box sx={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', width: '100%', background: '#F3F4F7', minHeight: '100vh', padding: '40px 24px' }}>
      <Box sx={{ maxWidth: '1440px', width: '100%' }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 3, mt: "40px" }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>

        {/* Stats Cards Skeleton */}
        <Grid container spacing={0} mb={6}>
          {statCards.map((_, index) => (
            <Grid item xs={2} key={index}>
              <StatCardSkeleton index={index} length={statCards.length}>
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: '30px' }} />
                  <Skeleton variant="text" width={60} height={40} className="stat-value" sx={{ mt: '16px', mb: '8px' }} />
                  <Skeleton variant="text" width={50} height={24} className="stat-title" />
                </Box>
              </StatCardSkeleton>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Skeleton */}
        <Grid container spacing={4}>
          {/* Main Panel */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ background: '#FFFFFF', borderRadius: '10px', p: 3, height: '700px', overflow: 'hidden' }}>
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width={200} height={32} />
              </Box>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px', mb: 2 }} />
              {[1, 2, 3, 4, 5].map((index) => (
                <Skeleton key={index} variant="rectangular" height={150} sx={{ borderRadius: '8px', mb: 2 }} />
              ))}
            </Box>
          </Grid>

          {/* Side Panel */}
          <Grid container item spacing={4} xs={12} lg={4}>
            <Grid item xs={12} sm={6} lg={12} sx={{ flex: 1, maxHeight: '50%', overflow: 'hidden' }}>
              <Box sx={{ background: '#FFFFFF', borderRadius: '10px', p: 3, height: '340px' }}>
                <Box sx={{ mb: 2 }}>
                  <Skeleton variant="text" width={150} height={32} />
                </Box>
                {[1, 2, 3].map((index) => (
                  <Skeleton key={index} variant="rectangular" height={80} sx={{ borderRadius: '8px', mb: 2 }} />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={12} sx={{ flex: 1, maxHeight: '50%', overflow: 'hidden' }}>
              <Box sx={{ background: '#FFFFFF', borderRadius: '10px', p: 3, height: '340px' }}>
                <Box sx={{ mb: 2 }}>
                  <Skeleton variant="text" width={150} height={32} />
                </Box>
                {[1, 2, 3].map((index) => (
                  <Skeleton key={index} variant="rectangular" height={80} sx={{ borderRadius: '8px', mb: 2 }} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardSkeleton;