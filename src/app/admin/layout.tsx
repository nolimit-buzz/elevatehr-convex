"use client";

import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import ImpersonationBanner from "./components/ImpersonationBanner";
import { ImpersonationProvider, useImpersonation } from "./context/ImpersonationContext";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { impersonation, exitImpersonation } = useImpersonation();

  const isAdminLogin = pathname === "/admin/login";

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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {impersonation && (
          <ImpersonationBanner companyName={impersonation.companyName} onExit={exitImpersonation} />
        )}
        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 3, md: "120px" },
            py: 3,
            bgcolor: "background.default",
            overflow: "auto",
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
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImpersonationProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ImpersonationProvider>
  );
}

