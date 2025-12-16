import { Box, Container, Typography } from "@mui/material";

const HeroBanner = () => {
  return (
    <Box
      aria-label="F1 Car"
      sx={{
        pt: 8,
        pb: 6,
        backgroundImage:
          'radial-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.28)), url("/heroBanner.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        textAlign: "center",
        height: "50vh",
        filter: "grayscale(100%)",
      }}
    >
      <Box>
        <img
          src="/f125LogoLight.png"
          height={200}
          aria-label="EA Sport F1 25 logotype"
        />
      </Box>
      <Container maxWidth="sm">
        <Typography variant="h5" align="center" color="inherit">
          Create and manage your own F1 25 tournaments with ease. Organize
          hotlap races and track results all in one place.
        </Typography>
      </Container>
    </Box>
  );
};

export default HeroBanner;
