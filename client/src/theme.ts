import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha, createTheme, type Theme, useTheme } from "@mui/material/styles";

type OslAppShellPalette = {
  surface: string;
  surfaceRaised: string;
  surfaceGlass: string;
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  warningAccent: string;
  appBarGradient: string;
  drawerGradient: string;
  animatedAccent: string;
};

declare module "@mui/material/styles" {
  interface Palette {
    appShell: OslAppShellPalette;
  }

  interface PaletteOptions {
    appShell?: OslAppShellPalette;
  }
}

export const oslAppShell: OslAppShellPalette = {
  surface: "#080a12",
  surfaceRaised: "#151821",
  surfaceGlass: "rgba(255, 255, 255, 0.07)",
  surfaceStrong: "#171923",
  border: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  accent: "#ff3048",
  accentSoft: "rgba(255, 48, 72, 0.2)",
  accentGlow: "0 0 22px rgba(255, 48, 72, 0.28)",
  warningAccent: "#ffb000",
  appBarGradient:
    "linear-gradient(110deg, rgba(8, 10, 18, 0.96) 0%, rgba(22, 24, 34, 0.94) 48%, rgba(78, 10, 20, 0.94) 100%)",
  drawerGradient:
    "linear-gradient(165deg, #080a12 0%, #171923 54%, #410814 100%)",
  animatedAccent:
    "repeating-linear-gradient(90deg, #ff1e35 0px, #ffb000 180px, #ffffff 360px, #ffb000 540px, #ff1e35 720px)",
};

export function getOslAppShell(theme: Theme): OslAppShellPalette {
  return theme.palette.appShell ?? oslAppShell;
}

export const oslTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: oslAppShell.accent,
      light: "#ff6675",
      dark: "#b90e24",
      contrastText: "#ffffff",
    },
    secondary: {
      main: oslAppShell.warningAccent,
      light: "#ffd166",
      dark: "#b87800",
      contrastText: "#090b12",
    },
    error: {
      main: "#ff3048",
    },
    success: {
      main: "#20d46b",
    },
    warning: {
      main: oslAppShell.warningAccent,
    },
    info: {
      main: "#6dc8ff",
    },
    background: {
      default: "#0b0d14",
      paper: oslAppShell.surfaceRaised,
    },
    text: {
      primary: "#f7f8fb",
      secondary: "rgba(247, 248, 251, 0.68)",
    },
    divider: oslAppShell.border,
    appShell: oslAppShell,
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Inria Sans', Arial, Helvetica, sans-serif",
    h1: { fontWeight: 900, letterSpacing: 0 },
    h2: { fontWeight: 900, letterSpacing: 0 },
    h3: { fontWeight: 900, letterSpacing: 0 },
    h4: { fontWeight: 900, letterSpacing: 0 },
    h5: { fontWeight: 800, letterSpacing: 0 },
    h6: { fontWeight: 800, letterSpacing: 0 },
    button: {
      fontWeight: 900,
      letterSpacing: 0,
      textTransform: "uppercase",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at 16% 0%, rgba(255, 48, 72, 0.13), transparent 28%), linear-gradient(180deg, #0b0d14 0%, #090b11 52%, #07080d 100%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          backgroundColor: theme.palette.appShell.surfaceRaised,
          border: `1px solid ${theme.palette.appShell.border}`,
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.28)",
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          borderColor: theme.palette.appShell.border,
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition:
            "transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.appShell.accent,
          boxShadow: theme.palette.appShell.accentGlow,
          "&:hover": {
            backgroundColor: theme.palette.primary.light,
            boxShadow: `0 0 26px ${alpha(theme.palette.appShell.accent, 0.36)}`,
          },
        }),
        outlinedPrimary: ({ theme }) => ({
          borderColor: alpha(theme.palette.appShell.accent, 0.58),
          color: theme.palette.text.primary,
          "&:hover": {
            borderColor: alpha(theme.palette.appShell.accent, 0.78),
            backgroundColor: theme.palette.appShell.accentSoft,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          fontWeight: 800,
          borderColor: theme.palette.appShell.border,
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.appShell.border,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          color: theme.palette.text.primary,
          background: theme.palette.appShell.drawerGradient,
          borderLeft: `1px solid ${theme.palette.appShell.borderStrong}`,
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.white, 0.16),
        }),
        bar: {
          borderRadius: 8,
        },
      },
    },
  },
});

export const redBullTheme = createTheme({
  palette: {
    primary: { main: "#0018A8" },
    secondary: { main: "#FCD700" },
    background: { default: "#0A0A23" },
  },
});
export const mercedesTheme = createTheme({
  palette: {
    primary: { main: "#00A19C" },
    secondary: { main: "#C0C0C0" },
    background: { default: "#0A0A0A" },
  },
});

export const ferrariTheme = createTheme({
  palette: {
    primary: { main: "#DC0000" },
    secondary: { main: "#FFF200" },
    background: { default: "#1A0000" },
  },
});

export const mclarenTheme = createTheme({
  palette: {
    primary: { main: "#FF8000" },
    secondary: { main: "#009FDA" },
    background: { default: "#0F0F0F" },
  },
});

export const astonTheme = createTheme({
  palette: {
    primary: { main: "#006F62" },
    secondary: { main: "#96FF00" },
    background: { default: "#001F1A" },
  },
});

export const alpineTheme = createTheme({
  palette: {
    primary: { main: "#0090FF" },
    secondary: { main: "#FF5ECD" },
    background: { default: "#0A0A12" },
  },
});

export const williamsTheme = createTheme({
  palette: {
    primary: { main: "#00A3E0" },
    secondary: { main: "#00205B" },
    background: { default: "#020B16" },
  },
});

export const rbTheme = createTheme({
  palette: {
    primary: { main: "#2B2D42" },
    secondary: { main: "#00D54B" },
    background: { default: "#0C0B14" },
  },
});

export const sauberTheme = createTheme({
  palette: {
    primary: { main: "#00FF11" },
    secondary: { main: "#000000" },
    background: { default: "#000000" },
  },
});

export const haasTheme = createTheme({
  palette: {
    primary: { main: "#E6002D" },
    secondary: { main: "#C4C4C4" },
    background: { default: "#1A1A1A" },
  },
});

export const teamThemes = {
  redbull: redBullTheme,
  mercedes: mercedesTheme,
  ferrari: ferrariTheme,
  mclaren: mclarenTheme,
  aston: astonTheme,
  alpine: alpineTheme,
  williams: williamsTheme,
  rb: rbTheme,
  sauber: sauberTheme,
  haas: haasTheme,
};

export const useIsMobile = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
};
