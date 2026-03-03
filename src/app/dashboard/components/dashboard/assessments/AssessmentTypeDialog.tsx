"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";

interface AssessmentTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectUpload: () => void;
  onSelectGenerate: () => void;
}

export default function AssessmentTypeDialog({
  open,
  onClose,
  onSelectUpload,
  onSelectGenerate,
}: AssessmentTypeDialogProps) {
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
          borderRadius: "20px",
          p: 0,
          maxWidth: "580px",
          width: "100%",
          bgcolor: "rgba(241, 244, 249, 1)",
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 3, md: 5 },
          position: "relative",
          bgcolor: "rgba(241, 244, 249, 1)",
          minWidth: { xs: 320, md: 580 },
           maxWidth: "580px",
          width: "100%",
         
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 20, right: 20, zIndex: 1, bgcolor: "rgba(235, 235, 235, 1)", borderRadius: "50%", p: 1 }}
        >
          <CloseIcon sx={{ fontSize: 20, color: "rgba(17, 17, 17, 0.84)" }} />
        </IconButton>

        <Typography
          sx={{
            
            fontSize: 20,
            color: "rgba(17, 17, 17, 0.92)",
            fontWeight: 600,
            mb: 3,
          }}
        >
          Add a new Assessment?
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
          <Box
            onClick={onSelectUpload}
            sx={{
              flex: 1,
                borderRadius: "6px",
              border: "0.8px solid rgba(68, 68, 226, 0.48)",
              backgroundColor: "rgba(234, 234, 246, 1)",
              p: 3,
              cursor: "pointer",
              transition: "all 0.15s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(68, 68, 226, 0.08)",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Stack spacing={1.5} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "rgba(68, 68, 226, 1)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image src="/images/share.svg" alt="Upload" width={24} height={24} />
                
              </Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: "rgba(34, 34, 79, 1)",
                }}
              >
                Add assessment file
              </Typography>
              <Typography
                sx={{ fontSize: 14, color: "rgba(34, 34, 79, 0.72)", width: "100%", fontWeight: 400  }}
              >
                Have an assessment ready?
                Upload it here
              </Typography>
            </Stack>
          </Box>

          <Box
            onClick={onSelectGenerate}
            sx={{
              flex: 1,
              borderRadius: "6px",
              border: "0.8px solid rgba(68, 68, 226, 0.48)",
              backgroundColor: "rgba(234, 234, 246, 1)",
              p: 3,
              cursor: "pointer",
              transition: "all 0.15s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(68, 68, 226, 0.08)",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Stack spacing={1.5} alignItems="center" textAlign="center">
              <Box
                sx={{
                    width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "rgba(68, 68, 226, 1)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
               <Image src="/images/Add_Plus.svg" alt="Upload" width={24} height={24} />
              </Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: "rgba(34, 34, 79, 1)",
                }}
              >
                Generate an assessment
              </Typography>
              <Typography
                 sx={{ fontSize: 14, color: "rgba(34, 34, 79, 0.72)", width: "100%", fontWeight: 400  }}
              >
                Need an assessment? We can build one for you.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
