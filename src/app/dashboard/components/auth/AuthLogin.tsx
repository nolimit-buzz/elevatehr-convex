"use client";
import React, { useState } from "react";
import { Box, Stack, TextField, Button, CircularProgress, Alert, Typography, Link } from "@mui/material";
import CustomTextField from "@/app/dashboard/components/forms/theme-elements/CustomTextField";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { AuthQueries } from "@/queries/auth.queries";
import { DefaultConstants } from "@/app/constants/defaults";
import { setWithExpiry } from "@/app/utils/authStorage";
import { setProfile } from "@/app/utils/authStorage";

interface AuthLoginProps {
  subtext?: React.ReactNode;
  subtitle?: React.ReactNode;
  onSuccess?: (response: any) => void;
}

export default function AuthLogin({ subtext, subtitle, onSuccess }: AuthLoginProps) {
  const router = useRouter();
  const { Login } = AuthQueries();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {
      email: "",
      password: "",
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) return;

    setLoading(true);

    const { result, error } = await Login({ email: formData.email, password: formData.password }).finally(() =>
      setLoading(false)
    );

    if (error) return setErrorMessage(error || "Login failed. Please try again.");
    if (result?.token) {
      setWithExpiry(DefaultConstants.tokenName, result.token);
      setProfile({
        personalInfo: result?.personalInfo,
        companyInfo: result?.companyInfo,
        notifications: result?.notifications,
      });
      onSuccess && onSuccess(result);
      router.push("/dashboard");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <CustomTextField
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleTextChange}
          error={!!errors.email}
          helperText={errors.email}
        />

        <CustomTextField
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleTextChange}
          error={!!errors.password}
          helperText={errors.password}
        />

        {subtitle && (
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            {subtitle}
          </Typography>
        )}

        {subtext && (
          <Typography variant="body1" sx={{ color: "text.grey.100", mb: 2 }}>
            {subtext}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            height: "48px",
            fontSize: "16px",
            fontWeight: 600,
            textTransform: "none",
            bgcolor: "secondary.main",
            "&:hover": {
              bgcolor: "secondary.dark",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
        </Button>
      </Stack>
    </Box>
  );
}
