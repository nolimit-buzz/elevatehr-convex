"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Grid,
  styled,
  Chip,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Skeleton,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Divider from "@mui/material/Divider";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../../global.css";
import { BorderStyle } from "@mui/icons-material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTheme } from "@mui/material/styles";
import CreatableSelect from "react-select/creatable";
import { ActionMeta, MultiValue, GroupBase } from "react-select";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { AlertColor } from "@mui/material/Alert";
import { useJob, JobQueries } from "@/queries/jobs.queries";
import { useAssessmentsList } from "@/queries/assessment.queries";
import { Id } from "../../../../../convex/_generated/dataModel";

const Banner = styled(Box)(({ theme }) => ({
  width: "100%",
  background: "#4444E2",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "28px",
}));

const Pill = styled(Chip)(({ theme }) => ({
  padding: "10px 12px",
  backgroundColor: "rgba(255, 255, 255, 0.12)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "20px",
  color: "#fff",
}));

const PageContainer = styled(Box)(({ theme }) => ({
  padding: "0",
  backgroundColor: "#F1F4F9",
  minHeight: "100vh",
}));

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "8px",
  width: "100%",
  maxWidth: "1063px",
  margin: "auto",
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  padding: "28px 24px",
  [theme.breakpoints.down("md")]: {
    padding: "12px",
  },
  "& .MuiStepConnector-line": {
    border: "0.5px dashed rgba(17, 17, 17, 0.68)",
  },
  "& .Mui-completed svg": {
    color: "rgba(29, 175, 97, 1)",
  },
  "& .MuiStep-root": {
    paddingX: { xs: "4px", md: "8px" },
    display: { xs: "none", md: "flex" },
    "&.Mui-active": {
      display: "flex",
    },
  },
}));

const StyledStepLabel = styled(StepLabel)(({ theme }) => ({
  "& .MuiStepLabel-label": {
    color: "rgba(17, 17, 17, 0.68)",
    fontSize: { xs: "14px", md: "16px" },
    fontWeight: "400",
    lineHeight: "100%",
    letterSpacing: { xs: "0", md: "0.16px" },
  },
  "& .Mui-active": {
    fontWeight: "400",
    color: "rgba(17, 17, 17, 1)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  backgroundColor: theme.palette.primary.main,
  padding: "16px 44px",
  color: theme.palette.secondary.light,
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "100%",
  letterSpacing: "0.16px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#6666E6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
  },
}));

const StyledOutlineButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  color: "#032B44",
  padding: "16px 44px",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "100%",
  letterSpacing: "0.16px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "rgba(68, 68, 226, 0.08)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(68, 68, 226, 0.1)",
  },
}));

const StyledAutocomplete = styled(Autocomplete<string, true, false, true>)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    border: "0.8px solid rgba(17, 17, 17, 0.14)",
    "& fieldset": {
      border: "none",
    },
  },
  "& .MuiChip-root": {
    backgroundColor: "#4444E2",
    color: "#fff",
    borderRadius: "16px",
    margin: "2px",
    "& .MuiChip-deleteIcon": {
      color: "#fff",
      "&:hover": {
        color: "#fff",
      },
    },
  },
  "& .MuiAutocomplete-listbox": {
    maxHeight: "200px",
  },
});

const StyledSelect = styled(CreatableSelect<SkillOption, true, GroupBase<SkillOption>>)({
  ".select__control": {
    borderRadius: "8px",
    border: "0.8px solid rgba(17, 17, 17, 0.14)",
    minHeight: "56px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "rgba(17, 17, 17, 0.24)",
    },
    "&--is-focused": {
      borderColor: "#4444E2",
      boxShadow: "none",
    },
  },
  ".select__multi-value": {
    backgroundColor: "#4444E2",
    borderRadius: "16px",
    margin: "2px",
    padding: "2px 8px",
    color: "#fff",
    ".select__multi-value__label": {
      color: "#fff",
    },
    ".select__multi-value__remove": {
      color: "#fff",
      "&:hover": {
        backgroundColor: "transparent",
        color: "#fff",
      },
    },
  },
  ".select__menu": {
    zIndex: 2,
    ".select__group-heading": {
      color: "rgba(17, 17, 17, 0.7)",
      fontSize: "14px",
      fontWeight: 500,
      padding: "8px 12px",
    },
    ".select__option": {
      "&--is-selected": {
        backgroundColor: "rgba(68, 68, 226, 0.08)",
        color: "#111",
      },
      "&--is-focused": {
        backgroundColor: "rgba(68, 68, 226, 0.04)",
      },
    },
  },
  ".select__placeholder": {
    color: "rgba(17, 17, 17, 0.5)",
  },
});

const FileUploadButton = styled(Button)({
  backgroundColor: "#F8F9FB",
  color: "rgba(17, 17, 17, 0.84)",
  padding: "16px",
  borderRadius: "8px",
  justifyContent: "flex-start",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#F0F1F3",
  },
});

interface SkillOption {
  value: string;
  label: string;
}

interface TextEditorProps {
  label: string;
  description: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onRegenerate?: () => void;
}

interface FieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  sx?: any;
  error?: string;
  placeholder?: string;
}

interface FormBuilderFieldProps {
  field: {
    key: string;
    label: string;
    type: string;
    value?: string;
    options?: string[];
    required?: boolean;
  };
  index: number;
  handleChange: (index: number, key: string, value: string, optionIndex?: number | null) => void;
  handleDelete: (index: number, optionIndex?: number | null) => void;
  handleTypeChange: (index: number, type: string) => void;
  isRequired: boolean;
}

interface Assessment {
  id: Id<"assessments"> | string;
  _id?: Id<"assessments">;
  title: string;
  type: string;
  description?: string;
  level?: string;
  skills?: string[] | string;
  questions?: any[];
  completed_count?: string;
  job_ids?: string;
}

interface AssessmentStepProps {
  assessments: Assessment[];
  selectedAssessment: Assessment | null;
  handleAssessmentChange: (assessment: Assessment | null) => void;
}

