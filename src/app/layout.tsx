import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import NextTopLoader from 'nextjs-toploader';
import Footer from '@/components/organisms/Footer';
import Box from '@mui/material/Box';
import GoogleAdSense from '@/components/atoms/GoogleAdSense';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | AWS News Feed Archive',
    default: 'AWS News Feed Archive',
  },
  description: 'AWS 公式フィードの最新記事を日別でまとめています。',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || '';

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {adsenseId && <GoogleAdSense adsenseId={adsenseId} />}
      </head>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <NextTopLoader
              color="#ff9900" // AWS Orange
              showSpinner={false}
              height={4}
              showAtBottom={false}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
              }}
            >
              <Box component="main" sx={{ flexGrow: 1 }}>
                {props.children}
              </Box>
              <Footer />
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
