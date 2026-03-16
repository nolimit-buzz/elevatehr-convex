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
  CircularProgress,
  Tooltip,
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
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";

import { useRouter } from "next/navigation";
import { useImpersonation } from "../context/ImpersonationContext";
import { type MockRecruiter, type RecruiterStatus } from "../mock-data";
import { ADMIN_CARD_SX } from "../styles";
import NewRecruiterModal from "../components/NewRecruiterModal";
import { useAdminRecruiters } from "@/queries/admin.queries";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: "16px 20px",
  [theme.breakpoints.down("xl")]: {
    padding: "12px 14px",
  },
  [theme.breakpoints.down("lg")]: {
    padding: "8px 8px",
    fontSize: "0.8125rem",
  },
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
}));

const TableHeaderCell = styled(StyledTableCell)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
  textTransform: "capitalize",
  padding: "12px 20px",
  [theme.breakpoints.down("xl")]: {
    padding: "10px 14px",
  },
  [theme.breakpoints.down("lg")]: {
    padding: "8px 8px",
  },
  backgroundColor: "transparent",
}));

function StatusChip({ status }: { status: RecruiterStatus }) {
  const getColors = () => {
    switch (status) {
      case "active":
        return { bg: "#ECFDF5", text: "#10B981" };
      case "pending":
        return { bg: "#FFF7ED", text: "#F97316" };
      case "inactive":
        return { bg: "#FEF2F2", text: "#EF4444" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };
  const { bg, text } = getColors();
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.4,
        borderRadius: "20px",
        bgcolor: bg,
        color: text,
        display: "inline-block",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {status}
    </Box>
  );
}

const SortIcon = () => <ArrowsUpDownIcon style={{ width: 14, height: 14, marginLeft: 4, color: "#9CA3AF" }} />;

function getIndustryTagProps(industry: string) {
  const i = industry.toLowerCase();
  const s = { width: 14, height: 14 };
  if (i.includes("tech"))
    return { color: "info.light", textColor: "info.dark", icon: <ComputerDesktopIcon style={s} /> };
  if (i.includes("design"))
    return { color: "warning.light", textColor: "warning.dark", icon: <PaintBrushIcon style={s} /> };
  if (i.includes("oil")) return { color: "primary.light", textColor: "primary.dark", icon: <BeakerIcon style={s} /> };
  return { color: "action.hover", textColor: "text.secondary", icon: <BuildingOfficeIcon style={s} /> };
}

function ScrollingEmail({ email }: { email: string }) {
  return (
    <Box
      sx={{
        width: "120px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        cursor: "default",
        "& .scroll-text": {
          display: "inline-block",
          transition: "transform 2s ease-in-out",
        },
        "&:hover .scroll-text": {
          transform: "translateX(min(0px, calc(120px - 100%)))",
        },
      }}
    >
      <Typography variant="body2" className="scroll-text" color="text.secondary" sx={{ fontSize: "inherit" }}>
        {email}
      </Typography>
    </Box>
  );
}

function RecruiterMobileCard({ row, onMenuOpen, tagConfig }: { row: any; onMenuOpen: any; tagConfig: any }) {
  return (
    <Paper elevation={0} sx={{ ...ADMIN_CARD_SX, p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Avatar
            src={row.companyLogo}
            sx={{
              width: 40,
              height: 40,
              bgcolor: row.companyLogo ? "transparent" : "action.hover",
              border: row.companyLogo ? "none" : "1px solid",
              borderColor: row.companyLogo ? "transparent" : "divider",
            }}
          >
            {!row.companyLogo && <BuildingOfficeIcon style={{ width: 20, height: 20, color: "rgba(17,17,17,0.58)" }} />}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {row.companyName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.primaryAdmin}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={(e) => onMenuOpen(e, row)}>
          <EllipsisHorizontalIcon style={{ width: 24, height: 24 }} />
        </IconButton>
      </Box>

      <Stack spacing={1.5}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Status
          </Typography>
          <StatusChip status={row.status} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Email
          </Typography>
          <ScrollingEmail email={row.email} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Industry
          </Typography>
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
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Usage
          </Typography>
          <Typography variant="body2">{row.activeJobs} active jobs</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function RecruiterDirectoryPage() {
  const router = useRouter();
  const { startImpersonation } = useImpersonation();
  const { recruiters, isLoading } = useAdminRecruiters();
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState<any | null>(null);
  const [newRecruiterOpen, setNewRecruiterOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!recruiters) return [];
    return recruiters.filter((r) => {
      const matchSearch =
        !search ||
        r.companyName.toLowerCase().includes(search.toLowerCase()) ||
        r.primaryAdmin.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [search, recruiters]);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, row: any) => {
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
      {/* Page Header Redesign */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Showing Count */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing
            </Typography>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ChevronDownIcon style={{ width: 14, height: 14 }} />}
              sx={{
                borderRadius: "8px",
                borderColor: "divider",
                color: "text.primary",
                textTransform: "none",
                bgcolor: "#F3F4F6",
                minWidth: "70px",
                justifyContent: "space-between",
              }}
            >
              10
            </Button>
          </Box>

          {/* Filter Button */}
          <Button
            variant="outlined"
            startIcon={<AdjustmentsHorizontalIcon style={{ width: 18, height: 18 }} />}
            sx={{
              borderRadius: "8px",
              borderColor: "divider",
              color: "text.primary",
              textTransform: "none",
              px: 2,
            }}
          >
            Filter
          </Button>



          {/* Add New Button */}
          <Button
            variant="contained"
            disableElevation
            startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
            sx={{
              bgcolor: "#3B82F6",
              "&:hover": { bgcolor: "#2563EB" },
              borderRadius: "8px",
              textTransform: "none",
              px: 3,
            }}
            onClick={() => setNewRecruiterOpen(true)}
          >
            Add New Recruiter
          </Button>
        </Box>
      </Box>

      {/* Content Area */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ ...ADMIN_CARD_SX, p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No recruiters found.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Table for Desktop & Large Tablets */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              ...ADMIN_CARD_SX,
              display: { xs: "none", md: "block" },
              width: "100%",
              overflowX: "scroll", // Disable scroll
              scrollbarWidth: "none",
            }}
          >
            {/* Table Toolbar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                px: 3,
                py: 2,
              }}
            />
            <Table>
              <TableHead>
                <TableRow sx={{ "& th": { bgcolor: "transparent", borderBottom: "1px solid", borderColor: "divider" } }}>
                  <TableHeaderCell padding="checkbox">
                    <Checkbox
                      size="small"
                      icon={<StopIcon style={{ width: 18, height: 18 }} />}
                      checkedIcon={<CheckIcon style={{ width: 18, height: 18 }} />}
                    />
                  </TableHeaderCell>
                  <TableHeaderCell>
                    Name <SortIcon />
                  </TableHeaderCell>
                  <TableHeaderCell>
                    E-mail <SortIcon />
                  </TableHeaderCell>
                  <TableHeaderCell>
                    Account Date <SortIcon />
                  </TableHeaderCell>
                  <TableHeaderCell>
                    Industry <SortIcon />
                  </TableHeaderCell>
                  <TableHeaderCell>
                    Usage <SortIcon />
                  </TableHeaderCell>
                  <TableHeaderCell>
                    Status <SortIcon />
                  </TableHeaderCell>
                  <TableHeaderCell align="right">
                    Action <SortIcon />
                  </TableHeaderCell>
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
                            src={row.companyLogo}
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: row.companyLogo ? "transparent" : "action.hover",
                              border: row.companyLogo ? "none" : "1px solid",
                              borderColor: row.companyLogo ? "transparent" : "divider",
                            }}
                          >
                            {!row.companyLogo && (
                              <BuildingOfficeIcon style={{ width: 14, height: 14, color: "rgba(17,17,17,0.58)" }} />
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
                        <ScrollingEmail email={row.email} />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "inherit" }}>
                          {row.joinedAt}
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
                        </Stack>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "inherit" }}>
                          {row.activeJobs} active jobs
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell>
                        <StatusChip status={row.status} />
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <IconButton size="small" onClick={(e) => handleOpenMenu(e, row)}>
                          <EllipsisHorizontalIcon style={{ width: 24, height: 24, color: "#9CA3AF" }} />
                        </IconButton>
                      </StyledTableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination footer */}
            {/* Pagination footer redesigned */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 3,
                py: 2.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                size="small"
                startIcon={<ChevronLeftIcon style={{ width: 18, height: 18 }} />}
                sx={{ color: "text.secondary", textTransform: "none", fontWeight: 500 }}
              >
                Previous
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {[1, 2, 3, 4, "...", 10, 11].map((p, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: p === 3 ? 600 : 400,
                      bgcolor: p === 3 ? "#3B82F6" : "transparent",
                      color: p === 3 ? "white" : "text.secondary",
                      "&:hover": { bgcolor: p === 3 ? "#2563EB" : "action.hover" },
                    }}
                  >
                    {p}
                  </Box>
                ))}
              </Box>

              <Button
                size="small"
                endIcon={<ChevronRightIcon style={{ width: 18, height: 18 }} />}
                sx={{ color: "text.secondary", textTransform: "none", fontWeight: 500 }}
              >
                Next
              </Button>
            </Box>
          </TableContainer>

          {/* Cards for Mobile & Small Tablets */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <Box sx={{ mb: 3 }}>
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
                  mb: 2,
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
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: "30px",
                  color: "text.primary",
                  borderColor: "divider",
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1,
                }}
                startIcon={<AdjustmentsHorizontalIcon style={{ width: 20, height: 20 }} />}
              >
                Filter
              </Button>
            </Box>

            {filtered.map((row) => (
              <RecruiterMobileCard
                key={row.id}
                row={row}
                onMenuOpen={handleOpenMenu}
                tagConfig={getIndustryTagProps(row.industry)}
              />
            ))}

            {/* Simple Pagination for Mobile */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 3, pt: 2 }}>
              <IconButton size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
                <ChevronLeftIcon style={{ width: 20, height: 20 }} />
              </IconButton>
              <Typography variant="body2" fontWeight={600}>
                Page 1
              </Typography>
              <IconButton
                size="small"
                sx={{ bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } }}
              >
                <ChevronRightIcon style={{ width: 20, height: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{ sx: { ...ADMIN_CARD_SX, minWidth: 200 } }}
      >
        <MenuItem onClick={handleViewDeepDive} sx={{ borderRadius: 2, mx: 1, fontSize: "0.8125rem" }}>
          <Box component="span" sx={{ mr: 1, display: "inline-flex" }}>
            <UserIcon style={{ width: 18, height: 18 }} />
          </Box>
          View Profile
        </MenuItem>
        <MenuItem onClick={handleLoginAs} sx={{ borderRadius: 2, mx: 1, fontSize: "0.8125rem" }}>
          <Box component="span" sx={{ mr: 1, display: "inline-flex" }}>
            <ArrowTopRightOnSquareIcon style={{ width: 18, height: 18 }} />
          </Box>
          Impersonate
        </MenuItem>
        <MenuItem onClick={handleCloseMenu} sx={{ borderRadius: 2, mx: 1, fontSize: "0.8125rem", color: "error.main" }}>
          <Box component="span" sx={{ mr: 1, display: "inline-flex" }}>
            <PowerIcon style={{ width: 18, height: 18 }} />
          </Box>
          Toggle Access
        </MenuItem>
      </Menu>

      <NewRecruiterModal
        open={newRecruiterOpen}
        onClose={() => setNewRecruiterOpen(false)}
        onSuccess={() => {
          setNewRecruiterOpen(false);
          // Trigger a refresh of the recruiters list
          window.location.reload();
        }}
      />
    </Box>
  );
}
