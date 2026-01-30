"use client";
import React, { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, Stack, Alert } from "@mui/material";
import Link from "next/link";
import CustomTextField from "@/app/dashboard/components/forms/theme-elements/CustomTextField";
import axios from "axios";
import { DefaultConstants } from "@/app/constants/defaults";
import { AuthQueries } from "@/queries/auth.queries";

interface AuthLoginProps {
  title?: string;
  subtitle?: ReactNode;
  subtext?: ReactNode;
}

const AuthLogin: React.FC<AuthLoginProps> = ({ title, subtitle, subtext }) => {
  const router = useRouter();
  const { Login } = AuthQueries();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem(DefaultConstants.tokenName);
    if (token) router.push("/dashboard");
  }, [router]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validate form fields
  const validateForm = () => {
    let valid = true;
    let newErrors = { email: "", password: "" };
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
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
      sessionStorage.setItem(DefaultConstants.tokenName, result.token);
      sessionStorage.setItem(
        "userProfile",
        JSON.stringify({
          personalInfo: result?.personalInfo,
          companyInfo: result?.companyInfo,
          notifications: result?.notifications,
        })
      );
      return router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {title && (
        <Typography
          sx={{
            color: "rgba(17, 17, 17, 0.92)",
            textAlign: "center",
            fontSize: "32px",
            fontWeight: 600,
            lineHeight: "120%",
            mb: 1,
          }}
        >
          {title}
        </Typography>
      )}

      {subtext && (
        <Typography
          sx={{
            color: "rgba(17, 17, 17, 0.68)",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 400,
            lineHeight: "120%",
            mb: 2,
          }}
        >
          {subtext}
        </Typography>
      )}

      <Stack spacing={1}>
        <CustomTextField
          label="Email"
          name="email"
          placeholder="Enter your email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
        <CustomTextField
          label="Password"
          name="password"
          placeholder="Enter your password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
        />

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{
            borderRadius: "8px",
            background: "#4444E2",
            padding: { xs: "12px 16px", sm: "18px 24px" },
            color: "secondary.light",
            bgcolor: "primary.main",
            fontSize: { xs: "14px", sm: "16px" },
            "&:hover": {
              backgroundColor: "#6666E6",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(68, 68, 226, 0.15)",
            },
          }}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        <Typography
          sx={{
            color: "rgba(17, 17, 17, 0.68)",
            textAlign: "center",
            fontSize: { xs: "14px", sm: "18px" },
            fontWeight: 400,
            lineHeight: "120%",
            mt: 1,
          }}
        >
          Don&apos;t have an account?{" "}
          <Typography
            component={Link}
            href="/authentication/register"
            sx={{
              color: "primary.main",
              fontSize: { xs: "12px", sm: "18px" },
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Create an account
          </Typography>
        </Typography>

        <Typography
          component={Link}
          href="/"
          sx={{
            color: "primary.main",
            mt: 0.5,
            textAlign: "center",
            fontSize: { xs: "14px", sm: "18px" },
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          Forgot Password?
        </Typography>
      </Stack>
    </form>
  );
};

export default AuthLogin;
