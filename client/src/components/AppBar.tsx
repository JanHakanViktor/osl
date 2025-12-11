import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
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
              justifyContent: "center",
              gap: 2,
            }}
          >
            <MenuItem>
              <Typography textAlign="center" sx={{ color: "black" }}>
                HOME
              </Typography>
            </MenuItem>
            <img src={logo} alt="OSL Logo" width={150} height={150} />
            <MenuItem>
              <Typography
                textAlign="center"
                sx={{ color: "black" }}
                onClick={() => {
                  window.location.href = "/create";
                }}
              >
                CREATE SESSION
              </Typography>
            </MenuItem>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
