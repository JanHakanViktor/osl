import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router";
import { Button } from "@mui/material";
import { useUIStore } from "../store/uiStore";

const logo = "/osl_logo.png";

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const openSignUpDialog = useUIStore((s) => s.openSignUpDialog);

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#ffffffff", color: "white" }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
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
              navigate("/create");
            }}
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
              navigate("/create");
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
              navigate("/create");
            }}
          >
            DRIVERS
          </Typography>
        </MenuItem>
        <Button
          sx={{ ml: 4, py: 2, px: 4, fontSize: "20px", color: "white" }}
          variant="contained"
          color="error"
          onClick={openSignUpDialog}
        >
          Sign in
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
