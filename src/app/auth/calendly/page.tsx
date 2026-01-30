'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function CalendlyAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState({
    name: '',
    duration: 30,
    description: '',
    color: '#000000'
  });

  const handleCreateEventType = async () => {
    try {
      setLoading(true);
      
      // Exchange code for token first
      const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID}:${process.env.NEXT_PUBLIC_CALENDLY_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code!,
          redirect_uri: 'http://localhost:3000/auth/calendly'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      localStorage.setItem('calendly_access_token', accessToken);
      localStorage.setItem('calendly_refresh_token', tokenData.refresh_token);
      
      // Now create the event type
      const response = await fetch('https://stoplight.io/mocks/calendly/api-docs/395/one_off_event_types', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: eventData.name,
          host: 'https://api.calendly.com/users/karenziboh', // Replace with actual host URI
          duration: eventData.duration,
          date_setting: {
            type: 'date_range',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          location: {
            kind: 'google_conference'
          },
          description: eventData.description,
          color: eventData.color
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create event type');
      }

      const data = await response.json();
      
      // Send event data to parent and close
      window.opener?.postMessage({ 
        type: 'CALENDLY_AUTH_SUCCESS',
        eventData: {
          name: data.resource.name,
          duration: data.resource.duration,
          description: data.resource.description_plain,
          schedulingUrl: data.resource.scheduling_url
        }
      }, window.location.origin);
      window.close();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to create event type');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Create Calendly Event Type</Typography>
        
        <TextField
          label="Event Name"
          fullWidth
          value={eventData.name}
          onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="Duration (minutes)"
          type="number"
          fullWidth
          value={eventData.duration}
          onChange={(e) => setEventData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={eventData.description}
          onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="Color"
          type="color"
          fullWidth
          value={eventData.color}
          onChange={(e) => setEventData(prev => ({ ...prev, color: e.target.value }))}
          sx={{ mb: 3 }}
        />
        
        <Button
          variant="contained"
          onClick={handleCreateEventType}
          disabled={!eventData.name || loading}
          fullWidth
        >
          Create Event Type
        </Button>
      </Paper>
    </Box>
  );
} 