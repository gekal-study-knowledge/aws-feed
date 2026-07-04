'use client';

import * as React from 'react';
import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArticleIcon from '@mui/icons-material/Article';

interface DailySummaryProps {
  overview: string;
  topics?: string[];
  articleCount?: number;
  generatedBy?: string;
  generatedAt?: string;
}

export default function DailySummary({
  overview,
  topics = [],
  articleCount,
  generatedBy,
  generatedAt,
}: DailySummaryProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        mb: 4,
        borderRadius: '16px',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, rgba(255, 153, 0, 0.06) 0%, rgba(35, 47, 62, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(255, 153, 0, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            AI による概要
          </Typography>
        </Box>
        {typeof articleCount === 'number' && (
          <Chip
            icon={<ArticleIcon />}
            label={`${articleCount} 記事`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      <Typography
        variant="body1"
        sx={{ lineHeight: 1.9, color: 'text.primary', whiteSpace: 'pre-wrap' }}
      >
        {overview}
      </Typography>

      {topics.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}
          >
            主要トピック
          </Typography>
          <Stack component="ul" spacing={1} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
            {topics.map((topic, index) => (
              <Box
                key={index}
                component="li"
                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}
              >
                <Box
                  sx={{
                    mt: '0.55em',
                    flexShrink: 0,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  {topic}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {(generatedBy || generatedAt) && (
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 3, color: 'text.secondary', fontStyle: 'italic' }}
        >
          {[generatedBy && `${generatedBy} が生成`, generatedAt].filter(Boolean).join(' · ')}
        </Typography>
      )}
    </Paper>
  );
}
