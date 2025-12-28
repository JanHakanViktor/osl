import { createTheme, useMediaQuery, useTheme } from "@mui/material";

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
