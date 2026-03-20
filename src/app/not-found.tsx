import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          my: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', fontWeight: 900, mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          ページが見つかりません
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          お探しのページは削除されたか、名前が変更されたか、一時的に利用できない可能性があります。
        </Typography>
        <Link href="/" passHref>
          <Button variant="contained" color="primary" startIcon={<HomeIcon />} size="large">
            ホーム画面に戻る
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
