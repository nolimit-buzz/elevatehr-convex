'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Button,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  styled,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useRouter, useSearchParams } from 'next/navigation';
import Description from '@mui/icons-material/Description';
import Add from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <CircularProgress />,
});
import 'react-quill/dist/quill.snow.css';

interface Template {
  title: string;
  subject: string;
  content: string;
  tokens?: Record<string, string>;
}

interface TemplatesResponse {
  templates: Record<string, Template>;
}

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: "8px",
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '10px 20px',
  fontSize: theme.typography.pxToRem(16),
  color: theme.palette.secondary.light,
  fontWeight: theme.typography.fontWeightMedium,
  height: '52px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#6666E6',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(68, 68, 226, 0.15)',
  },
}))
const EmailTemplatePage = () => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const templateType = searchParams.get('type') || 'application_received';

  const [template, setTemplate] = useState<Template>({
    title: '',
    subject: '',
    content: ''
  });
  const [saving, setSaving] = useState(false);

  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        const response = await fetch('https://app.elevatehr.ai/wp-json/elevatehr/v1/email-templates', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data: TemplatesResponse = await response.json();
        if (data?.templates) {
          setTemplates(data.templates);
          console.log(data.templates);

          // Set initial template if available
          if (data.templates[templateType]) {
            setTemplate(data.templates[templateType]);
          }
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [templateType]);

  useEffect(() => {
    if (templates && templates[templateType]) {
      setTemplate(templates[templateType]);
    }
  }, [templateType, templates]);

  const handleTemplateClick = (type: string) => {
    router.push(`/dashboard/email-templates?type=${type}`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('jwt');

      // Create a copy of the templates object
      const updatedTemplates = { ...templates };

      // Update the current template
      updatedTemplates[templateType] = template;

      // Prepare request body
      const requestBody = {
        templates: updatedTemplates
      };

      const response = await fetch('https://app.elevatehr.ai/wp-json/elevatehr/v1/email-templates', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        console.log('Templates updated successfully');
        // Update the local state with the new templates
        setTemplates(updatedTemplates);
        setNotification({
          open: true,
          message: 'Template saved successfully',
          severity: 'success',
        });
      } else {
        console.error('Failed to update templates');
        setNotification({
          open: true,
          message: 'Failed to save template',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setNotification({
        open: true,
        message: 'Error saving template',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link'
  ];

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1280px', mx: 'auto' }}>
      <Box sx={{
        p: 3,
        mt: 3,
        bgcolor: theme.palette.primary.main,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundImage: 'url(/images/backgrounds/banner-bg.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'right',
        borderRadius: '10px'
      }}>
        <IconButton
          onClick={() => router.push('/dashboard')}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={600}>
          Email Templates
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', mt: 3 }}>
        <Box sx={{ width: '30%', minWidth: '300px', maxWidth: '416px' }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '10px',
              overflow: 'hidden',
              height: 'max-content'
            }}
          >
            <Typography
              variant="h6"
              sx={{ p: 2, borderBottom: '0.8px solid rgba(17, 17, 17, 0.08)' }}
            >
              Templates
            </Typography>
            <List>
              {Object.entries(templates || {}).map(([key, value]) => (
                <ListItem key={key} disablePadding sx={{
                  '&:not(:last-child)': {
                    borderBottom: '0.8px solid rgba(17, 17, 17, 0.08)',
                  }
                }}>
                  <ListItemButton
                    onClick={() => handleTemplateClick(key)}
                    selected={templateType === key}
                    sx={{
                      p: "12px",
                      bgcolor: '#FFF',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: theme.palette.secondary.light,
                        '& .MuiListItemIcon-root .MuiBox-root': {
                          bgcolor: 'secondary.dark',
                        },
                        '& .MuiListItemIcon-root svg path': {
                          stroke: theme.palette.primary.main,
                        },
                      },
                      '&.Mui-selected': {
                        bgcolor: theme.palette.secondary.light,
                        borderLeft: '3px solid #4444E2',
                        '&:hover': {
                          bgcolor: theme.palette.secondary.light,
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: templateType === key ? 'secondary.dark' : '#EEEFF2',
                          borderRadius: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        >
                          <path
                            d="M17.5 5.83341V14.1667C17.5 16.6667 16.25 18.3334 13.3333 18.3334H6.66667C3.75 18.3334 2.5 16.6667 2.5 14.1667V5.83341C2.5 3.33341 3.75 1.66675 6.66667 1.66675H13.3333C16.25 1.66675 17.5 3.33341 17.5 5.83341Z"
                            stroke={templateType === key ? theme.palette.primary.main : 'rgba(17, 17, 17, 0.84)'}
                            strokeWidth="1.25"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12.084 3.75V5.41667C12.084 6.33333 12.834 7.08333 13.7507 7.08333H15.4173"
                            stroke={templateType === key ? theme.palette.primary.main : 'rgba(17, 17, 17, 0.84)'}
                            strokeWidth="1.25"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.66602 10.8333H9.99935"
                            stroke={templateType === key ? theme.palette.primary.main : 'rgba(17, 17, 17, 0.84)'}
                            strokeWidth="1.25"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.66602 14.1667H13.3327"
                            stroke={templateType === key ? theme.palette.primary.main : 'rgba(17, 17, 17, 0.84)'}
                            strokeWidth="1.25"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={value.title}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: templateType === key ? theme.palette.primary.main : 'rgba(17, 17, 17, 0.84)',
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '100%',
                          letterSpacing: '0.16px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        <Box sx={{ flex: 1, ml: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: 'white',
              borderRadius: '10px',
              height: 'max-content',
            }}
          >
            <Stack spacing={3}>

              <TextField
                value={template.subject}
                onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFF',
                    borderRadius: '8px',
                    border: '0.8px solid rgba(17, 17, 17, 0.14)',
                    transition: 'all 0.3s ease',
                    '&.Mui-focused': {
                      border: `0.8px solid ${theme.palette.primary.main}`,
                      boxShadow: `0 0 0 1px ${theme.palette.primary.main}25`,
                    }
                  },
                  '& .MuiInputLabel-root': {
                    display: 'none'
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'rgba(17, 17, 17, 0.92)',
                    fontSize: '20px',
                    fontWeight: 600,
                    lineHeight: '100%',
                    letterSpacing: '0.1px',
                    padding: '12px 16px',
                  },
                  '& fieldset': {
                    border: 'none',
                  }
                }}
              />

              <Box sx={{
                '& .quill': {
                  bgcolor: '#FFF',
                  borderRadius: '8px',
                  border: '0.8px solid rgba(17, 17, 17, 0.14)',
                  transition: 'all 0.3s ease',
                  '&:focus-within': {
                    border: `0.8px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 0 0 1px ${theme.palette.primary.main}25`,
                  },
                  '& .ql-toolbar': {
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    border: 'none',
                    borderBottom: '0.8px solid rgba(17, 17, 17, 0.14)',
                  },
                  '& .ql-container': {
                    border: 'none',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                  }
                }
              }}>
                <ReactQuill
                  value={template.content}
                  onChange={(content) => setTemplate(prev => ({ ...prev, content }))}
                  modules={modules}
                  formats={formats}
                  style={{ height: '400px' }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <PrimaryButton
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <>        <Typography variant="body2" sx={{ fontSize: '16px', fontWeight: 600, color: 'secondary.light' }}>Saving</Typography>
                    <CircularProgress size={24} color="inherit" /></> : 'Save'}
                </PrimaryButton>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          zIndex: 9999,
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          icon={notification.severity === 'success' ? <CheckIcon /> : undefined}
          sx={{
            minWidth: '300px',
            backgroundColor: 'primary.main',
            color: 'secondary.light',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .MuiAlert-icon': {
              color: '#fff',
              marginRight: '8px',
              padding: 0,
            },
            '& .MuiAlert-message': {
              padding: '6px 0',
              fontSize: '15px',
              textAlign: 'center',
              flex: 'unset',
            },
            '& .MuiAlert-action': {
              padding: '0 8px 0 0',
              marginRight: 0,
              '& .MuiButtonBase-root': {
                color: '#fff',
                padding: 1,
              },
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailTemplatePage; 