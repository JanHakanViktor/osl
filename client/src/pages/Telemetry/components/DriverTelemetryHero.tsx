import SensorsIcon from "@mui/icons-material/Sensors";
import SpeedIcon from "@mui/icons-material/Speed";
import { Box, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import { formatLapTime, formatSessionClock } from "../telemetryFormatters";
import SpeedGearGauge from "./SpeedGearGauge";

type DriverTelemetryHeroProps = {
  connected: boolean;
  driverName: string;
  sessionName: string;
  speed?: number;
  gear?: number;
  throttle?: number;
  brake?: number;
  currentLapMs?: number | null;
  sessionElapsedSeconds?: number | null;
};

export default function DriverTelemetryHero({
  connected,
  driverName,
  sessionName,
  speed,
  gear,
  throttle,
  brake,
  currentLapMs,
  sessionElapsedSeconds,
}: DriverTelemetryHeroProps) {
  const throttleValue = Math.round((throttle ?? 0) * 100);
  const brakeValue = Math.round((brake ?? 0) * 100);

  return (
    <Box
      sx={{
        minHeight: { xs: 380, md: 560 },
        px: { xs: 1, md: 2 },
        py: { xs: 2.5, md: 4 },
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: 3,
        textAlign: "center",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "center", sm: "flex-start" }}
        spacing={1.5}
      >
        <Chip
          icon={<SensorsIcon />}
          label={connected ? "Live" : "Offline"}
          sx={{
            alignSelf: { xs: "center", sm: "flex-start" },
            color: "common.white",
            backgroundColor: (theme) =>
              connected
                ? getOslAppShell(theme).accent
                : getOslAppShell(theme).surfaceGlass,
            border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
            "& .MuiChip-icon": { color: "common.white" },
          }}
        />
        <Box>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.78rem",
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            Session elapsed
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: { xs: "1.55rem", md: "2.25rem" },
              fontWeight: 900,
            }}
          >
            {formatSessionClock(sessionElapsedSeconds)}
          </Typography>
        </Box>
      </Stack>

      <Stack justifyContent="center" alignItems="center" spacing={1.5}>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 900,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            {driverName}
          </Typography>
          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: "1rem", md: "1.45rem" },
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            {sessionName}
          </Typography>
        </Box>

        <SpeedGearGauge speed={speed} gear={gear} />
      </Stack>

      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <SpeedIcon sx={{ color: (theme) => getOslAppShell(theme).accent }} />
          <Typography
            sx={{
              color: "text.secondary",
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            Current lap {formatLapTime(currentLapMs)}
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ maxWidth: 620, mx: "auto", width: "100%" }}
        >
          <PedalBar label="Throttle" value={throttleValue} color="#00E701" />
          <PedalBar label="Brake" value={brakeValue} color="#ff3048" />
        </Stack>
      </Stack>
    </Box>
  );
}

function PedalBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
        <Typography sx={{ color: "text.secondary", fontWeight: 900 }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 900 }}>
          {value}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 12,
          borderRadius: 1,
          backgroundColor: (theme) => alpha(theme.palette.common.white, 0.12),
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
            boxShadow: `0 0 18px ${alpha(color, 0.52)}`,
          },
        }}
      />
    </Box>
  );
}
