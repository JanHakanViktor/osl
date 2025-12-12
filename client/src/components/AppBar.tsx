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
          marginLeft: 34,
        }}
      >
        <MenuItem>
          <Typography
            fontSize={"40px"}
            textAlign="center"
            sx={{ color: "black" }}
            onClick={() => navigate("/")}
          >
            HOME
          </Typography>
        </MenuItem>

        <img src={logo} alt="OSL Logo" width={160} height={160} />

        <MenuItem>
          <Typography
            textAlign="center"
            sx={{ color: "black" }}
            fontSize={"50px"}
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
