"use client";
import React, { useState, useRef } from "react";
import { Box, Typography, Stack, Avatar, IconButton } from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";

interface OnboardingStep2Props {
  data: {
    company_logo: File | null;
  };
  onUpdate: (data: { company_logo: File | null }) => void;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ data, onUpdate }) => {
  const getInitialPreview = () => {
    if (data.company_logo && typeof window !== "undefined") {
      return URL.createObjectURL(data.company_logo);
    }
    return null;
  };
  const [previewUrl, setPreviewUrl] = useState<string | null>(getInitialPreview());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    onUpdate({ company_logo: file });
    if (typeof window !== "undefined") {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    onUpdate({ company_logo: null });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight="bold">Company Logo</Typography>
      <Typography color="grey.200" maxWidth="600px">
        Upload your company logo. This will be displayed on your job postings. (PNG, JPG up to 5MB)
      </Typography>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      
      {previewUrl ? (
        <Box sx={{ textAlign: "center", position: "relative", alignSelf: 'center', mt: 2 }}>
          <Avatar src={previewUrl} sx={{ width: 150, height: 150, border: '3px solid #e0e0e0' }} />
          <IconButton
            onClick={handleRemoveLogo}
            size="small"
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            border: "2px dashed #ccc",
            borderRadius: 2,
            p: 4,
            mt: 2,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUpload sx={{ fontSize: 48, color: "grey.200" }} />
          <Typography variant="h6" color="grey.200" gutterBottom>
            Click to upload logo
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default OnboardingStep2;
