import { Box, Paper, Stack, Grid, Skeleton } from "@mui/material";

export default function ProfileSkeleton() {
  return (
    <Box sx={{ maxWidth: "1280px", mx: "auto", p: 3 }}>
      {/* Back Button Skeleton */}
      <Skeleton variant="rectangular" width={120} height={36} sx={{ mb: 2 }} />

      {/* Profile Header Skeleton */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: "10px", overflow: "hidden" }}>
        <Box sx={{ height: "120px", bgcolor: "primary.main", position: "relative" }}>
          <Skeleton
            variant="circular"
            width={130}
            height={130}
            sx={{
              position: "absolute",
              top: -80,
              left: 20,
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          />
        </Box>
        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Box>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={150} height={24} />
          </Box>
        </Box>
      </Paper>

      {/* Main Content Layout */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3 }}>
        {/* Left Sidebar Skeleton */}
        <Box
          sx={{
            width: { xs: "100%", lg: "30%" },
            minWidth: { lg: "250px" },
            maxWidth: { lg: "300px" },
          }}
        >
          <Paper elevation={0} sx={{ p: 2, borderRadius: "10px" }}>
            <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={48}
                  sx={{
                    borderRadius: "8px",
                    bgcolor: i === 1 ? "secondary.light" : "background.paper",
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* Main Content Skeleton */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: "10px" }}>
            {/* Section Header */}
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={24} />
            </Box>

            {/* Form Fields */}
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Box>
                    <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "8px" }} />
                  </Box>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Box>
                  <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: "8px" }} />
                </Box>
              </Grid>
            </Grid>

            {/* Save Button */}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: "8px" }} />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
