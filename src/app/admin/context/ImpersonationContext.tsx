"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ImpersonationState = {
  companyName: string;
  recruiterId?: string;
  recruiterName?: string;
} | null;

const ImpersonationContext = createContext<{
  impersonation: ImpersonationState;
  setImpersonation: (state: ImpersonationState) => void;
  startImpersonation: (companyName: string, recruiterId?: string, recruiterName?: string) => void;
  exitImpersonation: () => void;
} | null>(null);

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonation, setImpersonation] = useState<ImpersonationState>(null);
  const startImpersonation = useCallback((companyName: string, recruiterId?: string, recruiterName?: string) => {
    setImpersonation({ companyName, recruiterId, recruiterName });
  }, []);
  const exitImpersonation = useCallback(() => setImpersonation(null), []);
  return (
    <ImpersonationContext.Provider
      value={{ impersonation, setImpersonation, startImpersonation, exitImpersonation }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const ctx = useContext(ImpersonationContext);
  if (!ctx) throw new Error("useImpersonation must be used within ImpersonationProvider");
  return ctx;
}
