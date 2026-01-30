import { Box, BoxProps } from '@mui/material';
import React from 'react';

interface BannerProps extends BoxProps {
  height?: string | number;
}

export const Banner: React.FC<BannerProps> = ({ children, height = '304px', ...props }) => {
  return (
    <Box
      {...props}
      sx={{
        width: '100%',
        height,
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
}; 