"use client";

import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Avatar,
  styled,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import {
  Squares2X2Icon,
  UserGroupIcon,
  BookOpenIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  CheckBadgeIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const SIDEBAR_WIDTH = 280;

const SidebarRoot = styled(Box)(({ theme }) => ({
  width: SIDEBAR_WIDTH,
  minWidth: SIDEBAR_WIDTH,
  height: "100vh",
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column",
  boxShadow: "none",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: theme.zIndex.drawer,
}));

const NavItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 2,
  margin: "2px 12px",
  padding: "10px 16px",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main + "18",
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
  },
}));

const iconSx = { width: 20, height: 20, flexShrink: 0 };
const themeIconSize = { width: 24, height: 24 };

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <Squares2X2Icon style={iconSx} /> },
  { href: "/admin/recruiters", label: "Recruiters", icon: <UserGroupIcon style={iconSx} /> },
  { href: "/admin/activity", label: "Activity", icon: <ClockIcon style={iconSx} /> },
  { href: "/admin/assessments", label: "Assessments", icon: <BookOpenIcon style={iconSx} /> },
  { href: "/admin/templates", label: "Templates", icon: <EnvelopeIcon style={iconSx} /> },
  { href: "/admin/settings", label: "Settings", icon: <Cog6ToothIcon style={iconSx} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarRoot>
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.contrastText",
          }}
        >
          <CheckBadgeIcon style={{ width: 20, height: 20 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
          ElevateHR
        </Typography>
      </Box>
      <Box sx={{ py: 2, px: 1.5 }}>
        <List sx={{ pt: 0 }}>
          {navItems.map((item) => {
            const isSelected =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <NavItem
                key={item.href}
                selected={isSelected}
                onClick={() => router.push(item.href)}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: "0.875rem" }}
                />
              </NavItem>
            );
          })}
        </List>
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box
        sx={{
          m: 1.5,
          p: 2,
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Box sx={{ color: "inherit", display: "inline-flex", mb: 0.5 }}>
          <SparklesIcon style={{ width: 20, height: 20 }} />
        </Box>
        <Typography variant="subtitle2" fontWeight={600}>
          Unlock deeper insights
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, display: "block", mt: 0.25 }}>
          Advanced metrics and reports for your instance.
        </Typography>
        <Button
          size="small"
          variant="contained"
          fullWidth
          sx={{
            mt: 1.5,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "primary.contrastText",
            color: "primary.main",
            borderRadius: 2,
            "&:hover": { bgcolor: "primary.contrastText", opacity: 0.95 },
          }}
        >
          Become Pro
        </Button>
      </Box>
      <Box sx={{ px: 1.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "action.hover",
            p: 0.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            component="button"
            type="button"
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              py: 0.875,
              px: 1.5,
              borderRadius: 1.5,
              bgcolor: "background.paper",
              color: "text.primary",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.8125rem",
              "&:hover": { bgcolor: "background.paper", opacity: 0.95 },
            }}
          >
            <SunIcon style={themeIconSize} />
            <Typography component="span" variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem" }}>
              Light
            </Typography>
          </Box>
          <Box
            component="button"
            type="button"
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              py: 0.875,
              px: 1.5,
              borderRadius: 1.5,
              bgcolor: "transparent",
              color: "text.secondary",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.8125rem",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <MoonIcon style={themeIconSize} />
            <Typography component="span" variant="body2" sx={{ fontSize: "0.8125rem", color: "inherit" }}>
              Dark
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.875rem" }}>
          AD
        </Avatar>
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ letterSpacing: "0.05em" }}>
            SUPER ADMIN
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SaaS Reseller
          </Typography>
        </Box>
      </Box>
    </SidebarRoot>
  );
}

export { SIDEBAR_WIDTH };
