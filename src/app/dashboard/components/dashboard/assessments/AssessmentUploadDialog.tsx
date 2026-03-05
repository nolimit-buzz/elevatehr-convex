"use client";
import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Box,
  Button,
  LinearProgress,
  TextField,
  Autocomplete,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Image from "next/image";

interface AssessmentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  importFile: File | null;
  setImportFile: (file: File | null) => void;
  importRows: any[];
  importing: boolean;
  importProgress: { total: number; done: number };
  onImport: () => void;
  onCancelImport: () => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  skills: string[];
  setSkills: (value: string[]) => void;
  generatedSkills: string[];
  isGeneratingSkills: boolean;
  generateSkills: () => void;
  handleDeleteSkill: (skill: string) => void;
  handleFileChange: (file: File) => void;
  success: boolean;
}

export default function AssessmentUploadDialog({
  open,
  onClose,
  importFile,
  setImportFile,
  importRows,
  importing,
  importProgress,
  onImport,
  onCancelImport,
  jobTitle,
  setJobTitle,
  skills,
  setSkills,
  generatedSkills,
  isGeneratingSkills,
  generateSkills,
  handleDeleteSkill,
  handleFileChange,
  success,
}: AssessmentUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(17, 17, 17, 0.32)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "8px",
          p: 0,
          maxWidth: "600px",
          width: "100%",
          bgcolor: "rgba(241, 244, 249, 1)",
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 3, md: 4 },
          position: "relative",
          bgcolor: "rgba(241, 244, 249, 1)",
          minWidth: { xs: 320, md: 600 },
          maxHeight: "90vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { width: "0.1px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "transparent" },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 10,
            right: 16,
            zIndex: 1,
            bgcolor: "rgba(235, 235, 235, 1)",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
          }}
        >
          <CloseIcon sx={{ fontSize: 14, color: "rgba(17, 17, 17, 0.84)" }} />
        </IconButton>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 24,
            color: "rgba(17, 17, 17, 0.92)",
            mb: 3,
          }}
        >
          Upload file
        </Typography>

        {/* Job Title Field */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 18,
              color: "rgba(17, 17, 17, 0.92)",
              mb: 1.5,
            }}
          >
            Who is this assessment for (job title)
          </Typography>
          <TextField
            fullWidth
            placeholder="Add job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            sx={{
              bgcolor: "#F4F5F7",
              borderRadius: "12px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                fontSize: 16,
                bgcolor: "#F4F5F7",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E7EC" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4444E2",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4444E2",
                borderWidth: "1.5px",
              },
            }}
            InputProps={{
              style: { fontWeight: 400, color: "rgba(17, 17, 17, 0.68)" },
            }}
          />
        </Box>

        {/* Skills Field */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 18,
              color: "rgba(17, 17, 17, 0.92)",
              mb: 1.5,
            }}
          >
            Skills
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={generatedSkills}
            value={skills}
            onChange={(event, newValue) => setSkills(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                onFocus={() => {
                  if (
                    !isGeneratingSkills &&
                    jobTitle.length > 0 &&
                    generatedSkills.length === 0
                  ) {
                    generateSkills();
                  }
                }}
                placeholder="Select or type skills"
                sx={{
                  bgcolor: "#F4F5F7",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    fontSize: 16,
                    bgcolor: "#F4F5F7",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E7EC" },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4444E2",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4444E2",
                    borderWidth: "1.5px",
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  style: { fontWeight: 400, color: "rgba(17, 17, 17, 0.68)" },
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  onDelete={() => handleDeleteSkill(option)}
                  sx={{
                    bgcolor: "#F4F5F7",
                    color: "rgba(17, 17, 17, 0.84)",
                    fontWeight: 500,
                    fontSize: 15,
                    borderRadius: "12px",
                    border: "1.5px solid #E4E7EC",
                    "&:hover": { borderColor: "#4444E2" },
                  }}
                />
              ))
            }
          />
        </Box>

        {/* Drag and Drop Area */}
        <Box
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: "2px dashed",
            borderColor: isDragging ? "primary.main" : "rgba(17, 17, 17, 0.12)",
            borderRadius: "12px",
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: isDragging ? "rgba(68, 68, 226, 0.04)" : "transparent",
            transition: "all 0.2s",
            mb: 3,
            position: "relative"
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept=".csv,.xlsx,.xls"
            onChange={onFileSelect}
          />
          <Stack spacing={1} alignItems="center">
            <Box sx={{ position: "relative", mb: 1 }}>
              <Image src="/images/file-icon.svg" alt="File" width={48} height={48} />
              <Box sx={{
                position: "absolute",
                bottom: -2,
                right: -2,
                bgcolor: "primary.main",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff"
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 17V7M7 12l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
            </Box>
            <Typography sx={{ fontWeight: 500 }}>
              Drag and Drop file here or <Box component="span" sx={{ color: "primary.main", textDecoration: "underline" }}>Choose file</Box>
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
          <Typography variant="caption" sx={{ color: "rgba(17, 17, 17, 0.48)" }}>
            Supported formats: XLS, XLSX
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(17, 17, 17, 0.48)" }}>
            Maximum size: 25MB
          </Typography>
        </Stack>

        {/* File Progress / Selection */}
        {importFile && (
          <Box sx={{ mb: 4, p: 2, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #E4E7EC" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={importing ? 1 : 0}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Image src="/images/excel-icon.svg" alt="Excel" width={24} height={24} />
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{importFile.name}</Typography>
                  {importRows.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {importRows.length} rows detected
                    </Typography>
                  )}
                </Box>
              </Stack>
              {!importing && (
                <IconButton size="small" onClick={() => setImportFile(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
            {importing && (
              <Box sx={{ width: "100%", mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(importProgress.done / importProgress.total) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Table Example Section */}
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          bgcolor: "rgba(17, 17, 17, 0.04)",
          borderRadius: "12px"
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Image src="/images/excel-icon.svg" alt="Excel" width={32} height={32} />
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Table Example</Typography>
              <Typography variant="caption" sx={{ color: "rgba(17, 17, 17, 0.48)", display: "block", maxWidth: "280px" }}>
                You can download the attached example and use them as a starting point for your own file.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "#E4E7EC",
              color: "rgba(17, 17, 17, 0.92)",
              bgcolor: "#fff",
              "&:hover": { bgcolor: "#f9f9f9", borderColor: "#D0D5DD" }
            }}
          >
            Download
          </Button>
        </Box>

        {success && (
          <Typography color="success.main" sx={{ mt: 3, textAlign: "center", fontWeight: 600 }}>
            Assessment uploaded successfully!
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={onImport}
          disabled={importing || !importFile || !jobTitle || skills.length === 0 || success}
          sx={{
            bgcolor: success ? "success.main" : "#4444E2",
            color: "#fff",
            fontWeight: 600,
            py: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            mt: 4,
            "&:hover": { bgcolor: success ? "success.dark" : "#5656E6" },
          }}
        >
          {importing ? "Importing..." : success ? "Uploaded" : "Upload Assessment"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