interface FormData {
  title: string;
  location: string;
  work_model: string;
  job_type: string;
  description: string;
  responsibilities: string;
  expectations: string[];
  salary_min: string;
  salary_max: string;
  salary_error: string;
  level?: string;
  skills: string[];
  about_role: string;
  assessment_id?: Id<"assessments"> | string;
  [key: string]: any;
}

interface CustomField {
  key: string;
  type: string;
  label: string;
  value?: string;
  options?: string[];
  required?: boolean;
  description?: string;
}

interface FormField {
  key: string;
  type: string;
  label: string;
  value?: string;
  options?: string[];
  required?: boolean;
  description?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ label, description, value, onChange, onRegenerate }) => {
  const theme = useTheme();
  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems={{ xs: "flex-start", sm: "flex-start" }}
        width={"100%"}
        padding="28px 24px"
      >
        <Stack spacing={1} minWidth={{ xs: "100%", sm: "280px" }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.grey[100],
                fontSize: { xs: "18px", sm: "20px" },
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "100%",
                letterSpacing: "0.1px",
              }}
            >
              {label}
            </Typography>
            <IconButton size="small" onClick={onRegenerate} sx={{ mt: { xs: 1, sm: 0 } }}>
              <RefreshIcon />
            </IconButton>
          </Stack>
          <Typography
            sx={{
              color: theme.palette.grey[100],
              fontSize: { xs: "14px", sm: "16px" },
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "100%",
              letterSpacing: "0.16px",
            }}
            variant="body2"
            color="textSecondary"
          >
            {description}
          </Typography>
        </Stack>
        <ReactQuill
          value={value || ""}
          onChange={onChange}
          style={{
            flex: 2,
            borderRadius: "8px",
            border: "0.8px solid rgba(17, 17, 17, 0.14)",
            marginLeft: 0,
          }}
        />
      </Stack>
      <Divider />
    </>
  );
};

const Field: React.FC<FieldProps> = ({
  label,
  description,
  value,
  onChange,
  multiline = false,
  sx = {},
  error = "",
  placeholder = "",
}) => {
  const theme = useTheme();
  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems={{ xs: "flex-start", sm: "flex-start" }}
        padding="28px 24px"
      >
        <Stack spacing={1} minWidth={{ xs: "100%", sm: "280px" }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.grey[100],
              fontSize: { xs: "18px", sm: "20px" },
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "100%",
              letterSpacing: "0.1px",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              color: theme.palette.grey[100],
              fontSize: { xs: "14px", sm: "16px" },
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "100%",
              letterSpacing: "0.16px",
            }}
            variant="body2"
            color="textSecondary"
          >
            {description}
          </Typography>
        </Stack>
        <TextField
          fullWidth
          value={value}
          onChange={onChange}
          variant="outlined"
          multiline={multiline}
          rows={multiline ? 4 : 1}
          style={{ marginLeft: 0, fontWeight: 700 }}
          sx={sx}
          error={!!error}
          placeholder={placeholder}
        />
      </Stack>
    </>
  );
};

