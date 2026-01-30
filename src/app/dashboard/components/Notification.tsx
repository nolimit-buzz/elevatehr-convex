import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        zIndex: 9999,
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        icon={severity === 'success' ? <CheckIcon /> : undefined}
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
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 