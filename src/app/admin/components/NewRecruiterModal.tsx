"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

export type NewRecruiterPayload = {
  company_name: string;
  industry: string;
  company_logo: File | null;
  company_website: string;
  booking_link: string;
  number_of_employees: string;
  about_company: string;
  first_name: string;
  last_name: string;
  job_title: string;
  email: string;
  phone_number: string;
  password: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: NewRecruiterPayload) => void;
};

const initialState: NewRecruiterPayload = {
  company_name: "",
  industry: "",
  company_logo: null,
  company_website: "",
  booking_link: "",
  number_of_employees: "",
  about_company: "",
  first_name: "",
  last_name: "",
  job_title: "",
  email: "",
  phone_number: "",
  password: "",
};

export default function NewRecruiterModal({ open, onClose, onSubmit }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<NewRecruiterPayload>(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValues((prev) => ({ ...prev, company_logo: file }));
  };

  const handleClose = () => {
    setStep(1);
    setValues(initialState);
    onClose();
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(values);
    } else {
      // Placeholder until wired to backend
      console.log("New recruiter payload", values);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Create new recruiter</DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {step === 1 && (
            <>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  color: "text.secondary",
                }}
              >
                Company details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Company name"
                    name="company_name"
                    value={values.company_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Industry"
                    name="industry"
                    value={values.industry}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company website"
                    name="company_website"
                    placeholder="https://"
                    value={values.company_website}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Interview booking link"
                    name="booking_link"
                    placeholder="Calendly or booking URL"
                    value={values.booking_link}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of employees"
                    name="number_of_employees"
                    value={values.number_of_employees}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    component="label"
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      width: "100%",
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "divider",
                      bgcolor: "action.hover",
                      px: 2,
                      py: 1,
                      minHeight: 56,
                      cursor: "pointer",
                      textAlign: "center",
                      "&:hover": {
                        borderColor: "primary.main",
                        filter: "brightness(0.98)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ArrowUpTrayIcon style={{ width: 20, height: 20, color: "#ffffff" }} />
                    </Box>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {values.company_logo ? "Change company logo" : "Upload company logo"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Transparent SVG or PNG works best.
                      </Typography>
                    </Box>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Box>
                  {values.company_logo && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Selected: {values.company_logo.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="About company"
                    name="about_company"
                    helperText="Short description used during onboarding and candidate communications."
                    value={values.about_company}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {step === 2 && (
            <>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  color: "text.secondary",
                }}
              >
                Primary admin
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="First name"
                    name="first_name"
                    value={values.first_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Last name"
                    name="last_name"
                    value={values.last_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="email"
                    label="Work email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job title"
                    name="job_title"
                    value={values.job_title}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone number"
                    name="phone_number"
                    value={values.phone_number}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="Temporary password"
                    name="password"
                    helperText="They can change this after first login."
                    value={values.password}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 2 && (
          <Button onClick={handleBack} sx={{ textTransform: "none" }}>
            Back
          </Button>
        )}
        <Button onClick={handleClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        {step === 1 ? (
          <Button
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 600 }}
            onClick={handleNext}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 600 }}
            onClick={handleSubmit}
          >
            Create recruiter
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

