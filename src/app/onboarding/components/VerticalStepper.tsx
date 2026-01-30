"use client";
import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface Step {
    label: string;
    description: string;
}

interface VerticalStepperProps {
    steps: Step[];
    activeStep: number;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({ steps, activeStep }) => {
    return (
        <Stack spacing={4}>
            {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;

                return (
                    <Stack direction="row" key={step.label} spacing={2.5} alignItems="center">
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `2px solid ${isActive ? 'white' : 'rgba(255, 255, 255, 0.3)'}`,
                                color: isCompleted ? 'white' : 'secondary.main',
                                transition: 'all 0.3s ease',
                                flexShrink: 0,
                                transform: isActive ? 'scale(1.1)' : 'none',
                            }}
                        >
                            {isCompleted ? <CheckIcon fontSize="small" /> : <Typography fontWeight="bold" fontSize="0.9rem">{index + 1}</Typography>}
                        </Box>
                        <Box>
                            <Typography 
                                fontWeight="bold" 
                                sx={{ 
                                    color: isActive || isCompleted ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: '1px',
                                    mb: 0.5
                                }}
                            >
                                {step.label}
                            </Typography>
                        </Box>
                    </Stack>
                );
            })}
        </Stack>
    );
};

export default VerticalStepper; 