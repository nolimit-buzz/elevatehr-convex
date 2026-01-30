import React from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  subTabValue: number;
  assessmentType?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ subTabValue, assessmentType }) => {
  const getEmptyStateText = () => {
    if (subTabValue === 1 && assessmentType) {
      return `No candidates have completed the ${assessmentType} assessment yet.`;
    }

    switch (subTabValue) {
      case 0:
        return "No applications for this job";
        case 1:
        return "No applications to review";
      case 2:
        return "No candidates in skill assessment";
      case 3:
        return "No interviews scheduled";
      case 4:
        return "No accepted candidates";
      case 5:
        return "No archived candidates";
      default:
        return "No candidates found";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "700px",
        px: 2,
      }}
    >
      {subTabValue === 0 && (
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="16" fill="#1CC47E" />
          <path
            d="M11.8335 11.8335L20.1668 20.1668"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.1667 13.5L20.1667 20.1667L13.5 20.1667"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {subTabValue === 1 && (
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="16" fill="#1CC47E" />
          <path
            d="M11.8335 11.8335L20.1668 20.1668"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.1667 13.5L20.1667 20.1667L13.5 20.1667"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {subTabValue === 2 && (
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="16" fill="#5656E6" />
          <path
            d="M15.1667 22.25H23.5001"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.1667 16.4167H23.5001"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.1667 10.5833H23.5001"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 10.5834L9.33333 11.4167L11.8333 8.91675"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 16.4167L9.33333 17.25L11.8333 14.75"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 22.2499L9.33333 23.0833L11.8333 20.5833"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {subTabValue === 3 && (
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="16" fill="#FD8535" />
          <path
            d="M16.4417 23.0167H11.1751C8.54175 23.0167 7.66675 21.2667 7.66675 19.5084V12.4917C7.66675 9.8584 8.54175 8.9834 11.1751 8.9834H16.4417C19.0751 8.9834 19.9501 9.8584 19.9501 12.4917V19.5084C19.9501 22.1417 19.0667 23.0167 16.4417 23.0167Z"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.2666 20.2499L19.95 18.6249V13.3665L22.2666 11.7415C23.4 10.9499 24.3333 11.4332 24.3333 12.8249V19.1749C24.3333 20.5665 23.4 21.0499 22.2666 20.2499Z"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5833 15.1667C16.2736 15.1667 16.8333 14.6071 16.8333 13.9167C16.8333 13.2264 16.2736 12.6667 15.5833 12.6667C14.8929 12.6667 14.3333 13.2264 14.3333 13.9167C14.3333 14.6071 14.8929 15.1667 15.5833 15.1667Z"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {subTabValue === 4 && (
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="16" fill="#D834DE" />
          <path
            d="M13.7083 13.5417C15.1916 14.0834 16.8083 14.0834 18.2916 13.5417"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.0166 7.66675H11.9833C10.2083 7.66675 8.7666 9.11675 8.7666 10.8834V22.6251C8.7666 24.1251 9.8416 24.7584 11.1583 24.0334L15.2249 21.7751C15.6583 21.5334 16.3583 21.5334 16.7833 21.7751L20.8499 24.0334C22.1666 24.7667 23.2416 24.1334 23.2416 22.6251V10.8834C23.2333 9.11675 21.7916 7.66675 20.0166 7.66675Z"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.0166 7.66675H11.9833C10.2083 7.66675 8.7666 9.11675 8.7666 10.8834V22.6251C8.7666 24.1251 9.8416 24.7584 11.1583 24.0334L15.2249 21.7751C15.6583 21.5334 16.3583 21.5334 16.7833 21.7751L20.8499 24.0334C22.1666 24.7667 23.2416 24.1334 23.2416 22.6251V10.8834C23.2333 9.11675 21.7916 7.66675 20.0166 7.66675Z"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {subTabValue === 5 && (
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="16" fill="#35B0FD" />
          <path
            d="M18.0332 21.8751L19.2999 23.1417L21.8332 20.6084"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.1334 15.0584C16.0501 15.0501 15.9501 15.0501 15.8584 15.0584C13.8751 14.9917 12.3001 13.3667 12.3001 11.3667C12.2917 9.32508 13.9501 7.66675 15.9917 7.66675C18.0334 7.66675 19.6917 9.32508 19.6917 11.3667C19.6917 13.3667 18.1084 14.9917 16.1334 15.0584Z"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.9917 24.1751C14.475 24.1751 12.9667 23.7917 11.8167 23.0251C9.80003 21.6751 9.80003 19.4751 11.8167 18.1334C14.1084 16.6001 17.8667 16.6001 20.1584 18.1334"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <Typography
        sx={{
          mt: 2,
          color: "rgba(17, 17, 17, 0.48)",
          fontSize: "16px",
          fontWeight: 400,
          textAlign: "center",
        }}
      >
        {subTabValue === 1 && assessmentType
          ? `No candidates have been assigned to ${assessmentType.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')} yet.`
          : subTabValue === 0
          ? "No applications for this job"
          : subTabValue === 1
          ? "No applications to review"
          : subTabValue === 2
          ? "No candidates in skill assessment"
          : subTabValue === 3
          ? "No interviews scheduled"
          : subTabValue === 4
          ? "No accepted candidates"
          : "No archived candidates"}
      </Typography>
    </Box>
  );
};

export default EmptyState; 