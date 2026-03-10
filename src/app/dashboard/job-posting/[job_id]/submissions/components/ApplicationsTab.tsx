"use client";
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Button,
  CircularProgress,
  Stack,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Menu,
  Divider,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeMosaicOutlinedIcon from '@mui/icons-material/AutoAwesomeMosaicOutlined';
import FilterSection from "@/app/dashboard/components/FilterSection";
import CandidateListSection from "@/app/dashboard/components/dashboard/CandidatesListSection";
import MobileCandidateGrid from "@/app/dashboard/components/MobileCandidateGrid";
import MobileStageDropdown from "@/app/dashboard/components/MobileStageDropdown";
import CandidateSkeletonLoader from "@/app/dashboard/components/CandidateSkeletonLoader";
import EmptyState from "@/app/dashboard/components/EmptyState";
import {
  FilterState,
  CandidateResponse,
  StageType,
  Assessment,
  PhaseOption,
} from "@/app/dashboard/types/candidate";

interface ApplicationsTabProps {
  theme: any;
  loading: boolean;
  stageTotals: any;
  subTabValue: number;
  handleSubTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  isFilterExpanded: boolean;
  setIsFilterExpanded: (value: boolean) => void;
  filters: FilterState;
  availableSkills: any[];
  handleFilterChange: (name: keyof FilterState, value: string | string[]) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  hasActiveFilters: () => boolean;
  filterMenuAnchor: HTMLElement | null;
  handleFilterMenuClose: () => void;
  filteredCandidates: CandidateResponse;
  selectedEntries: string[];
  setSelectedEntries: (ids: string[]) => void;
  handleExportCVs: () => void;
  bulkActionsAnchor: HTMLElement | null;
  handleBulkActionsOpen: (event: React.MouseEvent<HTMLElement>) => void;
  handleBulkActionsClose: () => void;
  getStageValue: (tabValue: number) => StageType;
  dynamicPhaseOptions: Record<StageType, PhaseOption[]>;
  openEmailModalForAction: (action: string) => void;
  isMovingStage: string;
  selectedAssessmentType: number;
  setSelectedAssessmentType: (value: number) => void;
  assessments: Assessment[];
  handleSelectCandidate: (id: string | number) => void;
  handleCardClick: (id: string | number, event: React.MouseEvent<HTMLElement>) => void;
  handleNotification: (message: string, severity: "success" | "error") => void;
  page: number;
  totalPages: number;
  handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  perPage: number;
  setPerPage: (value: number) => void;
  setPage: (value: number) => void;
  getSkillChipColor: (skill: string) => { bg: string; color: string };
  // Email Modal Props
  emailModalOpen: boolean;
  setEmailModalOpen: (value: boolean) => void;
  emailLoading: boolean;
  emailContent: string;
  setEmailContent: (value: string) => void;
  emailError: string;
  handleSendBulkEmailAndMoveStage: () => Promise<void>;
  pendingAction: string | null;
  quillModules: any;
  quillFormats: any;
  ReactQuill: any;
}

