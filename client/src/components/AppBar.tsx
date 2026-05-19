import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router";
import SignInButton from "./auth/SignInButton";
import { useUIStore } from "../store/uiStore";
import { useCurrentUser } from "./auth/auth.queries";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { getOslAppShell, useIsMobile } from "../theme";
import { alpha } from "@mui/material/styles";

const logo = "/osl_logo.png";

const navItems = [
  {
    label: "Create Session",
    path: "/sessions/new",
    icon: AddCircleOutlineIcon,
  },
  {
    label: "Session History",
    path: "/sessions",
    icon: HistoryIcon,
  },
];

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useCurrentUser();

  const isMobile = useIsMobile();
  const isDrawerOpen = useUIStore((s) => s.isDrawerOpen);
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  const openDrawer = useUIStore((s) => s.openDrawer);
  const signedIn = !!user;

  const handleNavigate = (path: string) => {
    navigate(path);
    closeDrawer();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        background: (theme) => getOslAppShell(theme).appBarGradient,
        backdropFilter: "blur(16px)",
        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.32)",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: (theme) => getOslAppShell(theme).animatedAccent,
          backgroundSize: "720px 100%",
          boxShadow: (theme) =>
            `0 0 18px ${alpha(getOslAppShell(theme).accent, 0.65)}`,
          animation: "appBarAccentDrive 20s linear infinite",
        },
        "@keyframes appBarAccentDrive": {
          "0%": { backgroundPosition: "0 50%" },
          "100%": { backgroundPosition: "-720px 50%" },
        },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          minHeight: { xs: 70, sm: 100 },
          px: { xs: 2, sm: 4, lg: 7 },
          gap: { xs: 1.5, md: 4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          component="button"
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 0,
            mr: "auto",
            border: 0,
            color: "inherit",
            cursor: "pointer",
            backgroundColor: "transparent",
            transition: "transform 0.2s ease",
            "&:hover": { transform: "scale(1.03)" },
            "&:active": { transform: "scale(0.98)" },
          }}
        >
          <Box
            component="img"
            src={logo}
            aria-label="OSL"
            alt="OSL Logo"
            sx={{
              width: "auto",
              height: { xs: 56, sm: 110 },
              display: "block",
              objectFit: "contain",
              filter:
                "brightness(0) invert(1) drop-shadow(0 12px 20px rgba(0, 0, 0, 0.34))",
            }}
          />
        </Box>

        {isMobile && signedIn ? (
          <>
            <IconButton
              aria-label={
                isDrawerOpen ? "Close navigation menu" : "Open navigation menu"
              }
              onClick={isDrawerOpen ? closeDrawer : openDrawer}
              sx={{
                width: 44,
                height: 44,
                color: "common.white",
                border: (theme) =>
                  `1px solid ${getOslAppShell(theme).borderStrong}`,
                backgroundColor: (theme) => getOslAppShell(theme).surfaceGlass,
                transition: "background-color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.16)",
                },
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  transition: "transform 0.22s ease",
                  transform: isDrawerOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                {isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
              </Box>
            </IconButton>

            <Drawer
              anchor="right"
              open={isDrawerOpen}
              onClose={closeDrawer}
              sx={{
                zIndex: (theme) => theme.zIndex.drawer + 3,
              }}
              PaperProps={{
                sx: {
                  zIndex: (theme) => theme.zIndex.drawer + 4,
                  width: 300,
                  color: "common.white",
                  background: (theme) => getOslAppShell(theme).drawerGradient,
                  borderLeft: (theme) =>
                    `1px solid ${getOslAppShell(theme).borderStrong}`,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  borderBottom: (theme) =>
                    `1px solid ${getOslAppShell(theme).border}`,
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  aria-label="OSL"
                  alt="OSL Logo"
                  sx={{
                    width: "auto",
                    height: 52,
                    objectFit: "contain",
                    filter:
                      "brightness(0) invert(1) drop-shadow(0 12px 20px rgba(0, 0, 0, 0.34))",
                  }}
                />
                <IconButton
                  aria-label="Close navigation menu"
                  onClick={closeDrawer}
                  sx={{
                    width: 42,
                    height: 42,
                    color: "common.white",
                    border: (theme) =>
                      `1px solid ${getOslAppShell(theme).borderStrong}`,
                    backgroundColor: (theme) => getOslAppShell(theme).surfaceGlass,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.16)",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <List sx={{ p: 1.5 }}>
                {navItems.map(({ label, path, icon: Icon }) => {
                  const isActive = location.pathname === path;

                  return (
                    <ListItem key={path} disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        selected={isActive}
                        onClick={() => handleNavigate(path)}
                        sx={{
                          minHeight: 54,
                          borderRadius: 2,
                          color: "common.white",
                          border: (theme) =>
                            `1px solid ${getOslAppShell(theme).border}`,
                          backgroundColor: (theme) =>
                            isActive
                              ? getOslAppShell(theme).accentSoft
                              : getOslAppShell(theme).surfaceGlass,
                          "&.Mui-selected, &.Mui-selected:hover": {
                            backgroundColor: (theme) =>
                              alpha(getOslAppShell(theme).accent, 0.25),
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: (theme) => getOslAppShell(theme).accent,
                          }}
                        >
                          <Icon />
                        </ListItemIcon>
                        <ListItemText primary={label} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>

              <Box sx={{ mt: "auto", px: 2, pb: 3 }}>
                <SignInButton />
              </Box>
            </Drawer>
          </>
        ) : (
          <Box
            component="nav"
            aria-label="Primary navigation"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {signedIn &&
              navItems.map(({ label, path, icon: Icon }) => {
                const isActive =
                  location.pathname === path ||
                  (path === "/sessions" &&
                    location.pathname.startsWith("/sessions/") &&
                    !location.pathname.endsWith("/live"));

                return (
                  <Button
                    key={path}
                    startIcon={<Icon />}
                    onClick={() => handleNavigate(path)}
                    sx={{
                      minHeight: 44,
                      px: { md: 1.5, lg: 2.25 },
                      borderRadius: 2,
                      color: "common.white",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: 0,
                      whiteSpace: "nowrap",
                      border: "1px solid",
                      borderColor: (theme) =>
                        isActive
                          ? alpha(getOslAppShell(theme).accent, 0.75)
                          : getOslAppShell(theme).border,
                      backgroundColor: (theme) =>
                        isActive
                          ? getOslAppShell(theme).accentSoft
                          : getOslAppShell(theme).surfaceGlass,
                      boxShadow: (theme) =>
                        isActive ? getOslAppShell(theme).accentGlow : "none",
                      "&:hover": {
                        color: "common.white",
                        borderColor: (theme) =>
                          alpha(getOslAppShell(theme).accent, 0.78),
                        backgroundColor: (theme) =>
                          alpha(getOslAppShell(theme).accent, 0.18),
                        transform: "translateY(-1px)",
                      },
                      transition:
                        "transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: "none", lg: "inline" } }}
                    >
                      {label}
                    </Box>
                    <Box
                      component="span"
                      sx={{ display: { xs: "inline", lg: "none" } }}
                    >
                      {label}
                    </Box>
                  </Button>
                );
              })}

            <Box
              sx={{
                ml: 1,
                pl: 1,
                borderLeft: (theme) =>
                  `1px solid ${getOslAppShell(theme).border}`,
              }}
            >
              <SignInButton />
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
