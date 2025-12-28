import { Box, Container, Typography } from "@mui/material";
import { useCurrentUser } from "./auth/auth.queries";

const HeroBanner = () => {
  const { data: user } = useCurrentUser();
  return (
    <Box
      aria-label="F1 Car"
      sx={{
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 6 },
        backgroundImage:
          'radial-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.28)), url("/heroBanner.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        textAlign: "center",
        minHeight: { xs: "40vh", md: "50vh" },
        filter: "grayscale(100%)",
      }}
    >
      <Box
        component="img"
        src="/f125LogoLight.png"
        aria-label="EA Sport F1 25 logotype"
        sx={{
          height: { xs: 100, sm: 160, md: 200 },
          maxWidth: "100%",
        }}
      ></Box>
      <Container sx={{ mt: 4 }}>
        <Typography
          variant="body1"
          color="inherit"
          sx={{
            fontSize: { sm: "1.3rem", md: "1.5rem" },
          }}
        >
          OSL delivers real-time telemetry and performance statistics to
          streamline the in-game experience. Record your sessions, analyze your
          laps, and get started by creating a session.
        </Typography>
      </Container>
      <Container sx={{ mt: 4 }}>
        {user && (
          <Typography
            variant="body1"
            fontWeight="bold"
            align="center"
            color="#ffffffff"
            sx={{
              fontSize: { sm: "2.5rem", md: "5rem" },
            }}
          >
            Welcome {user.username}!
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default HeroBanner;
