"use client";

import { useEffect, useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar, { SIDEBAR_WIDTH } from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import ImpersonationBanner from "@/app/components/ImpersonationBanner";
import { ImpersonationProvider, useImpersonation } from "./context/ImpersonationContext";
import { DefaultConstants } from "@/app/constants/defaults";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { impersonation, exitImpersonation } = useImpersonation();
  const [unauthToast, setUnauthToast] = useState(false);

  const isAdminLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isAdminLogin) return;
    const token = localStorage.getItem(DefaultConstants.tokenName);
    if (!token) {
      setUnauthToast(true);
      router.replace("/admin/login");
    }
  }, [isAdminLogin, router]);

  if (isAdminLogin) {
    // For the admin login route, render without sidebar/header chrome
    return (
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <>
      <Snackbar
        open={unauthToast}
        autoHideDuration={4000}
        onClose={() => setUnauthToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setUnauthToast(false)}>
          You must be logged in to access the admin panel.
        </Alert>
      </Snackbar>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <AdminSidebar />
        <Box
          sx={{
            ml: `${SIDEBAR_WIDTH}px`,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {impersonation && <ImpersonationBanner companyName={impersonation.companyName} onExit={exitImpersonation} />}
          <Box
            component="main"
            sx={{
              flex: 1,
              px: { xs: 3, md: "40px" },
              py: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 1440, display: "flex", flexDirection: "column" }}>
              <AdminHeader />
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImpersonationProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ImpersonationProvider>
  );
}
