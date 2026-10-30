import type { ReactNode } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { TimingSession } from "../../../types/liveTiming.types";
import { formatWeather } from "../liveTimingView";

type TimingSessionHeaderProps = {
  eyebrow: string;
  session: TimingSession;
  /** Extra chips, such as the live connection and the time left. */
  children?: ReactNode;
};

const SAFETY_CAR_LABELS = {
  FULL: "Safety car",
  VIRTUAL: "Virtual safety car",
  FORMATION_LAP: "Formation lap",
} as const;

export default function TimingSessionHeader({
  eyebrow,
  session,
  children,
}: TimingSessionHeaderProps) {
  const weather = formatWeather(session.weather);
  const circuit = session.circuit;
  const safetyCar =
    session.safetyCar !== "NONE" && !session.isFinished
      ? SAFETY_CAR_LABELS[session.safetyCar]
      : null;

  return (
    <Box sx={{ mb: { xs: 2, md: 3 } }}>
      <Typography
        sx={{
          color: "primary.main",
          fontSize: "0.8rem",
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: "1.7rem", md: "2.4rem" },
          fontWeight: 900,
          textTransform: "uppercase",
          lineHeight: 1.1,
        }}
      >
        {circuit
          ? `${circuit.grandPrix} · ${session.sessionName}`
          : session.sessionName}
      </Typography>
      {circuit && (
        <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
          {circuit.name}
        </Typography>
      )}

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
        {children}
        <Chip
          size="small"
          label={session.isOnline ? "Online lobby" : "Offline session"}
          variant="outlined"
        />
        {weather && (
          <Chip
            size="small"
            variant="outlined"
            label={`${weather} · Track ${session.trackTemperatureC ?? "--"}°C · Air ${session.airTemperatureC ?? "--"}°C`}
          />
        )}
        {session.isFinished && (
          <Chip size="small" color="success" label="Final classification" />
        )}
        {safetyCar && (
          <Chip
            size="small"
            label={safetyCar}
            sx={{ bgcolor: "warning.main", color: "#0b0d14", fontWeight: 900 }}
          />
        )}
      </Stack>
    </Box>
  );
}
