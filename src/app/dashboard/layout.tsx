"use client";
import { styled, Container, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/app/dashboard/layout/header/Header";
import ImpersonationBanner from "@/app/components/ImpersonationBanner";
import { DefaultConstants } from "@/app/constants/defaults";
import { getWithExpiry } from "@/app/utils/authStorage";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const arrowId = searchParams.get("arrow_id");
  const name = searchParams.get("name");

  const handleExitImpersonation = () => {
    // Remove arrow_id and name from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("arrow_id");
    params.delete("name");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Render nothing while checking — prevents dashboard flash for unauthed users
  if (!authorized) return null;

  return (
    <main>
      {arrowId && (
        <ImpersonationBanner
          companyName={name || `Recruiter ID: ${arrowId}`}
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
            <Box sx={{ width: "100%", minHeight: "calc(100vh - 170px)" }}>
              {children}
            </Box>
          </Container>
        </PageWrapper>
      </MainWrapper>
    </main>
  );
}
