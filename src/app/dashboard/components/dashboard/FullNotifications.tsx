"use client";
import React from "react";
import { Box, Typography, Stack, CircularProgress, List, ListItem, Divider, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "../shared/DashboardCard";

interface NotificationData {
  id: string | number;
  title: string;
  content: string;
  date: string;
  read: boolean;
  type: string;
}

interface FullNotificationsProps {
  notifications: NotificationData[];
  loading: boolean;
  error: string | null;
}

const NotificationItem: React.FC<{ notification: NotificationData }> = ({ notification }) => {
  const theme = useTheme();
  return (
    <>
      <ListItem sx={{ height: "auto", minHeight: 56, padding: 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", width: "100%", px: 2.5, py: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.secondary.light,
              color: "#4343E1",
              mt: 0.5,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10.0167 2.4248C7.25841 2.4248 5.01674 4.66647 5.01674 7.4248V9.83314C5.01674 10.3415 4.80007 11.1165 4.54174 11.5498L3.58341 13.1415C2.99174 14.1248 3.40007 15.2165 4.48341 15.5831C8.07507 16.7831 11.9501 16.7831 15.5417 15.5831C16.5501 15.2498 16.9917 14.0581 16.4417 13.1415L15.4834 11.5498C15.2334 11.1165 15.0167 10.3415 15.0167 9.83314V7.4248C15.0167 4.6748 12.7667 2.4248 10.0167 2.4248Z"
                stroke={theme.palette.grey[300]}
                strokeWidth="1.25"
                strokeMiterlimit="10"
                strokeLinecap="round"
              />
              <path
                d="M11.5582 2.6667C11.2999 2.5917 11.0332 2.53337 10.7582 2.50003C9.95819 2.40003 9.19152 2.45837 8.47485 2.6667C8.71652 2.05003 9.31652 1.6167 10.0165 1.6167C10.7165 1.6167 11.3165 2.05003 11.5582 2.6667Z"
                stroke={theme.palette.grey[300]}
                strokeWidth="1.25"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.5166 15.8833C12.5166 17.2583 11.3916 18.3833 10.0166 18.3833C9.33327 18.3833 8.69993 18.1 8.24993 17.65C7.79993 17.2 7.5166 16.5666 7.5166 15.8833"
                stroke={theme.palette.grey[300]}
                strokeWidth="1.25"
                strokeMiterlimit="10"
              />
            </svg>
          </Avatar>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: "rgba(17, 17, 17, 0.92)",
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "0.14px",
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {notification.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(17, 17, 17, 0.84)",
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "0.14px",
                "& b": {
                  fontWeight: 600,
                },
              }}
              dangerouslySetInnerHTML={{ __html: notification.content }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(17, 17, 17, 0.52)",
                fontSize: 12,
                lineHeight: "12px",
                letterSpacing: "0.12px",
                mt: 1,
                display: "block",
              }}
            >
              {notification.date
                ? new Date(notification.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No date"}
            </Typography>
          </Box>
        </Box>
      </ListItem>
      <Divider sx={{ borderColor: "rgba(17, 17, 17, 0.08)" }} />
    </>
  );
};

const FullNotifications: React.FC<FullNotificationsProps> = ({ notifications, loading, error }) => {
  return (
    <DashboardCard>
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" p={2}>
          {error}
        </Typography>
      ) : notifications.length === 0 ? (
        <Typography color="text.secondary" p={2}>
          No notifications
        </Typography>
      ) : (
        <List disablePadding>
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </List>
      )}
    </DashboardCard>
  );
};

export default FullNotifications;
