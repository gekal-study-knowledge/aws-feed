'use client';

import * as React from 'react';
import { Alert, IconButton, Box, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface PostUpdateNotifierProps {
  year: string;
  month: string;
  day: string;
  slug: string;
  newsCounter?: number;
}

const VISITED_KEY = 'visited_posts';

const getVisitedPosts = (): Record<string, number> => {
  if (typeof window === 'undefined') return {};

  let visitedPosts: Record<string, number> = {};
  try {
    const parsedData = JSON.parse(localStorage.getItem(VISITED_KEY) || '{}');

    if (Array.isArray(parsedData)) {
      parsedData.forEach((postId) => {
        if (typeof postId === 'string') {
          visitedPosts[postId] = -1;
        }
      });
    } else if (parsedData !== null && typeof parsedData === 'object') {
      visitedPosts = parsedData as Record<string, number>;
    }
  } catch (error) {
    console.error('Failed to parse visited_posts:', error);
  }
  return visitedPosts;
};

const cleanupOldPostData = (visitedPosts: Record<string, number>): Record<string, number> => {
  const now = new Date();
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const filtered: Record<string, number> = {};
  Object.entries(visitedPosts).forEach(([postId, counter]) => {
    // postId format: YYYY/MM/DD/slug
    const parts = postId.split('/');
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const postDate = new Date(year, month - 1, day);

      // 先月の一日以降のデータのみ保持
      if (postDate >= firstOfLastMonth) {
        filtered[postId] = counter;
      }
    } else {
      // パースできないものは削除
      filtered[postId] = counter;
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
}: PostUpdateNotifierProps) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const currentPostId = `${year}/${month}/${day}/${slug}`;

  React.useEffect(() => {
    // クライアントサイドでのみ実行
    let visitedPosts = getVisitedPosts();
    const previousCounter = visitedPosts[currentPostId];

    // 前回保存されたカウントと比較
    if (previousCounter !== undefined && previousCounter !== newsCounter) {
      setMessage(
        `新しい更新があります（前回確認時: ${previousCounter}件 -> 現在: ${newsCounter}件）`,
      );
      setOpen(true);
    }

    // 現在の状態を保存（常に最新に更新する）
    visitedPosts[currentPostId] = newsCounter;

    // 古いデータをクリーンアップ
    visitedPosts = cleanupOldPostData(visitedPosts);

    localStorage.setItem(VISITED_KEY, JSON.stringify(visitedPosts));
  }, [currentPostId, newsCounter]);

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
