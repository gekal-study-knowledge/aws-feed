'use client';

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#232f3e', // AWS Squid Ink
        },
        secondary: {
          main: '#ff9900', // AWS Orange
        },
        background: {
          default: '#f2f3f3', // Light gray background common in AWS console
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#ecf0f1', // Light text for dark mode
        },
        secondary: {
          main: '#ff9900', // Keep AWS Orange
        },
        background: {
          default: '#0f171e', // Darker blue/black
          paper: '#1e2b3e',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // CssBaseline のグローバル指定ではネストの起点が無いため '&' は使えない。
        // 表まわりの指定は PostContent 側（.entry-summary 配下）で行う。
        '.markdown-body': {
          overflowWrap: 'break-word',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Disable MUI v5 dark mode elevation overlay
        },
      },
    },
  },
});

const theme = responsiveFontSizes(baseTheme);

export default theme;
