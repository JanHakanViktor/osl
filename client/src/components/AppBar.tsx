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
          justifyContent: "center",
          border: "2px, solid, black",
        }}
      >
        <img
          src={logo}
          alt="OSL Logo"
          width={160}
          height={160}
          onClick={() => navigate("/")}
        />
        <MenuItem>
          <Typography
            textAlign="center"
            sx={{ color: "black", height: "100%" }}
            fontSize={"40px"}
            onClick={() => {
              navigate("/create");
            }}
          >
            CREATE SESSION
          </Typography>
        </MenuItem>
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
