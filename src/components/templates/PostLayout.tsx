'use client';

import * as React from 'react';
import { Box, Button, Container, Fab } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Link from 'next/link';
import StickyHeader from '@/components/organisms/StickyHeader';
import PostHeader from '@/components/molecules/PostHeader';
import PostContent from '@/components/organisms/PostContent';
import NavigationLinks from '@/components/organisms/NavigationLinks';

interface PostLayoutProps {
  title: string;
  date: string;
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
  lastUpdated,
  contentHtml,
  previous,
  next,
  year,
  month,
  day,
  slug,
}: PostLayoutProps) {
  const [isBottom, setIsBottom] = React.useState(false);
  const [showSticky, setShowSticky] = React.useState(false);

  React.useEffect(() => {
    // 訪問済みとして保存
    const visitedKey = 'visited_posts';
    const visitedPosts = JSON.parse(localStorage.getItem(visitedKey) || '[]');
    const currentPostId = `${year}/${month}/${day}/${slug}`;
    if (!visitedPosts.includes(currentPostId)) {
      visitedPosts.push(currentPostId);
      localStorage.setItem(visitedKey, JSON.stringify(visitedPosts));
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // ヘッダー表示の判定 (少しスクロールしたら表示)
      setShowSticky(scrollY > 200);

      // 最下部判定 (遊びを持たせる)
      const atBottom = scrollY + windowHeight >= documentHeight - 50;
      setIsBottom(atBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初期状態のチェック
    return () => window.removeEventListener('scroll', handleScroll);
  }, [year, month, day, slug]);

  return (
    <>
      <StickyHeader show={showSticky && !isBottom} date={date} />

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

        <PostHeader title={title} date={date} lastUpdated={lastUpdated} />

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
      </Container>

      {/* Floating Action Buttons */}
      {!isBottom && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 1000,
          }}
        >
          {next && (
            <Link href={next} passHref>
              <Fab
                color="primary"
                size="medium"
                aria-label="next day"
                sx={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  '&:hover': { transform: 'scale(1.1)' },
                  transition: 'transform 0.2s',
                }}
              >
                <ArrowForwardIcon />
              </Fab>
            </Link>
          )}

          <Fab
            color="secondary"
            size="medium"
            aria-label="scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              '&:hover': { transform: 'scale(1.1)' },
              transition: 'transform 0.2s',
            }}
          >
            <ArrowUpwardIcon />
          </Fab>

          {previous && (
            <Link href={previous} passHref>
              <Fab
                color="primary"
                size="medium"
                aria-label="previous day"
                sx={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  '&:hover': { transform: 'scale(1.1)' },
                  transition: 'transform 0.2s',
                }}
              >
                <ArrowBackIcon />
              </Fab>
            </Link>
          )}
        </Box>
      )}
    </>
  );
}
