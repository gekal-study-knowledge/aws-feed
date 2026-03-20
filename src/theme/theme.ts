'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#667eea', // docs/style.css background start color
        },
        secondary: {
          main: '#764ba2', // docs/style.css background end color
        },
        background: {
          default: '#f4f7f6',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#8e9eef', // Lighter version for dark mode
        },
        secondary: {
          main: '#a589c3', // Lighter version for dark mode
        },
        background: {
          default: '#0d1117',
          paper: '#161b22',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
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

export default theme;
