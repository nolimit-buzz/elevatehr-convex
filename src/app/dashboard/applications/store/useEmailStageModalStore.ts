import { create } from "zustand";

type EmailStageModalState = {
  emailModalOpen: boolean;
  emailLoading: boolean;
  emailContent: string;
  emailError: string;
  pendingAction: string | null;
  setEmailModalOpen: (value: boolean) => void;
  setEmailLoading: (value: boolean) => void;
  setEmailContent: (value: string) => void;
  setEmailError: (value: string) => void;
  setPendingAction: (value: string | null) => void;
  reset: () => void;
};

const initialState = {
  emailModalOpen: false,
  emailLoading: false,
  emailContent: "",
  emailError: "",
  pendingAction: null,
};

export const useEmailStageModalStore = create<EmailStageModalState>((set) => ({
  ...initialState,
  setEmailModalOpen: (emailModalOpen) => set({ emailModalOpen }),
  setEmailLoading: (emailLoading) => set({ emailLoading }),
  setEmailContent: (emailContent) => set({ emailContent }),
  setEmailError: (emailError) => set({ emailError }),
  setPendingAction: (pendingAction) => set({ pendingAction }),
  reset: () => set(initialState),
}));
