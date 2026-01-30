"use client";
import "@/app/global.css";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource-variable/outfit";
import Header from "./dashboard/layout/header/Header";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexClient } from "convex/browser";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexProvider client={convex}>
          <ThemeProvider theme={baselightTheme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
