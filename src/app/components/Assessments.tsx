'use client';

import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import DashboardCard from '@/app/dashboard/components/shared/DashboardCard';
import { useTheme } from "@mui/material/styles";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { CalendlyEvent } from '@/app/types/calendly';
import { useRouter } from 'next/navigation';

interface AssessmentItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: string;
}

interface AssessmentProps {
  customStyle?: React.CSSProperties;
  assessments: AssessmentItem[];
  loading: boolean;
  error: string | null;
}

const Assessment: React.FC<AssessmentProps> = ({ customStyle, assessments = [], loading, error }) => {
  const theme = useTheme();
  const router = useRouter();

  const handleSeeAll = () => {
    router.push('/dashboard/assessments');
  };

  return (
    <DashboardCard customStyle={{ padding: '0px', ...customStyle }}>
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
            Recent Assessments
          </Typography>

          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center",
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
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
            <ArrowForwardOutlined
              sx={{ color: "secondary.main", width: 20, height: 20 }}
            />
          </Box>
        </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      ) : (!assessments || Array.isArray(assessments) && assessments.length === 0) ? (
        <Typography sx={{ p: 2, color: 'rgba(17, 17, 17, 0.6)' }}>
          No recent assessments
        </Typography>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
          {assessments.map((assessment, index) => (
            <React.Fragment key={assessment.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{
                  p: 2,
                  backgroundColor: 'rgba(68, 68, 226, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(68, 68, 226, 0.04)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '4px',
                    height: '100%',
                    backgroundColor: 'primary.main',
                    borderRadius: '2px',
                    mr: 2,
                    minHeight: '60px',
                  }}
                />
                <ListItemText
                  sx={{ m: 0 }}
                  primary={
                    <Typography
                      component="span"
                      variant="subtitle1"
                      sx={{ 
                        color: 'rgba(17, 17, 17, 0.92)',
                        fontWeight: 500,
                        fontSize: '15px',
                        lineHeight: '20px',
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
                            color: 'rgba(17, 17, 17, 0.6)',
                            fontSize: '13px',
                            lineHeight: '16px',
                            display: 'block',
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
                            color: 'rgba(17, 17, 17, 0.6)',
                            fontSize: '13px',
                            lineHeight: '16px',
                            display: 'block',
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
                            fontSize: '13px',
                            lineHeight: '16px',
                            display: 'block',
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
                    borderColor: 'rgba(17, 17, 17, 0.08)',
                    mx: 2,
                  }} 
                />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
      </Box>    
    </DashboardCard>
  );
};

export default Assessment; 