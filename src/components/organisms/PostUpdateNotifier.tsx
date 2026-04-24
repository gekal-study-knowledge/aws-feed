'use client';

import * as React from 'react';
import { Alert, IconButton, Box, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { getVisitedPosts, saveVisitedPosts, getJSTNow, VisitRecord } from '@/lib/store/useVisitedPost';

interface PostUpdateNotifierProps {
  year: string;
  month: string;
  day: string;
  slug: string;
  newsCounter?: number;
  onUpdateDetected?: (previousVisitedAt: string | undefined, newCount: number) => void;
}

const cleanupOldPostData = (
  visitedPosts: Record<string, VisitRecord>,
): Record<string, VisitRecord> => {
  const now = new Date();
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const filtered: Record<string, VisitRecord> = {};
  Object.entries(visitedPosts).forEach(([postId, record]) => {
    const parts = postId.split('/');
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const postDate = new Date(year, month - 1, day);
      if (postDate >= firstOfLastMonth) {
        filtered[postId] = record;
      }
    } else {
      filtered[postId] = record;
    }
  });
  return filtered;
};

export default function PostUpdateNotifier({
  year,
  month,
  day,
  slug,
  newsCounter = -1,
  onUpdateDetected,
}: PostUpdateNotifierProps) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const currentPostId = `${year}/${month}/${day}/${slug}`;

  React.useEffect(() => {
    let visitedPosts = getVisitedPosts();
    const record = visitedPosts[currentPostId];

    if (record !== undefined && record.counter !== newsCounter) {
      const newCount = Math.max(0, newsCounter - record.counter);
      setMessage(
        `新しい更新があります（前回確認時: ${record.counter}件 -> 現在: ${newsCounter}件）`,
      );
      setOpen(true);
      onUpdateDetected?.(record.visitedAt, newCount);
    }

    visitedPosts[currentPostId] = { counter: newsCounter, visitedAt: getJSTNow() };
    visitedPosts = cleanupOldPostData(visitedPosts);
    saveVisitedPosts(visitedPosts);
  }, [currentPostId, newsCounter, onUpdateDetected]);

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Collapse in={open}>
        <Alert
          severity="info"
          icon={<NotificationsActiveIcon fontSize="inherit" />}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            mb: 2,
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#ff9900' : '#ff9900'),
            color: '#232f3e',
            fontWeight: 'bold',
            '& .MuiAlert-icon': {
              color: '#232f3e',
            },
          }}
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
}
