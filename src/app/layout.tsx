import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import NextTopLoader from "nextjs-toploader";
import Footer from "@/components/organisms/Footer";
import Box from "@mui/material/Box";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | AWS News Feed Archive",
    default: "AWS News Feed Archive",
  },
  description: "AWS公式フィードの最新記事を日別でまとめています。",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <NextTopLoader
              color="#667eea"
              showSpinner={false}
              height={4}
              showAtBottom={false}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
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
