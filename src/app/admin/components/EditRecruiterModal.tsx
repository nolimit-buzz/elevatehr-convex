"use client";

import React, { useEffect, useState } from "react";
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
import type { MockRecruiter } from "../mock-data";
import type { NewRecruiterPayload } from "./NewRecruiterModal";

type Props = {
  open: boolean;
  onClose: () => void;
  recruiter: MockRecruiter;
};

type EditableRecruiter = NewRecruiterPayload;

const buildInitialValues = (recruiter: MockRecruiter): EditableRecruiter => {
  const [firstName, ...rest] = recruiter.primaryAdmin.split(" ");
  const lastName = rest.join(" ");

  return {
    company_name: recruiter.companyName,
    industry: recruiter.industry,
    company_logo: null,
    company_website: "",
    booking_link: "",
    number_of_employees: "",
    about_company: "",
    first_name: firstName ?? "",
    last_name: lastName ?? "",
    job_title: "",
    email: recruiter.email,
    phone_number: "",
    password: "",
  };
};

export default function EditRecruiterModal({ open, onClose, recruiter }: Props) {
  const [values, setValues] = useState<EditableRecruiter>(() => buildInitialValues(recruiter));

  useEffect(() => {
    if (open) {
      setValues(buildInitialValues(recruiter));
    }
  }, [open, recruiter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValues((prev) => ({ ...prev, company_logo: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder until wired to backend
    // Here we would call a mutation to persist changes
    console.log("Updated recruiter profile", recruiter.id, values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit recruiter profile</DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company name"
                name="company_name"
                value={values.company_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
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
                fullWidth
                label="First name"
                name="first_name"
                value={values.first_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last name"
                name="last_name"
                value={values.last_name}
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
                label="Email"
                name="email"
                type="email"
                value={values.email}
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
                fullWidth
                label="Temporary password"
                name="password"
                type="password"
                helperText="Optional: reset the primary admin's sign-in password."
                value={values.password}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" sx={{ textTransform: "none", fontWeight: 600 }} onClick={handleSubmit}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

