"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
  TextField,
  InputAdornment,
  Container,
  Divider,
  Dialog,
  DialogContent,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import Select from "@mui/material/Select";
import { useRouter } from "next/navigation";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import * as XLSX from "xlsx";
import { pdfjs } from "react-pdf";
import mammoth from "mammoth";
import {
  useAssessmentsList,
  AssessmentQueries,
  type Id,
} from "@/queries/assessment.queries";
import AssessmentTypeDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentTypeDialog";
import AssessmentUploadDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentUploadDialog";
import AssessmentConfigDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentConfigDialog";
import TechnicalAssessmentEditor from "@/app/dashboard/components/dashboard/assessments/TechnicalAssessmentEditor";
import AssessmentFormBuilder from "@/app/dashboard/components/dashboard/assessments/AssessmentFormBuilder";
import AssessmentSuccessModal from "@/app/dashboard/components/dashboard/assessments/AssessmentSuccessModal";

export interface Assessment {
  _id: Id<"assessments">;
  level?: string;
  type: string;
  color?: string;
  text_color?: string;
  title: string;
  description?: string;
  responses?: number;
  duration?: string;
}

export default function AssessmentsPage() {
  const theme = useTheme();
  const router = useRouter();

  // ─── List & delete state ───────────────────────────────────────────────────
  const assessmentsData = useAssessmentsList();
  const assessments = assessmentsData ?? [];
  const loading = assessmentsData === undefined;

  const { RemoveAssessment, GenerateSkills, GenerateQuestions, GenerateTechnicalContent, CreateAssessment, CreateTechnicalAssessment, UpdateAssessment } = AssessmentQueries();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [headerMenuAnchorEl, setHeaderMenuAnchorEl] = useState<null | HTMLElement>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // ─── Creation flow state ───────────────────────────────────────────────────
  // "selectType" is the first step (pick type dropdown on this page)
  const [selectTypeOpen, setSelectTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("technical_assessment");

  // After type is selected, open the creation sub-modals
  const [creationOpen, setCreationOpen] = useState(false);
  const [entryStep, setEntryStep] = useState<"choose" | "upload" | "form">("choose");
  const [creationType, setCreationType] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const generateFromFileInputRef = useRef<HTMLInputElement | null>(null);
  const stopImportRef = useRef(false);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ total: number; done: number }>({ total: 0, done: 0 });
  const [sourceDocText, setSourceDocText] = useState<string>("");

  const [jobTitle, setJobTitle] = useState("");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [numberOfOpenTextQuestions, setNumberOfOpenTextQuestions] = useState("");
  const [numberOfMultiChoiceQuestions, setNumberOfMultiChoiceQuestions] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [assessmentOptions, setAssessmentOptions] = useState("2");
  const [generatedSkills, setGeneratedSkills] = useState<string[]>([]);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);

  // ─── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (jobTitle && skills.length > 0) {
      setAssessmentDescription(
        `${jobTitle} assessment covering the following skills: ${skills.join(", ")}. This assessment is designed to evaluate candidates' knowledge and expertise in these areas.`
      );
    }
  }, [jobTitle, skills]);

  useEffect(() => {
    setGeneratedSkills([]);
  }, [jobTitle]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const formatType = (type: string) =>
    type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const resetCreationState = () => {
    setJobTitle("");
    setLevel("");
    setSkills([]);
    setNumberOfOpenTextQuestions("");
    setNumberOfMultiChoiceQuestions("");
    setGenLoading(false);
    setGenError(null);
    setGenSuccess(false);
    setQuestions([]);
    setShowFormBuilder(false);
    setSaveLoading(false);
    setSaveError(null);
    setSaveSuccess(false);
    setAssessmentDescription("");
    setEditorValue("");
    setAssessmentOptions("2");
    setGeneratedSkills([]);
    setIsGeneratingSkills(false);
    setIsGeneratingContent(false);
    setShowSuccessModal(false);
    setSavedAssessmentId(null);
    setImportFile(null);
    setImportRows([]);
    setImporting(false);
    setImportProgress({ total: 0, done: 0 });
    setSourceDocText("");
    setEntryStep("choose");
    setCreationType(null);
  };

  const handleCloseCreation = () => {
    setCreationOpen(false);
    resetCreationState();
  };

  // ─── List handlers ─────────────────────────────────────────────────────────
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, assessment: Assessment) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAssessment(assessment);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedAssessment(null);
  };

  const handleDeleteFromMenu = () => {
    if (selectedAssessment) {
      setAssessmentToDelete(selectedAssessment);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;
    setDeleting(true);
    try {
      const { error } = await RemoveAssessment(assessmentToDelete._id);
      if (error) throw new Error(error);
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
      setSnackbarMessage("Assessment deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage("Failed to delete assessment. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssessmentToDelete(null);
  };

  const handleHeaderMenuOpen = (event: React.MouseEvent<HTMLElement>) => setHeaderMenuAnchorEl(event.currentTarget);
  const handleHeaderMenuClose = () => setHeaderMenuAnchorEl(null);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // ─── Creation: entry ───────────────────────────────────────────────────────
  const handleContinueFromTypeSelect = () => {
    setSelectTypeOpen(false);
    setCreationType(selectedType);
    setEntryStep("choose");
    setCreationOpen(true);
  };

  const handleSelectGenerate = () => {
    setEntryStep("form");
  };

  const handleSelectUpload = () => {
    importInputRef.current?.click();
  };

  // ─── Creation: import ──────────────────────────────────────────────────────
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImportFile(file);
      setImportRows([]);
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
      if (!json || json.length === 0) {
        setSnackbarMessage("No rows found in the uploaded file.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      const normalized = json.map((row) => {
        const next: Record<string, any> = {};
        Object.entries(row).forEach(([k, v]) => { next[String(k).trim().toLowerCase()] = v; });
        return next;
      });
      if (normalized.length > 50) {
        setSnackbarMessage("Please import 50 rows or fewer at a time.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      setImportRows(normalized);
      setSnackbarMessage(`Loaded ${normalized.length} rows from ${file.name}`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setEntryStep("upload");
    } catch (err) {
      setSnackbarMessage("Failed to read CSV/Excel file. Please check the format and try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      e.target.value = "";
    }
  };

  const extractTextFromDocument = async (file: File): Promise<string> => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt")) return await file.text();
    if (name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || "";
    }
    if (name.endsWith(".pdf")) {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += (content.items as any[]).map((item) => (item?.str ? String(item.str) : "")).join(" ") + "\n";
      }
      return fullText;
    }
    return "";
  };

  const handleImportAssessments = async () => {
    if (importRows.length === 0) return;
    setImporting(true);
    setImportProgress({ total: importRows.length, done: 0 });
    stopImportRef.current = false;
    try {
      for (let i = 0; i < importRows.length; i++) {
        if (stopImportRef.current) break;
        const row = importRows[i];
        const rowTitle = String(row.title || row.job_title || row.name || "").trim();
        if (!rowTitle) { setImportProgress({ total: importRows.length, done: i + 1 }); continue; }
        const rowType = String(row.type || "online_assessment_1").trim();
        const rowLevel = String(row.level || "").trim() || undefined;
        const rowSkillsRaw = row.skills ?? row.skill ?? "";
        const rowSkills = typeof rowSkillsRaw === "string"
          ? rowSkillsRaw.split(",").map((s: string) => s.trim()).filter(Boolean)
          : Array.isArray(rowSkillsRaw) ? rowSkillsRaw.map((s: any) => String(s).trim()).filter(Boolean) : [];
        const skillsForGeneration = rowSkills.length ? rowSkills : ["Problem solving"];
        const questionsJson = String(row.questions_json || "").trim();
        const technicalContent = String(row.technical_content || row.technicalcontent || "").trim();

        if (rowType === "technical_assessment") {
          if (technicalContent) {
            await CreateTechnicalAssessment({ title: rowTitle, level: rowLevel, skills: skillsForGeneration, technicalContent, assessmentOptions: row.assessment_options ? Number(row.assessment_options) : undefined });
          } else {
            const optionsCount = row.assessment_options ? Number(row.assessment_options) : 2;
            const { result } = await GenerateTechnicalContent({ jobTitle: rowTitle, level: rowLevel, skills: skillsForGeneration, assessmentOptions: optionsCount });
            await CreateTechnicalAssessment({ title: rowTitle, level: rowLevel, skills: skillsForGeneration, technicalContent: (result as any)?.content || "", assessmentOptions: optionsCount });
          }
        } else {
          let qs: any[] = [];
          if (questionsJson) {
            try { const parsed = JSON.parse(questionsJson); qs = Array.isArray(parsed) ? parsed : parsed?.questions || []; } catch {}
          }
          if (!qs || qs.length === 0) {
            const openCount = row.open_text_questions ? Number(row.open_text_questions) : 3;
            const multiCount = row.multi_choice_questions ? Number(row.multi_choice_questions) : 3;
            const { result } = await GenerateQuestions({ jobTitle: rowTitle, level: rowLevel, skills: skillsForGeneration, numberOfOpenTextQuestions: openCount, numberOfMultiChoiceQuestions: multiCount });
            qs = (result as any)?.response?.questions || [];
          }
          const description = String(row.description || "").trim() || `${rowTitle} assessment covering the following skills: ${skillsForGeneration.join(", ")}.`;
          await CreateAssessment({ title: rowTitle, description, type: rowType as any, level: rowLevel, skills: skillsForGeneration, questions: qs });
        }
        setImportProgress({ total: importRows.length, done: i + 1 });
      }
      if (stopImportRef.current) {
        setSnackbarMessage("Import stopped.");
        setSnackbarSeverity("error" as any);
      } else {
        setSnackbarMessage("Import completed.");
        setSnackbarSeverity("success");
        handleCloseCreation();
      }
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage("Import failed. Please check your file and try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setImporting(false);
      stopImportRef.current = false;
    }
  };

  const handleCancelImport = () => { stopImportRef.current = true; };

  // ─── Creation: generate assessment ────────────────────────────────────────
  const handleDeleteSkill = (skillToDelete: string) => setSkills((s) => s.filter((sk) => sk !== skillToDelete));

  const handleCreateAssessment = async () => {
    setGenLoading(true);
    setGenError(null);
    setGenSuccess(false);
    try {
      const { result, error } = await GenerateQuestions({
        jobTitle,
        level: level || undefined,
        skills,
        numberOfOpenTextQuestions: +numberOfOpenTextQuestions,
        numberOfMultiChoiceQuestions: +numberOfMultiChoiceQuestions,
      });
      if (error || !result) throw new Error(error || "Failed to generate assessment");
      if (result.status === "success" && result.response?.questions) {
        setQuestions(result.response.questions);
        setShowFormBuilder(true);
        setCreationOpen(false);
        setAssessmentDescription(`${jobTitle} assessment covering the following skills: ${skills.join(", ")}. This assessment includes ${numberOfOpenTextQuestions} open-text questions and ${numberOfMultiChoiceQuestions} multiple-choice questions to evaluate the candidate's knowledge and expertise.`);
      } else {
        throw new Error("Invalid response from server");
      }
      setGenSuccess(true);
    } catch (err: any) {
      setGenError(err.message || "An error occurred");
    } finally {
      setGenLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const { result, error: createError } = await CreateAssessment({
        title: jobTitle,
        description: assessmentDescription,
        type: "online_assessment_1",
        level: level || undefined,
        skills,
        questions: questions.map((q) => ({ question: q.question, type: q.type, options: q.type === "multi-choice" ? q.options : [] })),
      });
      if (createError || !result) throw new Error(createError || "Failed to save assessment");
      setSavedAssessmentId(result.assessment_id);
      setShowSuccessModal(true);
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveTechnicalAssessment = async () => {
    try {
      const { result, error: createError } = await CreateTechnicalAssessment({
        title: jobTitle,
        level: level || undefined,
        skills,
        technicalContent: editorValue,
        assessmentOptions: parseInt(assessmentOptions),
      });
      if (createError || !result) throw new Error(createError || "Failed to save assessment");
      setSavedAssessmentId(result.assessment_id);
      setShowSuccessModal(true);
    } catch (err: any) {
      setSnackbarMessage(err.message || "An error occurred while saving the assessment.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleGenerateTechnicalContent = async () => {
    if (!jobTitle || skills.length === 0) {
      setSnackbarMessage("Please enter a job title and at least one skill first.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setIsGeneratingContent(true);
    try {
      const { result, error } = await GenerateTechnicalContent({ jobTitle, level: level || undefined, skills, assessmentOptions: parseInt(assessmentOptions) || 2 });
      if (error || !result) throw new Error(error || "Failed to generate content");
      if (result.status === "success" && result.content) {
        setEditorValue(result.content);
        setAssessmentDescription(`${jobTitle} technical assessment covering the following skills: ${skills.join(", ")}. This assessment includes ${assessmentOptions} practical tasks to evaluate candidates' hands-on expertise.`);
        setSnackbarMessage("Assessment content generated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setSnackbarMessage(err.message || "An error occurred while generating content.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const generateSkills = async () => {
    setIsGeneratingSkills(true);
    try {
      const { result, error } = await GenerateSkills({ jobTitle, jobDescription: sourceDocText || assessmentDescription || "" });
      if (error) { console.error("Error generating skills:", error); return; }
      if (result) setGeneratedSkills([...result.technical, ...result.soft]);
    } catch (error) {
      console.error("Error generating skills:", error);
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  // ─── Question helpers ──────────────────────────────────────────────────────
  const handleQuestionChange = (idx: number, field: string, value: any) =>
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));

  const handleTypeChange = (idx: number, newType: string) =>
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, type: newType, options: newType === "multi-choice" ? (q.options?.length ? q.options : [""]) : [] } : q));

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) =>
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, options: q.options.map((opt: string, j: number) => j === optIdx ? value : opt) } : q));

  const handleAddOption = (qIdx: number) =>
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, options: [...q.options, ""] } : q));

  const handleRemoveOption = (qIdx: number, optIdx: number) =>
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, options: q.options.filter((_: string, j: number) => j !== optIdx) } : q));

  const handleDeleteQuestion = (idx: number) => setQuestions((prev) => prev.filter((_, i) => i !== idx));
  const handleAddQuestion = () => setQuestions((prev) => [...prev, { question: "", type: "open-text", options: [] }]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: "#F6F7FB", minHeight: "100vh" }}>
      {/* Hidden file inputs */}
      <input ref={importInputRef} type="file" hidden accept=".csv,.xlsx,.xls" onChange={handleImportFileChange} />
      <input ref={generateFromFileInputRef} type="file" hidden accept=".pdf,.docx,.txt" />

      <Container maxWidth={false} sx={{ maxWidth: "1440px", py: 4 }}>
        {/* Banner */}
        <Box
          sx={{
            backgroundColor: `primary.main`,
            backgroundImage: "url(/images/backgrounds/banner-bg.svg)",
            backgroundSize: "cover",
            backgroundPosition: "right center",
            borderRadius: "12px",
            p: { xs: 3, md: 4 },
            mb: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700, fontSize: { xs: 20, md: 24 } }}>
            Assessments
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: { xs: 2, md: 0 } }}>
            <TextField
              placeholder="Search"
              size="small"
              sx={{
                "& fieldset": { border: "none !important" },
                "& .MuiInputBase-input::placeholder": { color: "rgba(255, 255, 255)", opacity: 0.84 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(255, 255, 255, 0.84)" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#fff",
                color: "rgba(17, 17, 17, 0.92)",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "100%",
                letterSpacing: "0.16px",
                borderRadius: "8px",
                boxShadow: "none",
                px: 3,
                py: 1.5,
                textTransform: "none",
                "&:hover": { bgcolor: "#F4F4FF" },
              }}
              onClick={() => setSelectTypeOpen(true)}
            >
              + New Assessment
            </Button>
          </Stack>
        </Box>

        {/* Assessment List */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box sx={{ p: 3, borderRadius: "12px", bgcolor: "#fff", border: "1px solid #E4E7EC", minHeight: 220 }}>
                  <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: "8px", mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={16} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: "8px", mt: "auto" }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : assessments.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 10, color: "rgba(17, 17, 17, 0.48)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <AssignmentOutlinedIcon sx={{ fontSize: 64, color: "#D6D6F6", mb: 3 }} />
            <Typography sx={{ fontSize: 24, fontWeight: 500, color: "rgba(17, 17, 17, 0.48)" }}>
              Your assessments will appear here
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {assessments.map((a, idx) => (
              <Grid item xs={12} sm={6} md={3} key={a._id || idx}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "12px",
                    boxShadow: "none",
                    bgcolor: "#fff",
                    border: "1px solid #E4E7EC",
                    minHeight: 220,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    transition: "box-shadow 0.2s",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/dashboard/assessments/new?type=${a.type}&id=${a._id}`)}
                >
                  <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, a); }}
                      sx={{ color: "rgba(17, 17, 17, 0.48)", "&:hover": { backgroundColor: "rgba(17, 17, 17, 0.08)", color: "rgba(17, 17, 17, 0.68)" } }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", bgcolor: a.color, borderRadius: "8px", py: "6px", mb: 1.5, height: 32, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: a.text_color, px: "10px", whiteSpace: "nowrap" }}>
                        {formatType(a.type)}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: "rgba(17, 17, 17, 0.92)", mb: 0.5, lineHeight: 1.3 }}>
                      {a.title}
                    </Typography>
                    {a.description && (
                      <Typography sx={{ fontSize: 13, color: "rgba(17, 17, 17, 0.56)", mb: 1.5, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {a.description}
                      </Typography>
                    )}
                    <Divider sx={{ my: 1.5, borderColor: "#E4E7EC" }} />
                    <Typography sx={{ fontSize: 13, color: "rgba(17, 17, 17, 0.48)", fontWeight: 400 }}>
                      {formatType(a.type)}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ─── Step 1: Select Type Dialog (simple, stays on page) ─────────────── */}
      <Dialog
        open={selectTypeOpen}
        onClose={() => setSelectTypeOpen(false)}
        maxWidth="xs"
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(17, 17, 17, 0.32)", backdropFilter: "blur(4px)" } } }}
        PaperProps={{ sx: { borderRadius: "8px", p: 0, bgcolor: "rgba(241, 244, 249, 1)" } }}
      >
        <DialogContent sx={{ p: { xs: 3, md: 4 }, position: "relative", bgcolor: "rgba(241, 244, 249, 1)", minWidth: { xs: 320, md: 400 } }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: "rgba(17, 17, 17, 0.92)", mb: 3, textAlign: "left" }}>
            Select Assessment Type
          </Typography>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            fullWidth
            displayEmpty
            sx={{ mb: 3, bgcolor: "#F6F7FB", borderRadius: "10px", fontWeight: 500, fontSize: 16, "& .MuiSelect-select": { color: "rgba(17, 17, 17, 0.92)", fontWeight: 500, fontSize: 16, py: 2 } }}
          >
            <MenuItem value="technical_assessment" sx={{ fontWeight: 400, fontSize: 15 }}>Technical assessment</MenuItem>
            <MenuItem value="online_assessment_1" sx={{ fontWeight: 400, fontSize: 15 }}>Online assessment</MenuItem>
          </Select>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={() => setSelectTypeOpen(false)} color="inherit" sx={{ fontWeight: 500, fontSize: 16, borderRadius: "8px", px: 3, py: 1 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleContinueFromTypeSelect}
              sx={{ fontWeight: 600, fontSize: 16, borderRadius: "8px", px: 3, py: 1, bgcolor: "#4444E2", "&:hover": { bgcolor: "#5656E6" } }}
            >
              Continue
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ─── Step 2: Choose Upload vs Generate ──────────────────────────────── */}
      <AssessmentTypeDialog
        open={creationOpen && entryStep === "choose"}
        onClose={handleCloseCreation}
        onSelectUpload={handleSelectUpload}
        onSelectGenerate={handleSelectGenerate}
      />

      {/* ─── Step 3a: Upload CSV/Excel ───────────────────────────────────────── */}
      <AssessmentUploadDialog
        open={creationOpen && entryStep === "upload"}
        onClose={handleCloseCreation}
        importFile={importFile}
        importRows={importRows}
        importing={importing}
        importProgress={importProgress}
        onImport={handleImportAssessments}
        onCancelImport={handleCancelImport}
      />

      {/* ─── Step 3b: Configure & Generate ───────────────────────────────────── */}
      <AssessmentConfigDialog
        open={creationOpen && entryStep === "form"}
        onClose={handleCloseCreation}
        type={creationType}
        jobTitle={jobTitle}
        setJobTitle={setJobTitle}
        skills={skills}
        setSkills={setSkills}
        generatedSkills={generatedSkills}
        isGeneratingSkills={isGeneratingSkills}
        generateSkills={generateSkills}
        handleDeleteSkill={handleDeleteSkill}
        assessmentOptions={assessmentOptions}
        setAssessmentOptions={setAssessmentOptions}
        numberOfOpenTextQuestions={numberOfOpenTextQuestions}
        setNumberOfOpenTextQuestions={setNumberOfOpenTextQuestions}
        numberOfMultiChoiceQuestions={numberOfMultiChoiceQuestions}
        setNumberOfMultiChoiceQuestions={setNumberOfMultiChoiceQuestions}
        error={genError}
        success={genSuccess}
        loading={genLoading}
        onSubmit={creationType === "technical_assessment" ? () => setCreationOpen(false) : handleCreateAssessment}
        id={null}
        level={level}
      />

      {/* ─── Technical Assessment Editor (full-page overlay) ─────────────────── */}
      {creationType === "technical_assessment" && !creationOpen && showSuccessModal === false && editorValue !== undefined && jobTitle && (
        <TechnicalAssessmentEditor
          jobTitle={jobTitle}
          skills={skills}
          assessmentDescription={assessmentDescription}
          setAssessmentDescription={setAssessmentDescription}
          value={editorValue}
          setValue={setEditorValue}
          isGeneratingContent={isGeneratingContent}
          handleGenerateTechnicalContent={handleGenerateTechnicalContent}
          handleSaveTechnicalAssessment={handleSaveTechnicalAssessment}
        />
      )}

      {/* ─── Form Builder ─────────────────────────────────────────────────────── */}
      {showFormBuilder && (
        <AssessmentFormBuilder
          jobTitle={jobTitle}
          skills={skills}
          assessmentDescription={assessmentDescription}
          setAssessmentDescription={setAssessmentDescription}
          questions={questions}
          handleQuestionChange={handleQuestionChange}
          handleTypeChange={handleTypeChange}
          handleOptionChange={handleOptionChange}
          handleAddOption={handleAddOption}
          handleRemoveOption={handleRemoveOption}
          handleDeleteQuestion={handleDeleteQuestion}
          handleAddQuestion={handleAddQuestion}
          saveError={saveError}
          saveSuccess={saveSuccess}
          saveLoading={saveLoading}
          handleSaveAssessment={handleSaveAssessment}
          id={null}
        />
      )}

      {/* ─── Success Modal ────────────────────────────────────────────────────── */}
      <AssessmentSuccessModal
        open={showSuccessModal}
        onClose={() => { setShowSuccessModal(false); resetCreationState(); }}
        savedAssessmentId={savedAssessmentId}
        router={router}
      />

      {/* ─── Card Context Menu ────────────────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", minWidth: 160, mt: 1 } }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={handleDeleteFromMenu}
          sx={{ color: "#DC3545", fontSize: "14px", fontWeight: 500, py: 1.5, px: 2, "&:hover": { backgroundColor: "rgba(220, 53, 69, 0.08)" } }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* ─── Delete Confirmation Dialog ───────────────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(17, 17, 17, 0.32)", backdropFilter: "blur(4px)" } } }}
        PaperProps={{ sx: { borderRadius: "8px", p: 0, bgcolor: "rgba(241, 244, 249, 1)" } }}
      >
        <DialogContent sx={{ p: { xs: 3, md: 4 }, position: "relative", bgcolor: "rgba(241, 244, 249, 1)", minWidth: { xs: 320, md: 400 } }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: "rgba(17, 17, 17, 0.92)", mb: 2, textAlign: "left" }}>
            Delete Assessment
          </Typography>
          <Typography sx={{ fontSize: 16, color: "rgba(17, 17, 17, 0.68)", mb: 3, textAlign: "left" }}>
            Are you sure you want to delete &quot;{assessmentToDelete?.title}&quot;? This action cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={handleDeleteCancel} sx={{ bgcolor: "primary.main", fontWeight: 500, fontSize: 16, borderRadius: "8px", px: 3, py: 1, "&:hover": { bgcolor: "primary.main", opacity: 0.95 } }}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              sx={{ fontWeight: 600, fontSize: 16, borderRadius: "8px", px: 3, py: 1, borderColor: "#DC3545", color: "#DC3545", "&:hover": { borderColor: "#C82333", color: "#C82333", backgroundColor: "rgba(220, 53, 69, 0.04)" }, "&:disabled": { borderColor: "#DC3545", color: "#DC3545", opacity: 0.6 } }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ─── Snackbar ─────────────────────────────────────────────────────────── */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%", borderRadius: "8px" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
