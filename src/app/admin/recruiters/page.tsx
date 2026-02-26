"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  Stack,
  InputBase,
  Avatar,
  styled,
} from "@mui/material";
import {
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
  PowerIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  ComputerDesktopIcon,
  PaintBrushIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  StopIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

import { useRouter } from "next/navigation";
import { useImpersonation } from "../context/ImpersonationContext";
import { MOCK_RECRUITERS, type MockRecruiter, type RecruiterStatus } from "../mock-data";
import { ADMIN_CARD_SX } from "../styles";
import NewRecruiterModal from "../components/NewRecruiterModal";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: "20px 24px",
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

function StatusDot({ status }: { status: RecruiterStatus }) {
  const color =
    status === "active"
      ? "success.main"
      : status === "pending"
        ? "warning.main"
        : "error.main";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
      <Typography variant="body2" sx={{ fontWeight: 500, textTransform: "capitalize", color: "text.primary" }}>
        {status}
      </Typography>
    </Box>
  );
}

function getIndustryTagProps(industry: string) {
  const i = industry.toLowerCase();
  const s = { width: 14, height: 14 };
  if (i.includes("tech")) return { color: "info.light", textColor: "info.dark", icon: <ComputerDesktopIcon style={s} /> };
  if (i.includes("design")) return { color: "warning.light", textColor: "warning.dark", icon: <PaintBrushIcon style={s} /> };
  if (i.includes("oil")) return { color: "primary.light", textColor: "primary.dark", icon: <BeakerIcon style={s} /> };
  return { color: "action.hover", textColor: "text.secondary", icon: <BuildingOfficeIcon style={s} /> };
}

export default function RecruiterDirectoryPage() {
  const router = useRouter();
  const { startImpersonation } = useImpersonation();
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState<MockRecruiter | null>(null);
  const [newRecruiterOpen, setNewRecruiterOpen] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_RECRUITERS.filter((r) => {
      const matchSearch =
        !search ||
        r.companyName.toLowerCase().includes(search.toLowerCase()) ||
        r.primaryAdmin.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [search]);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, row: MockRecruiter) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedRecruiter(row);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRecruiter(null);
  };
  const handleLoginAs = () => {
    if (selectedRecruiter) {
      startImpersonation(selectedRecruiter.companyName);
      handleCloseMenu();
    }
  };
  const handleViewDeepDive = () => {
    if (selectedRecruiter) {
      router.push(`/admin/recruiters/${selectedRecruiter.id}`);
      handleCloseMenu();
    }
  };

  return (
    <Box sx={{ width: "100%", overflow: "hidden", pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Button
          variant="contained"
          disableElevation
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            textTransform: "none",
            fontWeight: 500,
            borderRadius: "30px",
            px: 2.5,
            py: 1,
            "&:hover": { bgcolor: "primary.dark" },
            boxShadow: "none"
          }}
          startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
          onClick={() => setNewRecruiterOpen(true)}
        >
          Add New Recruiter
        </Button>
      </Box>

      {/* Table Container */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          ...ADMIN_CARD_SX,
          overflow: "hidden",
        }}
      >
        {/* Table Toolbar - without "Recruiter List" title */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", px: 3, py: 2.5, flexWrap: "wrap", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "30px",
              px: 2,
              py: 0.75,
              width: { xs: "100%", sm: 280 },
            }}
          >
            <MagnifyingGlassIcon style={{ width: 20, height: 20, color: "gray" }} />
            <InputBase
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ fontSize: "0.875rem", width: "100%", ml: 1 }}
            />
          </Box>

          <Button
            variant="outlined"
            sx={{
              borderRadius: "30px",
              color: "text.primary",
              borderColor: "divider",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              py: 0.75,
              "&:hover": { bgcolor: "action.hover" }
            }}
            startIcon={<AdjustmentsHorizontalIcon style={{ width: 20, height: 20 }} />}
          >
            Filter
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { bgcolor: "transparent", borderBottom: "1px solid", borderColor: "divider" } }}>
              <StyledTableCell padding="checkbox">
                <Checkbox
                  size="small"
                  icon={<StopIcon style={{ width: 18, height: 18 }} />}
                  checkedIcon={<CheckIcon style={{ width: 18, height: 18 }} />}
                />
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Name</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>E-mail</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Account Date</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Industry</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Usage</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Status</StyledTableCell>
              <StyledTableCell align="right" sx={{ fontWeight: 600, color: "text.primary" }}>Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => {
              const tagConfig = getIndustryTagProps(row.industry);
              return (
                <TableRow key={row.id} hover>
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      icon={<StopIcon style={{ width: 18, height: 18 }} />}
                      checkedIcon={<CheckIcon style={{ width: 18, height: 18 }} />}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={row.logoUrl}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: row.logoUrl ? "transparent" : "action.hover",
                          border: row.logoUrl ? "none" : "1px solid",
                          borderColor: row.logoUrl ? "transparent" : "divider",
                        }}
                      >
                        {!row.logoUrl && (
                          <BuildingOfficeIcon style={{ width: 18, height: 18, color: "rgba(17,17,17,0.58)" }} />
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {row.companyName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.primaryAdmin}
                        </Typography>
                      </Box>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.email}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(row.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Box
                        sx={{
                          bgcolor: tagConfig.color,
                          color: tagConfig.textColor,
                          px: 1,
                          py: 0.25,
                          borderRadius: 2,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        {tagConfig.icon} {row.industry}
                      </Box>
                      {row.tier === "premium" && (
                        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, px: 0.75, py: 0.25, fontSize: "0.75rem", color: "text.secondary" }}>
                          +1
                        </Box>
                      )}
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.jobsCount} Jobs / {row.candidatesCount} App
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <StatusDot status={row.status} />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, row)}>
                      <EllipsisHorizontalIcon style={{ width: 24, height: 24 }} />
                    </IconButton>
                  </StyledTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {/* Pagination footer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Box sx={{ border: "1px solid", borderColor: "divider", px: 1.5, py: 0.5, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">100 Page</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Page 1</Typography>
            <IconButton size="small" sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <ChevronLeftIcon style={{ width: 24, height: 24 }} />
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: "primary.main", color: "primary.contrastText", borderRadius: 2, "&:hover": { bgcolor: "primary.dark" } }}>
              <ChevronRightIcon style={{ width: 24, height: 24 }} />
            </IconButton>
          </Box>
        </Box>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{ sx: { ...ADMIN_CARD_SX, minWidth: 200 } }}
      >
        <MenuItem onClick={handleViewDeepDive} sx={{ borderRadius: 2, mx: 1, fontSize: "0.875rem" }}>
          <Box component="span" sx={{ mr: 1, display: "inline-flex" }}><UserIcon style={{ width: 24, height: 24 }} /></Box>
          View Profile
        </MenuItem>
        <MenuItem onClick={handleLoginAs} sx={{ borderRadius: 2, mx: 1, fontSize: "0.875rem" }}>
          <Box component="span" sx={{ mr: 1, display: "inline-flex" }}><ArrowTopRightOnSquareIcon style={{ width: 24, height: 24 }} /></Box>
          Impersonate
        </MenuItem>
        <MenuItem onClick={handleCloseMenu} sx={{ borderRadius: 2, mx: 1, fontSize: "0.875rem", color: "error.main" }}>
          <Box component="span" sx={{ mr: 1, display: "inline-flex" }}><PowerIcon style={{ width: 24, height: 24 }} /></Box>
          Toggle Access
        </MenuItem>
      </Menu>

      <NewRecruiterModal
        open={newRecruiterOpen}
        onClose={() => setNewRecruiterOpen(false)}
      />
    </Box>
  );
}
