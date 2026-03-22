import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Link from 'next/link';
import Grid from '@mui/material/Grid';
import { getSortedPostsData, getPostsByMonth } from '@/lib/posts';
import PostList from '@/components/organisms/PostList';
import ThemeSwitcher from '@/components/atoms/ThemeSwitcher';
import UpdateNotifier from '@/components/organisms/UpdateNotifier';
import InFeedAd from '@/components/molecules/InFeedAd';
import MobileAd from '@/components/molecules/MobileAd';
import type { Metadata } from 'next';
import { subMonths, startOfMonth, format, isAfter, parseISO } from 'date-fns';

export const metadata: Metadata = {
  title: 'AWS News Feed Archive',
};

export default function Home() {
  const allPostsData = getSortedPostsData();
  const postsByMonth = getPostsByMonth();

  // 先月 1 日の日付を取得
  const lastMonthFirstDay = startOfMonth(subMonths(new Date(), 1));
  const filterDateStr = format(lastMonthFirstDay, 'yyyy-MM-01');

  // 先月 1 日以降の記事をフィルタリング
  const recentPosts = allPostsData.filter((post) => {
    return isAfter(parseISO(post.date), lastMonthFirstDay) || post.date === filterDateStr;
  });

  const monthKeys = Object.keys(postsByMonth).sort().reverse();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* モバイル用広告（トップ） */}
        <MobileAd position="top" />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ThemeSwitcher />
        </Box>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          align="center"
          color="primary"
          sx={{ fontWeight: 800, mb: 2 }}
        >
          AWS News Feed Archive
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
          AWS 公式フィードの最新記事を日別でまとめています。
        </Typography>

        <Divider sx={{ mb: 4 }}>
          <Chip
            label="月別アーカイブ"
            icon={<CalendarMonthIcon />}
            color="primary"
            variant="outlined"
          />
        </Divider>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2,
            mb: 6,
          }}
        >
          {monthKeys.map((key) => {
            const [year, month] = key.split('-');
            return (
              <Link key={key} href={`/archive/${key}`} passHref style={{ textDecoration: 'none' }}>
                <Button variant="outlined" size="small" component="span">
                  {year}年{month}月
                </Button>
              </Link>
            );
          })}
        </Box>

        <Divider sx={{ mb: 4 }}>
          <Chip label="最近の記事（先月 1 日〜）" color="secondary" />
        </Divider>

        <UpdateNotifier
          currentLatestDate={allPostsData[0]?.date || ''}
          currentNewsCount={allPostsData[0]?.newsCounter || 0}
        />

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 9 }}>
            {/* モバイル用広告（記事リスト前） */}
            <MobileAd position="top" />

            <PostList posts={recentPosts} />

            {recentPosts.length === 0 && (
              <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                最近の記事はありません。月別アーカイブから過去の記事をご覧ください。
              </Typography>
            )}

            {/* モバイル用広告（記事リスト後） */}
            <MobileAd position="bottom" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            {/* デスクトップ用サイドバー広告 */}
            <InFeedAd />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
