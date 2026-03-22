'use client';

import * as React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Link from 'next/link';
import PostHeader from '@/components/molecules/PostHeader';
import PostContent from '@/components/organisms/PostContent';
import NavigationLinks from '@/components/organisms/NavigationLinks';
import MobileAd from '@/components/molecules/MobileAd';
import { useVisitedPost } from '@/lib/store/useVisitedPost';

interface PostLayoutProps {
  title: string;
  date: string;
  newsCounter?: number;
  lastUpdated?: string;
  contentHtml: string;
  previous?: string | null;
  next?: string | null;
  year: string;
  month: string;
  day: string;
  slug: string;
}

export default function PostLayout({
  title,
  date,
  newsCounter = -1,
  lastUpdated,
  contentHtml,
  previous,
  next,
  year,
  month,
  day,
  slug,
}: PostLayoutProps) {
  const { markAsVisited } = useVisitedPost({
    year,
    month,
    day,
    slug,
    newsCounter,
  });

  React.useEffect(() => {
    markAsVisited();
  }, [year, month, day, slug]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2 }}>
        {/* Home Button */}
        <Link href="/" passHref>
          <Button
            component="span"
            startIcon={<HomeIcon sx={{ fontSize: '1.5rem !important' }} />}
            variant="text"
            size="large"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Back to Archive
          </Button>
        </Link>
      </Box>

      {/* モバイル用広告（トップ） - ヘッダーのすぐ下は避ける */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <MobileAd position="middle" />
      </Box>

      <PostHeader title={title} date={date} lastUpdated={lastUpdated} />

      {/* 広告（タイトル下） */}
      <MobileAd position="middle" />

      {/* Decorative Divider */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          my: 6,
          position: 'relative',
          '&::before, &::after': {
            content: '""',
            flex: 1,
            height: '1px',
            background: (theme) =>
              `linear-gradient(to ${theme.direction === 'rtl' ? 'left' : 'right'}, transparent, ${theme.palette.primary.light}, transparent)`,
          },
        }}
      >
        <AutoAwesomeIcon
          sx={{
            mx: 3,
            color: 'primary.light',
            opacity: 0.5,
            fontSize: '1.5rem',
            transform: 'rotate(-10deg)',
          }}
        />
      </Box>

      <Box sx={{ my: 4 }}>
        <PostContent contentHtml={contentHtml} />
        <NavigationLinks previous={previous} next={next} />
      </Box>

      {/* モバイル用広告（記事下） - フッターのすぐ上は避ける */}
      <MobileAd position="content-bottom" />

      {/* 日付ナビゲーション */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="caption" color="text.secondary">
          {date}
        </Typography>
      </Box>
    </Container>
  );
}
