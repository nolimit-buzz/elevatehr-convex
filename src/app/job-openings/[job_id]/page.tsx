"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Container, Box, Stack, Typography, styled, Chip, Button, Grid, Skeleton, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import metaData from "@/utils/metadata";
import { usePublicJob, usePublicCompany } from "@/queries/jobs.queries";
export const dynamic = "force-dynamic";

// Helper function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  // Remove HTML tags and decode HTML entities
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

const Banner = styled(Box)(({ theme }) => ({
  width: "100%",
  background: theme.palette.primary.main,
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "28px",
}));

const Pill = styled(Chip)(({ theme }) => ({
  padding: "10px 12px",
  borderRadius: "20px",
  height: "36px",
  "&.MuiChip-root": {
    "&.job-type": {
      backgroundColor: "#FCEBE3",
      color: "#724A3B",
      "& .MuiChip-label": {
        fontSize: "14px",
        fontWeight: 400,
      },
    },
    "&.work-model": {
      backgroundColor: "#F9E8F3",
      color: "#76325F",
      "& .MuiChip-label": {
        fontSize: "14px",
        fontWeight: 400,
      },
    },
    "&.location": {
      backgroundColor: "#D7EEF4",
      color: "#2B656E",
      "& .MuiChip-label": {
        fontSize: "14px",
        fontWeight: 400,
      },
    },
    "&.date": {
      backgroundColor: "rgba(239, 239, 250, 1)",
      color: theme.palette.primary.main,
      borderRadius: "8px",
      width: "max-content",
      padding: "0px",
      "& .MuiChip-label": {
        fontSize: "14px",
        fontWeight: 500,
      },
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  backgroundColor: theme.palette.primary.main,
  padding: "16px 44px",
  color: theme.palette.secondary.light,
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "100%",
  letterSpacing: "0.16px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#6666E6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
  },
}));

const JobDetailsPage = () => {
  const theme = useTheme();
  const { job_id } = useParams();
  const router = useRouter();

  // Use Convex hooks for fetching job and company data
  const jobData = usePublicJob(job_id as string);
  const companyData = usePublicCompany(jobData?.company_id as string);

  const loading = jobData === undefined;
  const companyLoading = companyData === undefined;

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
        <Banner
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.primary.main,
            backgroundImage: "url(/images/backgrounds/banner-bg-img.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
          }}
          height={"304px"}
        >
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Banner>

        <Container
          sx={{
            maxWidth: "1063px !important",
            backgroundColor: "white",
            position: "relative",
          }}
        >
          <Grid container spacing={3} sx={{ padding: { xs: "0" } }}>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  borderRadius: "8px",
                  // padding: "40px",
                  marginBottom: "24px",
                }}
              >
                <Stack spacing={4}>
                  <Skeleton variant="rounded" width={200} height={36} />
                  <Box>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={32} sx={{ mt: 2 }} />
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Skeleton variant="rounded" width={120} height={36} />
                      <Skeleton variant="rounded" width={120} height={36} />
                      <Skeleton variant="rounded" width={120} height={36} />
                    </Stack>
                  </Box>
                  <Box>
                    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="90%" height={24} />
                    <Skeleton variant="text" width="95%" height={24} />
                  </Box>
                  <Box>
                    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="90%" height={24} />
                    <Skeleton variant="text" width="95%" height={24} />
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <Stack
                  spacing={2}
                  sx={{
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    padding: "24px",
                  }}
                >
                  <Skeleton variant="rectangular" width={200} height={60} sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Skeleton variant="rounded" width={120} height={24} />
                    <Skeleton variant="rounded" width={120} height={24} />
                  </Stack>
                  <Skeleton variant="text" width="100%" height={24} />
                  <Skeleton variant="text" width="90%" height={24} />
                  <Skeleton variant="text" width="95%" height={24} />
                  <Skeleton variant="rounded" width="100%" height={48} sx={{ mt: 2 }} />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (!jobData) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          Job not found or no longer accepting applications
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Banner
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.palette.primary.main,
          backgroundImage: "url(/images/backgrounds/banner-bg-img.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
        }}
        height={"304px"}
      ></Banner>

      <Container
        sx={{
          maxWidth: "1063px !important",
          backgroundColor: "white",
          position: "relative",
          padding: { xs: "20px" },
        }}
      >
        <Grid container spacing={3} sx={{ flexDirection: { xs: "column-reverse", md: "row" } }}>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                backgroundColor: "transparent",
                borderRadius: "8px",
                // padding: "40px",
                marginBottom: "24px",
              }}
            >
              <Stack spacing={4}>
                {/* <Stack direction="row" alignItems="center"> */}
                <Pill
                  label={
                    jobData?.created_at &&
                    (() => {
                      const days = Math.floor(
                        (new Date().getTime() - new Date(jobData.created_at).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return `Posted ${days} ${days === 1 ? "day" : "days"} ago`;
                    })()
                  }
                  className="date"
                />
                {/* </Stack> */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.200",
                      fontSize: "16px",
                      fontWeight: "400",
                      marginBottom: "14px",
                    }}
                  >
                    We&apos;re looking for{" "}
                    {["a", "e", "i", "o", "u"].includes(jobData?.title?.charAt(0)?.toLowerCase() || "lawyer")
                      ? "an"
                      : "a"}{" "}
                    ...
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: "grey.100",
                      fontSize: "24px",
                      fontWeight: "600",
                      marginBottom: "16px",
                      textTransform: "capitalize",
                    }}
                  >
                    {jobData?.experience_level} {jobData?.title}
                  </Typography>
                  <Stack direction={"row"} alignItems={"center"} gap={"8px"} mt={"16px"} flexWrap={"wrap"}>
                    <Pill
                      label={jobData?.location}
                      className="location"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M18.3334 10.0001C18.3334 14.6001 14.6001 18.3334 10.0001 18.3334C5.40008 18.3334 1.66675 14.6001 1.66675 10.0001C1.66675 5.40008 5.40008 1.66675 10.0001 1.66675C14.6001 1.66675 18.3334 5.40008 18.3334 10.0001Z"
                            stroke="#2B656E"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.0917 12.65L10.5083 11.1083C10.0583 10.8416 9.69165 10.2 9.69165 9.67497V6.2583"
                            stroke="#2B656E"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                    />
                    <Pill
                      label={jobData?.work_model}
                      className="work-model"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9.9999 11.1917C11.4358 11.1917 12.5999 10.0276 12.5999 8.5917C12.5999 7.15576 11.4358 5.9917 9.9999 5.9917C8.56396 5.9917 7.3999 7.15576 7.3999 8.5917C7.3999 10.0276 8.56396 11.1917 9.9999 11.1917Z"
                            stroke="#76325F"
                            strokeWidth="1.25"
                          />
                          <path
                            d="M3.01675 7.07508C4.65842 -0.141583 15.3501 -0.13325 16.9834 7.08342C17.9418 11.3167 15.3084 14.9001 13.0001 17.1168C11.3251 18.7334 8.67508 18.7334 6.99175 17.1168C4.69175 14.9001 2.05842 11.3084 3.01675 7.07508Z"
                            stroke="#76325F"
                            strokeWidth="1.25"
                          />
                        </svg>
                      }
                    />
                    <Pill
                      label={jobData?.job_type}
                      className="job-type"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9.9999 11.1917C11.4358 11.1917 12.5999 10.0276 12.5999 8.5917C12.5999 7.15576 11.4358 5.9917 9.9999 5.9917C8.56396 5.9917 7.3999 7.15576 7.3999 8.5917C7.3999 10.0276 8.56396 11.1917 9.9999 11.1917Z"
                            stroke="#724A3B"
                            strokeWidth="1.25"
                          />
                          <path
                            d="M3.01675 7.07508C4.65842 -0.141583 15.3501 -0.13325 16.9834 7.08342C17.9418 11.3167 15.3084 14.9001 13.0001 17.1168C11.3251 18.7334 8.67508 18.7334 6.99175 17.1168C4.69175 14.9001 2.05842 11.3084 3.01675 7.07508Z"
                            stroke="#724A3B"
                            strokeWidth="1.25"
                          />
                        </svg>
                      }
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      marginBottom: "16px",
                      color: "rgba(17, 17, 17, 0.92)",
                    }}
                  >
                    About the Role
                  </Typography>
                  <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                    {stripHtmlTags(jobData?.description || "")}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      marginBottom: "16px",
                      color: "rgba(17, 17, 17, 0.92)",
                    }}
                  >
                    Job Responsibilities
                  </Typography>
                  <Stack spacing={1}>
                    {jobData?.responsibilities?.map((responsibility: string, index: number) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="flex-start">
                        <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                          • {stripHtmlTags(responsibility)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      marginBottom: "16px",
                      color: "rgba(17, 17, 17, 0.92)",
                    }}
                  >
                    Requirements
                  </Typography>
                  <Stack spacing={1}>
                    {jobData?.requirements?.map((requirement: string, index: number) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="flex-start">
                        <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>• {requirement}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {/* <Box>
                  <Typography
                    variant="h5"
                    sx={{
                    fontWeight: 600, 
                      marginBottom: "16px",
                      color: "rgba(17, 17, 17, 0.92)",
                    }}
                  >
                    Benefits
                  </Typography>
                  <Stack spacing={1}>
                    <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                      • Competitive Salary
                    </Typography>
                    <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                      • Hybrid role
                    </Typography>
                    <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                      • Collaborative team
                    </Typography>
                    <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                      • Paid leave days with allowance
                    </Typography>
                    <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>
                      • Up to 80 days in maternity leave
                    </Typography>
                  </Stack>
                </Box> */}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                marginBottom: "0",
              }}
            >
              <Stack
                spacing={2}
                sx={{
                  border: { xs: "none", md: "1px solid #E0E0E0" },
                  borderRadius: "8px",
                  padding: { xs: "0px", md: "24px" },
                }}
              >
                <Box sx={{ display: "flex", marginBottom: "24px" }}>
                  {companyData?.company_logo ? (
                    <Image
                      src={companyData.company_logo as string}
                      alt={`${companyData.company_name} Logo`}
                      width={200}
                      height={200}
                      style={{
                        maxWidth: "200px",
                        height: "auto",
                      }}
                    />
                  ) : (
                    <Image
                      src="/images/logos/logo.svg"
                      alt="Company Logo"
                      width={200}
                      height={200}
                      style={{
                        maxWidth: "200px",
                        height: "auto",
                      }}
                    />
                  )}
                </Box>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  gap={1}
                  flexWrap="wrap"
                  sx={{ marginBottom: "16px" }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z"
                        stroke="#724A3B"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.5 8C5.5 11.5899 6.5 14.5 8 14.5C9.5 14.5 10.5 11.5899 10.5 8C10.5 4.41015 9.5 1.5 8 1.5C6.5 1.5 5.5 4.41015 5.5 8Z"
                        stroke="#724A3B"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1.5 8H14.5"
                        stroke="#724A3B"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#724A3B",
                        fontSize: "14px",
                        fontWeight: 400,
                      }}
                    >
                      {companyData?.company_website || metaData?.website}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1} ml={0} sx={{ marginLeft: "0px !important" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5.66667 7.33333C7.13943 7.33333 8.33333 6.13943 8.33333 4.66667C8.33333 3.19391 7.13943 2 5.66667 2C4.19391 2 3 3.19391 3 4.66667C3 6.13943 4.19391 7.33333 5.66667 7.33333Z"
                        stroke="#76325F"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.3333 7.33333C11.8061 7.33333 13 6.13943 13 4.66667C13 3.19391 11.8061 2 10.3333 2C8.86057 2 7.66667 3.19391 7.66667 4.66667C7.66667 6.13943 8.86057 7.33333 10.3333 7.33333Z"
                        stroke="#76325F"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.33333 14C2.33333 11.4227 3.755 9.33333 5.66667 9.33333C7.57833 9.33333 9 11.4227 9 14"
                        stroke="#76325F"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.6667 14C11.6667 11.4227 10.245 9.33333 8.33333 9.33333C7.66667 9.33333 7.08333 9.66667 6.66667 10.1667"
                        stroke="#76325F"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#76325F",
                        fontSize: "14px",
                        fontWeight: 400,
                      }}
                    >
                      {companyData?.number_of_employees || "50-200"}
                    </Typography>
                  </Stack>
                </Stack>

                <Box>
                  <Typography sx={{ color: "rgba(17, 17, 17, 0.84)" }}>{companyData?.about_company || ""}</Typography>
                </Box>
                <a href={`/job-openings/${job_id}/apply?company_id=${companyData?.id}`}>
                  <StyledButton variant="contained" fullWidth>
                    Apply for this Job
                  </StyledButton>
                </a>
              </Stack>
            </Box>
            <Divider sx={{ display: { xs: "block", md: "none" }, margin: "10px 0" }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default JobDetailsPage;
