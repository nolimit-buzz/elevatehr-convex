"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { useEmailTemplates } from "@/queries/emailTemplates.queries";
import { useApplicationMutations, StageType } from "@/queries/applications.queries";
import "react-quill/dist/quill.snow.css";

interface EmailStageTransitionDialogProps {
  open: boolean;
  onClose: () => void;
  stage: StageType | string | null;
  applicantIds: string[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  title?: string;
}

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EmailStageTransitionDialog({
  open,
  onClose,
  stage,
  applicantIds,
  onSuccess,
  onError,
  title,
}: EmailStageTransitionDialogProps) {
  const theme = useTheme();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { moveToStageWithEmail } = useApplicationMutations();
  const emailTemplates = useEmailTemplates();

  // Quill config
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  );

  const quillFormats = useMemo(() => ["header", "bold", "italic", "underline", "strike", "list", "bullet", "link"], []);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && stage && emailTemplates?.templates) {
      const templateContent = emailTemplates.templates[stage]?.content || "";
      setContent(templateContent);
    }
  }, [open, stage, emailTemplates]);

  const handleSend = async () => {
    if (!stage || applicantIds.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const { error: moveError } = await moveToStageWithEmail(applicantIds, stage as StageType, content);

      if (moveError) {
        throw new Error(moveError);
      }

      onSuccess?.(`Email sent and applicant moved to '${stage.replace("_", " ")}'`);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update stage";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 600, color: "rgba(17, 17, 17, 0.92)" }}>
        {title || (stage ? `Send email for ${stage.replace("_", " ")}` : "Send Email")}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: theme.palette.background.paper }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              "& .quill": {
                bgcolor: "#FFF",
                borderRadius: "8px",
                border: "0.8px solid rgba(17, 17, 17, 0.14)",
                transition: "all 0.3s ease",
                "&:focus-within": {
                  border: `0.8px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 0 0 1px ${theme.palette.primary.main}25`,
                },
                "& .ql-toolbar": {
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  border: "none",
                  borderBottom: "0.8px solid rgba(17, 17, 17, 0.14)",
                },
                "& .ql-container": {
                  border: "none",
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                },
              },
            }}
          >
            {/* @ts-ignore - ReactQuill loaded dynamically */}
            <ReactQuill
              className="quill"
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
            />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button onClick={handleSend} variant="contained" color="secondary" disabled={loading || !content}>
          {loading ? <CircularProgress size={20} color="inherit" /> : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
