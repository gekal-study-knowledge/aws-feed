'use client';

import * as React from 'react';
import { Box, Typography, Paper, Chip, Stack, Alert, AlertTitle } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArticleIcon from '@mui/icons-material/Article';

interface DailySummaryProps {
  overview: string;
  topics?: string[];
  articleCount?: number;
  generatedBy?: string;
  generatedAt?: string;
  /** その日に実際にあるエントリー数 */
  entryCount?: number;
  /** 概要を生成した後に取得されたエントリー数 */
  addedAfterCount?: number;
  /** 概要とフィードの一覧がずれているか */
  isStale?: boolean;
}

export default function DailySummary({
  overview,
  topics = [],
  articleCount,
  generatedBy,
  generatedAt,
  entryCount,
  addedAfterCount = 0,
  isStale = false,
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
            label={
              isStale && typeof entryCount === 'number'
                ? `概要 ${articleCount} 記事 / 一覧 ${entryCount} 記事`
                : `${articleCount} 記事`
            }
            size="small"
            color={isStale ? 'warning' : 'primary'}
            variant="outlined"
          />
        )}
      </Box>

      {isStale && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>この概要は最新ではありません</AlertTitle>
          {addedAfterCount > 0
            ? `概要を生成した後に ${addedAfterCount} 件の記事が追加されています。下の一覧には概要に反映されていない記事が含まれます。`
            : '概要の記事数と下の一覧の件数が一致していません。下の一覧には概要に反映されていない記事が含まれる可能性があります。'}
        </Alert>
      )}

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
