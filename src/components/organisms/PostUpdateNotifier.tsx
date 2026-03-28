'use client';

import * as React from 'react';
import { Alert, IconButton, Box, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface PostUpdateNotifierProps {
  date: string;
  newsCounter?: number;
}

export default function PostUpdateNotifier({ date, newsCounter = -1 }: PostUpdateNotifierProps) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    // クライアントサイドでのみ実行
    const storageKey = `aws_feed_post_${date}`;
    const lastVisitJson = localStorage.getItem(storageKey);
    const now = new Date().toISOString();

    if (lastVisitJson) {
      try {
        const lastVisit = JSON.parse(lastVisitJson);
        // 前回保存されたカウントと比較
        if (lastVisit.newsCounter !== newsCounter) {
          setMessage(
            `新しい更新があります（前回確認時: ${lastVisit.newsCounter}件 -> 現在: ${newsCounter}件）`,
          );
          setOpen(true);
        }
      } catch (e) {
        console.error('Failed to parse last visit from localStorage', e);
      }
    }

    // 現在の状態を保存（常に最新に更新する）
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        date,
        newsCounter,
        timestamp: now,
      }),
    );
  }, [date, newsCounter]);

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
