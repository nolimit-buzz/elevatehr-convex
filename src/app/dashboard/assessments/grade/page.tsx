'use client';
import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, Stack, Divider, Link } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

const OpenAIKeySetupPage = () => {
  const router = useRouter();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
      {/* Back Button */}
      <Button
        component={Link}
        href="/dashboard/profile"
        sx={{
            borderRadius: '100px',
            border: '1px solid rgba(17, 17, 17, 0.14)',
          color: 'rgba(17, 17, 17, 0.6)',
            fontWeight: 500,
            fontSize: '15px',
          textTransform: 'none',
          mb: 3,
        }}
        startIcon={<ArrowBack />}
      >
        Back to Profile
      </Button>

      <Paper elevation={0} sx={{ p: 4, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          OpenAI API Key Setup
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              Step 1: Create/Open your OpenAI account
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.grey.100', mb: 2 }}>
              Visit the OpenAI platform to sign in or create an account.
            </Typography>
            <Button variant="contained" href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" sx={{ mb: 2 }}>
              Go to OpenAI Platform
            </Button>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              Step 2: Create a new API key
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.grey.100', mb: 2 }}>
              In the OpenAI dashboard, navigate to <strong>View API keys</strong> and click <strong>Create new secret key</strong>.
            </Typography>
            <Button variant="outlined" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
              Open API Keys Page
            </Button>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              Step 3: Copy and paste your key
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.grey.100', mb: 2 }}>
              Copy the generated key (starts with <code>sk-</code>) and paste it into the field on your Profile → Integrations page.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              Security tips
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.grey.100' }}>
              Treat your API key like a password. Do not share it publicly, and rotate it periodically from your OpenAI account.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default OpenAIKeySetupPage;