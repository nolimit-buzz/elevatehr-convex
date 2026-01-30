"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Button,
  IconButton,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
  styled,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Link,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useRouter } from "next/navigation";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventNoteIcon from "@mui/icons-material/EventNote";
import RefreshIcon from "@mui/icons-material/Refresh";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { AuthQueries, AuthQueriesReturnType } from "@/queries/auth.queries";
import { CompanyQueries } from "@/queries/company.queries";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import { toast } from "sonner";

// Custom styled TextField component
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#FFF",
    borderRadius: "8px",
    border: "0.8px solid rgba(17, 17, 17, 0.14)",
    transition: "all 0.3s ease",
    "&.Mui-focused": {
      border: `0.8px solid ${theme.palette.primary.main}`,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}25`,
    },
    "& .MuiOutlinedInput-helperText": {
      color: "rgba(17, 17, 17, 0.6)",
      fontSize: "15px",
      fontWeight: 400,
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "14px 16px",
    fontWeight: 400,
    fontSize: "16px",
    color: "rgba(17, 17, 17, 0.92)",
  },
  "& .MuiInputLabel-root": {
    color: "rgba(17, 17, 17, 0.6)",
    fontSize: "15px",
    fontWeight: 400,
    transform: "translate(16px, 15px) scale(1)",
    "&.Mui-focused, &.MuiFormLabel-filled": {
      transform: "translate(16px, -9px) scale(0.75)",
      backgroundColor: "#FFF",
      padding: "0 8px",
    },
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(16px, -9px) scale(0.75)",
    backgroundColor: "#FFF",
    padding: "0 8px",
  },
  "& fieldset": {
    border: "none",
  },
  "& .MuiFormHelperText-root": {
    color: "rgba(17, 17, 17, 0.6)",
    fontSize: "15px",
    fontWeight: 400,
    marginTop: "10px",
    marginLeft: 0,
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  padding: "10px 20px",
  fontSize: theme.typography.pxToRem(16),
  color: theme.palette.secondary.light,
  fontWeight: theme.typography.fontWeightMedium,
  height: "52px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#6666E6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
  },
}));

interface ProfileData {
  personal: NonNullable<AuthQueriesReturnType["Login"]>["personalInfo"];
  company: NonNullable<AuthQueriesReturnType["Login"]>["companyInfo"];
}

// Define section type for navigation
type ProfileSection = "personal" | "company" | "password" | "applications" | "integrations" | "calendly";

interface ErrorState {
  email?: string;
  bookingLink?: string;
  website?: string;
  password?: string;
}

const ProfilePage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { UpdateCompany, GenerateUploadUrl, UpdateLogo } = CompanyQueries();
  const { Me, ChangePassword } = AuthQueries();
  const [activeSection, setActiveSection] = useState<ProfileSection>("company");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [updatedProfileData, setUpdatedProfileData] = useState<ProfileData | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const [integrations, setIntegrations] = useState({
    calendly: {
      connected: Boolean(process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID && process.env.NEXT_PUBLIC_CALENDLY_CLIENT_SECRET),
    },
    zoom: {
      connected: false,
      email: "",
    },
    googleCalendar: {
      connected: false,
    },
  });
  const [calendlyModalOpen, setCalendlyModalOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState<{
    name: string;
    duration: number;
    description: string;
    schedulingUrl: string;
  } | null>(null);
  const [calendlyEvents, setCalendlyEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState<boolean>(false);

  const loadFromAPI = async () => {
    setLoading(true);
    const { result, error } = await Me();
    setLoading(false);

    if (error) {
      setNotification({ open: true, message: "Failed to load profile data", severity: "error" });
      loadDataFromStorage();
      return;
    }
    if (result) updateLocalStorage(result);
  };

  useEffect(() => {
    loadFromAPI();
  }, []);

  const loadDataFromStorage = () => {
    const storedUserProfile = localStorage.getItem("userProfile");
    if (storedUserProfile) {
      const profile = JSON.parse(storedUserProfile);
      setProfileData({
        personal: profile?.personalInfo || null,
        company: profile?.companyInfo || null,
      });
      setLoading(false);
      return;
    }

    // If no profile in localStorage, redirect
    window.location.href = "/";
  };

  const updateLocalStorage = (result: any) => {
    //update localStorage state and clear updatedProfileData

    const userProfile = localStorage.getItem("userProfile");
    if (userProfile && result) {
      const profile = JSON.parse(userProfile);
      const updatedProfile = {
        ...profile,
        personalInfo: {
          ...profile.personalInfo,
          ...result.personalInfo,
        },
        companyInfo: {
          ...profile.companyInfo,
          ...result.companyInfo,
        },
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setProfileData({
        personal: updatedProfile.personalInfo,
        company: updatedProfile.companyInfo,
      });
    }
  };

  const handleSectionChange = (section: ProfileSection) => {
    setActiveSection(section);
  };

  const validateUrl = (url: string, allowWithoutHttp = false): boolean => {
    if (!url) return true;

    if (allowWithoutHttp && !url.startsWith("http")) {
      // For website fields, we'll allow domains without http:// as we can add it later
      url = "https://" + url;
    }

    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleProfileChange = (section: "personal" | "company", field: string, value: string) => {
    const updatedData = {
      ...updatedProfileData,
      [section]: { ...updatedProfileData?.[section as keyof ProfileData], [field]: value },
    };
    setUpdatedProfileData(updatedData as ProfileData);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear password error when user types
    if (field === "confirmPassword" || field === "newPassword") {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  // Save profile data
  const handleSaveProfile = async () => {
    if (profileData === null) return;

    //validate URLs
    const companyWebsite = updatedProfileData?.company?.company_website;
    const bookingLink = updatedProfileData?.company?.booking_link;
    if (companyWebsite && !validateUrl(companyWebsite, true)) {
      setErrors((prev) => ({ ...prev, website: "Enter a valid URL" }));
      return;
    }

    if (bookingLink && !validateUrl(bookingLink)) {
      setErrors((prev) => ({ ...prev, bookingLink: "Enter a valid URL" }));
      return;
    }

    setSaving(true);

    // Extract only the fields needed for the update (exclude _id, _creationTime)
    const { _id: companyId, _creationTime: companyCreationTime, ...companyData } = updatedProfileData?.company ?? {};
    const {
      _id: personalId,
      _creationTime: personalCreationTime,
      ...personalData
    } = updatedProfileData?.personal ?? {};

    const { result, error } = await UpdateCompany({
      personal: personalData,
      company: companyData,
    }).finally(() => setSaving(false));

    if (error) {
      setNotification({ open: true, message: error, severity: "error" });
      return;
    }
    const sectionLabel = activeSection === "company" ? "Company information" : "Personal information";
    setNotification({ open: true, message: `${sectionLabel} updated successfully`, severity: "success" });
    updateLocalStorage(result);
    setUpdatedProfileData(null);
  };

  const handleChangePassword = async () => {
    // Check if new password and confirm password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors((prev) => ({ ...prev, password: "New passwords do not match" }));
      return;
    }

    console.log("Changing password with data:", passwordData);

    try {
      setSaving(true);

      const { result, error } = await ChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (error) {
        setNotification({
          open: true,
          message: error,
          severity: "error",
        });
        return;
      }

      setNotification({
        open: true,
        message: "Password changed successfully",
        severity: "success",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: "Error changing password",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setLogoUploading(true);

      // Step 1: Get a short-lived upload URL
      const { result: uploadUrl, error: uploadUrlError } = await GenerateUploadUrl();
      if (uploadUrlError || !uploadUrl) {
        toast.error(uploadUrlError || "Failed to generate upload URL");
        return;
      }

      // Step 2: POST the file to the URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        toast.error("Failed to upload file");
        return;
      }

      const { storageId } = await uploadResponse.json();

      // Step 3: Save the storage ID to the database and get the logo URL
      const { result, error } = await UpdateLogo(storageId);
      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Logo updated successfully");

      // Update localStorage and local state with the new logo
      const userProfile = localStorage.getItem("userProfile");
      if (userProfile && result) {
        const profile = JSON.parse(userProfile);
        const updatedProfile = {
          ...profile,
          personalInfo: {
            ...profile.personalInfo,
            ...result.personalInfo,
          },
          companyInfo: {
            ...profile.companyInfo,
            ...result.companyInfo,
          },
        };
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        setProfileData({
          personal: updatedProfile.personalInfo,
          company: updatedProfile.companyInfo,
        });
      }
    } catch (error) {
      setNotification({ open: true, message: "Failed to upload logo", severity: "error" });
    } finally {
      setLogoUploading(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleIntegrationConnect = async (integration: string) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("jwt");

      // Here you would typically handle OAuth flow or API connection
      // For now, we'll just simulate a connection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIntegrations((prev) => ({
        ...prev,
        [integration]: {
          ...prev[integration as keyof typeof prev],
          connected: true,
        },
      }));

      setNotification({
        open: true,
        message: `${integration.charAt(0).toUpperCase() + integration.slice(1)} connected successfully`,
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to connect ${integration}`,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCalendlyConnect = () => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `https://auth.calendly.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/auth/calendly`,
      "Calendly OAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "CALENDLY_AUTH_SUCCESS") {
        setIntegrations((prev) => ({
          ...prev,
          calendly: { ...prev.calendly, connected: true },
        }));
        setEventDetails(event.data.eventData);
        setNotification({
          open: true,
          message: "Calendly event created successfully!",
          severity: "success",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  };

  // Function to get Calendly access token
  const getCalendlyAccessToken = async () => {
    try {
      const response = await fetch("https://auth.calendly.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID || "",
          client_secret: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_SECRET || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get access token");
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      throw error;
    }
  };

  // Function to fetch Calendly events
  const fetchCalendlyEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const personalAccessToken = process.env.NEXT_PUBLIC_PERSONAL_ACCESS_TOKEN;

      if (!personalAccessToken) {
        throw new Error("Personal access token is not configured");
      }

      // First get the user profile
      const userResponse = await fetch("https://api.calendly.com/users/me", {
        headers: {
          Authorization: `Bearer ${personalAccessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await userResponse.json();
      const userUri = userData.resource.uri;
      const userUuid = userUri.split("/").pop(); // Extract UUID from URI

      // Then fetch events using the user's UUID
      const eventsResponse = await fetch(`https://api.calendly.com/scheduled_events?user=${userUri}`, {
        headers: {
          Authorization: `Bearer ${personalAccessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch events");
      }

      const eventsData = await eventsResponse.json();
      setCalendlyEvents(eventsData.collection || []);
    } catch (error) {
      setNotification({
        open: true,
        message: "Failed to fetch Calendly events",
        severity: "error",
      });
    } finally {
      setLoadingEvents(false);
    }
  }, [setCalendlyEvents, setNotification, setLoadingEvents]);

  // Initialize updatedProfileData when profileData loads
  useEffect(() => {
    if (profileData && !updatedProfileData) {
      setUpdatedProfileData(profileData);
    }
  }, [profileData, updatedProfileData]);

  // Fetch events when Calendly tab is active
  useEffect(() => {
    if (activeSection === "calendly" && integrations.calendly.connected) {
      fetchCalendlyEvents();
    }
  }, [activeSection, integrations.calendly.connected, integrations, fetchCalendlyEvents]);

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    router.push("/");
  };

  const handleSaveGroqKey = async () => {
    const newApiKey = updatedProfileData?.company?.ai_api_key;
    if (!newApiKey) return;

    try {
      setSaving(true);

      const { result, error } = await UpdateCompany({
        company: {
          ai_api_key: newApiKey,
        },
      });

      if (error) {
        setNotification({ open: true, message: error, severity: "error" });
        return;
      }

      setNotification({ open: true, message: "Groq API key updated successfully", severity: "success" });
      updateLocalStorage(result);
      setUpdatedProfileData(null);
    } catch (error) {
      setNotification({ open: true, message: "Error updating Groq API key", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <Box sx={{ maxWidth: "1280px", mx: "auto" }}>
      {/* Back Button */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/dashboard")}
          sx={{
            color: "rgba(17, 17, 17, 0.7)",
            fontWeight: 500,
            fontSize: "15px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Profile Header */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {/* Header Background */}
        <Box
          sx={{
            height: "120px",
            bgcolor: theme.palette.primary.main,
            position: "relative",
            backgroundImage: 'url("/images/backgrounds/banner-bg.svg")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />

        {/* Profile Info Section */}
        <Box
          sx={{
            px: 4,
            pb: 3,
            pt: 3,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          {/* Logo and Company Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 3,
              width: "100%",
              height: "50px",
            }}
          >
            {/* Logo */}

            <Avatar
              src={profileData?.company?.company_logo}
              alt={profileData?.company?.company_name}
              sx={{
                width: 130,
                height: 130,
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                position: "relative",
                top: -80,
                bgcolor: "white",
                padding: 1.5,
                "& img": {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              }}
            />

            {/* Company Name and Website */}
            <Box sx={{ pb: 0, mt: -1 }}>
              <Typography variant="h4" fontWeight={600} sx={{ color: "rgba(17, 17, 17, 0.92)", fontSize: "28px" }}>
                {profileData?.company?.company_name}
              </Typography>

              <Typography
                component="a"
                href={
                  profileData?.company?.company_website
                    ? profileData.company.company_website.startsWith("http")
                      ? profileData.company.company_website
                      : `https://${profileData.company.company_website}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(17, 17, 17, 0.6)",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: 500,
                  mt: 0.5,
                  "&:hover": {
                    color: theme.palette.primary.main,
                    textDecoration: "underline",
                  },
                }}
              >
                {profileData?.company?.company_website || ""}
                <Box component="span" sx={{ display: "inline-block", ml: 0.5, transform: "translateY(1px)" }}>
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10 10.5H1.5V2H5.25V0.75H0.75C0.335786 0.75 0 1.08579 0 1.5V11.25C0 11.6642 0.335786 12 0.75 12H10.75C11.1642 12 11.5 11.6642 11.5 11.25V6.75H10V10.5ZM6.75 0.75V2H9.4425L3.2175 8.2275L4.2725 9.2825L10.5 3.0575V5.75H11.75V0.75H6.75Z"
                      fill="currentColor"
                    />
                  </svg>
                </Box>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, mt: 3, gap: 3 }}>
        {/* Sidebar - Only visible on lg screens and up */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            width: "30%",
            minWidth: "250px",
            maxWidth: "300px",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              // p:2,
              bgcolor: "white",
              borderRadius: "10px",
              height: "max-content",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h6"
              sx={{ p: 2, borderBottom: "0.8px solid rgba(17, 17, 17, 0.08)", fontWeight: 500, fontSize: "18px" }}
            >
              Profile Settings
            </Typography>
            <List sx={{ p: 2 }}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionChange("company")}
                  selected={activeSection === "company"}
                  sx={{
                    p: "18px 22px",
                    bgcolor: "#FFF",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: theme.palette.secondary.light,
                    },
                    "&.Mui-selected": {
                      bgcolor: theme.palette.secondary.light,
                      borderRadius: "8px",
                      "&:hover": {
                        bgcolor: theme.palette.secondary.light,
                      },
                      "& svg path": {
                        fill: theme.palette.primary.main,
                      },
                    },
                    mb: 1,
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22 22.75H2C1.59 22.75 1.25 22.41 1.25 22C1.25 21.59 1.59 21.25 2 21.25H22C22.41 21.25 22.75 21.59 22.75 22C22.75 22.41 22.41 22.75 22 22.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M21 22.75H3C2.59 22.75 2.25 22.41 2.25 22V6C2.25 2.98 3.98 1.25 7 1.25H17C20.02 1.25 21.75 2.98 21.75 6V22C21.75 22.41 21.41 22.75 21 22.75ZM3.75 21.25H20.25V6C20.25 3.78 19.22 2.75 17 2.75H7C4.78 2.75 3.75 3.78 3.75 6V21.25Z"
                        fill="#292D32"
                      />
                      <path
                        d="M10 17.25H7C6.59 17.25 6.25 16.91 6.25 16.5C6.25 16.09 6.59 15.75 7 15.75H10C10.41 15.75 10.75 16.09 10.75 16.5C10.75 16.91 10.41 17.25 10 17.25Z"
                        fill="#292D32"
                      />
                      <path
                        d="M17 17.25H14C13.59 17.25 13.25 16.91 13.25 16.5C13.25 16.09 13.59 15.75 14 15.75H17C17.41 15.75 17.75 16.09 17.75 16.5C17.75 16.91 17.41 17.25 17 17.25Z"
                        fill="#292D32"
                      />
                      <path
                        d="M10 12.75H7C6.59 12.75 6.25 12.41 6.25 12C6.25 11.59 6.59 11.25 7 11.25H10C10.41 11.25 10.75 11.59 10.75 12C10.75 12.41 10.41 12.75 10 12.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M17 12.75H14C13.59 12.75 13.25 12.41 13.25 12C13.25 11.59 13.59 11.25 14 11.25H17C17.41 11.25 17.75 11.59 17.75 12C17.75 12.41 17.41 12.75 17 12.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M10 8.25H7C6.59 8.25 6.25 7.91 6.25 7.5C6.25 7.09 6.59 6.75 7 6.75H10C10.41 6.75 10.75 7.09 10.75 7.5C10.75 7.91 10.41 8.25 10 8.25Z"
                        fill="#292D32"
                      />
                      <path
                        d="M17 8.25H14C13.59 8.25 13.25 7.91 13.25 7.5C13.25 7.09 13.59 6.75 14 6.75H17C17.41 6.75 17.75 7.09 17.75 7.5C17.75 7.91 17.41 8.25 17 8.25Z"
                        fill="#292D32"
                      />
                    </svg>

                    <ListItemText
                      primary="Company Information"
                      sx={{
                        "& .MuiListItemText-primary": {
                          color: activeSection === "company" ? theme.palette.primary.main : "rgba(17, 17, 17, 0.84)",
                          fontWeight: 400,
                          fontSize: "16px",
                        },
                      }}
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
              {/* <Divider /> */}

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionChange("personal")}
                  selected={activeSection === "personal"}
                  sx={{
                    p: "18px 22px",
                    bgcolor: "#FFF",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: theme.palette.secondary.light,
                    },
                    "&.Mui-selected": {
                      bgcolor: theme.palette.secondary.light,
                      borderRadius: "8px",
                      "&:hover": {
                        bgcolor: theme.palette.secondary.light,
                      },
                      "& svg path": {
                        fill: theme.palette.primary.main,
                      },
                    },
                    mb: 1,
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 12.75C8.83 12.75 6.25 10.17 6.25 7C6.25 3.83 8.83 1.25 12 1.25C15.17 1.25 17.75 3.83 17.75 7C17.75 10.17 15.17 12.75 12 12.75ZM12 2.75C9.66 2.75 7.75 4.66 7.75 7C7.75 9.34 9.66 11.25 12 11.25C14.34 11.25 16.25 9.34 16.25 7C16.25 4.66 14.34 2.75 12 2.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M20.5901 22.75C20.1801 22.75 19.8401 22.41 19.8401 22C19.8401 18.55 16.3202 15.75 12.0002 15.75C7.68015 15.75 4.16016 18.55 4.16016 22C4.16016 22.41 3.82016 22.75 3.41016 22.75C3.00016 22.75 2.66016 22.41 2.66016 22C2.66016 17.73 6.85015 14.25 12.0002 14.25C17.1502 14.25 21.3401 17.73 21.3401 22C21.3401 22.41 21.0001 22.75 20.5901 22.75Z"
                        fill="#292D32"
                      />
                    </svg>
                    <ListItemText
                      primary="Personal Information"
                      sx={{
                        "& .MuiListItemText-primary": {
                          color: activeSection === "personal" ? theme.palette.primary.main : "rgba(17, 17, 17, 0.84)",
                          fontWeight: 400,
                          fontSize: "16px",
                        },
                      }}
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
              {/* <Divider /> */}

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionChange("password")}
                  selected={activeSection === "password"}
                  sx={{
                    p: "18px 22px",
                    bgcolor: "#FFF",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: theme.palette.secondary.light,
                    },
                    "&.Mui-selected": {
                      bgcolor: theme.palette.secondary.light,
                      borderRadius: "8px",
                      "&:hover": {
                        bgcolor: theme.palette.secondary.light,
                      },
                      "& svg path": {
                        fill: theme.palette.primary.main,
                      },
                    },
                    mb: 1,
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6.18014 22.7499C6.08014 22.7499 5.97014 22.7399 5.88014 22.7299L3.71014 22.4299C2.67014 22.2899 1.73014 21.3599 1.57014 20.2999L1.27014 18.1099C1.17014 17.4099 1.47014 16.4999 1.97014 15.9899L6.36014 11.5999C5.65014 8.75992 6.47014 5.75992 8.56014 3.68992C11.8001 0.459923 17.0701 0.449923 20.3201 3.68992C21.8901 5.25992 22.7501 7.34992 22.7501 9.56992C22.7501 11.7899 21.8901 13.8799 20.3201 15.4499C18.2201 17.5299 15.2301 18.3499 12.4101 17.6299L8.01014 22.0199C7.59014 22.4599 6.84014 22.7499 6.18014 22.7499ZM14.4301 2.75992C12.6801 2.75992 10.9401 3.41992 9.61014 4.74992C7.81014 6.53992 7.16014 9.15992 7.91014 11.5999C7.99014 11.8699 7.92014 12.1499 7.72014 12.3499L3.02014 17.0499C2.85014 17.2199 2.71014 17.6599 2.74014 17.8899L3.04014 20.0799C3.10014 20.4599 3.51014 20.8899 3.89014 20.9399L6.07014 21.2399C6.31014 21.2799 6.75014 21.1399 6.92014 20.9699L11.6401 16.2599C11.8401 16.0599 12.1301 15.9999 12.3901 16.0799C14.8001 16.8399 17.4301 16.1899 19.2301 14.3899C20.5101 13.1099 21.2201 11.3899 21.2201 9.56992C21.2201 7.73992 20.5101 6.02992 19.2301 4.74992C17.9301 3.42992 16.1801 2.75992 14.4301 2.75992Z"
                        fill="#292D32"
                      />
                      <path
                        d="M9.19008 20.5399C9.00008 20.5399 8.81008 20.4699 8.66008 20.3199L6.36008 18.0199C6.07008 17.7299 6.07008 17.2499 6.36008 16.9599C6.65008 16.6699 7.13008 16.6699 7.42008 16.9599L9.72008 19.2599C10.0101 19.5499 10.0101 20.0299 9.72008 20.3199C9.57008 20.4699 9.38008 20.5399 9.19008 20.5399Z"
                        fill="#292D32"
                      />
                      <path
                        d="M14.5 11.75C13.26 11.75 12.25 10.74 12.25 9.5C12.25 8.26 13.26 7.25 14.5 7.25C15.74 7.25 16.75 8.26 16.75 9.5C16.75 10.74 15.74 11.75 14.5 11.75ZM14.5 8.75C14.09 8.75 13.75 9.09 13.75 9.5C13.75 9.91 14.09 10.25 14.5 10.25C14.91 10.25 15.25 9.91 15.25 9.5C15.25 9.09 14.91 8.75 14.5 8.75Z"
                        fill="#292D32"
                      />
                    </svg>

                    <ListItemText
                      primary="Password"
                      sx={{
                        "& .MuiListItemText-primary": {
                          color: activeSection === "password" ? theme.palette.primary.main : "rgba(17, 17, 17, 0.84)",
                          fontWeight: 400,
                          fontSize: "16px",
                        },
                      }}
                    />
                  </Box>
                </ListItemButton>
              </ListItem>

              {/* <Divider /> */}

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionChange("integrations")}
                  selected={activeSection === "integrations"}
                  sx={{
                    p: "18px 22px",
                    bgcolor: "#FFF",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: theme.palette.secondary.light,
                    },
                    "&.Mui-selected": {
                      bgcolor: theme.palette.secondary.light,
                      borderRadius: "8px",
                      "&:hover": {
                        bgcolor: theme.palette.secondary.light,
                      },
                      "& svg path": {
                        fill: theme.palette.primary.main,
                      },
                    },
                    mb: 1,
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19 16.75C18.59 16.75 18.25 16.41 18.25 16V6.5C18.25 5.81 17.69 5.25 17 5.25H11.5C11.09 5.25 10.75 4.91 10.75 4.5C10.75 4.09 11.09 3.75 11.5 3.75H17C18.52 3.75 19.75 4.98 19.75 6.5V16C19.75 16.41 19.41 16.75 19 16.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M14 7.74993C13.83 7.74993 13.66 7.68995 13.52 7.57995L10.52 5.07995C10.35 4.93995 10.25 4.72993 10.25 4.49993C10.25 4.26993 10.35 4.06991 10.52 3.91991L13.52 1.41991C13.84 1.14991 14.31 1.19995 14.58 1.51995C14.85 1.83995 14.8 2.30995 14.48 2.57995L12.17 4.49993L14.48 6.41991C14.8 6.68991 14.84 7.15991 14.58 7.47991C14.43 7.65991 14.21 7.74993 14 7.74993Z"
                        fill="#292D32"
                      />
                      <path
                        d="M19 22.75C16.93 22.75 15.25 21.07 15.25 19C15.25 16.93 16.93 15.25 19 15.25C21.07 15.25 22.75 16.93 22.75 19C22.75 21.07 21.07 22.75 19 22.75ZM19 16.75C17.76 16.75 16.75 17.76 16.75 19C16.75 20.24 17.76 21.25 19 21.25C20.24 21.25 21.25 20.24 21.25 19C21.25 17.76 20.24 16.75 19 16.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M12.5 20.25H7C5.48 20.25 4.25 19.02 4.25 17.5V8C4.25 7.59 4.59 7.25 5 7.25C5.41 7.25 5.75 7.59 5.75 8V17.5C5.75 18.19 6.31 18.75 7 18.75H12.5C12.91 18.75 13.25 19.09 13.25 19.5C13.25 19.91 12.91 20.25 12.5 20.25Z"
                        fill="#292D32"
                      />
                      <path
                        d="M9.99993 22.7499C9.78993 22.7499 9.56994 22.6599 9.41994 22.4799C9.14994 22.1599 9.19992 21.6899 9.51992 21.4199L11.8299 19.4999L9.51992 17.58C9.19992 17.31 9.15994 16.84 9.41994 16.52C9.68994 16.2 10.1599 16.1599 10.4799 16.4199L13.4799 18.9199C13.6499 19.0599 13.7499 19.2699 13.7499 19.4999C13.7499 19.7299 13.6499 19.93 13.4799 20.08L10.4799 22.58C10.3399 22.69 10.1699 22.7499 9.99993 22.7499Z"
                        fill="#292D32"
                      />
                      <path
                        d="M5 8.75C2.93 8.75 1.25 7.07 1.25 5C1.25 2.93 2.93 1.25 5 1.25C7.07 1.25 8.75 2.93 8.75 5C8.75 7.07 7.07 8.75 5 8.75ZM5 2.75C3.76 2.75 2.75 3.76 2.75 5C2.75 6.24 3.76 7.25 5 7.25C6.24 7.25 7.25 6.24 7.25 5C7.25 3.76 6.24 2.75 5 2.75Z"
                        fill="#292D32"
                      />
                    </svg>
                    <ListItemText
                      primary="Integrations"
                      sx={{
                        "& .MuiListItemText-primary": {
                          color:
                            activeSection === "integrations" ? theme.palette.primary.main : "rgba(17, 17, 17, 0.84)",
                          fontWeight: 400,
                          fontSize: "16px",
                        },
                      }}
                    />
                  </Box>
                </ListItemButton>
              </ListItem>

              {process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID && process.env.NEXT_PUBLIC_CALENDLY_CLIENT_SECRET && (
                <>
                  {/* <Divider /> */}
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleSectionChange("calendly")}
                      selected={activeSection === "calendly"}
                      sx={{
                        p: "18px 22px",
                        bgcolor: "#FFF",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          bgcolor: theme.palette.secondary.light,
                        },
                        "&.Mui-selected": {
                          bgcolor: theme.palette.secondary.light,
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: theme.palette.secondary.light,
                          },
                          "& svg path": {
                            fill: theme.palette.primary.main,
                          },
                        },
                        mb: 1,
                        borderRadius: "8px",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8 5.75C7.59 5.75 7.25 5.41 7.25 5V2C7.25 1.59 7.59 1.25 8 1.25C8.41 1.25 8.75 1.59 8.75 2V5C8.75 5.41 8.41 5.75 8 5.75Z"
                            fill="#292D32"
                          />
                          <path
                            d="M16 5.75C15.59 5.75 15.25 5.41 15.25 5V2C15.25 1.59 15.59 1.25 16 1.25C16.41 1.25 16.75 1.59 16.75 2V5C16.75 5.41 16.41 5.75 16 5.75Z"
                            fill="#292D32"
                          />
                          <path
                            d="M8.5 14.5001C8.37 14.5001 8.24 14.4701 8.12 14.4201C7.99 14.3701 7.89 14.3001 7.79 14.2101C7.61 14.0201 7.5 13.7701 7.5 13.5001C7.5 13.3701 7.53 13.2401 7.58 13.1201C7.63 13.0001 7.7 12.8901 7.79 12.7901C7.89 12.7001 7.99 12.6301 8.12 12.5801C8.48 12.4301 8.93 12.5101 9.21 12.7901C9.39 12.9801 9.5 13.2401 9.5 13.5001C9.5 13.5601 9.49 13.6301 9.48 13.7001C9.47 13.7601 9.45 13.8201 9.42 13.8801C9.4 13.9401 9.37 14.0001 9.33 14.0601C9.3 14.1101 9.25 14.1601 9.21 14.2101C9.02 14.3901 8.76 14.5001 8.5 14.5001Z"
                            fill="#292D32"
                          />
                          <path
                            d="M12 14.5C11.87 14.5 11.74 14.47 11.62 14.42C11.49 14.37 11.39 14.3 11.29 14.21C11.11 14.02 11 13.77 11 13.5C11 13.37 11.03 13.24 11.08 13.12C11.13 13 11.2 12.89 11.29 12.79C11.39 12.7 11.49 12.63 11.62 12.58C11.98 12.42 12.43 12.51 12.71 12.79C12.89 12.98 13 13.24 13 13.5C13 13.56 12.99 13.63 12.98 13.7C12.97 13.76 12.95 13.82 12.92 13.88C12.9 13.94 12.87 14 12.83 14.06C12.8 14.11 12.75 14.16 12.71 14.21C12.52 14.39 12.26 14.5 12 14.5Z"
                            fill="#292D32"
                          />
                          <path
                            d="M15.5 14.5C15.37 14.5 15.24 14.47 15.12 14.42C14.99 14.37 14.89 14.3 14.79 14.21C14.75 14.16 14.71 14.11 14.67 14.06C14.63 14 14.6 13.94 14.58 13.88C14.55 13.82 14.53 13.76 14.52 13.7C14.51 13.63 14.5 13.56 14.5 13.5C14.5 13.24 14.61 12.98 14.79 12.79C14.89 12.7 14.99 12.63 15.12 12.58C15.49 12.42 15.93 12.51 16.21 12.79C16.39 12.98 16.5 13.24 16.5 13.5C16.5 13.56 16.49 13.63 16.48 13.7C16.47 13.76 16.45 13.82 16.42 13.88C16.4 13.94 16.37 14 16.33 14.06C16.3 14.11 16.25 14.16 16.21 14.21C16.02 14.39 15.76 14.5 15.5 14.5Z"
                            fill="#292D32"
                          />
                          <path
                            d="M8.5 17.9999C8.37 17.9999 8.24 17.97 8.12 17.92C8 17.87 7.89 17.7999 7.79 17.7099C7.61 17.5199 7.5 17.2599 7.5 16.9999C7.5 16.8699 7.53 16.7399 7.58 16.6199C7.63 16.4899 7.7 16.38 7.79 16.29C8.16 15.92 8.84 15.92 9.21 16.29C9.39 16.48 9.5 16.7399 9.5 16.9999C9.5 17.2599 9.39 17.5199 9.21 17.7099C9.02 17.8899 8.76 17.9999 8.5 17.9999Z"
                            fill="#292D32"
                          />
                          <path
                            d="M12 17.9999C11.74 17.9999 11.48 17.8899 11.29 17.7099C11.11 17.5199 11 17.2599 11 16.9999C11 16.8699 11.03 16.7399 11.08 16.6199C11.13 16.4899 11.2 16.38 11.29 16.29C11.66 15.92 12.34 15.92 12.71 16.29C12.8 16.38 12.87 16.4899 12.92 16.6199C12.97 16.7399 13 16.8699 13 16.9999C13 17.2599 12.89 17.5199 12.71 17.7099C12.52 17.8899 12.26 17.9999 12 17.9999Z"
                            fill="#292D32"
                          />
                          <path
                            d="M15.5 18C15.24 18 14.98 17.89 14.79 17.71C14.7 17.62 14.63 17.51 14.58 17.38C14.53 17.26 14.5 17.13 14.5 17C14.5 16.87 14.53 16.74 14.58 16.62C14.63 16.49 14.7 16.38 14.79 16.29C15.02 16.06 15.37 15.95 15.69 16.02C15.76 16.03 15.82 16.05 15.88 16.08C15.94 16.1 16 16.13 16.06 16.17C16.11 16.2 16.16 16.25 16.21 16.29C16.39 16.48 16.5 16.74 16.5 17C16.5 17.26 16.39 17.52 16.21 17.71C16.02 17.89 15.76 18 15.5 18Z"
                            fill="#292D32"
                          />
                          <path
                            d="M20.5 9.83997H3.5C3.09 9.83997 2.75 9.49997 2.75 9.08997C2.75 8.67997 3.09 8.33997 3.5 8.33997H20.5C20.91 8.33997 21.25 8.67997 21.25 9.08997C21.25 9.49997 20.91 9.83997 20.5 9.83997Z"
                            fill="#292D32"
                          />
                          <path
                            d="M16 22.75H8C4.35 22.75 2.25 20.65 2.25 17V8.5C2.25 4.85 4.35 2.75 8 2.75H16C19.65 2.75 21.75 4.85 21.75 8.5V17C21.75 20.65 19.65 22.75 16 22.75ZM8 4.25C5.14 4.25 3.75 5.64 3.75 8.5V17C3.75 19.86 5.14 21.25 8 21.25H16C18.86 21.25 20.25 19.86 20.25 17V8.5C20.25 5.64 18.86 4.25 16 4.25H8Z"
                            fill="#292D32"
                          />
                        </svg>

                        <ListItemText
                          primary="Calendly"
                          sx={{
                            "& .MuiListItemText-primary": {
                              color:
                                activeSection === "calendly" ? theme.palette.primary.main : "rgba(17, 17, 17, 0.84)",
                              fontWeight: 400,
                              fontSize: "16px",
                            },
                          }}
                        />
                      </Box>
                    </ListItemButton>
                  </ListItem>
                </>
              )}
              {/* <Divider /> */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setLogoutModalOpen(true)}
                  sx={{
                    p: "18px 22px",
                    bgcolor: "#FFF",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "rgba(211, 47, 47, 0.04)",
                    },
                    mb: 1,
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15.24 22.27H15.11C10.67 22.27 8.53002 20.52 8.16002 16.6C8.12002 16.19 8.42002 15.82 8.84002 15.78C9.24002 15.74 9.62002 16.05 9.66002 16.46C9.95002 19.6 11.43 20.77 15.12 20.77H15.25C19.32 20.77 20.76 19.33 20.76 15.26V8.74001C20.76 4.67001 19.32 3.23001 15.25 3.23001H15.12C11.41 3.23001 9.93002 4.42001 9.66002 7.62001C9.61002 8.03001 9.26002 8.34001 8.84002 8.30001C8.42002 8.27001 8.12001 7.90001 8.15001 7.49001C8.49001 3.51001 10.64 1.73001 15.11 1.73001H15.24C20.15 1.73001 22.25 3.83001 22.25 8.74001V15.26C22.25 20.17 20.15 22.27 15.24 22.27Z"
                        fill="#D32F2F"
                      />
                      <path
                        d="M15.0001 12.75H3.62012C3.21012 12.75 2.87012 12.41 2.87012 12C2.87012 11.59 3.21012 11.25 3.62012 11.25H15.0001C15.4101 11.25 15.7501 11.59 15.7501 12C15.7501 12.41 15.4101 12.75 15.0001 12.75Z"
                        fill="#D32F2F"
                      />
                      <path
                        d="M5.84994 16.1C5.65994 16.1 5.46994 16.03 5.31994 15.88L1.96994 12.53C1.67994 12.24 1.67994 11.76 1.96994 11.47L5.31994 8.12C5.60994 7.83 6.08994 7.83 6.37994 8.12C6.66994 8.41 6.66994 8.89 6.37994 9.18L3.55994 12L6.37994 14.82C6.66994 15.11 6.66994 15.59 6.37994 15.88C6.23994 16.03 6.03994 16.1 5.84994 16.1Z"
                        fill="#D32F2F"
                      />
                    </svg>
                    <ListItemText
                      primary="Logout"
                      sx={{
                        "& .MuiListItemText-primary": {
                          color: "#D32F2F",
                          fontWeight: 400,
                          fontSize: "16px",
                        },
                      }}
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, width: { xs: "100%", lg: "auto" } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: "10px",
              overflow: "hidden",
              height: "max-content",
            }}
          >
            {/* Tabs - Only visible on screens smaller than lg */}
            <Box sx={{ display: { xs: "block", lg: "none" }, mb: 3 }}>
              <Tabs
                value={activeSection}
                onChange={(_, newValue) => handleSectionChange(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTabs-indicator": {
                    backgroundColor: theme.palette.primary.main,
                    height: 3,
                  },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "rgba(17, 17, 17, 0.84)",
                    padding: "12px 16px",
                    minHeight: "auto",
                    "&.Mui-selected": {
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    },
                    "&:hover": {
                      backgroundColor: theme.palette.secondary.light,
                    },
                  },
                }}
              >
                <Tab value="company" label="Company Information" />
                <Tab value="personal" label="Personal Information" />
                <Tab value="password" label="Password" />
                <Tab value="integrations" label="Integrations" />
                {process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID && process.env.NEXT_PUBLIC_CALENDLY_CLIENT_SECRET && (
                  <Tab value="calendly" label="Calendly" />
                )}
              </Tabs>
            </Box>
            {activeSection === "company" && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(17, 17, 17, 0.92)",
                      fontWeight: 500,
                      mb: 1,
                      fontSize: { xs: "18px", md: "20px" },
                    }}
                  >
                    Company Information
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(17, 17, 17, 0.6)", fontSize: { xs: "14px", md: "15px" }, lineHeight: 1.6 }}
                  >
                    Update your company details, logo, and company description.
                  </Typography>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 3 },
                    mb: 4,
                    bgcolor: "#F8F9FA",
                    borderRadius: "8px",
                    border: "0.8px solid rgba(17, 17, 17, 0.08)",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "rgba(17, 17, 17, 0.92)",
                      fontWeight: 500,
                      mb: 2,
                      fontSize: { xs: "16px", md: "18px" },
                    }}
                  >
                    Company Logo
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "center", sm: "flex-start" },
                      gap: 3,
                    }}
                  >
                    {profileData?.company?.company_logo && (
                      <Avatar
                        src={profileData.company.company_logo}
                        alt={profileData.company.company_name}
                        sx={{
                          width: { xs: 80, sm: 100 },
                          height: { xs: 80, sm: 100 },
                          border: "1px solid rgba(17, 17, 17, 0.08)",
                          "& img": {
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          },
                        }}
                      />
                    )}
                    <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(17, 17, 17, 0.6)", mb: 2, fontSize: { xs: "14px", md: "15px" } }}
                      >
                        Upload a logo for your company. This will be displayed on job postings and communications.
                      </Typography>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={logoUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        sx={{
                          textTransform: "none",
                          borderRadius: "8px",
                          width: { xs: "100%", sm: "auto" },
                        }}
                        disabled={logoUploading}
                      >
                        {logoUploading ? "Uploading..." : "Upload Logo"}
                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                      </Button>
                    </Box>
                  </Box>
                </Paper>

                <Typography
                  variant="subtitle1"
                  sx={{ color: "rgba(17, 17, 17, 0.92)", fontWeight: 500, mb: 2, fontSize: { xs: "16px", md: "18px" } }}
                >
                  Company Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Company Name"
                      defaultValue={profileData?.company?.company_name}
                      onChange={(e) => handleProfileChange("company", "company_name", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Company Size"
                      defaultValue={profileData?.company?.number_of_employees}
                      onChange={(e) => handleProfileChange("company", "number_of_employees", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Website"
                      defaultValue={profileData?.company?.company_website}
                      onChange={(e) => handleProfileChange("company", "company_website", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Booking Link"
                      defaultValue={profileData?.company?.booking_link}
                      onChange={(e) => handleProfileChange("company", "booking_link", e.target.value)}
                      placeholder="https://calendly.com/yourcompany"
                      fullWidth
                      error={!!errors.bookingLink}
                      helperText={errors.bookingLink}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="About Company"
                      defaultValue={profileData?.company?.about_company}
                      onChange={(e) => handleProfileChange("company", "about_company", e.target.value)}
                      multiline
                      rows={4}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <PrimaryButton
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      fullWidth={window.innerWidth < 600}
                    >
                      {saving ? (
                        <>
                          {" "}
                          <CircularProgress size={24} color="inherit" />{" "}
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "16px", fontWeight: 600, color: "secondary.light" }}
                          >
                            Saving
                          </Typography>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </PrimaryButton>
                  </Grid>
                </Grid>
              </>
            )}
            {activeSection === "personal" && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(17, 17, 17, 0.92)",
                      fontWeight: 500,
                      mb: 1,
                      fontSize: { xs: "18px", md: "20px" },
                    }}
                  >
                    Personal Information
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(17, 17, 17, 0.6)", fontSize: { xs: "14px", md: "15px" }, lineHeight: 1.6 }}
                  >
                    Update your personal details and contact information.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="First Name"
                      defaultValue={profileData?.personal?.first_name}
                      onChange={(e) => handleProfileChange("personal", "first_name", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Last Name"
                      defaultValue={profileData?.personal?.last_name}
                      onChange={(e) => handleProfileChange("personal", "last_name", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Email"
                      defaultValue={profileData?.personal?.email}
                      onChange={(e) => handleProfileChange("personal", "email", e.target.value)}
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Phone Number"
                      defaultValue={profileData?.personal?.phone_number}
                      onChange={(e) => handleProfileChange("personal", "phone_number", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Job Title"
                      defaultValue={profileData?.personal?.job_title}
                      onChange={(e) => handleProfileChange("personal", "job_title", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <PrimaryButton
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      fullWidth={window.innerWidth < 600}
                    >
                      {saving ? (
                        <>
                          {" "}
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "16px", fontWeight: 600, color: "secondary.light" }}
                          >
                            Saving changes
                          </Typography>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </PrimaryButton>
                  </Grid>
                </Grid>
              </>
            )}

            {activeSection === "password" && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(17, 17, 17, 0.92)", fontWeight: 500, mb: 1, fontSize: "20px" }}
                  >
                    Change Password
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(17, 17, 17, 0.6)", fontSize: { xs: "14px", md: "15px" }, lineHeight: 1.6 }}
                  >
                    Update your password to keep your account secure.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Current Password"
                      type="password"
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="New Password"
                      type="password"
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password ? errors.password : "Minimum 8 characters recommended"}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Confirm New Password"
                      type="password"
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      fullWidth
                      error={!!errors.password}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <PrimaryButton variant="contained" onClick={handleChangePassword} disabled={saving}>
                      {saving ? (
                        <>
                          {" "}
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "16px", fontWeight: 600, color: "secondary.light" }}
                          >
                            Saving
                          </Typography>
                          <CircularProgress size={24} color="inherit" />
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </PrimaryButton>
                  </Grid>
                </Grid>
              </>
            )}

            {activeSection === "integrations" && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(17, 17, 17, 0.92)", fontWeight: 500, mb: 1, fontSize: "20px" }}
                  >
                    Integrations
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(17, 17, 17, 0.6)", fontSize: { xs: "14px", md: "15px" }, lineHeight: 1.6 }}
                  >
                    Connect your favorite tools and services to enhance your experience.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Groq API Key */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "8px",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                            Groq API Key
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.grey.100" }}>
                            Add your Groq API key to enable AI features across the app.
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <StyledTextField
                            key="Groq-api-key-field"
                            label="Groq API Key"
                            type={showGroqKey ? "text" : "password"}
                            fullWidth
                            defaultValue={profileData?.company?.ai_api_key}
                            onChange={(e) => handleProfileChange("company", "ai_api_key", e.target.value)}
                            placeholder="sk-..."
                            helperText={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <InfoOutlined sx={{ fontSize: 18, color: "rgba(17, 17, 17, 0.6)" }} />
                                <Typography variant="body2" sx={{ color: "rgba(17, 17, 17, 0.6)" }}>
                                  <>
                                    Don't have a key yet? Follow the guide to create one on the Groq dashboard and
                                    paste it here.{" "}
                                    <Link
                                      target="_blank"
                                      href="/dashboard/profile/Groq-api-key-setup"
                                      sx={{ color: "primary.main", textDecoration: "none" }}
                                    >
                                      Groq API key setup
                                    </Link>
                                    .
                                  </>
                                </Typography>
                              </Box>
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label={showGroqKey ? "Hide API key" : "Show API key"}
                                    onClick={() => setShowGroqKey((prev) => !prev)}
                                    edge="end"
                                  >
                                    {showGroqKey ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: { xs: "flex-start", md: "flex-end" },
                          }}
                        >
                          <PrimaryButton
                            variant="contained"
                            onClick={handleSaveGroqKey}
                            disabled={saving || !updatedProfileData?.company?.ai_api_key}
                          >
                            {saving ? "Saving..." : "Save Key"}
                          </PrimaryButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}

            {activeSection === "calendly" && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(17, 17, 17, 0.92)", fontWeight: 500, mb: 1, fontSize: "20px" }}
                  >
                    Calendly Events
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(17, 17, 17, 0.6)", fontSize: { xs: "14px", md: "15px" }, lineHeight: 1.6 }}
                  >
                    View and manage your scheduled events.
                  </Typography>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Upcoming Interviews
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={fetchCalendlyEvents}
                      disabled={loadingEvents}
                    >
                      {loadingEvents ? "Refreshing..." : "Refresh"}
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {loadingEvents ? (
                      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : calendlyEvents.length > 0 ? (
                      calendlyEvents.map((event) => (
                        <Paper
                          key={event.uri}
                          elevation={0}
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: "8px",
                            "&:hover": {
                              bgcolor: "rgba(0, 0, 0, 0.02)",
                              transition: "background-color 0.2s ease",
                            },
                          }}
                        >
                          <Box
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}
                          >
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                {event.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "text.grey.100" }}>
                                Guest: {event.invitees_counter.active}
                              </Typography>
                            </Box>
                            <Chip
                              label="Upcoming"
                              color="success"
                              size="small"
                              sx={{
                                bgcolor: "success.light",
                                color: "success.dark",
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.grey.100" }}>
                            <AccessTimeIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                              {new Date(event.start_time).toLocaleDateString()} •{" "}
                              {new Date(event.start_time).toLocaleTimeString()} -{" "}
                              {new Date(event.end_time).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Paper>
                      ))
                    ) : (
                      <Box
                        sx={{
                          p: 4,
                          textAlign: "center",
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      >
                        <EventNoteIcon sx={{ fontSize: 48, color: "text.grey.100", mb: 2 }} />
                        <Typography variant="body1" sx={{ color: "text.grey.100", mb: 1 }}>
                          No upcoming events scheduled
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.grey.100" }}>
                          Your scheduled events will appear here
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </>
            )}
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          zIndex: 9999,
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          icon={notification.severity === "success" ? <CheckIcon /> : undefined}
          sx={{
            minWidth: "300px",
            backgroundColor: "primary.main",
            color: "secondary.light",
            borderRadius: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& .MuiAlert-icon": {
              color: "#fff",
              marginRight: "8px",
              padding: 0,
            },
            "& .MuiAlert-message": {
              padding: "6px 0",
              fontSize: "16px",
              textAlign: "center",
              flex: "unset",
            },
            "& .MuiAlert-action": {
              padding: "0 8px 0 0",
              marginRight: 0,
              "& .MuiButtonBase-root": {
                color: "#fff",
                padding: 1,
              },
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            maxWidth: "400px",
            width: "100%",
            p: 2,
            "& .MuiDialogContent-root": {
              "&::-webkit-scrollbar": {
                width: "6px",
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(17, 17, 17, 0.2)",
                borderRadius: "3px",
                border: "2px solid transparent",
                backgroundClip: "padding-box",
                "&:hover": {
                  backgroundColor: "rgba(17, 17, 17, 0.3)",
                },
              },
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            color: "rgba(17, 17, 17, 0.92)",
            textAlign: "center",
            p: 2,
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", p: 2 }}>
          <Typography sx={{ color: "rgba(17, 17, 17, 0.6)", fontSize: "16px" }}>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            p: 2,
          }}
        >
          <Button
            onClick={() => setLogoutModalOpen(false)}
            sx={{
              textTransform: "none",
              bgcolor: theme.palette.primary.main,
              color: "#FFF",
              fontWeight: 500,
              fontSize: "16px",
              px: 3,
              py: 1,
              borderRadius: "8px",
              "&:hover": {
                bgcolor: "#6666E6",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              color: "rgba(17, 17, 17, 0.6)",
              fontWeight: 500,
              fontSize: "16px",
              px: 3,
              py: 1,
              borderRadius: "8px",
              border: "1px solid rgba(17, 17, 17, 0.14)",
              "&:hover": {
                color: "#D32F2F",
                borderColor: "#D32F2F",
                bgcolor: "rgba(211, 47, 47, 0.04)",
              },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
