import { Box, Typography } from "@mui/material";
import CircuitLibrary from "../../data/circuit";

const MostPlayedCircuit = () => {
  const idx = CircuitLibrary[0] ? 5 : 0;
  const { image, grandPrix, circuit, timesPlayed } = CircuitLibrary[idx];

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography sx={{ p: 2, fontWeight: 700 }} variant="h5">
        MOST PLAYED CIRCUIT
      </Typography>

      <Box
        sx={{
          position: "relative",
          flex: 1,
          borderRadius: 2,
          borderColor: "red",
          overflow: "hidden",
          aspectRatio: { xs: "16 / 10", md: "16 / 9" },
        }}
      >
        <Box
          component="img"
          src={image}
          aria-label="race circuits"
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            px: { xs: 2, md: 4 },
            height: "100%",
          }}
        >
          <Typography
            sx={{
              color: "#000000ff",
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.6rem" },
            }}
          >
            {grandPrix.toLocaleUpperCase()}
          </Typography>
          <Typography
            sx={{
              color: "red",
              fontWeight: 700,
              fontSize: { xs: "0.7rem", sm: "1.1rem", md: "1.3rem" },
            }}
          >
            {circuit.toLocaleUpperCase()}
          </Typography>
          <Box
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.61)",
              py: 1.5,
              px: 2.5,
              borderRadius: 2,
              mt: "auto",
              mb: { xs: 0, sm: 2, md: 4 },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.7rem", sm: "1.1rem", md: "1.3rem" },
                color: "red",
                fontWeight: "bold",
              }}
            >
              TOTAL TIMES PLAYED
            </Typography>
            <Typography
              sx={{
                display: "flex",
                fontSize: { xs: "0.8rem", sm: "1.2rem", md: "1.4rem" },
                fontWeight: 700,
                color: "#ffffffff",
                justifyContent: "flex-end",
              }}
            >
              {timesPlayed} 43
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MostPlayedCircuit;
