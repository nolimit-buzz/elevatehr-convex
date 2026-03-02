"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Stack, Typography, Paper } from "@mui/material";
import PageContainer from "@/app/dashboard/components/container/PageContainer";
import AdminAuthLogin from "@/app/admin/components/AdminAuthLogin";

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <PageContainer title="Admin login" description="ElevateHR admin and reseller sign in" customStyle={{ padding: 0 }}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 520,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={1.5} mb={3}>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: "-0.02em", color: "#1a1a1a" }}>
              Admin login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in as an ElevateHR admin or reseller to manage recruiters and tenants.
            </Typography>
          </Stack>

          <AdminAuthLogin onSuccess={() => void router.push("/admin")} />

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            Need the standard recruiter login?{" "}
            <Typography component={Link} href="/" sx={{ color: "primary.main", fontWeight: 600 }}>
              Go to main login
            </Typography>
          </Typography>
        </Paper>
      </Box>
    </PageContainer>
  );
}
