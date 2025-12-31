import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router";
import SignInButton from "./auth/SignInButton";
import { useUIStore } from "../store/uiStore";
import { useCurrentUser } from "./auth/auth.queries";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useIsMobile } from "../theme";
import BackButton from "./auth/BackButton";

const logo = "/osl_logo.png";

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const openSignInDialog = useUIStore((s) => s.openSignInDialog);

  const isMobile = useIsMobile();
  const isDrawerOpen = useUIStore((s) => s.isDrawerOpen);
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  const openDrawer = useUIStore((s) => s.openDrawer);

  const handleCreateSession = () => {
    if (!user) {
      openSignInDialog("You are not signed in. Sign in to create a session.");
      return;
    }

    navigate("/sessions/new");
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#ffffffff",
        color: "white",
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "center",
          columnGap: 4,
        }}
      >
        <img
          src={logo}
          alt="OSL Logo"
          className="oslLogo"
          width={160}
          height={160}
          onClick={() => navigate("/")}
          style={{
            marginLeft: "2rem",
          }}
        />

        {isMobile ? (
          <>
            <IconButton onClick={openDrawer}>
              <MenuIcon sx={{ color: "black" }} />
            </IconButton>

            <Drawer anchor="right" open={isDrawerOpen} onClose={closeDrawer}>
              <BackButton />

              <List sx={{ width: 250 }}>
                <ListItem onClick={handleCreateSession}>
                  <ListItemText primary="Create Session" />
                </ListItem>

                <ListItem onClick={() => navigate("/sessions")}>
                  <ListItemText primary="Session History" />
                </ListItem>

                <ListItem onClick={() => navigate("/drivers")}>
                  <ListItemText primary="Drivers" />
                </ListItem>
              </List>

              <SignInButton />
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: "flex", gap: 4 }}>
            <MenuItem
              sx={{
                height: "100%",
                transition: "all 0.3s ease",
                color: "#000000ff",
                ":hover": {
                  color: "#ff0000ff",
                  transform: "scale(1.05)",
                  bgcolor: "rgba(255, 255, 255, 1)",
                  borderRadius: "10px",
                },
              }}
            >
              <Typography
                textAlign="center"
                fontSize={"30px"}
                fontWeight={"bold"}
                onClick={handleCreateSession}
              >
                CREATE SESSION
              </Typography>
            </MenuItem>

            <MenuItem
              sx={{
                height: "100%",
                transition: "all 0.3s ease",
                color: "#000000ff",
                ":hover": {
                  color: "#ff0000ff",
                  transform: "scale(1.05)",
                  bgcolor: "rgba(255, 255, 255, 1)",
                  borderRadius: "10px",
                },
              }}
            >
              <Typography
                textAlign="center"
                fontSize={"30px"}
                fontWeight={"bold"}
                onClick={() => {
                  navigate("/sessions");
                }}
              >
                SESSION HISTORY
              </Typography>
            </MenuItem>

            <MenuItem
              sx={{
                height: "100%",
                transition: "all 0.3s ease",
                color: "#000000ff",
                ":hover": {
                  color: "#ff0000ff",
                  transform: "scale(1.05)",
                  bgcolor: "rgba(255, 255, 255, 1)",
                  borderRadius: "10px",
                },
              }}
            >
              <Typography
                textAlign="center"
                fontSize={"30px"}
                fontWeight={"bold"}
                onClick={() => {
                  navigate("/sessions/new");
                }}
              >
                DRIVERS
              </Typography>
            </MenuItem>

            <SignInButton />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
