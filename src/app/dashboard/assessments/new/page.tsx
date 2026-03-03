"use client";
import React, { useEffect, useState, useRef } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AssessmentQueries,
  usePublicAssessment,
  type Id,
} from "@/queries/assessment.queries";
import * as XLSX from "xlsx";
import { pdfjs } from "react-pdf";
import mammoth from "mammoth";
import AssessmentTypeDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentTypeDialog";
import AssessmentUploadDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentUploadDialog";
import AssessmentConfigDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentConfigDialog";
import TechnicalAssessmentEditor from "@/app/dashboard/components/dashboard/assessments/TechnicalAssessmentEditor";
import AssessmentFormBuilder from "@/app/dashboard/components/dashboard/assessments/AssessmentFormBuilder";
import AssessmentSuccessModal from "@/app/dashboard/components/dashboard/assessments/AssessmentSuccessModal";

export default function CreateAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams?.get("type");
  const id = searchParams?.get("id");
  const [open, setOpen] = React.useState(!id);
  const [entryStep, setEntryStep] = React.useState<
    "choose" | "upload" | "form"
  >(id ? "form" : "choose");
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const generateFromFileInputRef = useRef<HTMLInputElement | null>(null);
  const stopImportRef = useRef(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    total: number;
    done: number;
  }>({
    total: 0,
    done: 0,
  });
  const [sourceDocFile, setSourceDocFile] = useState<File | null>(null);
  const [sourceDocText, setSourceDocText] = useState<string>("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [numberOfOpenTextQuestions, setNumberOfOpenTextQuestions] =
    React.useState("");
  const [numberOfMultiChoiceQuestions, setNumberOfMultiChoiceQuestions] =
    React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [showFormBuilder, setShowFormBuilder] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [assessmentDescription, setAssessmentDescription] = React.useState("");
  const [value, setValue] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [assessmentOptions, setAssessmentOptions] = useState("2");
  const [generatedSkills, setGeneratedSkills] = useState<string[]>([]);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(
    null,
  );

  // Convex assessment queries
  const {
    GenerateSkills,
    GenerateQuestions,
    GenerateTechnicalContent,
    CreateAssessment,
    CreateTechnicalAssessment,
    UpdateAssessment,
  } = AssessmentQueries();

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills((skills) => skills.filter((skill) => skill !== skillToDelete));
  };

  const handleSelectGenerate = () => {
    setEntryStep("form");
    setOpen(true);
  };

  const handleSelectUpload = () => {
    openImportPicker();
  };

  const openImportPicker = () => importInputRef.current?.click();
  const openGenerateFromFilePicker = () =>
    generateFromFileInputRef.current?.click();

  const handleImportFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      router.push("/dashboard/assessments");
      return;
    }

    try {
      setImportFile(file);
      setImportRows([]);

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: "",
      });

      if (!json || json.length === 0) {
        setSnackbarMessage("No rows found in the uploaded file.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const normalized = json.map((row) => {
        const next: Record<string, any> = {};
        Object.entries(row).forEach(([k, v]) => {
          next[String(k).trim().toLowerCase()] = v;
        });
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
      setOpen(true);
    } catch (err) {
      console.error("Failed to parse import file:", err);
      setSnackbarMessage(
        "Failed to read CSV/Excel file. Please check the format and try again.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      e.target.value = "";
    }
  };

  const guessJobTitleFromText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return "";
    return lines[0].slice(0, 80);
  };

  const extractTextFromDocument = async (file: File) => {
    const name = file.name.toLowerCase();

    if (name.endsWith(".txt")) {
      return await file.text();
    }

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
        const pageText = (content.items as any[])
          .map((item) => (item?.str ? String(item.str) : ""))
          .join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    }

    return "";
  };

  const handleGenerateFromFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSourceDocFile(file);
      setSourceDocText("");
      setIsGeneratingContent(true);

      const text = await extractTextFromDocument(file);
      if (!text || text.trim().length < 30) {
        setSnackbarMessage(
          "Could not extract enough text from this file. Try a PDF, DOCX, or TXT.",
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      setSourceDocText(text);

      const guessed = guessJobTitleFromText(text);
      if (guessed && !jobTitle) setJobTitle(guessed);

      setEntryStep("form");
      setOpen(true);

      setSnackbarMessage(`Loaded document: ${file.name}`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to process document:", err);
      setSnackbarMessage(
        "Failed to process document. Please try another file.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingContent(false);
      e.target.value = "";
    }
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

        const rowTitle = String(
          row.title || row.job_title || row.name || "",
        ).trim();
        if (!rowTitle) {
          setImportProgress({ total: importRows.length, done: i + 1 });
          continue;
        }

        const rowType = String(row.type || "online_assessment_1").trim();
        const rowLevel = String(row.level || "").trim() || undefined;
        const rowSkillsRaw = row.skills ?? row.skill ?? "";
        const rowSkills =
          typeof rowSkillsRaw === "string"
            ? rowSkillsRaw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : Array.isArray(rowSkillsRaw)
              ? rowSkillsRaw.map((s: any) => String(s).trim()).filter(Boolean)
              : [];

        const skillsForGeneration = rowSkills.length
          ? rowSkills
          : ["Problem solving"];

        const questionsJson = String(row.questions_json || "").trim();
        const technicalContent = String(
          row.technical_content || row.technicalcontent || "",
        ).trim();

        if (rowType === "technical_assessment") {
          if (technicalContent) {
            await CreateTechnicalAssessment({
              title: rowTitle,
              level: rowLevel,
              skills: skillsForGeneration,
              technicalContent,
              assessmentOptions: row.assessment_options
                ? Number(row.assessment_options)
                : undefined,
            });
          } else {
            const optionsCount = row.assessment_options
              ? Number(row.assessment_options)
              : 2;
            const { result } = await GenerateTechnicalContent({
              jobTitle: rowTitle,
              level: rowLevel,
              skills: skillsForGeneration,
              assessmentOptions: optionsCount,
            });
            await CreateTechnicalAssessment({
              title: rowTitle,
              level: rowLevel,
              skills: skillsForGeneration,
              technicalContent: (result as any)?.content || "",
              assessmentOptions: optionsCount,
            });
          }
        } else {
          let questions: any[] = [];
          if (questionsJson) {
            try {
              const parsed = JSON.parse(questionsJson);
              questions = Array.isArray(parsed)
                ? parsed
                : parsed?.questions || [];
            } catch {
              questions = [];
            }
          }
          if (!questions || questions.length === 0) {
            const openCount = row.open_text_questions
              ? Number(row.open_text_questions)
              : 3;
            const multiCount = row.multi_choice_questions
              ? Number(row.multi_choice_questions)
              : 3;
            const { result } = await GenerateQuestions({
              jobTitle: rowTitle,
              level: rowLevel,
              skills: skillsForGeneration,
              numberOfOpenTextQuestions: openCount,
              numberOfMultiChoiceQuestions: multiCount,
            });
            questions = (result as any)?.response?.questions || [];
          }

          const description =
            String(row.description || "").trim() ||
            `${rowTitle} assessment covering the following skills: ${skillsForGeneration.join(", ")}.`;

          await CreateAssessment({
            title: rowTitle,
            description,
            type: rowType as any,
            level: rowLevel,
            skills: skillsForGeneration,
            questions,
          });
        }

        setImportProgress({ total: importRows.length, done: i + 1 });
      }

      if (stopImportRef.current) {
        setSnackbarMessage("Import stopped.");
        setSnackbarSeverity("info" as any);
      } else {
        setSnackbarMessage("Import completed.");
        setSnackbarSeverity("success");
        router.push("/dashboard/assessments");
      }
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Import failed:", err);
      setSnackbarMessage(
        "Import failed. Please check your file and try again.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setImporting(false);
      stopImportRef.current = false;
    }
  };

  const handleCancelImport = () => {
    stopImportRef.current = true;
  };

  const handleCreateAssessment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Generate questions using Convex AI action
      const { result, error: genError } = await GenerateQuestions({
        jobTitle,
        level: level || undefined,
        skills,
        numberOfOpenTextQuestions: +numberOfOpenTextQuestions,
        numberOfMultiChoiceQuestions: +numberOfMultiChoiceQuestions,
      });

      if (genError || !result) {
        throw new Error(genError || "Failed to generate assessment");
      }

      if (result.status === "success" && result.response?.questions) {
        setQuestions(result.response.questions);
        setShowFormBuilder(true);
        setOpen(false); // Close modal
        // Set default description for online assessment
        const defaultDescription = `${jobTitle} assessment covering the following skills: ${skills.join(", ")}. This assessment includes ${numberOfOpenTextQuestions} open-text questions and ${numberOfMultiChoiceQuestions} multiple-choice questions to evaluate the candidate's knowledge and expertise.`;
        setAssessmentDescription(defaultDescription);
      } else {
        throw new Error("Invalid response from server");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      if (id) {
        // Update existing assessment
        const { result, error: updateError } = await UpdateAssessment({
          assessmentId: id as any,
          data: {
            title: jobTitle,
            description: assessmentDescription,
            level: level || undefined,
            skills,
            questions: questions.map((q) => ({
              question: q.question,
              type: q.type,
              options: q.type === "multi-choice" ? q.options : [],
            })),
          },
        });

        if (updateError || !result) {
          throw new Error(updateError || "Failed to update assessment");
        }
        setSavedAssessmentId(id);
      } else {
        // Create new assessment
        const { result, error: createError } = await CreateAssessment({
          title: jobTitle,
          description: assessmentDescription,
          type: "online_assessment_1",
          level: level || undefined,
          skills,
          questions: questions.map((q) => ({
            question: q.question,
            type: q.type,
            options: q.type === "multi-choice" ? q.options : [],
          })),
        });

        if (createError || !result) {
          throw new Error(createError || "Failed to save assessment");
        }
        setSavedAssessmentId(result.assessment_id);
      }

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
      if (id) {
        // Update existing assessment
        const { result, error: updateError } = await UpdateAssessment({
          assessmentId: id as any,
          data: {
            title: jobTitle,
            level: level || undefined,
            skills,
            technical_content: value,
            assessment_options: parseInt(assessmentOptions),
          },
        });

        if (updateError || !result) {
          throw new Error(updateError || "Failed to update assessment");
        }
        setSavedAssessmentId(id);
      } else {
        // Create new technical assessment
        const { result, error: createError } = await CreateTechnicalAssessment({
          title: jobTitle,
          level: level || undefined,
          skills,
          technicalContent: value,
          assessmentOptions: parseInt(assessmentOptions),
        });

        if (createError || !result) {
          throw new Error(createError || "Failed to save assessment");
        }
        setSavedAssessmentId(result.assessment_id);
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setSnackbarMessage(
        err.message || "An error occurred while saving the assessment.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleGenerateTechnicalContent = async () => {
    if (!jobTitle || skills.length === 0) {
      setSnackbarMessage(
        "Please enter a job title and at least one skill first.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingContent(true);
    try {
      const { result, error: genError } = await GenerateTechnicalContent({
        jobTitle,
        level: level || undefined,
        skills,
        assessmentOptions: parseInt(assessmentOptions) || 2,
      });

      if (genError || !result) {
        throw new Error(genError || "Failed to generate content");
      }

      if (result.status === "success" && result.content) {
        setValue(result.content);
        // Also generate a description
        const defaultDescription = `${jobTitle} technical assessment covering the following skills: ${skills.join(", ")}. This assessment includes ${assessmentOptions} practical tasks to evaluate candidates' hands-on expertise.`;
        setAssessmentDescription(defaultDescription);
        setSnackbarMessage("Assessment content generated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setSnackbarMessage(
        err.message || "An error occurred while generating content.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Fetch existing assessment if editing
  const existingAssessment = usePublicAssessment(
    id ? (id as Id<"assessments">) : null,
  );

  useEffect(() => {
    if (!existingAssessment) return;

    const assessment = existingAssessment;
    if (assessment.type === "technical_assessment") {
      setJobTitle(assessment.title || "");
      setLevel(assessment.level || "");
      setSkills(assessment.skills || []);
      setAssessmentDescription(assessment.description || "");
      setValue(assessment.technical_content || "");
      setAssessmentOptions(
        assessment.assessment_options
          ? String(assessment.assessment_options)
          : "2",
      );
      setShowFormBuilder(false);
      setOpen(false);
    } else {
      setJobTitle(assessment.title || "");
      setLevel(assessment.level || "");
      setSkills(assessment.skills || []);
      setAssessmentDescription(assessment.description || "");
      setQuestions(assessment.questions || []);
      setShowFormBuilder(true);
      setOpen(false);
    }
  }, [existingAssessment]);

  // Helper for updating a question
  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    );
  };

  // Change type and reset options if needed
  const handleTypeChange = (idx: number, newType: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? {
              ...q,
              type: newType,
              options:
                newType === "multi-choice"
                  ? q.options && q.options.length
                    ? q.options
                    : [""]
                  : [],
            }
          : q,
      ),
    );
  };

  // Edit multi-choice option
  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt: string, j: number) =>
                j === optIdx ? value : opt,
              ),
            }
          : q,
      ),
    );
  };

  // Add option to multi-choice
  const handleAddOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  // Remove option from multi-choice
  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.filter((_: string, j: number) => j !== optIdx),
            }
          : q,
      ),
    );
  };

  // Delete question
  const handleDeleteQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add new question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", type: "open-text", options: [] },
    ]);
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
      if (result) {
        const allSkills = [...result.technical, ...result.soft];
        setGeneratedSkills(allSkills);
      }
    } catch (error) {
      console.error("Error generating skills:", error);
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  // Add effect to set default description
  useEffect(() => {
    if (jobTitle && skills.length > 0) {
      const defaultDescription = `${jobTitle} assessment covering the following skills: ${skills.join(", ")}. This assessment is designed to evaluate candidates' knowledge and expertise in these areas.`;
      setAssessmentDescription(defaultDescription);
    }
  }, [jobTitle, skills]);

  // Reset generated skills when job title changes so they can be regenerated
  useEffect(() => {
    setGeneratedSkills([]);
  }, [jobTitle]);

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        hidden
        accept=".csv,.xlsx,.xls"
        onChange={handleImportFileChange}
      />
      <input
        ref={generateFromFileInputRef}
        type="file"
        hidden
        accept=".pdf,.docx,.txt"
        onChange={handleGenerateFromFileChange}
      />

      <AssessmentTypeDialog
        open={open && entryStep === "choose"}
        onClose={() => router.push("/dashboard/assessments")}
        onSelectUpload={handleSelectUpload}
        onSelectGenerate={handleSelectGenerate}
      />

      <AssessmentUploadDialog
        open={open && entryStep === "upload"}
        onClose={() => router.push("/dashboard/assessments")}
        importFile={importFile}
        importRows={importRows}
        importing={importing}
        importProgress={importProgress}
        onImport={handleImportAssessments}
        onCancelImport={handleCancelImport}
      />

      <AssessmentConfigDialog
        open={open && entryStep === "form"}
        onClose={() => router.push("/dashboard/assessments")}
        type={type}
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
        error={error}
        success={success}
        loading={loading}
        onSubmit={
          type === "technical_assessment"
            ? () => setOpen(false)
            : handleCreateAssessment
        }
        id={id}
        level={level}
      />

      {/* Technical Assessment Editor */}
      {type === "technical_assessment" && !open && (
        <TechnicalAssessmentEditor
          jobTitle={jobTitle}
          skills={skills}
          assessmentDescription={assessmentDescription}
          setAssessmentDescription={setAssessmentDescription}
          value={value}
          setValue={setValue}
          isGeneratingContent={isGeneratingContent}
          handleGenerateTechnicalContent={handleGenerateTechnicalContent}
          handleSaveTechnicalAssessment={handleSaveTechnicalAssessment}
        />
      )}

      {/* Form Builder */}
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
          id={id}
        />
      )}

      {/* Success Modal */}
      <AssessmentSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        savedAssessmentId={savedAssessmentId}
        router={router}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
