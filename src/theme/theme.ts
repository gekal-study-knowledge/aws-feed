"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#232f3e", // AWS Squid Ink
        },
        secondary: {
          main: "#ff9900", // AWS Orange
        },
        background: {
          default: "#f2f3f3", // Light gray background common in AWS console
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#ecf0f1", // Light text for dark mode
        },
        secondary: {
          main: "#ff9900", // Keep AWS Orange
        },
        background: {
          default: "#0f171e", // Darker blue/black
          paper: "#1e2b3e",
        },
      },
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ".markdown-body": {
          wordBreak: "break-all",
          overflowWrap: "break-word",
        },
        "& table": {
          display: "block",
          width: "100% !important",
          maxWidth: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          borderCollapse: "collapse",
          whiteSpace: "nowrap",
        },
        "& th, & td": {
          padding: "8px 16px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Disable MUI v5 dark mode elevation overlay
        },
      },
    },
  },
});

export default theme;
