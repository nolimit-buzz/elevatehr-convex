import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { CalendlyEvent } from '@/app/types/calendly';

interface CalendarProps {
  events: CalendlyEvent[];
  loading: boolean;
  error: string | null;
  customStyle?: React.CSSProperties;
}

const Calendar: React.FC<CalendarProps> = ({ events, loading, error, customStyle }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, ...customStyle }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, ...customStyle }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Box sx={{ p: 3, ...customStyle }}>
        <Typography color="text.secondary">No upcoming events</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, ...customStyle }}>
      {events.map((event) => (
        <Box
          key={event.uri}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {event.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Location: {event.location?.location || 'No location specified'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {event.status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invitees: {event.invitees_counter.active} / {event.invitees_counter.limit}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Calendar; 