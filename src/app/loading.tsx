import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(244, 247, 246, 0.8)', // theme background color with opacity
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: 'primary.main',
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          letterSpacing: 1.2,
          animation: 'pulse 1.5s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': { opacity: 0.6 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.6 },
          },
        }}
      >
        Loading...
      </Typography>
    </Box>
  );
}
