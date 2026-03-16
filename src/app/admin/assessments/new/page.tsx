"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import {
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
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

function NewAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get("type");

  const {
    GenerateSkills,
    GenerateQuestions,
    GenerateTechnicalContent,
    UpdateAssessment,
  } = AssessmentQueries();

  // ─── Creation flow state ───────────────────────────────────────────────────
  const [creationOpen, setCreationOpen] = useState(true);
  const [entryStep, setEntryStep] = useState<"choose" | "upload" | "form">("choose");
  const [creationType, setCreationType] = useState<string | null>(typeParam);

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
  };

  const handleCloseCreation = () => {
    router.push("/admin/assessments");
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
    <Box sx={{ width: "100%", pb: 4, bgcolor: "#F6F7FB", minHeight: "100vh" }}>
      {/* ─── Step 1: Choose Upload vs Generate ──────────────────────────────── */}
      <AssessmentTypeDialog
        open={creationOpen && entryStep === "choose"}
        onClose={handleCloseCreation}
        onSelectUpload={handleSelectUpload}
        onSelectGenerate={handleSelectGenerate}
      />

      {/* ─── Step 2a: Upload CSV/Excel ───────────────────────────────────────── */}
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

      {/* ─── Step 2b: Configure & Generate ───────────────────────────────────── */}
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
            backUrl="/admin/assessments"
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
          backUrl="/admin/assessments"
        />
      )}

      {/* ─── Success Modal ────────────────────────────────────────────────────── */}
      <AssessmentSuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          resetCreationState();
          router.push("/admin/assessments");
        }}
        savedAssessmentId={savedAssessmentId}
        router={router}
        isSimulation={true}
        backUrl="/admin/assessments"
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

export default function NewAdminAssessmentPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 4 }}><CircularProgress /></Box>}>
      <NewAssessmentContent />
    </Suspense>
  );
}
