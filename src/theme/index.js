import { createTheme as createMuiTheme } from "@mui/material/styles";

export const lightTheme = {
  palette: {
    mode: "light",
    primary: {
      main: "#1a1a2e",
      light: "#2d2d44",
      dark: "#0d0d1a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#16213e",
      light: "#2a3a5c",
      dark: "#0a0f1f",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4f4f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a2e",
      secondary: "#4a4a6a",
    },
    divider: "rgba(0,0,0,0.08)",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 600, letterSpacing: -0.5 },
    h2: { fontWeight: 600, letterSpacing: -0.5 },
    h3: { fontWeight: 600, letterSpacing: -0.5 },
    h4: { fontWeight: 600, letterSpacing: -0.5 },
    h5: { fontWeight: 600, letterSpacing: -0.5 },
    h6: { fontWeight: 600, letterSpacing: -0.5 },
    body1: { letterSpacing: 0.2 },
    body2: { letterSpacing: 0.2 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
          padding: "8px 20px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        },
      },
    },
  },
};

export const darkTheme = {
  palette: {
    mode: "dark",
    primary: {
      main: "#64b5f6",
      light: "#90caf9",
      dark: "#1e88e5",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#81c784",
      light: "#a5d6a7",
      dark: "#388e3c",
      contrastText: "#ffffff",
    },
    background: {
      default: "#0a0a0f",
      paper: "#14141e",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#a0a0b8",
    },
    divider: "rgba(255,255,255,0.06)",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 600, letterSpacing: -0.5 },
    h2: { fontWeight: 600, letterSpacing: -0.5 },
    h3: { fontWeight: 600, letterSpacing: -0.5 },
    h4: { fontWeight: 600, letterSpacing: -0.5 },
    h5: { fontWeight: 600, letterSpacing: -0.5 },
    h6: { fontWeight: 600, letterSpacing: -0.5 },
    body1: { letterSpacing: 0.2 },
    body2: { letterSpacing: 0.2 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
          padding: "8px 20px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          background: "#14141e",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: "#14141e",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#0a0a0f",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "#0a0a0f",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
  },
};

export const createTheme = (mode) => {
  return createMuiTheme(mode === "dark" ? darkTheme : lightTheme);
};
