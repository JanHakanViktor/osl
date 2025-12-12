import { Box, Container, Typography } from "@mui/material";
import mockedCircuitLibrary from "../mockedData";

const MostPlayedCircuit = () => {
  const idx = mockedCircuitLibrary[3] ? 3 : 0;
  const { image, grandPrix, circuit, played } = mockedCircuitLibrary[idx];
  return (
    <>
      <Typography sx={{ p: 2, fontWeight: "bold" }} variant="h5">
        RECENT SESSIONS
      </Typography>
      <Container
        sx={{
          backgroundImage:
            'radial-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.12)), url("/sessionbg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "text.primary",
          border: "solid, 4px, red",
          borderRadius: "10px",
          pt: 3,
          pb: 1,
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
            filter: "blur(6px) saturate(0.8) brightness(0.55)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Dark overlay to boost text contrast */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.45))",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            px: { xs: 2, md: 4 },
            py: 2,
          }}
        >
          {/* Top info card with red border (responsive) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              px: { xs: 2, md: 3 },
              py: { xs: 1.6, md: 2.5 },
              border: "4px solid",
              borderColor: "error.main",
              borderRadius: "12px",
              backgroundColor: "transparent",
              width: { xs: "100%", md: "auto" },
              maxWidth: 980,
              // add subtle backdrop on very small screens so text remains legible
              backdropFilter: { xs: "blur(4px)", md: "none" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: "clamp(0.95rem, 1.6vw, 1.2rem)",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {grandPrix}
              </Typography>

              <Typography
                sx={{
                  fontSize: "clamp(0.9rem, 1.4vw, 1.1rem)",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {circuit}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                minWidth: { xs: 150, md: 220 },
                py: 1.5,
                px: 2.5,
                borderRadius: 2,
                textAlign: "left",
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

          {/* Bottom spacing area (you can place any extra content here) */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              px: { xs: 2, md: 6 },
            }}
          >
            {/* optional additional content */}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default MostPlayedCircuit;
