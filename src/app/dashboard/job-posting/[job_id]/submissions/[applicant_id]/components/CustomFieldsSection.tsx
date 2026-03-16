"use client";
import React from "react";
import { Box, Stack, Typography, Divider } from "@mui/material";

interface CustomFieldsSectionProps {
  jobData: any;
  applicant: any;
}

export default function CustomFieldsSection({ jobData, applicant }: CustomFieldsSectionProps) {
  const customFieldsConfig = jobData?.application_form?.custom_fields || [];
  const customFieldResponses = applicant?.custom_fields || {};

  if (customFieldsConfig.length === 0 || Object.keys(customFieldResponses).length === 0) return null;

  const validFields = customFieldsConfig.filter((field: any) => {
    const response = customFieldResponses[field.key];
    return response !== undefined && response !== null;
  });

  if (validFields.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Application Responses
      </Typography>
      <Stack spacing={3} sx={{
        bgcolor: "rgba(17, 17, 17, 0.04)",
        p: 2,
        borderRadius: 2,
      }}>
        {validFields.map((field: any, index: number) => {
          const response = customFieldResponses[field.key];
          const displayValue = typeof response === 'object' && response !== null && 'value' in response
            ? String(response.value)
            : String(response);

          return (
            <Box key={field.key} sx={{ whiteSpace: "pre-wrap" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {index + 1}. {field.label}
              </Typography>
              <Typography color="text.grey[100]" sx={{ whiteSpace: "pre-wrap", pl: 2 }}>
                {displayValue}
              </Typography>
            </Box>
          );
        })}
      </Stack>
      <Divider sx={{ my: 4 }} />
    </Box>
  );
}
