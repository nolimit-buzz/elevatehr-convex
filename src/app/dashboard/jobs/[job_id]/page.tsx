'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Container,
  Box,
  Stack,
  Typography,
  CircularProgress,
  styled,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaidIcon from '@mui/icons-material/Paid';

export const dynamic = 'force-dynamic';

const Banner = styled(Box)(({ theme }) => ({
  width: '100%',
  background: theme.palette.primary.main,
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '28px',
}));

const Pill = styled(Chip)(({ theme }) => ({
  padding: '10px 12px',
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  color: '#fff',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  backgroundColor: '#4444E2',
  padding: '16px 44px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '100%',
  letterSpacing: '0.16px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#6666E6',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(68, 68, 226, 0.15)',
  }
}));

interface JobData {
  title: string;
  description: string;
  about_role: string;
  responsibilities: string;
  expectations: string;
  benefits?: string;
  location: string;
  work_model: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
}

const JobDetailsPage = () => {
  const theme = useTheme();
  const { job_id } = useParams();
  const router = useRouter();
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!job_id) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        const response = await axios.get<{ data: JobData }>(`https://app.elevatehr.ai/wp-json/elevatehr/v1/jobs/${job_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setJobData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to fetch job details. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [job_id]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6">Loading job details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#F1F4F9', minHeight: '100vh' }}>
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          backgroundImage: "url(/images/backgrounds/banner-bg.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "204px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%"
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            color: "rgba(255, 255, 255, 0.92)", 
            fontSize: "40px", 
            fontWeight: "600",
            textAlign: "center",
            width: "100%"
          }}
        >
          {jobData?.title}
        </Typography>
        <Stack 
          mt={2} 
          direction="row" 
          alignItems="center" 
          justifyContent="center"
          gap="8px"
          width="100%"
        >
          <Pill label={jobData?.location} />
          <Pill label={jobData?.work_model} />
          <Pill label={jobData?.job_type} />
          {jobData?.salary_min && jobData?.salary_max && (
            <Pill 
              icon={<PaidIcon />}
              label={`$${jobData.salary_min.toLocaleString()} - $${jobData.salary_max.toLocaleString()}`} 
            />
          )}
        </Stack>
      </Box>

      <Container sx={{ maxWidth: '1063px !important' }}>
        <Box sx={{ 
          backgroundColor: '#fff', 
          borderRadius: '8px',
          padding: '40px',
          marginBottom: '24px'
        }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                marginBottom: '16px',
                color: 'rgba(17, 17, 17, 0.92)'
              }}>
                Who we are
              </Typography>
              <Box 
                component="div"
                sx={{ color: 'rgba(17, 17, 17, 0.84)' }} 
                dangerouslySetInnerHTML={{ __html: jobData?.description || '' }} 
              />
            </Box>

            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                marginBottom: '16px',
                color: 'rgba(17, 17, 17, 0.92)'
              }}>
                About the Role
              </Typography>
              <Box 
                component="div"
                sx={{ color: 'rgba(17, 17, 17, 0.84)' }} 
                dangerouslySetInnerHTML={{ __html: jobData?.about_role || '' }} 
              />
            </Box>

            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                marginBottom: '16px',
                color: 'rgba(17, 17, 17, 0.92)'
              }}>
                Job Responsibilities
              </Typography>
              <Box 
                component="div"
                sx={{ color: 'rgba(17, 17, 17, 0.84)' }} 
                dangerouslySetInnerHTML={{ __html: jobData?.responsibilities || '' }} 
              />
            </Box>

            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                marginBottom: '16px',
                color: 'rgba(17, 17, 17, 0.92)'
              }}>
                Expectations of this Role
              </Typography>
              <Box sx={{ color: 'rgba(17, 17, 17, 0.84)' }}>
                <List sx={{ margin: 0, paddingLeft: '16px' }}>
                  {jobData?.expectations?.split('\n').map((expectation: string, index: number) => (
                    <ListItem key={index} sx={{ padding: '4px 0', display: 'list-item' }}>
                      <ListItemText 
                        primary={expectation}
                        sx={{ 
                          margin: 0,
                          '& .MuiTypography-root': { 
                            color: 'rgba(17, 17, 17, 0.84)',
                            fontSize: '16px',
                            lineHeight: '24px'
                          }
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>

            {jobData?.benefits && (
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  marginBottom: '16px',
                  color: 'rgba(17, 17, 17, 0.92)'
                }}>
                  Benefits
                </Typography>
                <Box 
                  component="div"
                  sx={{ color: 'rgba(17, 17, 17, 0.84)' }} 
                  dangerouslySetInnerHTML={{ __html: jobData?.benefits || '' }} 
                />
              </Box>
            )}
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <StyledButton
            variant="contained"
            onClick={() => router.push(`/dashboard/jobs/${job_id}/apply`)}
          >
            Apply for this Job
          </StyledButton>
        </Box>
      </Container>
    </Box>
  );
};

export default JobDetailsPage; 