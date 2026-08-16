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
import DailySummary from '@/components/organisms/DailySummary';
import NavigationLinks from '@/components/organisms/NavigationLinks';
import PostUpdateNotifier from '@/components/organisms/PostUpdateNotifier';
import AuthButton from '@/components/atoms/AuthButton';
import { useVisitedPost } from '@/lib/store/useVisitedPost';
import type { DailySummary as DailySummaryData } from '@/lib/data';

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
  summary?: DailySummaryData | null;
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
  summary,
}: PostLayoutProps) {
  const [isBottom, setIsBottom] = React.useState(false);
  const [showSticky, setShowSticky] = React.useState(false);
  const [newSince, setNewSince] = React.useState<string | undefined>(undefined);
  const [newCount, setNewCount] = React.useState(0);

  const { markAsVisited } = useVisitedPost({
    year,
    month,
    day,
    slug,
    newsCounter,
  });

  React.useEffect(() => {
    markAsVisited();

    // スクロールイベントは高頻度で発火するため rAF で間引く
    // （間引かないと毎フレーム再レンダーが走り、他コンポーネントの副作用に悪影響しうる）
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // ヘッダー表示の判定 (少しスクロールしたら表示)
        setShowSticky(scrollY > 200);

        // 最下部判定 (遊びを持たせる)
        const atBottom = scrollY + windowHeight >= documentHeight - 50;
        setIsBottom(atBottom);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初期状態のチェック
    return () => window.removeEventListener('scroll', handleScroll);
  }, [year, month, day, slug]);

  return (
    <>
      <StickyHeader show={showSticky && !isBottom} date={date} />

      <Container maxWidth="md">
        <Box
          sx={{
            mt: 4,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
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
          <AuthButton />
        </Box>

        <PostUpdateNotifier
          year={year}
          month={month}
          day={day}
          slug={slug}
          newsCounter={newsCounter}
          onUpdateDetected={(prevVisitedAt, count) => {
            setNewSince(prevVisitedAt);
            setNewCount(count);
          }}
        />

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
          {summary && (
            <DailySummary
              overview={summary.overview}
              topics={summary.topics}
              articleCount={summary.articleCount}
              generatedBy={summary.generatedBy}
              generatedAt={summary.generatedAt}
            />
          )}
          <PostContent contentHtml={contentHtml} newSince={newSince} newCount={newCount} />
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
