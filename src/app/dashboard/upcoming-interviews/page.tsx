'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Stack,
  Button,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PageContainer from '@/app/dashboard/components/container/PageContainer';
import { CalendlyEvent } from '@/app/types/calendly';
import { 
  format, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import AddIcon from '@mui/icons-material/Add';

const UpcomingInterviewsPage = () => {
  const [events, setEvents] = useState<CalendlyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const fetchCalendlyEvents = async () => {
      try {
        setLoading(true);
        const personalAccessToken = process.env.NEXT_PUBLIC_PERSONAL_ACCESS_TOKEN;

        if (!personalAccessToken) {
          throw new Error('Personal access token is not configured');
        }

        // First get the user profile
        const userResponse = await fetch('https://api.calendly.com/users/me', {
          headers: {
            'Authorization': `Bearer ${personalAccessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await userResponse.json();
        const userUri = userData.resource.uri;

        // Then fetch events using the user's URI
        const eventsResponse = await fetch(`https://api.calendly.com/scheduled_events?user=${userUri}`, {
          headers: {
            'Authorization': `Bearer ${personalAccessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events');
        }

        const eventsData = await eventsResponse.json();
        setEvents(eventsData.collection || []);
      } catch (error) {
        console.error('Error fetching Calendly events:', error);
        setError('Failed to fetch events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendlyEvents();
  }, []);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_time), date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          px: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              sx={{ cursor: 'pointer', p: 1, '&:hover': { opacity: 0.7 } }}
            >
              ←
            </Box>
            <Box
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              sx={{ cursor: 'pointer', p: 1, '&:hover': { opacity: 0.7 } }}
            >
              →
            </Box>
          </Box>
        </Box>
        <Grid container spacing={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid item xs={12/7} key={day}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: 'rgba(17, 17, 17, 0.6)',
                  fontWeight: 500,
                  mb: 1
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

            return (
              <Grid item xs={12/7} key={day.toString()}>
                <Box
                  onClick={() => setSelectedDate(day)}
                  sx={{
                    aspectRatio: '1',
                    p: 1,
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: isSelected ? 'primary.main' : 'transparent',
                    color: isSelected ? 'white' : isToday ? 'primary.main' : isCurrentMonth ? 'inherit' : 'rgba(17, 17, 17, 0.4)',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: isSelected ? 'primary.dark' : 'rgba(68, 68, 226, 0.04)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isToday ? 600 : 400,
                      color: 'inherit',
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  {dayEvents.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 0.5,
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(68, 68, 226, 0.1)',
                        borderRadius: '12px',
                        px: 1,
                        py: 0.25,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? 'white' : 'primary.main',
                          fontWeight: 500,
                          fontSize: '11px',
                        }}
                      >
                        {dayEvents.length} {dayEvents.length === 1 ? 'interview' : 'interviews'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <PageContainer title="Upcoming Interviews" description="View all upcoming interviews">
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: "rgba(17, 17, 17, 0.92)",
                mb: 1,
              }}
            >
              Upcoming Interviews
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(17, 17, 17, 0.6)",
                fontSize: "16px",
              }}
            >
              View and manage all your scheduled interviews
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              px: 3,
              py: 1.5,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Schedule Interview
          </Button>
        </Stack>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                p: 2,
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {renderCalendar()}
              </LocalizationProvider>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                height: '100%',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : error ? (
                <Typography color="error" sx={{ p: 2 }}>
                  {error}
                </Typography>
              ) : selectedDateEvents.length === 0 ? (
                <Typography sx={{ p: 2, color: 'rgba(17, 17, 17, 0.6)' }}>
                  No interviews scheduled for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'this date'}
                </Typography>
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(17, 17, 17, 0.92)',
                      fontWeight: 500,
                      fontSize: '18px',
                      mb: 2,
                    }}
                  >
                    Interviews for {format(selectedDate!, 'MMMM d, yyyy')}
                  </Typography>
                  {selectedDateEvents.map((event) => (
                    <Box
                      key={event.uri}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: 'rgba(68, 68, 226, 0.04)',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(68, 68, 226, 0.08)',
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'rgba(17, 17, 17, 0.92)',
                          fontWeight: 500,
                          fontSize: '18px',
                          mb: 1,
                        }}
                      >
                        {event.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(17, 17, 17, 0.6)',
                          fontSize: '14px',
                          mb: 0.5,
                        }}
                      >
                        {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                      </Typography>
                      {event.location && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(17, 17, 17, 0.6)',
                            fontSize: '14px',
                          }}
                        >
                          {event.location.type === 'physical' ? 'Location: ' : 'Meeting: '}
                          {event.location.location}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default UpcomingInterviewsPage; 