"use client";
import React from "react";
import { Box, Stack, Typography, Divider } from "@mui/material";

interface CustomFieldsSectionProps {
  jobData: any;
  applicant: any;
}

// Fields already shown elsewhere in the applicant detail view (header, skills, resume).
const FIELDS_SHOWN_ELSEWHERE = new Set(["firstname", "lastname", "email", "skills", "cv", "resume"]);

export default function CustomFieldsSection({ jobData, applicant }: CustomFieldsSectionProps) {
  const requiredFieldsConfig = jobData?.application_form?.required_fields || [];
  const customFieldsConfig = jobData?.application_form?.custom_fields || [];
  const fieldsConfig = [...requiredFieldsConfig, ...customFieldsConfig].filter(
    (field: any) => !FIELDS_SHOWN_ELSEWHERE.has(field.key),
  );
  const customFieldResponses = applicant?.custom_fields || {};

  if (fieldsConfig.length === 0 || Object.keys(customFieldResponses).length === 0) return null;

  const validFields = fieldsConfig.filter((field: any) => {
    const response = customFieldResponses[field.key];
    return response !== undefined && response !== null && response !== "";
  });

  if (validFields.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, }}>
        Application Responses
      </Typography>
      <Stack spacing={3} sx={{
        bgcolor: "rgba(17, 17, 17, 0.04)",
        p: 2,
        borderRadius: 2,
      }}>
        {validFields.map((field: any, index: number) => {
          const response = customFieldResponses[field.key];
          const rawValue = typeof response === 'object' && response !== null && 'value' in response
            ? response.value
            : response;
          // For select fields, the stored answer is the option key (e.g. "option_0") —
          // resolve it to its human-readable label.
          const displayValue =
            field.type === "select" && field.options && typeof field.options === "object"
              ? (field.options as Record<string, string>)[String(rawValue)] ?? String(rawValue)
              : String(rawValue);

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

    </Box>
  );
}
