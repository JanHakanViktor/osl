import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router";

const logo = "/osl_logo.png";

function ResponsiveAppBar() {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ backgroundColor: "white" }}>
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          border: "2px, solid, black",
          gap: 4,
        }}
      >
        <img
          src={logo}
          alt="OSL Logo"
          width={160}
          height={160}
          onClick={() => navigate("/")}
          style={{ marginLeft: "2rem" }}
        />
        <MenuItem
          sx={{
            color: "black",
            height: "100%",
            transition: "all 0.3s ease",
            ":hover": {
              color: "red",
              transform: "scale(1.05)",
              bgcolor: "#FFFFFF",
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
            color: "black",
            height: "100%",
            transition: "all 0.3s ease",
            ":hover": {
              color: "red",
              transform: "scale(1.05)",
              bgcolor: "#FFFFFF",
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
            color: "black",
            height: "100%",
            transition: "all 0.3s ease",
            ":hover": {
              color: "red",
              transform: "scale(1.05)",
              bgcolor: "#FFFFFF",
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
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
