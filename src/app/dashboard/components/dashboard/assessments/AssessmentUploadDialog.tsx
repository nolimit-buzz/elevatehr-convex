"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Button,
  LinearProgress,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentCancelModal from "./AssessmentCancelModal";

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
  onImport,
  onCancelImport,
}: AssessmentUploadDialogProps) {
  const [showCancelModal, setShowCancelModal] = React.useState(false);

  const handleCloseClick = () => {
    if (importing) {
      setShowCancelModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onCancelImport();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 0,
          maxWidth: "720px",
          width: "100%",
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 3, md: 5 },
          position: "relative",
          bgcolor: "#fff",
          minWidth: { xs: 320, md: 640 },
        }}
      >
        <IconButton
          onClick={handleCloseClick}
          sx={{ position: "absolute", top: 20, right: 20, zIndex: 1 }}
        >
          <CloseIcon sx={{ fontSize: 28, color: "rgba(17, 17, 17, 0.32)" }} />
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

        {importFile && importRows.length > 0 && (
          <Stack mt={3} spacing={1.5}>
            <Typography
                sx={{ fontSize: 14, color: "rgba(34, 34, 79, 0.72)", width: "100%", fontWeight: 400  }}
            >
              Ready to import: {importRows.length} rows from {importFile.name}
            </Typography>
            <Button
              variant="contained"
              onClick={onImport}
              disabled={importing}
              sx={{
                bgcolor: "#4444E2",
                borderRadius: "12px",
                textTransform: "none",
                py: 1.25,
                "&:hover": { bgcolor: "#5656E6" },
                alignSelf: "flex-start",
              }}
            >
              {importing
                ? `Importing ${importProgress.done}/${importProgress.total}`
                : "Import assessments"}
            </Button>

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
      </DialogContent>

      <AssessmentCancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </Dialog>
  );
}
