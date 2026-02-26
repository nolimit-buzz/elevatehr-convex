"use client";

import { Box, Button, Typography } from "@mui/material";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

interface ImpersonationBannerProps {
  companyName: string;
  onExit: () => void;
}

export default function ImpersonationBanner({ companyName, onExit }: ImpersonationBannerProps) {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        py: 1.25,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="body2" fontWeight={600}>
        Viewing as {companyName}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={onExit}
        startIcon={<ArrowRightOnRectangleIcon style={{ width: 24, height: 24 }} />}
        sx={{
          borderColor: "primary.contrastText",
          color: "primary.contrastText",
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          "&:hover": {
            borderColor: "primary.contrastText",
            bgcolor: "rgba(255,255,255,0.12)",
          },
        }}
      >
        Exit Impersonation
      </Button>
    </Box>
  );
}
