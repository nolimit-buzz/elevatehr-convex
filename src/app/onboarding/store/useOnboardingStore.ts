import { create } from "zustand";

export type OnboardingData = {
  website: string;
  company_logo: File | null;
  booking_link: string;
  about: string;
};

const initialData: OnboardingData = {
  website: "",
  company_logo: null,
  booking_link: "",
  about: "",
};

type OnboardingState = {
  activeStep: number;
  data: OnboardingData;
  skipped: Record<number, boolean>;
  loading: boolean;
  error: string;
  setActiveStep: (step: number) => void;
  next: (maxStep: number) => void;
  back: () => void;
  skip: (maxStep: number) => void;
  updateData: (patch: Partial<OnboardingData>) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  activeStep: 0,
  data: initialData,
  skipped: {},
  loading: false,
  error: "",
  setActiveStep: (step) => set({ activeStep: step }),
  next: (maxStep) =>
    set((state) => ({ activeStep: Math.min(state.activeStep + 1, maxStep) })),
  back: () => set((state) => ({ activeStep: Math.max(state.activeStep - 1, 0) })),
  skip: (maxStep) =>
    set((state) => ({
      skipped: { ...state.skipped, [state.activeStep]: true },
      activeStep: Math.min(state.activeStep + 1, maxStep),
    })),
  updateData: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
  setLoading: (value) => set({ loading: value }),
  setError: (value) => set({ error: value }),
  reset: () => set({ activeStep: 0, data: initialData, skipped: {}, loading: false, error: "" }),
}));
