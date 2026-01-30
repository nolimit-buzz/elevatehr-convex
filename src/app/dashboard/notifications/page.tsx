'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
} from '@mui/material';
import PageContainer from '@/app/dashboard/components/container/PageContainer';
import FullNotifications from '@/app/dashboard/components/dashboard/FullNotifications';

interface NotificationData {
  id: string | number;
  title: string;
  content: string;
  date: string;
  read: boolean;
  type: string;
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  personal: {
    first_name: string;
    last_name: string;
  };
  company: {
    name: string;
    logo: string;
    website: string;
  };
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: 0,
    name: '',
    email: '',
    role: '',
    personal: {
      first_name: '',
      last_name: '',
    },
    company: {
      name: '',
      logo: '',
      website: '',
    }
  });

  useEffect(() => {
    // Get profile data from localStorage
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setProfileData({
        id: profile.id || 0,
        name: profile.name || '',
        email: profile.email || '',
        role: profile.role || '',
        personal: {
          first_name: profile.personalInfo.first_name || '',
          last_name: profile.personalInfo.last_name || '',
        },
        company: {
          name: profile.companyInfo.company_name || '',
          logo: profile.companyInfo.company_logo || '',
          website: profile.companyInfo.company_website || '',
        }
      });
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await fetch('https://app.elevatehr.ai/wp-json/elevatehr/v1/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        const transformedData = data.map((notification: any) => ({
          id: notification.id,
          title: notification.title,
          content: notification.content,
          date: notification.date,
          read: notification.read || false,
          type: notification.type || 'default'
        }));
        setNotifications(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <PageContainer title="Notifications" description="View all notifications">
      <Paper
        elevation={0}
        sx={{
          my: 4,
          borderRadius: '10px',
          overflow: 'hidden',
          maxWidth: '1440px',
        }}
      >
        {/* Header Background */}
        <Box
          sx={{
            height: '120px',
            bgcolor: 'primary.main',
            position: 'relative',
            backgroundImage: 'url("/images/backgrounds/banner-bg.svg")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />

        {/* Profile Info Section */}
        <Box sx={{
          px: 4,
          pb: 3,
          pt: 3,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
          {/* Logo and Company Info */}
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 3,
            width: '100%',
            height: '50px',
          }}>
            {/* Logo */}
            <Avatar
              src={profileData.company.logo || '/images/logos/logo.svg'}
              alt={profileData.company.name}
              sx={{
                width: 130,
                height: 130,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                top: -80,
                bgcolor: 'white',
                padding: 1.5,
                '& img': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }
              }}
            />

            {/* Company Name and Website */}
            <Box sx={{ pb: 0, mt: -1 }}>
              <Typography variant="h4" fontWeight={600} sx={{ color: 'rgba(17, 17, 17, 0.92)', fontSize: '28px' }}>
                {profileData.company.name || 'ElevateHR'}
              </Typography>

              <Typography
                component="a"
                href={profileData.company.website ?
                  (profileData.company.website.startsWith('http') ? profileData.company.website : `https://${profileData.company.website}`) :
                  '#'}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(17, 17, 17, 0.6)',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                  mt: 0.5,
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  }
                }}
              >
                {profileData.company.website || 'www.elevatehr.ai'}
                <Box component="span" sx={{ display: 'inline-block', ml: 0.5, transform: 'translateY(1px)' }}>
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10.5H1.5V2H5.25V0.75H0.75C0.335786 0.75 0 1.08579 0 1.5V11.25C0 11.6642 0.335786 12 0.75 12H10.75C11.1642 12 11.5 11.6642 11.5 11.25V6.75H10V10.5ZM6.75 0.75V2H9.4425L3.2175 8.2275L4.2725 9.2825L10.5 3.0575V5.75H11.75V0.75H6.75Z" fill="currentColor" />
                  </svg>
                </Box>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "rgba(17, 17, 17, 0.92)",
            mb: 3,
          }}
        >
          Notifications
        </Typography>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <FullNotifications
            notifications={notifications.slice(0, 10)}
            loading={loading}
            error={error}
          />
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default NotificationsPage; 