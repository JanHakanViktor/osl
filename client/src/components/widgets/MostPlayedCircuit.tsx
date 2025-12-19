import { Box, Typography } from "@mui/material";
import CircuitLibrary from "../../data/circuit";

const MostPlayedCircuit = () => {
  const idx = CircuitLibrary[0] ? 3 : 0;
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
          width: "100%",
          borderRadius: 2,
          borderColor: "red",
          overflow: "hidden",
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
            gap: 3,
            px: { xs: 2, md: 4 },
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 2, md: 3 },
              py: { xs: 1.6, md: 2.5 },
              width: { xs: "100%", md: "auto" },
              maxWidth: 980,
            }}
          >
            <Box>
              <Typography sx={{ color: "#000000ff", fontWeight: 700 }}>
                {grandPrix.toLocaleUpperCase()}
              </Typography>
              <Typography sx={{ color: "#000000ff", fontWeight: 700 }}>
                {circuit.toLocaleUpperCase()}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "rgba(186, 186, 186, 1)",
                minWidth: 150,
                py: 1.5,
                px: 2.5,
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  color: "#000000ff",
                  fontWeight: "bold",
                }}
              >
                TOTAL TIMES PLAYED
              </Typography>
              <Typography
                sx={{
                  display: "flex",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#ffffffff",
                  justifyContent: "flex-end",
                }}
              >
                {timesPlayed}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MostPlayedCircuit;
