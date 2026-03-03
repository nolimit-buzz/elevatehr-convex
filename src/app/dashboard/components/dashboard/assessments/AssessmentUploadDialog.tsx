"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Box,
  Button,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface AssessmentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  importFile: File | null;
  importRows: any[];
  importing: boolean;
  importProgress: { total: number; done: number };
  onImport: () => void;
  onCancelImport: () => void;
}

export default function AssessmentUploadDialog({
  open,
  onClose,
  importFile,
  importRows,
  importing,
  importProgress,
}: AssessmentUploadDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          width: "100%",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 16, zIndex: 1, bgcolor: "rgba(235, 235, 235, 1)", borderRadius: "50%", width: "30px", height: "30px" }}
        >
          <CloseIcon sx={{ fontSize: 14, color: "rgba(17, 17, 17, 0.84)" }} />
        </IconButton>

        <Typography
          sx={{
            fontSize: 20,
            color: "rgba(17, 17, 17, 0.92)",
            fontWeight: 600,
            mb: 3,
          }}
        >
          Upload assessment file
        </Typography>

        {importFile && (
          <Stack mt={3} spacing={1.5}>
            <Typography
              sx={{ fontSize: 14, color: "rgba(34, 34, 79, 0.72)", fontWeight: 400 }}
            >
              File selected: <strong>{importFile.name}</strong>
              {importRows.length > 0 && <> — {importRows.length} rows detected</>}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {}}
              sx={{
                bgcolor: "#4444E2",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                py: 1.25,
                alignSelf: "flex-start",
                "&:hover": { bgcolor: "#5656E6" },
              }}
            >
              Upload Assessment
            </Button>

            {/* Progress bar — shown when import is externally triggered */}
            {importing && (
              <Box sx={{ width: "100%", mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(importProgress.done / importProgress.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    bgcolor: "rgba(68, 68, 226, 0.12)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#4444E2",
                      borderRadius: 5,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(34, 34, 79, 0.56)", mt: 0.5, display: "block" }}
                >
                  {Math.round((importProgress.done / importProgress.total) * 100)}% complete
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        {!importFile && (
          <Typography sx={{ fontSize: 14, color: "rgba(34, 34, 79, 0.48)", fontWeight: 400 }}>
            No file selected yet.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
