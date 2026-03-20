'use client';

import * as React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';

interface VisitedIconProps {
  year: string;
  month: string;
  day: string;
  slug: string;
}

export default function VisitedIcon({ year, month, day, slug }: VisitedIconProps) {
  const [visited, setVisited] = React.useState(false);

  React.useEffect(() => {
    const visitedKey = 'visited_posts';
    const visitedPosts = JSON.parse(localStorage.getItem(visitedKey) || '[]');
    const currentPostId = `${year}/${month}/${day}/${slug}`;
    if (visitedPosts.includes(currentPostId)) {
      setVisited(true);
    }
  }, [year, month, day, slug]);

  if (!visited) return null;

  return (
    <Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle', ml: 1 }}>
      <CheckCircleIcon fontSize="small" color="success" />
    </Box>
  );
}
