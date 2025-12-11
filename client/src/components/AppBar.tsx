import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";

const logo = "/osl_logo.png";

function ResponsiveAppBar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "white" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ flexGrow: 1 }}></Box>
            <MenuItem>
              <Typography textAlign="center" sx={{ color: "black" }}>
                HOME
              </Typography>
            </MenuItem>

            <MenuItem>
              <Typography
                textAlign="center"
                sx={{ color: "black" }}
                onClick={() => {
                  window.location.href = "/create";
                }}
              >
                CREATE GAME
              </Typography>
            </MenuItem>
            <MenuItem>
              <Typography textAlign="center" sx={{ color: "black" }}>
                LEADERBOARD
              </Typography>
            </MenuItem>
            <img src={logo} alt="OSL Logo" width={150} height={150} />
            <MenuItem>
              <Typography textAlign="center" sx={{ color: "black" }}>
                DRIVERS
              </Typography>
            </MenuItem>

            <MenuItem>
              <Typography textAlign="center" sx={{ color: "black" }}>
                ADMIN
              </Typography>
            </MenuItem>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              gap: 2,
              flexDirection: "row-reverse",
            }}
          >
            <Button
              sx={{
                my: 2,
                color: "white",
                backgroundColor: "#ff0000",
                display: "block",
                ":hover": { fontWeight: "bold" },
              }}
            >
              LOGIN
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