const FormBuilderField: React.FC<FormBuilderFieldProps> = ({
  field,
  index,
  handleChange,
  handleDelete,
  handleTypeChange,
  isRequired,
}) => {
  const theme = useTheme();

  return (
    <Stack
      alignItems="flex-start"
      width={"100%"}
      sx={{ padding: "20px 22px", border: "1px solid rgba(17, 17, 17, 0.14)", borderRadius: "8px" }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width={"100%"}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent={"space-between"}
          width={"100%"}
        >
          <TextField
            placeholder="Type Question"
            value={field.label}
            onChange={(e) => handleChange(index, "label", e.target.value)}
            variant="outlined"
            // disabled={isRequired || isDefaultField}
            sx={{
              width: "100%",
              "& .MuiInputBase-root": {
                "& input": {
                  pointerEvents: isRequired ? "none" : "auto",
                  paddingX: 0,
                  fontSize: "16px !important",
                  color: "black",
                  fontWeight: 500,
                  lineHeight: "100%",
                  letterSpacing: "0.16px",
                  border: "none",
                  "&::placeholder": {
                    color: theme.palette.grey[100],
                  },
                },
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />
          {!isRequired && (
            <Stack
              direction={"row"}
              gap={2}
              alignItems={"center"}
              justifyContent={{ xs: "space-between", sm: "flex-start" }}
              width={{ xs: "100%", sm: "max-content" }}
              mb={{ xs: 2, sm: 0 }}
            >
              <FormControl variant="outlined" style={{ minWidth: 150 }}>
                <Select
                  value={field.type}
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                  disabled={isRequired}
                  sx={{
                    "& .MuiSelect-select": {
                      padding: "5px 8px",
                      paddingRight: "10px",
                      borderRadius: "5px",
                      backgroundColor: "#F4F4F6",
                      color: "rgba(17, 17, 17, 0.84)",
                      fontSize: "14px",
                      fontWeight: 500,
                      letterSpacing: "0.14px",
                      "& div": {
                        paddingRight: 0,
                      },
                      "& fieldset": {
                        border: "none",
                      },
                    },
                  }}
                >
                  <MenuItem value="text">Open Question</MenuItem>
                  <MenuItem value="select">Multi Choice</MenuItem>
                  <MenuItem value="file">Attachment</MenuItem>
                </Select>
              </FormControl>
              <IconButton sx={{ padding: 0 }} onClick={() => handleDelete(index)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Stack>

      {(field.type === "text" || field.type === "number") && (
        <TextField
          fullWidth
          value={field.value || ""}
          onChange={(e) => handleChange(index, "value", e.target.value)}
          variant="outlined"
          InputProps={{
            readOnly: isRequired,
            autoFocus: true,
          }}
          placeholder="Response field"
          sx={{
            flex: 1,
            "& .MuiInputBase-root": {
              width: "100%",
              backgroundColor: "#F4F4F6",
              borderRadius: "6px",
              border: "0.5px solid rgba(17, 17, 17, 0.08)",
              "& input": {
                width: "100%",
                borderRadius: "5px",
                backgroundColor: "#F4F4F6",
                color: theme.palette.grey[100],
                "&::placeholder": {
                  color: theme.palette.grey[100],
                },
              },
              "& fieldset": {
                width: "100%",
                border: "none",
              },
            },
          }}
        />
      )}

      {field.type === "select" && (
        <Stack width={"100%"} gap={1}>
          {(Array.isArray(field.options)
            ? field.options
            : field.options
              ? Object.values(field.options as any)
              : []
          ).map((option, optionIndex) => (
            <Stack key={optionIndex} direction={"row"} gap={1} alignItems={"center"}>
              <TextField
                fullWidth
                value={option || ""}
                onChange={(e) => {
                  handleChange(index, "options", e.target.value, optionIndex);
                }}
                variant="outlined"
                placeholder="Option"
                disabled={isRequired}
                sx={{
                  flex: 1,
                  "& .MuiInputBase-root": {
                    width: "100%",
                    backgroundColor: "#F4F4F6",
                    borderRadius: "6px",
                    border: "0.5px solid rgba(17, 17, 17, 0.08)",
                    "& input": {
                      width: "100%",
                      borderRadius: "5px",
                      backgroundColor: "#F4F4F6",
                      color: theme.palette.grey[100],
                      "&::placeholder": {
                        color: theme.palette.grey[100],
                      },
                    },
                    "& fieldset": {
                      width: "100%",
                      border: "none",
                    },
                  },
                }}
              />
              {!isRequired && (
                <IconButton onClick={() => handleDelete(index, optionIndex)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Stack>
          ))}
          {!isRequired && (
            <StyledOutlineButton
              variant="outlined"
              color="primary"
              onClick={() =>
                handleChange(
                  index,
                  "options",
                  "",
                  (Array.isArray(field.options)
                    ? field.options
                    : field.options
                      ? Object.values(field.options as any)
                      : []
                  ).length
                )
              }
              style={{ alignSelf: "flex-start" }}
            >
              Add Option
            </StyledOutlineButton>
          )}
        </Stack>
      )}

      {field.type === "file" && (
        <Box sx={{ width: "100%" }}>
          <Button
            variant="outlined"
            fullWidth
            component="span"
            startIcon={<AttachFileIcon />}
            // disabled={isDefaultField || isRequired}
            sx={{
              fontSize: "16px",
              // fontWeight: 500,
              borderColor: "rgba(17, 17, 17, 0.14)",
              pointerEvents: isRequired ? "none" : "auto",
              lineHeight: "100%",
              letterSpacing: "0.14px",
              backgroundColor: "#F8F9FB",
              color: "rgba(17, 17, 1,0.4)",
              padding: "16px",
              borderRadius: "8px",
              justifyContent: "flex-start",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#F0F1F3",
              },
            }}
          >
            Upload file
          </Button>
        </Box>
      )}
    </Stack>
  );
};

const AssessmentStep: React.FC<AssessmentStepProps> = ({ assessments, selectedAssessment, handleAssessmentChange }) => {
  const theme = useTheme();

  return (
    <Stack spacing={3} width="100%" padding="28px">
      {/* Info Banner */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "rgba(68, 68, 226, 0.04)",
          borderRadius: "8px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Typography
          sx={{
            color: theme.palette.grey[100],
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
          }}
        >
          Only accepted applicants who have been moved to the assessment stage can access this
        </Typography>
      </Box>

      {/* Assessment Selection */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="flex-start" width={"100%"}>
        <Stack spacing={1} minWidth={"280px"}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "rgba(17, 17, 17, 0.92)",
              fontSize: "20px",
              fontWeight: 600,
              lineHeight: "100%",
              letterSpacing: "0.1px",
            }}
          >
            Add Assessment
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(17, 17, 17, 0.68)",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "100%",
              letterSpacing: "0.16px",
            }}
          >
            Assessment for this role
          </Typography>
        </Stack>
        <FormControl fullWidth>
          <Select
            value={selectedAssessment ? selectedAssessment.id : ""}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                handleAssessmentChange(null);
                return;
              }
              const selected = assessments.find((a) => a.id === value);
              if (selected) {
                handleAssessmentChange(selected);
              }
            }}
            displayEmpty
            renderValue={(value) => {
              if (!value) return "Select from your list of assessments";
              const assessment = assessments.find((a) => a.id === value);
              if (!assessment) return "Select from your list of assessments";

              return (
                <Stack spacing={0.5} width="100%">
                  <Typography sx={{ fontWeight: 500 }}>
                    {assessment.level} {assessment.title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" sx={{ color: "rgba(17, 17, 17, 0.68)" }}>
                      {assessment.type
                        ? assessment.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                        : ""}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {assessment.skills
                      ? (Array.isArray(assessment.skills) ? assessment.skills : assessment.skills.split(","))
                          .slice(0, 2)
                          .map((skill, index) => (
                            <Chip
                              key={index}
                              label={typeof skill === "string" ? skill.trim() : skill}
                              size="small"
                              sx={{
                                height: "20px",
                                fontSize: "0.75rem",
                                backgroundColor: "rgba(68, 68, 226, 0.08)",
                                color: "#4444E2",
                                "& .MuiChip-label": {
                                  px: 1,
                                },
                              }}
                            />
                          ))
                      : null}
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(17, 17, 17, 0.68)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {assessment.description}
                  </Typography>
                </Stack>
              );
            }}
            sx={{
              borderRadius: "8px",
              border: "0.8px solid rgba(17, 17, 17, 0.14)",
              "& .MuiSelect-select": {
                padding: "16px",
                "&:focus": {
                  backgroundColor: "transparent",
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxWidth: 500,
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              <Typography sx={{ color: "rgba(17, 17, 17, 0.5)" }}>Select from your list of assessments</Typography>
            </MenuItem>
            {assessments.map((assessment) => (
              <MenuItem
                key={assessment.id}
                value={assessment.id}
                sx={{
                  py: 1.5,
                  px: 2,
                  "&:hover": {
                    backgroundColor: "rgba(68, 68, 226, 0.04)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(68, 68, 226, 0.08)",
                    "&:hover": {
                      backgroundColor: "rgba(68, 68, 226, 0.12)",
                    },
                  },
                }}
              >
                <Stack spacing={0.5} width="100%">
                  <Typography sx={{ fontWeight: 500 }}>
                    {assessment.level} {assessment.title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" sx={{ color: "rgba(17, 17, 17, 0.68)" }}>
                      {assessment.type
                        ? assessment.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                        : ""}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {assessment.skills
                      ? (Array.isArray(assessment.skills) ? assessment.skills : assessment.skills.split(","))
                          .slice(0, 2)
                          .map((skill, index) => (
                            <Chip
                              key={index}
                              label={typeof skill === "string" ? skill.trim() : skill}
                              size="small"
                              sx={{
                                height: "20px",
                                fontSize: "0.75rem",
                                backgroundColor: "rgba(68, 68, 226, 0.08)",
                                color: "#4444E2",
                                "& .MuiChip-label": {
                                  px: 1,
                                },
                              }}
                            />
                          ))
                      : null}
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(17, 17, 17, 0.68)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {assessment.description}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
};

const AboutTheJob = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params["job_id"] as string;
  const theme = useTheme();
  const steps = ["About the Job", "Application Form", "Assessment"];

  // Convex hooks
  const convexJobId = jobId ? (jobId as Id<"jobs">) : null;
  const convexJob = useJob(convexJobId);
  const { UpdateJob } = JobQueries();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    location: "",
    work_model: "",
    job_type: "",
    description: "",
    responsibilities: "",
    expectations: [],
    salary_min: "",
    salary_max: "",
    salary_error: "",
    skills: [],
    about_role: "",
    assessment_id: undefined,
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const customFieldsRef = useRef<CustomField[]>([]);
  useEffect(() => {
    customFieldsRef.current = customFields;
  }, [customFields]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [jobUrl, setJobUrl] = useState("");
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Initialize step from URL parameter
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 1 && stepNumber <= steps.length) {
        setCurrentStep(stepNumber);
      }
    }
  }, [searchParams, steps.length]);

  // Update URL when step changes
  const updateStepInURL = (step: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", step.toString());
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Function to handle step changes
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    updateStepInURL(step);
  };

  // Populate form data from Convex job
  useEffect(() => {
    if (!jobId) {
      setError("No job ID provided" as any);
      setLoading(false);
      return;
    }

    // Handle loading state from Convex query
    if (convexJob === undefined) {
      setLoading(true);
      return;
    }

    // Handle job data
    if (convexJob) {
      const jobData = convexJob;

      // Parse skills and requirements from Convex data
      const skills = jobData.skills || [];
      const requirements = jobData.requirements || [];

      setTechnicalSkills(skills);
      setSoftSkills([]);
      setCustomSkills([]);

      // Load existing custom fields from application_form
      const existingCustomFields = (jobData as any).application_form?.custom_fields || [];
      setCustomFields(
        existingCustomFields.map((field: any, index: number) => ({
          key: field.key || `custom_${index + 1}`,
          type: field.type || "text",
          label: field.label || "",
          value: field.value || "",
          options: Array.isArray(field.options) ? field.options : field.options ? Object.values(field.options) : [],
          required: field.required || false,
          description: field.description || "",
        }))
      );

      // Load existing required fields from application_form
      const existingRequiredFields = (jobData as any).application_form?.required_fields || [];
      setFormFields(
        existingRequiredFields.map((field: any) => ({
          key: field.key || "",
          type: field.type || "text",
          label: field.label || "",
          value: field.value || "",
          options: Array.isArray(field.options) ? field.options : field.options ? Object.values(field.options) : [],
          required: field.required || false,
          description: field.description || "",
        }))
      );

      setFormData({
        title: jobData.title || "",
        location: jobData.location || "",
        work_model: jobData.work_model || "",
        job_type: jobData.job_type || "",
        description: jobData.description || "",
        responsibilities: Array.isArray(jobData.responsibilities)
          ? jobData.responsibilities.join("\n")
          : jobData.responsibilities || "",
        expectations: requirements,
        salary_min: jobData.salary_min?.toString() || "",
        salary_max: jobData.salary_max?.toString() || "",
        salary_error: "",
        level: jobData.experience_level || "",
        skills: skills,
        about_role: jobData.description || "",
        assessment_id: (jobData as any).assessment_id || undefined,
      });

      setLoading(false);
    } else {
      setError("Job not found" as any);
      setLoading(false);
    }
  }, [jobId, convexJob]);

  // Use Convex hook to fetch assessments
  const convexAssessments = useAssessmentsList();

  // Update assessments state when Convex data changes
  useEffect(() => {
    if (convexAssessments && Array.isArray(convexAssessments)) {
      const mappedAssessments: Assessment[] = convexAssessments.map((assessment) => ({
        id: assessment._id,
        _id: assessment._id,
        title: assessment.title,
        type: assessment.type,
        description: assessment.description || "",
        level: assessment.level || "",
        skills: assessment.skills || [],
        questions: assessment.questions || [],
      }));
      setAssessments(mappedAssessments);
    }
  }, [convexAssessments]);

  // Set selected assessment when either assessments or job data is loaded
  useEffect(() => {
    // Check if we have assessments, an assessment ID, and no currently selected assessment
    if (
      assessments.length > 0 &&
      formData.assessment_id &&
      formData.assessment_id !== "" &&
      formData.assessment_id !== null &&
      formData.assessment_id !== undefined &&
      !selectedAssessment
    ) {
      const assessmentId = formData.assessment_id;
      const assessment = assessments.find((a) => a.id === assessmentId);
      if (assessment) {
        setSelectedAssessment(assessment);
      }
    }
  }, [assessments, formData.assessment_id, selectedAssessment]);

  // Ensure assessment is selected when user navigates to assessment step
  useEffect(() => {
    if (currentStep === 3 && assessments.length > 0 && formData.assessment_id && !selectedAssessment) {
      const assessmentId = formData.assessment_id;
      const assessment = assessments.find((a) => a.id === assessmentId);
      if (assessment) {
        setSelectedAssessment(assessment);
      }
    }
  }, [currentStep, assessments, formData.assessment_id, selectedAssessment]);

  // Initial check for assessment when component mounts
  useEffect(() => {
    if (assessments.length > 0 && formData.assessment_id && !selectedAssessment) {
      const assessmentId = formData.assessment_id;
      const assessment = assessments.find((a) => a.id === assessmentId);
      if (assessment) {
        setSelectedAssessment(assessment);
      }
    }
  }, []); // Empty dependency array - runs only once

  const handleChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  type RegenerateField = "aboutTheRole" | "jobResponsibilities" | "expectations";

  const handleRegenerate = (field: RegenerateField) => async () => {
    // AI regeneration is handled on the backend during job creation
    // For editing, we don't support regeneration - user can manually edit
    setNotification({
      open: true,
      message: "AI regeneration is only available during job creation. Please edit manually.",
      severity: "info",
    });
  };

  const addExpectation = () => {
    setFormData((prevData) => ({
      ...prevData,
      expectations: [...prevData.expectations, "New Expectation"],
    }));
  };

  const addField = () => {
    setCustomFields([
      ...customFields,
      {
        key: `custom_${customFields.length + 1}`,
        type: "text",
        label: "",
        value: "",
        options: [],
        required: false,
        description: "",
      },
    ]);
  };

  const handleFieldChange = (index: number, key: string, value: string, optionIndex?: number | null) => {
    if (optionIndex !== null && optionIndex !== undefined) {
      const updatedFields = [...customFields];
      if (!updatedFields[index].options) {
        updatedFields[index].options = [];
      }
      updatedFields[index].options![optionIndex] = value;
      setCustomFields(updatedFields);
    } else {
      const updatedFields = [...customFields];
      updatedFields[index] = {
        ...updatedFields[index],
        [key]: value,
      };
      setCustomFields(updatedFields);
    }
  };

  const handleTypeChange = (index: number, type: string) => {
    const updatedFields = [...customFields];
    updatedFields[index] = {
      ...updatedFields[index],
      type,
      options: type === "select" ? ["", ""] : [],
      value: "",
    };
    setCustomFields(updatedFields);
  };

  const handleDeleteField = (index: number, optionIndex: number | null = null) => {
    setCustomFields((prevFields) => {
      // Delete an option if a valid option index was provided
      if (optionIndex !== null && optionIndex !== undefined) {
        const next = prevFields.map((field, idx) => {
          if (idx !== index) return field;
          const nextOptions = (field.options || []).filter((_, optIdx) => optIdx !== optionIndex);

          return {
            ...field,
            options: nextOptions,
          };
        });

        // Keep formData.application_form.custom_fields in sync for option deletion
        setFormData((prev) => ({
          ...prev,
          application_form: {
            ...(prev as any).application_form,
            custom_fields: ((prev as any).application_form?.custom_fields || []).map((f: any, idx: number) => {
              if (idx !== index) return f;
              const opts = Array.isArray(f?.options) ? f.options : f?.options ? Object.values(f.options) : [];
              const updated = opts.filter((_: any, optIdx: number) => optIdx !== optionIndex);
              return { ...f, options: updated };
            }),
          },
        }));

        try {
          // Best-effort log of next states after option deletion
          // Note: formData update is async; this logs the intended next arrays
          const nextFormDataCustom = (
            typeof window !== "undefined" && (window as any).structuredClone
              ? (window as any).structuredClone
              : (o: any) => JSON.parse(JSON.stringify(o))
          )(prevFields as any).map((f: any, idx: number) =>
            idx !== index
              ? f
              : { ...f, options: (f.options || []).filter((_: any, optIdx: number) => optIdx !== optionIndex) }
          );
          console.log("[handleDeleteField] Option deleted:", {
            index,
            optionIndex,
            nextCustomFields: next,
            nextFormDataCustomFields: nextFormDataCustom,
          });
        } catch (e) {
          console.error("Error deleting field:", e);
          // Ignore errors in logging
        }

        return next;
      }

      // Otherwise, delete the entire field
      const filtered = prevFields.filter((_, idx) => idx !== index);

      // Sync removal to formData.application_form.custom_fields
      setFormData((prev) => ({
        ...prev,
        application_form: {
          ...(prev as any).application_form,
          custom_fields: ((prev as any).application_form?.custom_fields || []).filter(
            (_: any, idx: number) => idx !== index
          ),
        },
      }));

      try {
        console.log("[handleDeleteField] Field deleted:", { index, nextCustomFields: filtered });
      } catch (e) {
        console.error("Error logging field deletion:", e);
        // Ignore errors in logging
      }

      return filtered;
    });
  };

  const handleAssessmentChange = (assessment: Assessment | null) => {
    setSelectedAssessment(assessment);
    // Also update the formData to keep it in sync
    setFormData((prev) => ({
      ...prev,
      assessment_id: assessment ? assessment.id : undefined,
    }));
  };

  const validateSalaryRange = (value: string) => {
    const salaryRegex = /^\d+(?:-\d+)?$/;
    return salaryRegex.test(value);
  };

  const handleSalaryChange = (value: string) => {
    // Remove any non-numeric characters except dash
    const cleanValue = value.replace(/[^\d-]/g, "");

    // Only allow one dash
    if (cleanValue.split("-").length > 2) {
      return;
    }

    // Split the value into min and max
    const [min, max] = cleanValue.split("-");

    // Update the form data with both min and max values
    setFormData((prev) => ({
      ...prev,
      salary_min: min || "",
      salary_max: max || "",
      salary_error: "",
    }));
  };

  const formatSalaryDisplay = (value: string) => {
    if (!value) return "";

    const parts = value.split("-");
    if (parts.length === 1) {
      // Single number
      const num = parseInt(parts[0]);
      return isNaN(num) ? value : num.toLocaleString();
    } else {
      // Range
      const min = parseInt(parts[0]);
      const max = parseInt(parts[1]);
      if (isNaN(min) || isNaN(max)) {
        return value;
      }
      return `${min.toLocaleString()}-${max.toLocaleString()}`;
    }
  };

  const handleSalaryMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setFormData((prev) => ({
      ...prev,
      salary_min: value,
      salary_error: "",
    }));
  };

  const handleSalaryMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setFormData((prev) => ({
      ...prev,
      salary_max: value,
      salary_error: "",
    }));
  };

  const handleSkillsChange = (newValue: string[]) => {
    // setTechnicalSkills(newValue);
    setFormData((prev) => ({
      ...prev,
      skills: newValue,
    }));
  };

  const handleDone = async () => {
    if (!jobId || !convexJobId) {
      alert("Error: Job ID is missing!");
      return;
    }

    try {
      // Transform custom fields to match schema format
      const transformedCustomFields = customFields
        .filter((field) => field.label.trim()) // Only include fields with labels
        .map((field) => {
          const baseField: {
            key: string;
            type: string;
            label: string;
            required: boolean;
            options?: Record<string, string>;
            allowed_types?: string[];
          } = {
            key: field.key,
            type: field.type,
            label: field.label,
            required: field.required || false,
          };
          // Add options as Record<string, string> for select type
          if (field.type === "select" && field.options && field.options.length > 0) {
            baseField.options = field.options.reduce((acc: Record<string, string>, opt: string, idx: number) => {
              if (opt.trim()) {
                acc[`option_${idx}`] = opt;
              }
              return acc;
            }, {});
          }
          return baseField;
        });

      // Transform required fields to match schema format (preserve existing required_fields)
      const transformedRequiredFields = formFields.map((field) => {
        const baseField: {
          key: string;
          type: string;
          label: string;
          required: boolean;
          options?: Record<string, string>;
          allowed_types?: string[];
        } = {
          key: field.key,
          type: field.type,
          label: field.label,
          required: field.required || true,
        };
        // Add options as Record<string, string> for select type
        if (field.type === "select" && field.options && field.options.length > 0) {
          baseField.options = (field.options as string[]).reduce(
            (acc: Record<string, string>, opt: string, idx: number) => {
              if (opt.trim()) {
                acc[`option_${idx}`] = opt;
              }
              return acc;
            },
            {}
          );
        }
        // Add allowed_types for file type
        if (field.type === "file") {
          baseField.allowed_types = ["pdf", "doc", "docx"];
        }
        return baseField;
      });

      // Prepare update data for Convex
      const updateData = {
        jobId: convexJobId,
        data: {
          title: formData.title,
          description: formData.about_role || formData.description,
          responsibilities: formData.responsibilities
            ? formData.responsibilities.split("\n").filter((r: string) => r.trim())
            : [],
          requirements: formData.expectations.filter((e: string) => e.trim()),
          salary_min: parseInt(formData.salary_min.replace(/,/g, "")) || undefined,
          salary_max: parseInt(formData.salary_max.replace(/,/g, "")) || undefined,
          skills: formData.skills,
          experience_level: formData.level,
          assessment_id: selectedAssessment?.id as Id<"assessments"> | undefined,
          application_form: {
            required_fields: transformedRequiredFields,
            custom_fields: transformedCustomFields,
          },
        },
      };

      const { result, error } = await UpdateJob(updateData);

      if (error) {
        console.error("Error updating job post:", error);
        alert(`Failed to update job post: ${error}`);
        return;
      }

      // Construct the job URL
      const host = process.env.NEXT_PUBLIC_HOST || (typeof window !== "undefined" ? window.location.origin : "");
      const newJobUrl = `${host}/job-openings/${jobId}`;
      setJobUrl(newJobUrl);
      setShowDialog(true);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Error updating job post:", apiError.message || "Unknown error");
      alert(`Failed to update job post: ${apiError.message || "Unknown error"}`);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
    window.location.href = `/dashboard/job-posting/${jobId}/submissions?view=1`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jobUrl).then(() => {
      setNotification({
        open: true,
        message: "URL copied to clipboard!",
        severity: "success",
      });
      setShowDialog(false);
    });
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    const host = process.env.NEXT_PUBLIC_HOST || (typeof window !== "undefined" ? window.location.origin : "");
    window.location.href = `${host}/dashboard`;
  };

  const renderStepContent = () => {
    if (loading) {
      return (
        <Stack spacing={2} padding="20px">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height={150} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height={150} />
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </Stack>
        </Stack>
      );
    }

    if (error) {
      return (
        <Typography align="center" color="error" padding="20px">
          {error}
        </Typography>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <>
            <Field
              label="Job Title"
              description="A descriptive job title."
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  "& input": {
                    fontSize: "24px !important",
                    color: "rgba(17, 17, 17, 0.92)",
                    fontWeight: 600,
                    lineHeight: "100%",
                    letterSpacing: "0.12px",
                  },
                  "& fieldset": {
                    borderRadius: "8px",
                    border: "0.8px solid rgba(17, 17, 17, 0.14) !important",
                  },
                },
              }}
            />
            <Divider />

            <TextEditor
              label="About the Role"
              description="More information on the role."
              value={formData.about_role}
              onChange={(value) => handleChange("about_role", value)}
              onRegenerate={handleRegenerate("aboutTheRole")}
            />
            <TextEditor
              label="Job Responsibilities"
              description="What you will do in this role."
              value={formData.responsibilities}
              onChange={(value) => handleChange("responsibilities", value)}
              onRegenerate={handleRegenerate("jobResponsibilities")}
            />
            <Stack spacing={1} marginBottom="10px" direction={{ xs: "column", md: "row" }} padding="28px 24px">
              <Stack spacing={1} minWidth={{ xs: "100%", sm: "280px" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "rgba(17, 17, 17, 0.92)",
                    fontSize: { xs: "18px", sm: "20px" },
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "100%",
                    letterSpacing: "0.1px",
                  }}
                >
                  Expectation
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(17, 17, 17, 0.68)",
                    fontSize: { xs: "14px", sm: "16px" },
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "100%",
                    letterSpacing: "0.16px",
                  }}
                  variant="body2"
                  color="textSecondary"
                >
                  What you&rsquo;re bringing to this role.
                </Typography>
                <IconButton size="small" onClick={handleRegenerate("expectations")}>
                  <RefreshIcon />
                </IconButton>
              </Stack>
              <Stack gap={"12px"} width={"100%"}>
                {formData.expectations.map((expectation, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    value={expectation}
                    onChange={(e) => {
                      const newExpectations = [...formData.expectations];
                      newExpectations[index] = e.target.value;
                      setFormData((prevData) => ({
                        ...prevData,
                        expectations: newExpectations,
                      }));
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        "& fieldset": {
                          borderRadius: "8px",
                          border: "0.8px solid rgba(17, 17, 17, 0.14) !important",
                        },
                      },
                    }}
                  />
                ))}
                <Button startIcon={<AddIcon />} onClick={addExpectation} style={{ marginTop: "10px" }}>
                  Add Expectation
                </Button>
              </Stack>
            </Stack>
            <Divider />
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ xs: "flex-start", sm: "flex-start" }}
              padding="28px 24px"
            >
              <Stack spacing={1} minWidth={{ xs: "100%", sm: "280px" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "rgba(17, 17, 17, 0.92)",
                    fontSize: { xs: "18px", sm: "20px" },
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "100%",
                    letterSpacing: "0.1px",
                  }}
                >
                  Salary Range
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(17, 17, 17, 0.68)",
                    fontSize: { xs: "14px", sm: "16px" },
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "100%",
                    letterSpacing: "0.16px",
                  }}
                  variant="body2"
                  color="textSecondary"
                >
                  Specify the salary range for this position
                </Typography>
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ width: "100%", flex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      color: "rgba(17, 17, 17, 0.92)",
                      fontSize: "14px",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Minimum Salary
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="50,000"
                    value={formatSalaryDisplay(formData.salary_min)}
                    onChange={handleSalaryMinChange}
                    error={!!formData.salary_error}
                    helperText={formData.salary_error}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment sx={{ color: "red" }} position="start">
                          ₦
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        border: "0.8px solid rgba(17, 17, 17, 0.14)",
                        "& fieldset": {
                          border: "none",
                        },
                        "&:hover fieldset": {
                          border: "none",
                        },
                        "&.Mui-focused fieldset": {
                          border: "1px solid #4444E2",
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "16px 12px",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 1,
                    color: "rgba(17, 17, 17, 0.48)",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  to
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      color: "rgba(17, 17, 17, 0.92)",
                      fontSize: "14px",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Maximum Salary
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="100,000"
                    value={formatSalaryDisplay(formData.salary_max)}
                    onChange={handleSalaryMaxChange}
                    error={!!formData.salary_error}
                    helperText={formData.salary_error}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        border: "0.8px solid rgba(17, 17, 17, 0.14)",
                        "& fieldset": {
                          border: "none",
                        },
                        "&:hover fieldset": {
                          border: "none",
                        },
                        "&.Mui-focused fieldset": {
                          border: "1px solid #4444E2",
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "16px 12px",
                        fontSize: "16px",
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Stack>
            <Divider />
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ xs: "flex-start", sm: "flex-start" }}
              padding="28px 24px"
            >
              <Stack spacing={1} minWidth={{ xs: "100%", sm: "280px" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "rgba(17, 17, 17, 0.92)",
                    fontSize: { xs: "18px", sm: "20px" },
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "100%",
                    letterSpacing: "0.1px",
                  }}
                >
                  Skills Required
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(17, 17, 17, 0.68)",
                    fontSize: { xs: "14px", sm: "16px" },
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "100%",
                    letterSpacing: "0.16px",
                  }}
                  variant="body2"
                  color="textSecondary"
                >
                  Select or add required skills for this role
                </Typography>
              </Stack>
              <Box sx={{ width: "100%" }}>
                <StyledSelect
                  isMulti
                  value={formData.skills.map((skill) => ({ value: skill, label: skill }))}
                  onChange={(newValue: MultiValue<SkillOption>) => {
                    const selectedSkills = newValue ? newValue.map((option: SkillOption) => option.value) : [];
                    handleSkillsChange(selectedSkills);
                  }}
                  options={[
                    {
                      label: "Skills",
                      options: technicalSkills.map((skill) => ({
                        value: skill,
                        label: skill,
                      })),
                    },
                  ]}
                  placeholder="Select or type to add new skills"
                  noOptionsMessage={({ inputValue }: { inputValue: string }) =>
                    inputValue ? "Press enter to add this skill" : "No skills available"
                  }
                  formatCreateLabel={(inputValue: string) => `Add "${inputValue}" as a new skill`}
                  onCreateOption={(inputValue: string) => {
                    const newSkill = inputValue.trim();
                    if (newSkill) {
                      const updatedSkills = [...formData.skills, newSkill];
                      handleSkillsChange(updatedSkills);
                      // setTechnicalSkills(prev => [...prev, newSkill]);
                    }
                  }}
                  classNamePrefix="select"
                  maxMenuHeight={300}
                />
              </Box>
            </Stack>
            <Divider />
          </>
        );
      case 2:
        return (
          <Stack padding="28px" gap={"12px"}>
            {/* Display required fields */}
            {formFields.map((field: FormField, index) => (
              <FormBuilderField
                key={`required-${index}`}
                field={field.type === "email" || field.type === "url" ? { ...field, type: "text" } : field}
                index={index}
                handleChange={handleFieldChange}
                handleDelete={handleDeleteField}
                handleTypeChange={handleTypeChange}
                isRequired={true}
              />
            ))}

            {customFields.map((field, index) => (
              <FormBuilderField
                key={`${field.key || "custom"}-${index}`}
                field={field.type === "email" || field.type === "url" ? { ...field, type: "text" } : field}
                index={index}
                handleChange={handleFieldChange}
                handleDelete={handleDeleteField}
                handleTypeChange={handleTypeChange}
                isRequired={false}
              />
            ))}

            <StyledOutlineButton
              variant="outlined"
              color="primary"
              onClick={() => addField()}
              style={{ alignSelf: "flex-start", marginTop: "20px", marginRight: "10px" }}
            >
              Add Question
            </StyledOutlineButton>
          </Stack>
        );
      case 3:
        return (
          <AssessmentStep
            assessments={assessments}
            selectedAssessment={selectedAssessment}
            handleAssessmentChange={handleAssessmentChange}
          />
        );
      default:
        return <Typography>Unknown Step</Typography>;
    }
  };

  return (
    <PageContainer>
      <Banner
        sx={{
          width: "100%",
          backgroundColor: theme.palette.primary.main,
          backgroundImage: "url(/images/backgrounds/banner-bg.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        height={"204px"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {/* Back Button */}
        <Box
          sx={{
            position: "absolute",
            top: "20px",
            left: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            color: "white",
            "&:hover": {
              opacity: 0.8,
            },
          }}
          onClick={() => router.back()}
        >
          <Box
            component="span"
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
              transform: "rotate(180deg)",
            }}
          >
            →
          </Box>
          <Typography
            sx={{
              color: "white",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Back
          </Typography>
        </Box>

        {loading ? (
          <Stack spacing={2} alignItems="center">
            <Skeleton variant="text" width="120%" height={40} />
            {/* <Skeleton variant="text" width="40%" /> */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Skeleton variant="rounded" width={100} height={30} />
              <Skeleton variant="rounded" width={100} height={30} />
              <Skeleton variant="rounded" width={100} height={30} />
            </Stack>
          </Stack>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{
                color: "rgba(255, 255, 255, 0.92)",
                textAlign: "center",
                fontSize: "40px",
                fontWeight: "600",
                lineHeight: "100%",
                textTransform: "capitalize",
              }}
            >
              {formData.level} {formData.title}
            </Typography>
            <Stack mt={2} direction={"row"} alignItems={"center"} justifyContent={"center"} gap={"8px"}>
              <Pill label={formData.location} />
              <Pill label={formData.work_model} />
              <Pill label={formData.job_type} />
            </Stack>
          </>
        )}
      </Banner>
      <FormContainer>
        <StyledStepper activeStep={currentStep - 1}>
          {steps.map((label, index) => (
            <Step
              key={label}
              sx={{
                "& .MuiStep-root": { paddingX: { xs: "4px !important", md: "8px" } },
                cursor: "pointer",
                "&:hover": {
                  "& .MuiStepLabel-root": {
                    color: "primary.main",
                  },
                },
              }}
              onClick={() => handleStepChange(index + 1)}
            >
              <StyledStepLabel
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
                onClick={() => handleStepChange(index + 1)}
              >
                {label}
              </StyledStepLabel>
            </Step>
          ))}
        </StyledStepper>
        <Divider />

        {renderStepContent()}
        <Stack
          direction="row"
          gap={3}
          alignItems="flex-start"
          marginBottom="20px"
          width={"100%"}
          justifyContent={"flex-end"}
          padding={"28px"}
        >
          {currentStep === 3 ? (
            <Stack direction={"row"} gap={3}>
              <StyledOutlineButton
                variant="outlined"
                color="primary"
                onClick={() => handleStepChange(Math.max(currentStep - 1, 1))}
                style={{ alignSelf: "flex-end", marginTop: "20px", marginRight: "10px" }}
              >
                Back
              </StyledOutlineButton>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={handleDone}
                style={{ alignSelf: "flex-end", marginTop: "20px" }}
              >
                Done
              </StyledButton>
            </Stack>
          ) : (
            <>
              {currentStep > 1 && (
                <StyledOutlineButton
                  variant="outlined"
                  // color="primary"
                  onClick={() => handleStepChange(Math.max(currentStep - 1, 1))}
                  style={{ alignSelf: "flex-end", marginTop: "20px", marginRight: "10px" }}
                >
                  Back
                </StyledOutlineButton>
              )}
              <StyledButton
                variant="contained"
                onClick={() => handleStepChange(Math.min(currentStep + 1, 3))}
                sx={{
                  alignSelf: "flex-end",
                  marginTop: "20px",
                  backgroundColor: theme.palette.primary.main,
                  color: "secondary.light",
                  "&:hover": { backgroundColor: theme.palette.primary.main, color: "secondary.light" },
                }}
              >
                Next
              </StyledButton>
            </>
          )}
        </Stack>
        <Dialog
          open={showDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "12px",
              maxWidth: "520px",
            },
          }}
        >
          <Box sx={{ position: "relative" }}>
            <IconButton
              onClick={handleCloseDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "rgba(17, 17, 17, 0.6)",
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogTitle
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                color: "rgba(17, 17, 17, 0.92)",
                fontSize: "20px",
                fontWeight: 600,
                py: 3,
                px: 4,
              }}
            >
              <TaskAltIcon sx={{ fontSize: 40, color: "primary.main" }} />
              Job Post Updated Successfully!
            </DialogTitle>
          </Box>
          <DialogContent sx={{ pt: 1, pb: 3, px: 4 }}>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(17, 17, 17, 0.68)",
                mb: 2,
              }}
            >
              Your job post has been successfully updated. You can share the job link below:
            </Typography>
            <TextField
              fullWidth
              margin="dense"
              value={jobUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={copyToClipboard} edge="end">
                    <ContentCopyIcon />
                  </IconButton>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderWidth: "1px",
                  },
                },
              }}
            />
          </DialogContent>
        </Dialog>
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{
            zIndex: 9999,
            "&.MuiSnackbar-root": {
              [theme.breakpoints.down("sm")]: {
                bottom: "80px",
              },
            },
          }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{
              minWidth: "300px",
              backgroundColor: "primary.main",
              color: "secondary.light",
              borderRadius: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& .MuiAlert-icon": {
                color: "#fff",
                marginRight: "8px",
                padding: 0,
              },
              "& .MuiAlert-message": {
                padding: "6px 0",
                fontSize: "15px",
                textAlign: "center",
                flex: "unset",
              },
              "& .MuiAlert-action": {
                padding: "0 8px 0 0",
                marginRight: 0,
                "& .MuiButtonBase-root": {
                  color: "#fff",
                  padding: 1,
                },
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </FormContainer>
    </PageContainer>
  );
};

export default AboutTheJob;
