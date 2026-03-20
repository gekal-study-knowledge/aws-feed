import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { getPostsByMonth } from '@/lib/posts';
import PostList from '@/components/organisms/PostList';
import ThemeSwitcher from '@/components/atoms/ThemeSwitcher';
import type { Metadata } from 'next';

interface MonthPageProps {
  params: Promise<{
    month_key: string;
  }>;
}

export async function generateMetadata({ params }: MonthPageProps): Promise<Metadata> {
  const { month_key } = await params;
  const [year, month] = month_key.split('-');
  return {
    title: `${year}年${month}月の記事一覧`,
  };
}

export async function generateStaticParams() {
  const postsByMonth = getPostsByMonth();
  return Object.keys(postsByMonth).map((key) => ({
    month_key: key,
  }));
}

export const dynamicParams = false;

export default async function MonthPage({ params }: MonthPageProps) {
  const { month_key } = await params;
  const [year, month] = month_key.split('-');
  const postsByMonth = getPostsByMonth();
  const posts = postsByMonth[month_key] || [];

  // 前後の月を探す
  const sortedMonthKeys = Object.keys(postsByMonth).sort().reverse();
  const currentIndex = sortedMonthKeys.indexOf(month_key);
  const nextMonthKey = currentIndex > 0 ? sortedMonthKeys[currentIndex - 1] : null;
  const prevMonthKey =
    currentIndex < sortedMonthKeys.length - 1 ? sortedMonthKeys[currentIndex + 1] : null;

  const renderMonthLink = (key: string | null, direction: 'prev' | 'next') => {
    if (!key) return <Box sx={{ flex: 1 }} />;
    const [y, m] = key.split('-');
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: direction === 'prev' ? 'flex-start' : 'flex-end',
        }}
      >
        <Link href={`/archive/${key}`} passHref style={{ textDecoration: 'none' }}>
          <Button
            component="span"
            startIcon={direction === 'prev' ? <ArrowBackIcon /> : undefined}
            endIcon={direction === 'next' ? <ArrowForwardIcon /> : undefined}
            variant="outlined"
          >
            {y}年{m}月
          </Button>
        </Link>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Link href="/" passHref>
            <Button
              component="span"
              startIcon={<HomeIcon />}
              variant="text"
              sx={{ color: 'text.secondary' }}
            >
              Back to Top
            </Button>
          </Link>
          <ThemeSwitcher />
        </Box>

        <Typography variant="h2" component="h1" gutterBottom align="center" color="primary">
          {year}年{month}月の記事一覧
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, mt: 2 }}>
          {renderMonthLink(prevMonthKey, 'prev')}
          <Box sx={{ flex: 1 }} />
          {renderMonthLink(nextMonthKey, 'next')}
        </Box>

        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <Typography variant="body1" align="center">
            記事が見つかりませんでした。
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
          {renderMonthLink(prevMonthKey, 'prev')}
          <Box sx={{ flex: 1 }} />
          {renderMonthLink(nextMonthKey, 'next')}
        </Box>
      </Box>
    </Container>
  );
}
