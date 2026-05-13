"use client";
import React, { useEffect, useState, useRef } from "react";
import { Snackbar, Alert, Box } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AssessmentQueries,
  usePublicAssessment,
  type Id,
} from "@/queries/assessment.queries";
import * as XLSX from "xlsx";
import { pdfjs } from "react-pdf";
import mammoth from "mammoth";
import AssessmentConfigDialog from "@/app/dashboard/components/dashboard/assessments/AssessmentConfigDialog";
import TechnicalAssessmentEditor from "@/app/dashboard/components/dashboard/assessments/TechnicalAssessmentEditor";
import AssessmentFormBuilder from "@/app/dashboard/components/dashboard/assessments/AssessmentFormBuilder";
import AssessmentSuccessModal from "@/app/dashboard/components/dashboard/assessments/AssessmentSuccessModal";

/**
 * This page only handles EDITING an existing assessment (?id=...).
 * For creating new assessments, users are redirected to the main /assessments page
 * which now has the full creation flow built in as modals over the list.
 */
import { Suspense } from "react";

// Wrap the component logic in a separate function to use with Suspense
function EditAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams?.get("type");
  const id = searchParams?.get("id");

  // If no ID is provided, this is not an edit — redirect to main page
  useEffect(() => {
    if (!id) {
      router.replace("/dashboard/assessments");
    }
  }, [id, router]);

  const [open, setOpen] = React.useState(false);
  const [entryStep] = React.useState<"form">("form");

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

  const {
    GenerateSkills,
    GenerateQuestions,
    GenerateTechnicalContent,
    UpdateAssessment,
  } = AssessmentQueries();

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills((skills) => skills.filter((skill) => skill !== skillToDelete));
  };

  // Fetch existing assessment for editing
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
      setOpen(true);
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

  const handleSaveAssessment = async () => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
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
      if (updateError || !result)
        throw new Error(updateError || "Failed to update assessment");
      setSavedAssessmentId(id);
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
      if (updateError || !result)
        throw new Error(updateError || "Failed to update assessment");
      setSavedAssessmentId(id);
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
      if (genError || !result)
        throw new Error(genError || "Failed to generate content");
      if (result.status === "success" && result.content) {
        setValue(result.content);
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

  const generateSkills = async () => {
    setIsGeneratingSkills(true);
    try {
      const { result, error } = await GenerateSkills({
        jobTitle,
        jobDescription: assessmentDescription || "",
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

  const handleQuestionChange = (idx: number, field: string, value: any) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    );

  const handleTypeChange = (idx: number, newType: string) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? {
              ...q,
              type: newType,
              options:
                newType === "multi-choice"
                  ? q.options?.length
                    ? q.options
                    : [""]
                  : [],
            }
          : q,
      ),
    );

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) =>
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

  const handleAddOption = (qIdx: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, ""] } : q,
      ),
    );

  const handleRemoveOption = (qIdx: number, optIdx: number) =>
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

  const handleDeleteQuestion = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  const handleAddQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      { question: "", type: "open-text", options: [] },
    ]);

  // While redirecting (no id), render nothing
  if (!id) return null;

  return (
    <Box sx={{ bgcolor: "#F6F7FB", minHeight: "100vh" }}>
      {/* Config dialog for editing online assessments */}
      <AssessmentConfigDialog
        open={open && !showFormBuilder}
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
        onSubmit={() => setOpen(false)}
        id={id}
        level={level}
      />

      {/* Technical Assessment Editor */}
      {type === "technical_assessment" && open && (
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

      {/* Form Builder for online assessments */}
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
    </Box>
  );
}

export default function EditAssessmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditAssessmentContent />
    </Suspense>
  );
}

