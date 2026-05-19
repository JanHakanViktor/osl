import { useMemo, useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import TimerIcon from "@mui/icons-material/Timer";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CircuitLibrary from "../../data/circuit";
import { getOslAppShell } from "../../theme";
import type { LandingSummary } from "../../types/session.types";

type CircuitLap = LandingSummary["fastestLapByCircuit"][number];

const formatMs = (ms: number | null) => {
  if (!ms) return "No lap recorded";

  const totalMs = Math.max(0, Math.round(ms));
  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = totalMs % 1000;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}.${String(
    milliseconds,
  ).padStart(3, "0")}`;
};

const fallbackCircuits: CircuitLap[] = CircuitLibrary.map((circuit) => ({
  circuitId: Number(circuit.trackId),
  grandPrix: circuit.grandPrix,
  circuitName: circuit.circuit,
  image: circuit.image,
  fastestLapMs: null,
  fastestLapSectorsMs: [],
  driverName: null,
}));

const FastestLapBreakdown = ({ circuits }: { circuits: CircuitLap[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = circuits.length > 0 ? circuits : fallbackCircuits;
  const activeCircuit = slides[activeIndex] ?? slides[0];

  const sectorTimes = useMemo(() => {
    if (!activeCircuit?.fastestLapMs) {
      return ["No lap recorded", "No lap recorded", "No lap recorded"];
    }

    return [0, 1, 2].map((index) =>
      activeCircuit.fastestLapSectorsMs[index]
        ? formatMs(activeCircuit.fastestLapSectorsMs[index])
        : "No lap recorded",
    );
  }, [activeCircuit]);

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((current) =>
      current === slides.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 300,
        borderRadius: 2,
        p: { xs: 2, sm: 3 },
        bgcolor: "background.paper",
        color: "common.white",
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.28)",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: (theme) => getOslAppShell(theme).accent,
              fontWeight: 800,
            }}
          >
            Fastest lap
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {activeCircuit?.grandPrix ?? "Circuit"} Breakdown
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {activeCircuit?.circuitName}
          </Typography>
        </Box>
        <TimerIcon
          sx={{ color: (theme) => getOslAppShell(theme).accent, fontSize: 34 }}
        />
      </Stack>

      <Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {activeCircuit?.driverName ?? "No lap recorded"}
        </Typography>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-end"
          flexWrap="wrap"
        >
          <Typography
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: {
                xs: activeCircuit?.fastestLapMs ? "2.5rem" : "1.65rem",
                sm: activeCircuit?.fastestLapMs ? "3.2rem" : "2rem",
              },
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            {formatMs(activeCircuit?.fastestLapMs ?? null)}
          </Typography>
          {activeCircuit?.fastestLapMs && (
            <Chip
              label="Recorded"
              size="small"
              color="success"
              sx={{ color: "common.white", fontWeight: 800, mb: 0.5 }}
            />
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
          mt: "auto",
        }}
      >
        {["S1", "S2", "S3"].map((sector, index) => (
          <Box
            key={sector}
            sx={{
              borderRadius: 1.5,
              bgcolor: (theme) => getOslAppShell(theme).surfaceGlass,
              border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
              p: 2,
            }}
          >
            <Typography
              sx={{
                color: (theme) => getOslAppShell(theme).accent,
                fontWeight: 900,
              }}
            >
              {sector}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: 900,
                fontSize: activeCircuit?.fastestLapMs ? "1.45rem" : "0.95rem",
              }}
            >
              {sectorTimes[index]}
            </Typography>
          </Box>
        ))}
      </Box>

      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Button
          startIcon={<KeyboardArrowLeftIcon />}
          onClick={goToPrevious}
          variant="outlined"
          sx={{
            color: "common.white",
            borderColor: (theme) => alpha(getOslAppShell(theme).accent, 0.58),
            fontWeight: 900,
          }}
        >
          Previous
        </Button>
        <Typography
          variant="caption"
          sx={{ alignSelf: "center", color: "text.secondary" }}
        >
          {activeIndex + 1} / {slides.length}
        </Typography>
        <Button
          endIcon={<KeyboardArrowRightIcon />}
          onClick={goToNext}
          variant="outlined"
          sx={{
            color: "common.white",
            borderColor: (theme) => alpha(getOslAppShell(theme).accent, 0.58),
            fontWeight: 900,
          }}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
};

export default FastestLapBreakdown;
