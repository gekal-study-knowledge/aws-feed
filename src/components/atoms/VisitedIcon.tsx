'use client';

import * as React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import { useVisitedPost } from '@/lib/store/useVisitedPost';

interface VisitedIconProps {
  year: string;
  month: string;
  day: string;
  slug: string;
  newsCounter?: number;
}

export default function VisitedIcon({
  year,
  month,
  day,
  slug,
  newsCounter = -1,
}: VisitedIconProps) {
  const { isVisited, isUpdated } = useVisitedPost({
    year,
    month,
    day,
    slug,
    newsCounter,
  });

  if (!isVisited) return null;

  return (
    <Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle', ml: 1 }}>
      <CheckCircleIcon fontSize="small" color={!isUpdated ? 'success' : 'warning'} />
    </Box>
  );
}
