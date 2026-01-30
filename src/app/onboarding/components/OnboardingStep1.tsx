"use client";
import React from "react";
import { Typography, TextField, Stack, InputAdornment } from "@mui/material";
import { Language } from "@mui/icons-material";

interface OnboardingStep1Props {
  data: {
    website: string;
  };
  onUpdate: (data: { website: string }) => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ data, onUpdate }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ website: event.target.value });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight="bold">Company Website</Typography>
      <Typography color="grey.200" maxWidth="600px">
        Please provide your company's website URL. This will help candidates learn more about your organization.
      </Typography>
      <TextField
        fullWidth
        label="Company Website"
        placeholder="https://yourcompany.com"
        value={data.website}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Language color="action" />
            </InputAdornment>
          ),
        }}
        variant="outlined"
        sx={{ mt: 2 }}
      />
    </Stack>
  );
};

export default OnboardingStep1;
