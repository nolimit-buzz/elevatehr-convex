"use client";
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Button,
  Chip,
  Pagination,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import AutoAwesomeMosaicOutlinedIcon from '@mui/icons-material/AutoAwesomeMosaicOutlined';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { CandidateResponse } from "@/app/dashboard/types/candidate";
import CandidateSkeletonLoader from "@/app/dashboard/components/CandidateSkeletonLoader";

interface CVRepositoryTabProps {
  loading: boolean;
  candidates: CandidateResponse;
  cvViewMode: "grid" | "list";
  setCvViewMode: (mode: "grid" | "list") => void;
  cvCardMenuAnchor: {
    el: HTMLElement;
    appId: string;
    cvUrl: string;
    name: string;
  } | null;
  setCvCardMenuAnchor: (anchor: {
    el: HTMLElement;
    appId: string;
    cvUrl: string;
    name: string;
  } | null) => void;
  selectedEntries: string[];
  totalPages: number;
  page: number;
  handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

export default function CVRepositoryTab({
  loading,
  candidates,
  cvViewMode,
  setCvViewMode,
  cvCardMenuAnchor,
  setCvCardMenuAnchor,
  selectedEntries,
  totalPages,
  page,
  handlePageChange,
}: CVRepositoryTabProps) {
  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        p: { xs: 3, md: 4 },
        minHeight: 480,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "rgba(17,17,17,0.84)" }}>
            CV Repository
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(17,17,17,0.54)", mt: 0.5 }}>
            All CVs submitted for this role in one place.
          </Typography>
        </Box>

        {/* Right controls: view toggle + export */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <IconButton
              size="small"
              onClick={() => setCvViewMode("list")}
              sx={{
                borderRadius: 0,
                px: 1.5,
                py: 1,
                bgcolor: cvViewMode === "list" ? "rgba(68,68,226,0.1)" : "transparent",
                color: cvViewMode === "list" ? "#4444E2" : "rgba(17,17,17,0.54)",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "rgba(68,68,226,0.06)" },
              }}
            >
              <ViewListIcon fontSize="small" />
            </IconButton>
            <Box sx={{ width: "1px", height: 24, bgcolor: "rgba(0,0,0,0.12)" }} />
            <IconButton
              size="small"
              onClick={() => setCvViewMode("grid")}
              sx={{
                borderRadius: 0,
                px: 1.5,
                py: 1,
                bgcolor: cvViewMode === "grid" ? "rgba(68,68,226,0.1)" : "transparent",
                color: cvViewMode === "grid" ? "#4444E2" : "rgba(17,17,17,0.54)",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "rgba(68,68,226,0.06)" },
              }}
            >
              <AutoAwesomeMosaicOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Content area */}
      {loading ? (
        <CandidateSkeletonLoader />
      ) : candidates.applications.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 2,
            color: "rgba(17,17,17,0.38)",
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 56, opacity: 0.3 }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            No CVs found for this job yet.
          </Typography>
        </Box>
      ) : cvViewMode === "grid" ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)",
            },
            gap: 1,
          }}
        >
          {candidates.applications.map((app: any) => {
            const name = `${app.personal_info?.firstname || ""} ${app.personal_info?.lastname || ""}`.trim() || "Unknown";
            const cvUrl = app.attachments?.cv;
            const isSelected = selectedEntries.includes(String(app.id));

            return (
              <Box
                key={app.id}
                sx={{
                  borderRadius: "5px",
                  // border: isSelected ? "2px solid #4444E2" : "1px solid rgba(0,0,0,0.10)",
                  bgcolor: "#fff",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  width: 300,
                  boxShadow: isSelected ? "0 0 0 3px rgba(68,68,226,0.15)" : "0px 2px 6px rgba(0,0,0,0.04)",
                  "&:hover": { bgcolor: "rgba(68,68,226,0.04)" },
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <PictureAsPdfIcon
                      sx={{
                        fontSize: 18,
                        color: cvUrl ? "#E53935" : "rgba(17,17,17,0.3)",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "rgba(17,17,17,0.84)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: 13,
                      }}
                    >
                      {`${name} CV`}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (cvUrl) {
                        setCvCardMenuAnchor({
                          el: e.currentTarget,
                          appId: String(app.id),
                          cvUrl,
                          name,
                        });
                      }
                    }}
                    disabled={!cvUrl}
                    sx={{ ml: 0.5, flexShrink: 0, color: "rgba(17,17,17,0.48)", "&:hover": { color: "#4444E2" } }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    height: 200,
                    position: "relative",
                    // bgcolor: cvUrl ? "#F7F7FF" : "#F5F5F5",
                    bgcolor: "#fafafa",
                    overflow: "hidden",
                  }}
                >
                  {cvUrl ? (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        borderRadius: "5px",
                        p: 4,
                      }}
                    >
                      <PictureAsPdfIcon
                        sx={{
                          fontSize: 64,
                          color: "#E53935",
                          filter: "drop-shadow(0 2px 8px rgba(229,57,53,0.25))",
                        }}
                      />
                      <Typography variant="caption" sx={{ color: "rgba(17,17,17,0.48)", fontWeight: 600, fontSize: 11 }}>
                        PDF FILE
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        color: "rgba(17,17,17,0.28)",
                      }}
                    >
                      <PictureAsPdfIcon sx={{ fontSize: 48 }} />
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        No CV uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}

          <Menu
            anchorEl={cvCardMenuAnchor?.el}
            open={Boolean(cvCardMenuAnchor)}
            onClose={() => setCvCardMenuAnchor(null)}
            PaperProps={{
              sx: { mt: 1, minWidth: 190, borderRadius: "10px", boxShadow: "0px 4px 20px rgba(0,0,0,0.1)" },
            }}
          >
            <MenuItem
              onClick={() => {
                if (cvCardMenuAnchor?.cvUrl) window.open(cvCardMenuAnchor.cvUrl, "_blank");
                setCvCardMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <OpenInNewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="View CV" />
            </MenuItem>
            <MenuItem
              onClick={async () => {
                if (!cvCardMenuAnchor) return;
                const { cvUrl, name } = cvCardMenuAnchor;
                try {
                  const res = await fetch(cvUrl);
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `CV_${name}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                } catch {
                  window.open(cvUrl, "_blank");
                }
                setCvCardMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <FileDownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Download CV" />
            </MenuItem>
          </Menu>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {candidates.applications.map((app: any) => {
            const name = `${app.personal_info?.firstname || ""} ${app.personal_info?.lastname || ""}`.trim() || "Unknown";
            const cvUrl = app.attachments?.cv;
            const isSelected = selectedEntries.includes(String(app.id));
            return (
              <Box
                key={app.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 3,
                  py: 2,
                  borderRadius: "12px",
                  bgcolor: "#fafafa",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(68,68,226,0.04)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {/* <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: isSelected ? "#4444E2" : "#E8E8F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 15,
                      color: isSelected ? "#fff" : "#4444E2",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </Box> */}
                     <PictureAsPdfIcon
                        sx={{
                          fontSize: 30,
                          color: "#E53935",
                          filter: "drop-shadow(0 2px 8px rgba(229,57,53,0.25))",
                        }}
                      />
                  
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "rgba(17,17,17,0.84)" }}>
                      {name}
                    </Typography>
                    {/* <Typography variant="caption" sx={{ color: "rgba(17,17,17,0.48)" }}>
                      {app.professional_info?.current_role || app.stage || "Applicant"}
                    </Typography> */}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }} onClick={(e) => e.stopPropagation()}>
                  {cvUrl ? (
                    <>
                      <Chip
                        label="CV available"
                        size="small"
                        sx={{ bgcolor: "rgba(43,101,110,0.1)", color: "#2B656E", fontWeight: 600, fontSize: 11 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                        href={cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        component="a"
                        sx={{
                          textTransform: "none",
                          borderRadius: "8px",
                          fontWeight: 500,
                          borderColor: "rgba(17,17,17,0.16)",
                          color: "rgba(17,17,17,0.72)",
                          "&:hover": { borderColor: "#4444E2", color: "#4444E2" },
                        }}
                      >
                        View CV
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
                        onClick={async () => {
                          try {
                            const res = await fetch(cvUrl);
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `CV_${name}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } catch {
                            window.open(cvUrl, "_blank");
                          }
                        }}
                        sx={{
                          textTransform: "none",
                          borderRadius: "8px",
                          fontWeight: 500,
                          borderColor: "rgba(17,17,17,0.16)",
                          color: "rgba(17,17,17,0.72)",
                          "&:hover": { borderColor: "#4444E2", color: "#4444E2" },
                        }}
                      >
                        Download CV
                      </Button>
                    </>
                  ) : (
                    <Chip
                      label="No CV"
                      size="small"
                      sx={{ bgcolor: "rgba(17,17,17,0.06)", color: "rgba(17,17,17,0.38)", fontWeight: 500, fontSize: 11 }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
