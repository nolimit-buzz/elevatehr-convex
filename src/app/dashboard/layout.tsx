"use client";
import { styled, Container, Box } from "@mui/material";
import React, { useState } from "react";
import Header from "@/app/dashboard/layout/header/Header";

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

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
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
