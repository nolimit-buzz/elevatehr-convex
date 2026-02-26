"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/recruiters": "Recruiters",
  "/admin/activity": "Activity",
  "/admin/assessments": "Assessments",
  "/admin/templates": "Templates",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/admin/recruiters/") && pathname !== "/admin/recruiters")
    return "Workforce Detail";
  return "Admin";
}

export default function AdminHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: "-0.02em", color: "#1a1a1a" }}>
        {title}
      </Typography>
    </Box>
  );
}
