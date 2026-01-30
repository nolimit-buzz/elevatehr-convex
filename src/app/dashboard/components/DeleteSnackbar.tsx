"use client";
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface DeleteSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
}

const SuccessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" fill="#292D32" />
    <path d="M10.58 15.58C10.38 15.58 10.19 15.5 10.05 15.36L7.22 12.53C6.93 12.24 6.93 11.76 7.22 11.47C7.51 11.18 7.99 11.18 8.28 11.47L10.58 13.77L15.72 8.63001C16.01 8.34001 16.49 8.34001 16.78 8.63001C17.07 8.92001 17.07 9.40001 16.78 9.69001L11.11 15.36C10.97 15.5 10.78 15.58 10.58 15.58Z" fill="#292D32" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48C9.5 5.48 8.02 5.58 6.54 5.78L3 5.98" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.96" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.85 9.14L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.33 16.5H13.66" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 12.5H14.5" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteSnackbar: React.FC<DeleteSnackbarProps> = ({ 
  open, 
  message, 
  onClose, 
  autoHideDuration = 3000 
}) => {
  const isDeleteMessage = message.toLowerCase().includes('delete') || message.toLowerCase().includes('deleted');

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ zIndex: 1301 }}
    >
      <Alert
        onClose={onClose}
        severity="success"
        icon={isDeleteMessage ? <DeleteIcon /> : <SuccessIcon />}
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

export default DeleteSnackbar;