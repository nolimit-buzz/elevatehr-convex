"use client";
import React, { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Typography, Button, Stack, Alert, CircularProgress } from "@mui/material";
import Link from "next/link";
import CustomTextField from "@/app/dashboard/components/forms/theme-elements/CustomTextField";
import axios from "axios";
import { motion, Variants } from "framer-motion";

interface RegisterProps {
  title?: string;
  subtitle?: ReactNode;
  subtext?: ReactNode;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  job_title: string;
  companyName: string;
  numberOfEmployees: string;
  phone_number: string;
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const titleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const buttonVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      delay: 0.8
    }
  }
};

const Register: React.FC<RegisterProps> = ({ title, subtitle, subtext }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    job_title: '',
    companyName: '',
    numberOfEmployees: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    numberOfEmployees: "",
    job_title: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Validate form fields
  const validateForm = () => {
    let valid = true;
    let newErrors = {
      name: "",
      email: "",
      password: "",
      companyName: "",
      numberOfEmployees: "",
      job_title: "",
      phone_number: "",
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.first_name) {
      newErrors.name = "First name is required";
      valid = false;
    }

    if (!formData.last_name) {
      newErrors.name = "Last name is required";
      valid = false;
    }

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

    if (!formData.companyName) {
      newErrors.companyName = "Company name is required";
      valid = false;
    }

    // if (!formData.numberOfEmployees) {
    //   newErrors.numberOfEmployees = "Number of employees is required";
    //   valid = false;
    // }

    // if (!formData.job_title) {
    //   newErrors.job_title = "Job title is required";
    //   valid = false;
    // }

    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required";
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
    try {
      const response = await axios.post("https://app.elevatehr.ai/wp-json/elevatehr/v1/register", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        company_name: formData.companyName,
        number_of_employees: formData.numberOfEmployees,
        job_title: formData.job_title,
        phone_number: formData.phone_number,
      });
      const token = response.data.token;
      localStorage.setItem("jwt", token); 
      setLoading(false);
      router.push("/onboarding"); 

    } catch (error) {
      setErrorMessage((error as any).response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {title && (
        <motion.div variants={titleVariants}>
          <Typography sx={{ color: "rgba(17, 17, 17, 0.92)", textAlign: "center", fontSize: "32px", fontWeight: 600, lineHeight: "120%", mb: 1 }}>
            {title}
          </Typography>
        </motion.div>
      )}

      {subtext && (
        <motion.div variants={titleVariants}>
          <Typography sx={{ color: "rgba(17, 17, 17, 0.68)", textAlign: "center", fontSize: "18px", fontWeight: 400, lineHeight: "120%", mb: 2 }}>
            {subtext}
          </Typography>
        </motion.div>
      )}

      <Stack spacing={'12px'}>
        <motion.div variants={itemVariants}>
          <CustomTextField
            label="First Name"
            name="first_name"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={handleTextChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CustomTextField
            label="Last Name"
            name="last_name"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChange={handleTextChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CustomTextField
            label="Email"
            name="email"
            placeholder="Enter your email"
            type="email"
            value={formData.email}
            onChange={handleTextChange}
            error={!!errors.email}
            helperText={errors.email}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CustomTextField
            label="Create Password"
            name="password"
            placeholder="Create your password"
            type="password"
            value={formData.password}
            onChange={handleTextChange}
            error={!!errors.password}
            helperText={errors.password}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CustomTextField
            label="Company Name"
            name="companyName"
            placeholder="Enter your company name"
            value={formData.companyName}
            onChange={handleTextChange}
            error={!!errors.companyName}
            helperText={errors.companyName}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CustomTextField
            label="Number of Employees"
            name="numberOfEmployees"
            placeholder="Enter number of employees"
            value={formData.numberOfEmployees}
            onChange={handleTextChange}
            error={!!errors.numberOfEmployees}
            helperText={errors.numberOfEmployees}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CustomTextField
            label="Job Title"
            name="job_title"
            placeholder="Enter your job title"
            value={formData.job_title}
            onChange={handleTextChange}
            error={!!errors.job_title}
            helperText={errors.job_title}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CustomTextField
            label="Phone Number"
            name="phone_number"
            placeholder="Enter your phone number"
            value={formData.phone_number}
            onChange={handleTextChange}
            error={!!errors.phone_number}
            helperText={errors.phone_number}
          />
        </motion.div>

        {errorMessage && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert severity="error">{errorMessage}</Alert>
          </motion.div>
        )}

        <motion.div variants={buttonVariants}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            sx={{ borderRadius: "8px", background: "#4444E2", padding: "18px 24px", color: "secondary.light", bgcolor: "primary.main", '&:hover': { bgcolor: "#4444E2AD" } }}
            disabled={loading}
          >
            {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ marginRight: '10px' }}>Creating Account</span><CircularProgress size={20} /> </div> : "Create Account"}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography sx={{ color: "rgba(17, 17, 17, 0.68)", textAlign: "center", fontSize: "18px", fontWeight: 400, lineHeight: "120%", mt: 2 }}>
            Already have an account?{" "}
            <Typography component={Link} href="/" sx={{ color: "primary.main", fontSize: "18px", fontWeight: 600, textDecoration: "underline" }}>
              Sign in
            </Typography>
          </Typography>
        </motion.div>
      </Stack>
    </motion.form>
  );
};

export default Register;
