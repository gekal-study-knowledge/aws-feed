'use client';

import * as React from 'react';
import { Alert, IconButton, Box, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface UpdateNotifierProps {
  currentLatestDate: string;
  currentNewsCount: number;
}

const STORAGE_KEY = 'aws_feed_last_update';

export default function UpdateNotifier({
  currentLatestDate,
  currentNewsCount,
}: UpdateNotifierProps) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    // クライアントサイドでのみ実行
    const lastUpdateJson = localStorage.getItem(STORAGE_KEY);
    const now = new Date().toISOString();

    if (lastUpdateJson) {
      try {
        const lastUpdate = JSON.parse(lastUpdateJson);
        // 前回保存された日付または件数と比較
        if (lastUpdate.date !== currentLatestDate || lastUpdate.count !== currentNewsCount) {
          setMessage(
            `新しい更新があります（前回確認時: ${lastUpdate.date} ${lastUpdate.count}件 -> 現在: ${currentLatestDate} ${currentNewsCount}件）`,
          );
          setOpen(true);
        }
      } catch (e) {
        console.error('Failed to parse last update from localStorage', e);
      }
    }

    // 現在の状態を保存（常に最新に更新する）
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        date: currentLatestDate,
        count: currentNewsCount,
        timestamp: now,
      }),
    );
  }, [currentLatestDate, currentNewsCount]);

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
