"use client";

import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Divider, CircularProgress } from "@mui/material";
import DashboardCard from "@/app/dashboard/components/shared/DashboardCard";
import { useTheme } from "@mui/material/styles";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { useRouter } from "next/navigation";

interface AssessmentItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: string;
  type?: string;
}

interface AssessmentProps {
  customStyle?: React.CSSProperties;
  assessments: AssessmentItem[];
  loading: boolean;
  error: string | null;
}

const Assessment: React.FC<AssessmentProps> = ({ customStyle, assessments, loading, error }) => {
  const theme = useTheme();
  const router = useRouter();
  const handleSeeAll = () => {
    router.push("/dashboard/assessments");
  };

  return (
    <DashboardCard customStyle={{ padding: "0px", background: "#fff", ...customStyle }}>
      <Box>
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "rgba(17, 17, 17, 0.92)",
              fontSize: 24,
              lineHeight: "24px",
              letterSpacing: "0.36px",
            }}
          >
            Assessments
          </Typography>

          {assessments.length > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
              onClick={handleSeeAll}
            >
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.secondary.main,
                  fontSize: 14,
                  lineHeight: "14px",
                  letterSpacing: "0.14px",
                  mr: 0.5,
                }}
              >
                See all
              </Typography>
              <ArrowForwardOutlined sx={{ color: "secondary.main", width: 20, height: 20 }} />
            </Box>
          )}
        </Box>

        <List
          sx={{
            height: "calc(300px - 70px)",
            width: "100%",
            bgcolor: "background.paper",
            p: 0,
            maxHeight: 350,
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
          {error ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : assessments.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Typography color="grey.200">Your recent assessments will appear here</Typography>
            </Box>
          ) : (
            assessments.map((assessment, index) => (
              <React.Fragment key={assessment.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    // p: 2,
                    backgroundColor: "#fff",
                    "&:hover": {
                      backgroundColor: "#f7f8fc",
                      cursor: "pointer",
                    },
                  }}
                  onClick={() =>
                    router.push(
                      `/dashboard/assessments/new?type=${encodeURIComponent(assessment.type || "")}&id=${encodeURIComponent(assessment.id)}`,
                    )
                  }
                >
                  <Box
                    sx={{
                      mr: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "secondary.light",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H14C14.41 1.25 14.75 1.59 14.75 2C14.75 2.41 14.41 2.75 14 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V10C21.25 9.59 21.59 9.25 22 9.25C22.41 9.25 22.75 9.59 22.75 10V15C22.75 20.43 20.43 22.75 15 22.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M22 10.75H18C14.58 10.75 13.25 9.41999 13.25 5.99999V1.99999C13.25 1.69999 13.43 1.41999 13.71 1.30999C13.99 1.18999 14.31 1.25999 14.53 1.46999L22.53 9.46999C22.74 9.67999 22.81 10.01 22.69 10.29C22.57 10.57 22.3 10.75 22 10.75ZM14.75 3.80999V5.99999C14.75 8.57999 15.42 9.24999 18 9.24999H20.19L14.75 3.80999Z"
                        fill="#292D32"
                      />
                      <path
                        d="M13 13.75H7C6.59 13.75 6.25 13.41 6.25 13C6.25 12.59 6.59 12.25 7 12.25H13C13.41 12.25 13.75 12.59 13.75 13C13.75 13.41 13.41 13.75 13 13.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M11 17.75H7C6.59 17.75 6.25 17.41 6.25 17C6.25 16.59 6.59 16.25 7 16.25H11C11.41 16.25 11.75 16.59 11.75 17C11.75 17.41 11.41 17.75 11 17.75Z"
                        fill="#292D32"
                      />
                    </svg>
                  </Box>
                  <ListItemText
                    primary={
                      <Typography
                        component="span"
                        variant="subtitle1"
                        sx={{
                          color: "rgba(17, 17, 17, 0.92)",
                          fontWeight: 500,
                          fontSize: "15px",
                          lineHeight: "20px",
                          mb: 0.5,
                        }}
                      >
                        {assessment.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {assessment.description && (
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: "rgba(17, 17, 17, 0.6)",
                              fontSize: "13px",
                              lineHeight: "16px",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            {assessment.description}
                          </Typography>
                        )}
                        {assessment.date && (
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: "rgba(17, 17, 17, 0.6)",
                              fontSize: "13px",
                              lineHeight: "16px",
                              display: "block",
                            }}
                          >
                            {assessment.date}
                          </Typography>
                        )}
                        {assessment.status && (
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: theme.palette.primary.main,
                              fontSize: "13px",
                              lineHeight: "16px",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            {assessment.status}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < assessments.length - 1 && (
                  <Divider
                    component="li"
                    sx={{
                      borderColor: "rgba(17, 17, 17, 0.08)",
                      mx: 2,
                    }}
                  />
                )}
              </React.Fragment>
            ))
          )}
        </List>
      </Box>
    </DashboardCard>
  );
};

export default Assessment;
