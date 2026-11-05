import { create } from "zustand";

type AssessmentState = {
  submitting: boolean;
  error: string | null;
  success: string | null;
  submissionUrl: string;
  isSubmitted: boolean;
  selectedOption: string;
  isJobClosed: boolean;
  answers: { [key: number]: string };
  setSubmitting: (value: boolean) => void;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
  setSubmissionUrl: (value: string) => void;
  setIsSubmitted: (value: boolean) => void;
  setSelectedOption: (value: string) => void;
  setIsJobClosed: (value: boolean) => void;
  setAnswer: (questionIndex: number, answer: string) => void;
  reset: () => void;
};

const initialState = {
  submitting: false,
  error: null,
  success: null,
  submissionUrl: "",
  isSubmitted: false,
  selectedOption: "",
  isJobClosed: false,
  answers: {},
};

export const useAssessmentStore = create<AssessmentState>((set) => ({
  ...initialState,
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  setSubmissionUrl: (submissionUrl) => set({ submissionUrl }),
  setIsSubmitted: (isSubmitted) => set({ isSubmitted }),
  setSelectedOption: (selectedOption) => set({ selectedOption }),
  setIsJobClosed: (isJobClosed) => set({ isJobClosed }),
  setAnswer: (questionIndex, answer) =>
    set((state) => ({ answers: { ...state.answers, [questionIndex]: answer } })),
  reset: () => set(initialState),
}));
