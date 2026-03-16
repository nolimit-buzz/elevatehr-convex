"use client";
import React from "react";
import { Box, Stack, Divider } from "@mui/material";

export default function DetailsSkeleton() {
  return (
    <Box>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" gap={"16px"} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: "200px",
              height: "32px",
              bgcolor: "rgba(0, 0, 0, 0.03)",
              borderRadius: 1,
            }}
          />
          <Stack direction="row" gap={"28px"}>
            <Box
              sx={{
                width: "150px",
                height: "24px",
                bgcolor: "rgba(0, 0, 0, 0.03)",
                borderRadius: 1,
              }}
            />
            <Box
              sx={{
                width: "200px",
                height: "24px",
                bgcolor: "rgba(0, 0, 0, 0.03)",
                borderRadius: 1,
              }}
            />
          </Stack>
        </Stack>

        {/* Skills Skeleton */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                width: "80px",
                height: "24px",
                bgcolor: "rgba(0, 0, 0, 0.03)",
                borderRadius: "16px",
              }}
            />
          ))}
        </Stack>

        {/* Key Info Skeleton */}
        <Stack direction="row" spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                width: "120px",
                height: "24px",
                bgcolor: "rgba(0, 0, 0, 0.03)",
                borderRadius: 1,
              }}
            />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Why hire section Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            width: "200px",
            height: "24px",
            bgcolor: "rgba(0, 0, 0, 0.03)",
            borderRadius: 1,
            mb: 2,
          }}
        />
        <Box
          sx={{
            width: "100%",
            height: "100px",
            bgcolor: "rgba(0, 0, 0, 0.03)",
            borderRadius: 1,
          }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Resume section Skeleton */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: "100px",
              height: "24px",
              bgcolor: "rgba(0, 0, 0, 0.03)",
              borderRadius: 1,
            }}
          />
          <Box
            sx={{
              width: "120px",
              height: "36px",
              bgcolor: "rgba(0, 0, 0, 0.03)",
              borderRadius: 2,
            }}
          />
        </Box>
        <Box
          sx={{
            height: "800px",
            bgcolor: "rgba(0, 0, 0, 0.03)",
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Action Buttons Skeleton */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          mt: 4,
        }}
      >
        <Box
          sx={{
            width: "100px",
            height: "36px",
            bgcolor: "rgba(0, 0, 0, 0.03)",
            borderRadius: 2,
          }}
        />
        <Box
          sx={{
            width: "160px",
            height: "36px",
            bgcolor: "rgba(0, 0, 0, 0.03)",
            borderRadius: 2,
          }}
        />
      </Box>
    </Box>
  );
}
