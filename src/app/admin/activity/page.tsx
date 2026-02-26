"use client";

import React from "react";
import { Box, Paper, Stack, Typography, IconButton, Link as MuiLink, CircularProgress } from "@mui/material";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../styles";
import { useAdminRecentActivity } from "@/queries/admin.queries";

export default function AdminActivityPage() {
  const { activity, isLoading } = useAdminRecentActivity();

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          ...ADMIN_CARD_SX,
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Global events across all recruiters and tenants.
            </Typography>
          </Box>
          <MuiLink component={Link} href="/admin" underline="hover" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
            Back to dashboard
          </MuiLink>
        </Box>

        <Stack spacing={0}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : activity?.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No recent activity found.
            </Typography>
          ) : (
            activity?.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: 0 },
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2">{item.text}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                    {item.time}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: "text.secondary", flexShrink: 0 }}>
                  <ChevronRightIcon style={{ width: 20, height: 20 }} />
                </IconButton>
              </Box>
            ))
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
