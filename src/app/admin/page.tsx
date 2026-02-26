"use client";

import React, { useState } from "react";
import { Box, Grid, Paper, Typography, Stack, Link, IconButton, useTheme } from "@mui/material";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import {
  UserGroupIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "./styles";
import NewRecruiterModal from "./components/NewRecruiterModal";
import { useAdminDashboardStats } from "@/queries/admin.queries";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const iconSize = { width: 24, height: 24 };
const quickActionIconSize = { width: 20, height: 20 };
const cardSx = { ...ADMIN_CARD_SX, boxShadow: "none" };

const getGrowthChartOptions = (
  primaryColor: string,
  axisColor: string,
  gridColor: string,
  categories: string[],
): ApexOptions =>
  ({
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primaryColor],
    fill: { type: "solid", opacity: 0.2 },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories,
      labels: { style: { colors: axisColor, fontSize: "12px" } },
    },
    yaxis: {
      labels: { style: { colors: axisColor, fontSize: "12px" } },
      min: 0,
    },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    tooltip: { theme: "light" },
  }) as ApexOptions;

const quickActions = [
  {
    label: "New Recruiter",
    description: "Invite and provision a new recruiter to your instance.",
    icon: <PlusIcon style={quickActionIconSize} />,
    href: "/admin/recruiters",
  },
  {
    label: "Create Template",
    description: "Add a master assessment or communication template.",
    icon: <DocumentTextIcon style={quickActionIconSize} />,
    href: "/admin/assessments",
  },
  {
    label: "Update Branding",
    description: "Configure white-label, domain, and global settings.",
    icon: <PaintBrushIcon style={quickActionIconSize} />,
    href: "/admin/settings",
  },
];

export default function AdminDashboardPage() {
  const theme = useTheme();
  const [newRecruiterOpen, setNewRecruiterOpen] = useState(false);
  const { stats, isLoading } = useAdminDashboardStats();

  const growthChartOptions = getGrowthChartOptions(
    theme.palette.primary.main,
    theme.palette.text.secondary as string,
    theme.palette.divider,
    stats?.recruiterGrowth.map((d) => d.month) || [],
  );

  const growthSeries = [{ name: "Recruiters", data: stats?.recruiterGrowth.map((d) => d.count) || [] }];

  const kpiCards = [
    {
      id: "recruiters",
      title: "Total Recruiters",
      subtitle: "Active recruiter accounts",
      value: stats?.kpis.totalRecruiters ?? 0,
      icon: <UserGroupIcon style={iconSize} />,
    },
    {
      id: "activeJobs",
      title: "Active Jobs",
      subtitle: "Open positions",
      value: stats?.kpis.activeJobs ?? 0,
      icon: <BriefcaseIcon style={iconSize} />,
    },
    {
      id: "candidates",
      title: "Candidates",
      subtitle: "Total applicants",
      value: stats?.kpis.candidates ?? 0,
      icon: <UserGroupIcon style={iconSize} />,
    },
    {
      id: "assessments",
      title: "Assessments",
      subtitle: "Completed this month",
      value: stats?.kpis.assessments ?? 0,
      icon: <ClipboardDocumentCheckIcon style={iconSize} />,
    },
  ];

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* KPI overview cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <Paper
              elevation={0}
              sx={{
                ...cardSx,
                p: 2.5,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    "& svg": { width: 22, height: 22 },
                  }}
                >
                  {card.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    {card.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                    {card.subtitle}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: "auto", pt: 2 }}>
                <Typography
                  variant="h2"
                  fontWeight={700}
                  color="text.primary"
                  sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}
                >
                  {card.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity & Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              ...cardSx,
              p: 3,
              height: "100%",
              minHeight: 320,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Activity
              </Typography>
              <Link href="/admin/activity" underline="hover" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                View All
              </Link>
            </Box>
            <Stack spacing={0}>
              {stats?.recentActivity.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5,
                    px: 0,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: 0 },
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2">{item.text}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                      {item.time}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: "text.secondary", flexShrink: 0 }}>
                    <ChevronRightIcon style={quickActionIconSize} />
                  </IconButton>
                </Box>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  No recent activity
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", minHeight: 520 }}>
          <Paper
            elevation={0}
            sx={{
              ...cardSx,
              p: 3,
              flexShrink: 0,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Stack spacing={0.5}>
              {quickActions.map((action) =>
                action.label === "New Recruiter" ? (
                  <Box
                    key={action.label}
                    component="button"
                    type="button"
                    onClick={() => setNewRecruiterOpen(true)}
                    sx={{
                      all: "unset",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 1.25,
                        px: 1.5,
                        borderRadius: 2,
                        color: "text.primary",
                        bgcolor: "action.hover",
                        "&:hover": { bgcolor: "action.hover", filter: "brightness(0.97)" },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {action.icon}
                        <Typography variant="body2" fontWeight={500}>
                          {action.label}
                        </Typography>
                      </Box>
                      <Box sx={{ color: "text.secondary", display: "flex" }}>
                        <ChevronRightIcon style={quickActionIconSize} />
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Link
                    key={action.label}
                    href={action.href}
                    underline="none"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1.25,
                      px: 1.5,
                      borderRadius: 2,
                      color: "text.primary",
                      bgcolor: "action.hover",
                      "&:hover": { bgcolor: "action.hover", filter: "brightness(0.97)" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      {action.icon}
                      <Typography variant="body2" fontWeight={500}>
                        {action.label}
                      </Typography>
                    </Box>
                    <Box sx={{ color: "text.secondary", display: "flex" }}>
                      <ChevronRightIcon style={quickActionIconSize} />
                    </Box>
                  </Link>
                ),
              )}
            </Stack>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              ...cardSx,
              p: 3,
              flex: 1,
              minHeight: 240,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              mt: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
              Recruiter Growth
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              New recruiter signups over time.
            </Typography>
            {typeof window !== "undefined" && stats && (
              <Box sx={{ flex: 1, minHeight: 200 }}>
                <Chart options={growthChartOptions} series={growthSeries} type="area" height={260} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      <NewRecruiterModal open={newRecruiterOpen} onClose={() => setNewRecruiterOpen(false)} />
    </Box>
  );
}
