"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Form, FormField } from "@/app/dashboard/components/ui/form";
import { formSchema, type Inputs } from "@/app/lib/schema";
import { useState, useEffect } from "react";
import { FORM_SUBMIT_URL } from "@/app/lib/constants";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import Progress from "@/app/dashboard/layout/progress";
import axios from "axios";
import Image from 'next/image';

interface FormField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  required_fields: FormField[];
  custom_fields: FormField[];
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F8F9FB',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    padding: '16px',
    fontSize: '16px',
    color: 'rgba(17, 17, 17, 0.92)',
    fontWeight: 500,
    '&::placeholder': {
      fontSize: '16px',
      color: 'rgba(17, 17, 17, 0.48)',
    },
  },
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 600,
  color: theme.palette.secondary.light,
  marginBottom: '8px',
  '&.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 500,
  color: theme.palette.error.main,
  marginTop: '4px',
}));

export default function Typeform({
  params,
}: {
  params: { job_id: string };
}) {
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const delta = currentStep - previousStep;

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(
          `https://app.elevatehr.ai/wp-json/elevatehr/v1/active-jobs/${params.job_id}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Form data response:', response.data);
        setFormData(response.data.jobs.application_form);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Failed to load application form");
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [params.job_id]);

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
  });

  if (isLoading) {
        return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: 'primary.main'
      }}>
        <CircularProgress sx={{ color: 'white' }} />
          </Box>
        );
      }

  if (!formData) {
      return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: 'primary.main'
      }}>
        <Typography color="white">No form data available</Typography>
        </Box>
      );
    }

  const allFields = [...formData.required_fields, ...formData.custom_fields];
  const currentField = allFields[currentStep];
console.log(allFields, currentField)
  if (isSubmitted) {
      return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="space-y-8 w-full">
          <Image
            src="/assets/thankyou.gif"
            alt="Completed"
            width={500}
            height={300}
            className="w-1/2 w-50 mx-auto rounded-lg"
            priority
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              Thank you for submitting the form
            </h1>
            <p className="text-lg text-gray-600">
              We will get back to you soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

        return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <Progress currentStep={currentStep} totalSteps={allFields.length} />
      </div>
      {/* Form Container */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{backgroundColor:"primary.main", height:"100vh", width:"100vw"}}>
        <Form {...form}>
          <motion.div
            key={currentStep}
            className="w-full !max-w-[800px] mx-auto px-4"
            initial={{ y: delta >= 0 ? "100%" : "-100%", opacity: 0 }}
            exit={{ y: delta >= 0 ? "-100%" : "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <FormField
              control={form.control}
              name={currentField.key as keyof Inputs}
              render={({ field, fieldState: { error } }) => (
                <Box sx={{ mb: 4 }}>
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => {
                        setPreviousStep(currentStep);
                        setCurrentStep((step) => step - 1);
                      }}
              sx={{ 
                        mb: 2, 
                        fontWeight: 600,
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                      }}
                    >
                      Back
                    </Button>
                  )}
                  <Typography variant="body2" sx={{ mb: 1, color: 'secondary.light', fontWeight: 500 }}>
                    Step {currentStep + 1} of {allFields.length}
                  </Typography>
                  <StyledFormLabel>
                    {currentField.label}
                    {currentField.required && (
                      <Typography component="span" color="error" sx={{ ml: 0.5, fontWeight: 600 }}>
                        *
            </Typography>
                    )}
                  </StyledFormLabel>
                  <FormControl fullWidth error={!!error}>
                    {currentField.type === 'select' ? (
                      <Select
                        {...field}
                        displayEmpty
                sx={{
                  backgroundColor: '#F8F9FB',
                  borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'transparent',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'transparent',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                          '& .MuiSelect-select': {
                            color: 'rgba(17, 17, 17, 0.92)',
                            fontWeight: 500,
                          },
                        }}
                      >
                        <MenuItem value="" disabled sx={{ color: 'rgba(17, 17, 17, 0.48)' }}>
                          Select an option...
                        </MenuItem>
                        {currentField.options?.map((option) => (
                          <MenuItem key={option} value={option} sx={{ color: 'rgba(17, 17, 17, 0.92)', fontWeight: 500 }}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : currentField.type === 'radio' ? (
                      <RadioGroup
                        {...field}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                      >
                        {currentField.options?.map((option) => (
                          <FormControlLabel
                    key={option} 
                    value={option} 
                    control={<Radio />} 
                    label={option} 
                            sx={{
                              backgroundColor: '#F8F9FB',
                              borderRadius: '8px',
                              margin: '4px 0',
                              width: '100%',
                              padding: '12px 16px',
                              '& .MuiRadio-root': {
                                color: 'rgba(17, 17, 17, 0.48)',
                              },
                              '& .MuiTypography-root': {
                                color: 'rgba(17, 17, 17, 0.92)',
                                fontSize: '16px',
                                fontWeight: 500,
                              },
                            }}
                  />
                ))}
              </RadioGroup>
                    ) : (
                      <StyledTextField
                        {...field}
                        type={currentField.type}
                        placeholder={`Enter your ${currentField.label.toLowerCase()}`}
                        error={!!error}
                        helperText={error?.message}
                        autoFocus
                      />
                    )}
                    {error && (
                      <StyledFormHelperText>{error.message}</StyledFormHelperText>
                    )}
            </FormControl>
                </Box>
              )}
            />
            {/* Form Actions/Buttons */}
    <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
              gap: 2,
              mt: 4
            }}>
              {currentStep < allFields.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    const field = currentField.key as keyof Inputs;
                    form.trigger(field).then((output) => {
                      if (output) {
                        setPreviousStep(currentStep);
                        setCurrentStep((step) => step + 1);
                      }
                    });
                  }}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#fff',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                  >
                    Next
                </Button>
                ) : (
                <Button
                  variant="contained"
                    type="submit"
                  disabled={form.formState.isSubmitting}
                  onClick={form.handleSubmit(async (values) => {
                    try {
                      const token = localStorage.getItem('jwt');
                      const response = await axios.post(
                        `https://app.elevatehr.ai/wp-json/elevatehr/v1/jobs/${params.job_id}/applications`,
                        values,
                        {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        }
                      );
                      if (response.status === 200) {
                        toast.success("Form submitted successfully");
                        setIsSubmitted(true);
                      }
                    } catch (error) {
                      console.error("Error submitting form:", error);
                      toast.error("Failed to submit form");
                    }
                  })}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#fff',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              )}
              <Typography variant="body2" color="text.secondary">
                press <Typography component="span" sx={{ fontWeight: 600 }}>Enter ↵</Typography>
              </Typography>
            </Box>
          </motion.div>
        </Form>
      </Stack>
    </>
  );
} 