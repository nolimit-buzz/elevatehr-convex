"use client";
import { styled, Container, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/app/dashboard/layout/header/Header";
import ImpersonationBanner from "@/app/components/ImpersonationBanner";
import { DefaultConstants } from "@/app/constants/defaults";
import {
  getWithExpiry,
  setCompanyOverride,
  clearCompanyOverride,
  setImpersonationName,
  getImpersonationName,
  clearImpersonationName,
  getCompanyOverride,
} from "@/app/utils/authStorage";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  // padding: "20px",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
  width: "100%",
}));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getWithExpiry(DefaultConstants.tokenName);
    if (!token) {
      router.replace("/");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const searchParams = useSearchParams();
  const arrowIdFromUrl = searchParams.get("arrow_id");
  const nameFromUrl = searchParams.get("name");

  const [activeImpersonationId, setActiveImpersonationId] = useState<string | null>(null);
  const [activeImpersonationName, setActiveImpersonationName] = useState<string | null>(null);

  // On every pathname change, either save params to sessionStorage or restore them from it
  useEffect(() => {
    if (arrowIdFromUrl) {
      // URL has params — persist to sessionStorage and update local state
      setCompanyOverride(arrowIdFromUrl);
      setImpersonationName(nameFromUrl ?? "");
      setActiveImpersonationId(arrowIdFromUrl);
      setActiveImpersonationName(nameFromUrl);
    } else {
      // URL lost params — check sessionStorage and re-attach if present
      const storedId = getCompanyOverride();
      const storedName = getImpersonationName();
      if (storedId) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("arrow_id", storedId);
        if (storedName) params.set("name", storedName);
        router.replace(`${pathname}?${params.toString()}`);
        setActiveImpersonationId(storedId);
        setActiveImpersonationName(storedName);
      } else {
        setActiveImpersonationId(null);
        setActiveImpersonationName(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, arrowIdFromUrl]);

  const handleExitImpersonation = () => {
    clearCompanyOverride();
    clearImpersonationName();
    setActiveImpersonationId(null);
    setActiveImpersonationName(null);
    // Remove arrow_id and name from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("arrow_id");
    params.delete("name");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  // Render nothing while checking — prevents dashboard flash for unauthed users
  if (!authorized) return null;

  return (
    <main>
      {activeImpersonationId && (
        <ImpersonationBanner
          companyName={activeImpersonationName || `Recruiter ID: ${activeImpersonationId}`}
          onExit={handleExitImpersonation}
        />
      )}
      <Header />
      <MainWrapper className="mainwrapper">
        <PageWrapper className="page-wrapper">
          <Container
            sx={{
              maxWidth: "100% !important",
              margin: "0",
              padding: "0px !important",
              width: "100% !important",
            }}
          >
            <Box sx={{ width: "100%", minHeight: "calc(100vh - 170px)" }}>{children}</Box>
          </Container>
        </PageWrapper>
      </MainWrapper>
    </main>
  );
}
