import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <Box
      aria-label="F1 Car"
      sx={{
        pt: 8,
        pb: 6,
        backgroundImage:
          'radial-gradient(rgba(0, 0, 0, 1), rgba(38, 0, 255, 0.28)), url("/heroBanner.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        textAlign: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h2"
            align="center"
            color="inherit"
            gutterBottom
            fontWeight={"bold"}
          >
            F1 25 TOURNAMENT HUB
          </Typography>
          <Typography variant="h5" align="center" color="inherit">
            Create and manage your own F1 25 tournaments with ease. Organize
            hotlap races and track results all in one place.
          </Typography>
          <Box
            sx={{
              pt: 4,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                onClick={() => navigate("/create")}
                variant="contained"
                color="primary"
                size="large"
              >
                CREATE SESSION
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroBanner;
