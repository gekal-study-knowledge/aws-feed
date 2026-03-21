'use client';

import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import UpdateIcon from '@mui/icons-material/Update';

interface PostHeaderProps {
  title: string;
  date: string;
  lastUpdated?: string;
}

export default function PostHeader({ title, date, lastUpdated }: PostHeaderProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        mb: 4,
        borderRadius: '16px',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? `linear-gradient(135deg, #232f3e 0%, #1a242f 100%)`
            : `linear-gradient(135deg, #1e2b3e 0%, #151e2b 100%)`,
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
        },
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 800,
          fontSize: { xs: '2rem', md: '2.75rem' },
          lineHeight: 1.2,
          mb: 3,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon fontSize="small" sx={{ opacity: 0.8 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500, opacity: 0.9 }}>
            {date}
          </Typography>
        </Box>
        {lastUpdated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UpdateIcon fontSize="small" sx={{ opacity: 0.8 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 400, opacity: 0.8 }}>
              最終更新: {lastUpdated}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
