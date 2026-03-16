"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Link,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Stack,
  TextField,
  InputAdornment,
  Backdrop,
} from "@mui/material";
import { PlusIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../styles";
import { useAdminAssessmentsList } from "@/queries/adminAssessments.queries";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { pdfjs } from "react-pdf";
import mammoth from "mammoth";
import { AssessmentQueries, type Id } from "@/queries/assessment.queries";
import AssessmentTypeDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentTypeDialog";
import AssessmentUploadDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentUploadDialog";
import AssessmentConfigDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentConfigDialog";
import TechnicalAssessmentEditor from "@/app/dashboard/components/dashboard/assessments/TechnicalAssessmentEditor";
import AssessmentFormBuilder from "@/app/dashboard/components/dashboard/assessments/AssessmentFormBuilder";
import AssessmentSuccessModal from "@/app/dashboard/components/dashboard/assessments/AssessmentSuccessModal";

export default function MasterAssessmentLibraryPage() {
  const router = useRouter();
  const assessments = useAdminAssessmentsList();
  const isLoading = assessments === undefined;

  const {
    RemoveAssessment,
    GenerateSkills,
    GenerateQuestions,
    GenerateTechnicalContent,
    CreateAssessment,
    CreateTechnicalAssessment,
    UpdateAssessment,
  } = AssessmentQueries();

  // ─── Creation flow state ───────────────────────────────────────────────────
  const [selectTypeOpen, setSelectTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("technical_assessment");
  const [creationOpen, setCreationOpen] = useState(false);
  const [entryStep, setEntryStep] = useState<"choose" | "upload" | "form">("choose");
  const [creationType, setCreationType] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const stopImportRef = useRef(false);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // ─── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (jobTitle && skills.length > 0) {
      setAssessmentDescription(
        `${jobTitle} assessment covering the following skills: ${skills.join(", ")}. This assessment is designed to evaluate candidates' knowledge and expertise in these areas.`,
      );
    }
  }, [jobTitle, skills]);

  useEffect(() => {
    setGeneratedSkills([]);
  }, [jobTitle]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
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
    setUploadSuccess(false);
    setEntryStep("choose");
    setCreationType(null);
  };

  const handleCloseCreation = () => {
    setCreationOpen(false);
    resetCreationState();
  };

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
    setEntryStep("upload");
  };

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    const name = file.name.toLowerCase();
    try {
      if (
        name.endsWith(".csv") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".xls") ||
        name.endsWith(".pdf") ||
        name.endsWith(".docx") ||
        name.endsWith(".txt")
      ) {
        setImportFile(file);
        setSnackbarMessage(`File "${file.name}" selected successfully.`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        return;
      }
      setSnackbarMessage("Unsupported file type. Please upload CSV, Excel, PDF, or Word.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Failed to process file.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleImportAssessments = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      setSnackbarMessage("Assessment uploaded successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setUploadSuccess(true);
    } catch (err) {
      setSnackbarMessage("Failed to upload assessment.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setImporting(false);
    }
  };

  const handleCancelImport = () => {
    stopImportRef.current = true;
  };

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
        setAssessmentDescription(
          `${jobTitle} assessment covering the following skills: ${skills.join(", ")}. This assessment includes ${numberOfOpenTextQuestions} open-text questions and ${numberOfMultiChoiceQuestions} multiple-choice questions to evaluate the candidate's knowledge and expertise.`,
        );
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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Skip actual API call for Master Templates as per user request
      setSavedAssessmentId("dummy-admin-assessment-id");
      setShowSuccessModal(true);
      setSaveSuccess(true);
      setSnackbarMessage("Master template simulation successful!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveTechnicalAssessment = async () => {
    try {
      // Skip actual API call for Master Templates as per user request
      setSavedAssessmentId("dummy-admin-technical-id");
      setShowSuccessModal(true);
      setSnackbarMessage("Master technical template simulation successful!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
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
      const { result, error } = await GenerateTechnicalContent({
        jobTitle,
        level: level || undefined,
        skills,
        assessmentOptions: parseInt(assessmentOptions) || 2,
      });
      if (error || !result) throw new Error(error || "Failed to generate content");
      if (result.status === "success" && result.content) {
        setEditorValue(result.content);
        setAssessmentDescription(
          `${jobTitle} technical assessment covering the following skills: ${skills.join(", ")}. This assessment includes ${assessmentOptions} practical tasks to evaluate candidates' hands-on expertise.`,
        );
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
      const { result, error } = await GenerateSkills({
        jobTitle,
        jobDescription: sourceDocText || assessmentDescription || "",
      });
      if (error) {
        console.error("Error generating skills:", error);
        return;
      }
      if (result) setGeneratedSkills([...result.technical, ...result.soft]);
    } catch (error) {
      console.error("Error generating skills:", error);
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const extractTextFromDocument = async (file: File): Promise<string> => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt")) return await file.text();
    if (name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || "";
    }
    if (name.endsWith(".pdf")) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
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

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = "";
  };

  const handleQuestionChange = (idx: number, field: string, value: any) =>
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));

  const handleTypeChange = (idx: number, newType: string) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? { ...q, type: newType, options: newType === "multi-choice" ? (q.options?.length ? q.options : [""]) : [] }
          : q,
      ),
    );

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((opt: string, j: number) => (j === optIdx ? value : opt)) } : q,
      ),
    );

  const handleAddOption = (qIdx: number) =>
    setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ""] } : q)));

  const handleRemoveOption = (qIdx: number, optIdx: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.filter((_: string, j: number) => j !== optIdx) } : q,
      ),
    );

  const handleDeleteQuestion = (idx: number) => setQuestions((prev) => prev.filter((_, i) => i !== idx));
  const handleAddQuestion = () => setQuestions((prev) => [...prev, { question: "", type: "open-text", options: [] }]);

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Hidden file inputs */}
      <input
        ref={importInputRef}
        type="file"
        hidden
        accept=".csv,.xlsx,.xls,.pdf,.docx,.txt"
        onChange={handleImportFileChange}
      />
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
            Master Assessment Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and distribute test templates to your recruiters.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon style={{ width: 24, height: 24 }} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
          }}
          onClick={() => setSelectTypeOpen(true)}
        >
          + New Master Template
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {assessments?.map((t: any) => (
            <Paper
              key={t._id}
              elevation={0}
              sx={{
                ...ADMIN_CARD_SX,
                width: 320,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Chip
                  label={t.type === "technical_assessment" ? "TECHNICAL" : "QUIZ"}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    borderRadius: 2,
                  }}
                  variant="outlined"
                />
                <Chip
                  label="GLOBAL"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    border: "none",
                  }}
                />
              </Box>
              <Box sx={{ px: 2, pb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {t.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Level: {t.level || "N/A"}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link href="#" underline="hover" sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                  Edit Content
                </Link>
                <IconButton size="small" sx={{ color: "text.secondary" }} title="Settings">
                  <Cog6ToothIcon style={{ width: 24, height: 24 }} />
                </IconButton>
              </Box>
            </Paper>
          ))}
          <Paper
            elevation={0}
            component={Button}
            onClick={() => setSelectTypeOpen(true)}
            sx={{
              width: 320,
              height: 200,
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              textTransform: "none",
              color: "text.secondary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <PlusIcon style={{ width: 24, height: 24 }} />
            <Typography fontWeight={600} sx={{ letterSpacing: "0.04em" }}>
              ADD TEMPLATE
            </Typography>
          </Paper>
        </Box>
      )}


      {/* ─── Step 1: Select Type Dialog (simple, stays on page) ─────────────── */}
      <Dialog
        open={selectTypeOpen}
        onClose={() => setSelectTypeOpen(false)}
        maxWidth="xs"
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(17, 17, 17, 0.32)", backdropFilter: "blur(4px)" } } }}
        PaperProps={{ sx: { borderRadius: "8px", p: 0, bgcolor: "rgba(241, 244, 249, 1)" } }}
      >
        <DialogContent
          sx={{
            p: { xs: 3, md: 4 },
            position: "relative",
            bgcolor: "rgba(241, 244, 249, 1)",
            minWidth: { xs: 320, md: 400 },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: "rgba(17, 17, 17, 0.92)", mb: 3, textAlign: "left" }}>
            Select Assessment Type
          </Typography>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            fullWidth
            displayEmpty
            sx={{
              mb: 3,
              bgcolor: "#F6F7FB",
              borderRadius: "10px",
              fontWeight: 500,
              fontSize: 16,
              "& .MuiSelect-select": { color: "rgba(17, 17, 17, 0.92)", fontWeight: 500, fontSize: 16, py: 2 },
            }}
          >
            <MenuItem value="technical_assessment" sx={{ fontWeight: 400, fontSize: 15 }}>
              Technical assessment
            </MenuItem>
            <MenuItem value="online_assessment_1" sx={{ fontWeight: 400, fontSize: 15 }}>
              Online assessment
            </MenuItem>
          </Select>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setSelectTypeOpen(false)}
              color="inherit"
              sx={{ fontWeight: 500, fontSize: 16, borderRadius: "8px", px: 3, py: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleContinueFromTypeSelect}
              sx={{
                fontWeight: 600,
                fontSize: 16,
                borderRadius: "8px",
                px: 3,
                py: 1,
                bgcolor: "#4444E2",
                "&:hover": { bgcolor: "#5656E6" },
              }}
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
        setImportFile={setImportFile}
        importRows={importRows}
        importing={importing}
        importProgress={importProgress}
        onImport={handleImportAssessments}
        onCancelImport={handleCancelImport}
        jobTitle={jobTitle}
        setJobTitle={setJobTitle}
        skills={skills}
        setSkills={setSkills}
        generatedSkills={generatedSkills}
        isGeneratingSkills={isGeneratingSkills}
        generateSkills={generateSkills}
        handleDeleteSkill={handleDeleteSkill}
        handleFileChange={processFile}
        success={uploadSuccess}
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
      {creationType === "technical_assessment" &&
        !creationOpen &&
        showSuccessModal === false &&
        editorValue !== undefined &&
        jobTitle && (
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
        onClose={() => {
          setShowSuccessModal(false);
          resetCreationState();
        }}
        savedAssessmentId={savedAssessmentId}
        router={router}
        isSimulation={true}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isProcessingFile}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