export default function ApplicationsTab({
  theme,
  loading,
  stageTotals,
  subTabValue,
  handleSubTabChange,
  isFilterExpanded,
  setIsFilterExpanded,
  filters,
  availableSkills,
  handleFilterChange,
  clearFilters,
  applyFilters,
  hasActiveFilters,
  filterMenuAnchor,
  handleFilterMenuClose,
  filteredCandidates,
  selectedEntries,
  setSelectedEntries,
  handleExportCVs,
  bulkActionsAnchor,
  handleBulkActionsOpen,
  handleBulkActionsClose,
  getStageValue,
  dynamicPhaseOptions,
  openEmailModalForAction,
  isMovingStage,
  selectedAssessmentType,
  setSelectedAssessmentType,
  assessments,
  handleSelectCandidate,
  handleCardClick,
  handleNotification,
  page,
  totalPages,
  handlePageChange,
  perPage,
  setPerPage,
  setPage,
  getSkillChipColor,
  emailModalOpen,
  setEmailModalOpen,
  emailLoading,
  emailContent,
  setEmailContent,
  emailError,
  handleSendBulkEmailAndMoveStage,
  pendingAction,
  quillModules,
  quillFormats,
  ReactQuill,
}: ApplicationsTabProps) {
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(5, 1fr)",
          },
          gap: 2,
          mt: 2,
          mb: 1,
          width: "100%",
        }}
      >
        {[
          { label: "Application Review", value: stageTotals.new, color: "#4444E2" },
          { label: "Skill Assessment", value: stageTotals.skill_assessment, color: "#2B656E" },
          { label: "Interviews", value: stageTotals.interviews, color: "#76325F" },
          { label: "Acceptance", value: stageTotals.acceptance, color: "#1B5E20" },
          { label: "Archived", value: stageTotals.archived, color: "#724A3B" },
        ].map((card, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: "white",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                borderColor: card.color + "40",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "10px",
              }}
            >
              {card.label}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: card.color }}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {card.value === 1 ? "candidate" : "candidates"}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Stack
        direction="row"
        maxWidth={"100%"}
        gap={isFilterExpanded ? 3 : 0}
        sx={{ position: "relative" }}
      >
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            width: isFilterExpanded ? 308 : 0,
            transition: "width 0.3s ease-in-out",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box sx={{ width: 308, pt: 4, bgcolor: "#FFFFFF", borderRadius: 2 }}>
            <FilterSection
              filters={filters}
              availableSkills={availableSkills}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onApplyFilters={applyFilters}
              hasActiveFilters={hasActiveFilters}
              sx={{ p: 2 }}
            />
          </Box>
        </Box>

        {isFilterExpanded && (
          <IconButton
            onClick={() => setIsFilterExpanded(false)}
            sx={{
              position: "absolute",
              left: 260,
              top: 10,
              zIndex: 20,
              color: theme.palette.grey[200],
              "&:hover": { color: theme.palette.secondary.main },
            }}
          >
            <MenuOpenIcon />
          </IconButton>
        )}

        {/* Mobile Filter Dialog */}
        <FilterSection
          filters={filters}
          availableSkills={availableSkills}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onApplyFilters={applyFilters}
          hasActiveFilters={hasActiveFilters}
          isMobile
          open={Boolean(filterMenuAnchor)}
          onClose={handleFilterMenuClose}
          sx={{ bgcolor: "#FFFFFF", p: 2 }}
        />

        <Box sx={{ flex: 1, width: "80%", py: 0, bg: "#ffffff", marginTop: "10px" }}>
          {!isFilterExpanded && (
            <IconButton
              onClick={() => setIsFilterExpanded(true)}
              sx={{
                position: "absolute",
                left: 0,
                top: "2",
                color: "rgba(17, 17, 17, 0.68)",
                zIndex: 50,
                "&:hover": { bgcolor: "transparent" },
              }}
            >
              <AutoAwesomeMosaicOutlinedIcon sx={{ height: "30px", width: "30px" }} />
            </IconButton>
          )}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: "#ffffff !important",
              borderRadius: "10px",
              paddingX: "20px",
            }}
          >
            {/* Tabs for large screens */}
            <Box sx={{ display: { xs: "none", lg: "block" }, px: { lg: 4 } }}>
              <Tabs
                value={subTabValue}
                onChange={handleSubTabChange}
                indicatorColor="secondary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="submission tabs"
                sx={{
                  alignItems: "center",
                  "& .MuiTabs-flexContainer": { justifyContent: "space-between" },
                  "& .MuiTab-root": {
                    transition: "all 0.2s ease-in-out",
                    minWidth: "auto",
                    px: 1.5,
                    whiteSpace: "nowrap",
                    "&:hover": { color: theme.palette.secondary.main },
                  },
                }}
              >
                {["All", "Application Review", "Skill assessment", "Interviews", "Acceptance", "Archived"].map((label, index) => (
                  <Tab
                    key={index}
                    label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><span>{label}</span></Box>}
                    sx={{
                      textTransform: "none",
                      color: subTabValue === index ? theme.palette.grey[100] : theme.palette.grey[200],
                      minWidth: "auto",
                      px: 1,
                      whiteSpace: "nowrap",
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Mobile Dropdown */}
            <MobileStageDropdown
              subTabValue={subTabValue}
              stageTotals={stageTotals}
              onTabChange={handleSubTabChange}
              onFilterClick={() => {}} // This would need to be passed correctly if used
            />
          </Box>

          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              bgcolor: "transparent",
              borderRadius: 2,
              position: "relative",
              height: `calc(170vh - 270px)`,
            }}
          >
            {/* Select All and Bulk Actions */}
            {filteredCandidates?.applications?.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 1,
                  my: 2,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                  {(() => {
                    const allVisibleIds = filteredCandidates?.applications?.map((c) => String(c.id)) || [];
                    const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedEntries?.includes(id));
                    return (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (allSelected) {
                            setSelectedEntries([]);
                          } else {
                            setSelectedEntries(allVisibleIds);
                          }
                        }}
                        sx={{
                          width: "max-content",
                          flexWrap: "nowrap",
                          py: 1,
                          px: 1.5,
                          color: "rgba(17, 17, 17, 0.84)",
                          borderColor: "rgba(17, 17, 17, 0.12)",
                          "&:hover": { borderColor: "rgba(17, 17, 17, 0.24)" },
                        }}
                      >
                        {allSelected ? "Clear selection" : "Select all candidates"}
                      </Button>
                    );
                  })()}
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportCVs}
                    sx={{
                      color: "rgba(17, 17, 17, 0.84)",
                      borderColor: "rgba(17, 17, 17, 0.12)",
                      textTransform: "none",
                      fontWeight: 500,
                      py: 0.5,
                      px: 1.5,
                      "&:hover": { borderColor: "rgba(17, 17, 17, 0.24)", bgcolor: "rgba(0, 0, 0, 0.04)" },
                    }}
                  >
                    Export Candidates ({selectedEntries.length})
                  </Button>

                  {selectedEntries?.length > 0 && subTabValue !== 4 && (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <IconButton
                        onClick={handleBulkActionsOpen}
                        sx={{
                          color: "rgba(17, 17, 17, 0.84)",
                          bgcolor: "rgba(0, 0, 0, 0.04)",
                          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={bulkActionsAnchor}
                        open={Boolean(bulkActionsAnchor)}
                        onClose={handleBulkActionsClose}
                        PaperProps={{
                          sx: { mt: 1, minWidth: 220, borderRadius: "12px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" },
                        }}
                      >
                        <MenuItem disabled sx={{ opacity: "1 !important" }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {selectedEntries.length} candidates selected
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setSelectedEntries([]);
                            handleBulkActionsClose();
                          }}
                        >
                          <ListItemIcon><CloseIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Clear selection" />
                        </MenuItem>
                        <Divider />
                        {dynamicPhaseOptions[getStageValue(subTabValue)]?.map((option) => (
                          <MenuItem
                            key={option.action}
                            onClick={() => {
                              openEmailModalForAction(option.action);
                              handleBulkActionsClose();
                            }}
                            disabled={isMovingStage.length > 0}
                          >
                            <ListItemIcon>
                              {isMovingStage === option.action ? (
                                <CircularProgress size={20} />
                              ) : (
                                <option.icon fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText primary={option.label} />
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Assessment Tabs */}
            {subTabValue === 2 && (
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs
                  value={selectedAssessmentType}
                  onChange={(_, newValue) => setSelectedAssessmentType(newValue)}
                  aria-label="skill assessment tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    "& .MuiTabs-indicator": { backgroundColor: theme.palette.secondary.main },
                    "& .MuiTab-root": { minWidth: "auto", px: 1.5, whiteSpace: "nowrap" },
                  }}
                >
                  <Tab
                    label="All"
                    sx={{
                      textTransform: "none",
                      color: theme.palette.grey[100],
                      "&.Mui-selected": { color: theme.palette.secondary.main },
                    }}
                  />
                  {assessments?.map((assessment, index) => {
                    const title = assessment.title || assessment.type.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                    let label = title;
                    if (assessment.type.includes("online_assessment")) {
                      label = `Quiz (${title})`;
                    } else if (assessment.type === "technical_assessment") {
                      label = `Technical (${title})`;
                    }
                    return (
                      <Tab
                        key={index}
                        label={label}
                        sx={{
                          textTransform: "none",
                          color: theme.palette.grey[100],
                          "&.Mui-selected": { color: theme.palette.secondary.main },
                        }}
                      />
                    );
                  })}
                </Tabs>
              </Box>
            )}

            {loading ? (
              <CandidateSkeletonLoader />
            ) : filteredCandidates?.applications?.length === 0 ? (
              <EmptyState
                subTabValue={subTabValue}
                assessmentType={subTabValue === 1 ? assessments[selectedAssessmentType]?.type : undefined}
              />
            ) : (
              <>
                {/* Desktop View */}
                <Box
                  sx={{
                    maxWidth: "100%",
                    width: "100%",
                    overflowX: "hidden",
                    height: "100%",
                    pt: 0,
                    pb: 2,
                    display: { xs: "none", lg: "block" },
                  }}
                >
                  {filteredCandidates?.applications?.map((candidate) => (
                    <Box
                      width={"100%"}
                      key={candidate.id}
                      sx={{
                        backgroundColor: "white",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <CandidateListSection
                        isQuickActionsVisible={true}
                        isCheckboxVisible={true}
                        candidate={candidate}
                        isSelected={selectedEntries?.includes(String(candidate.id))}
                        onSelectCandidate={handleSelectCandidate}
                        onUpdateStages={(action) => openEmailModalForAction(action)}
                        currentStage={getStageValue(subTabValue)}
                        selectedEntries={selectedEntries}
                        setSelectedEntries={setSelectedEntries}
                        onNotification={handleNotification}
                        phaseOptions={dynamicPhaseOptions}
                      />
                    </Box>
                  ))}
                </Box>
                <MobileCandidateGrid
                  candidates={(filteredCandidates?.applications || []).map((app) => ({
                    id: app.id,
                    name: `${app.personal_info?.firstname || ""} ${app.personal_info?.lastname || ""}`.trim(),
                    email: "",
                    phone: "",
                    cv_url: app.attachments?.cv || "",
                    status: "",
                    created_at: "",
                    professional_info: {
                      experience_years: Number(app.professional_info?.experience) || 0,
                      skills: app.professional_info?.skills || "",
                      education: [],
                      start_date: app.professional_info?.start_date || "",
                    },
                    cv_analysis: app.cv_analysis ? {
                      experience_years: app.cv_analysis.experience_years,
                      skills: app.cv_analysis.skills || [],
                      education: app.cv_analysis.education || [],
                      match_score: app.cv_analysis.match_score,
                      summary: app.cv_analysis.summary,
                      skills_match: app.cv_analysis.skills_match,
                      missing_skills: app.cv_analysis.missing_skills,
                      education_level: app.cv_analysis.education_level,
                      recommendations: app.cv_analysis.recommendations,
                    } : undefined,
                    attachments: app.attachments,
                  }))}
                  selectedEntries={selectedEntries}
                  subTabValue={subTabValue}
                  isMovingStage={isMovingStage}
                  getStageValue={getStageValue}
                  handleSelectCandidate={handleSelectCandidate}
                  handleCardClick={handleCardClick}
                  handleUpdateStages={openEmailModalForAction}
                  getSkillChipColor={getSkillChipColor}
                  theme={theme}
                />
              </>
            )}

            {/* Pagination controls */}
            {totalPages > 0 && (
              <Box sx={{ mx: "auto", display: "flex", alignItems: "start", justifyContent: "space-between", mt: 3, mb: 0 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      "& .MuiPaginationItem-root": { fontSize: "16px", fontWeight: 500 },
                      "& .Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": { backgroundColor: "primary.dark" },
                      },
                    }}
                  />
                  <Typography variant="body2" color="grey.200" align="center" sx={{ mb: 3 }}>
                    Showing <span style={{ fontWeight: 600 }}>{(page - 1) * perPage + 1}</span> to{" "}
                    <span style={{ fontWeight: 600 }}>{Math.min(page * perPage, filteredCandidates?.total || 0)}</span> of{" "}
                    <span style={{ fontWeight: 600 }}>{filteredCandidates?.total || 0}</span> entries
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="grey.200">Show per Page:</Typography>
                  <FormControl size="small" sx={{ minWidth: 72, borderRadius: "1000px" }}>
                    <Select
                      value={perPage}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setPerPage(next);
                        setPage(1);
                      }}
                    >
                      {[5, 10, 20, 30, 50].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Custom Email Modal - Extracted here as it's mostly related to Applications actions */}
          <Dialog open={emailModalOpen} onClose={() => setEmailModalOpen(false)} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 600, color: "rgba(17, 17, 17, 0.92)" }}>
              {pendingAction ? `Send email for ${(() => {
                const matched = assessments.find((a: any) => a.id === pendingAction);
                return matched ? (matched as any).title || (matched as any).type.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : pendingAction.replace("_", " ");
              })()}` : "Send Email"}
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: theme.palette.background.paper }}>
              {emailLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
              ) : (
                <Box
                  sx={{
                    "& .quill": {
                      bgcolor: "#FFF",
                      borderRadius: "8px",
                      border: "0.8px solid rgba(17, 17, 17, 0.14)",
                      transition: "all 0.3s ease",
                      "&:focus-within": {
                        border: `0.8px solid ${theme.palette.primary.main}`,
                        boxShadow: `0 0 0 1px ${theme.palette.primary.main}25`,
                      },
                      "& .ql-toolbar": { borderTopLeftRadius: "8px", borderTopRightRadius: "8px", border: "none", borderBottom: "0.8px solid rgba(17, 17, 17, 0.14)" },
                      "& .ql-container": { border: "none", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" },
                    },
                  }}
                >
                  {ReactQuill && (
                    <ReactQuill
                      className="quill"
                      theme="snow"
                      value={emailContent}
                      onChange={setEmailContent}
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  )}
                </Box>
              )}
              {emailError && <Alert severity="error" sx={{ mt: 2 }}>{emailError}</Alert>}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setEmailModalOpen(false)} variant="outlined" color="primary">Cancel</Button>
              <Button
                onClick={handleSendBulkEmailAndMoveStage}
                variant="contained"
                color="secondary"
                disabled={emailLoading || !emailContent}
              >
                {emailLoading ? <CircularProgress size={20} color="inherit" /> : "Send"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Stack>
    </>
  );
}
