import { Box, Typography } from "@mui/material";
import mockedCircuitLibrary from "../mockedData";

const MostPlayedCircuit = () => {
  const idx = mockedCircuitLibrary[3] ? 3 : 0;
  const { image, grandPrix, circuit, played } = mockedCircuitLibrary[idx];

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
          border: "4px solid",
          borderColor: "red",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={image}
          alt=""
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.03)",
            filter: "blur(1px) brightness(0.8)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0, 0, 0, 0.73))",
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
            py: 2,
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
              borderColor: "red",
              borderRadius: "12px",
              backgroundColor: "#00000086",
              width: { xs: "100%", md: "auto" },
              maxWidth: 980,
            }}
          >
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 700 }}>
                {grandPrix}
              </Typography>
              <Typography sx={{ color: "#fff", fontWeight: 700 }}>
                {circuit}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.44)",
                minWidth: 150,
                py: 1.5,
                px: 2.5,
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.9)" }}
              >
                Total amount of times played
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "error.main",
                  mt: 0.5,
                }}
              >
                {played}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MostPlayedCircuit;
