import { Box, Container, Typography, Button } from "@mui/material";

const HeroBanner = () => {
  return (
    <Box
      sx={{
        pt: 8,
        pb: 6,
        backgroundImage:
          'radial-gradient(rgba(0, 0, 0, 1), rgba(38, 0, 255, 0.28)), url("/heroBanner.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
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
          <Typography variant="h5" align="center" color="inherit" paragraph>
            Create and manage your own F1 25 tournaments with ease. Organize
            races and track results all in one place.
          </Typography>
          <Box
            sx={{
              pt: 4,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => {
                  window.location.href = "/telemetry";
                }}
              >
                VIEW TELEMETRY
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroBanner;
