"use client";
import React from "react";
import { Box, Paper, List, ListItem, Typography, Stack } from "@mui/material";

interface ApplicantListItem {
  id: string | number;
  personal_info: {
    firstname: string;
    lastname: string;
    location?: string;
  };
  professional_info: {
    experience: string;
    salary_range: string;
    start_date: string;
  };
}

interface SidebarProps {
  applicants: ApplicantListItem[];
  currentApplicantId: string | number | null;
  onApplicantClick: (id: string) => void;
}

export default function Sidebar({ applicants, currentApplicantId, onApplicantClick }: SidebarProps) {
  return (
    <Box
      sx={{
        display: { xs: "none", lg: "block" },
        width: "30%",
        position: "sticky",
        top: "32px",
        height: "fit-content",
        alignSelf: "flex-start",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          height: "70vh",
          borderRadius: 2,
          bgcolor: "#fff",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#032B4420 transparent",
          "&::-webkit-scrollbar": {
            height: "4px",
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#032B44",
            width: "4px",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(68, 68, 226, 0.3)",
            },
          },
        }}
      >
        <List
          sx={{
            textOverflow: "wrap",
            p: 0,
            overflowX: "hidden",
          }}
        >
          {applicants.map((item) => (
            <ListItem
              key={item.id}
              sx={{
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "24px 16px",
                cursor: "pointer",
                borderBottom: "0.8px solid rgba(17, 17, 17, 0.08)",
                bgcolor: String(item.id) === String(currentApplicantId) ? "rgba(68, 68, 226, 0.04)" : "transparent",
                border: String(item.id) === String(currentApplicantId) ? "1px solid" : "none",
                borderColor: String(item.id) === String(currentApplicantId) ? "secondary.main" : "transparent",
                borderLeft: String(item.id) === String(currentApplicantId) ? "5px solid" : "none",
                borderLeftColor: String(item.id) === String(currentApplicantId) ? "secondary.main" : "transparent",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.02)",
                },
                opacity: String(item.id) === String(currentApplicantId) ? 1 : 0.68,
              }}
              onClick={() => {
                onApplicantClick(String(item.id));
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: "18px",
                  color: String(item.id) === String(currentApplicantId) ? "secondary.main" : "text.grey[100]",
                  mb: 1,
                  textTransform: "capitalize",
                }}
              >
                {item.personal_info.firstname} {item.personal_info.lastname}
              </Typography>

              <Stack width="100%" direction="row" flexWrap="wrap" gap={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
                      fill="#292D32"
                    />
                    <path
                      d="M15.7101 15.93C15.5801 15.93 15.4501 15.9 15.3301 15.82L12.2301 13.97C11.4601 13.51 10.8901 12.5 10.8901 11.61V7.51001C10.8901 7.10001 11.2301 6.76001 11.6401 6.76001C12.0501 6.76001 12.3901 7.10001 12.3901 7.51001V11.61C12.3901 11.97 12.6901 12.5 13.0001 12.68L16.1001 14.53C16.4601 14.74 16.5701 15.2 16.3601 15.56C16.2101 15.8 15.9601 15.93 15.7101 15.93Z"
                      fill="#292D32"
                    />
                  </svg>
                  <Typography
                    sx={{
                      color: "rgba(17, 17, 17, 0.68)",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "100%",
                      letterSpacing: "0.16px",
                      width: "max-content",
                    }}
                  >
                    Available{" "}
                    {new Date(item.professional_info.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12.0001 22.76C10.5201 22.76 9.03005 22.2 7.87005 21.09C4.92005 18.25 1.66005 13.72 2.89005 8.33C4.00005 3.44 8.27005 1.25 12.0001 1.25C12.0001 1.25 12.0001 1.25 12.0101 1.25C15.7401 1.25 20.0101 3.44 21.1201 8.34C22.3401 13.73 19.0801 18.25 16.1301 21.09C14.9701 22.2 13.4801 22.76 12.0001 22.76ZM12.0001 2.75C9.09005 2.75 5.35005 4.3 4.36005 8.66C3.28005 13.37 6.24005 17.43 8.92005 20C10.6501 21.67 13.3601 21.67 15.0901 20C17.7601 17.43 20.7201 13.37 19.6601 8.66C18.6601 4.3 14.9101 2.75 12.0001 2.75Z"
                      fill="#292D32"
                    />
                  </svg>
                  <Typography
                    sx={{
                      color: "rgba(17, 17, 17, 0.68)",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "100%",
                      letterSpacing: "0.16px",
                      width: "max-content",
                    }}
                  >
                    {item.personal_info.location || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6.66685 18.3333H13.3335C16.6835 18.3333 17.2835 16.9917 17.4585 15.3583L18.0835 8.69167C18.3085 6.65833 17.7252 5 14.1668 5H5.83351C2.27518 5 1.69185 6.65833 1.91685 8.69167L2.54185 15.3583C2.71685 16.9917 3.31685 18.3333 6.66685 18.3333Z"
                      stroke="#111111"
                      strokeOpacity="0.62"
                      strokeWidth="1.25"
                    />
                  </svg>
                  <Typography
                    sx={{
                      color: "rgba(17, 17, 17, 0.68)",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "100%",
                      letterSpacing: "0.16px",
                      width: "max-content",
                    }}
                  >
                    {item.professional_info.experience} experience
                  </Typography>
                </Box>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
