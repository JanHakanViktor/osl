import {
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { LandingSummary } from "../../types/session.types";

type LatestSession = LandingSummary["latestSession"];

const formatMs = (ms?: number | null) => {
  if (!ms) return "--:--.---";

  const totalMs = Math.max(0, Math.round(ms));
  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = totalMs % 1000;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}.${String(
    milliseconds
  ).padStart(3, "0")}`;
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 900, fontSize: "1.15rem" }}>{value}</Typography>
  </Box>
);

const LatestSessionRecap = ({ session }: { session: LatestSession }) => {
  const hasSession = Boolean(session);

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 320,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          minHeight: 128,
          color: "#fff",
          p: 3,
          bgcolor: "#d90000",
          overflow: "hidden",
        }}
      >
        {session?.image && (
          <Box
            component="img"
            src={session.image}
            alt=""
            sx={{
              position: "absolute",
              top: 8,
              right: { xs: 8, sm: 12 },
              width: { xs: "44%", sm: "42%" },
              height: "calc(100% - 16px)",
              objectFit: "contain",
              objectPosition: "right center",
              opacity: 0.72,
              filter: "brightness(0) invert(1)",
              pointerEvents: "none",
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.76), rgba(0,0,0,0.22))",
          }}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="overline" sx={{ color: "#ff4d4d", fontWeight: 800 }}>
              Latest session
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {session?.sessionName ?? "No finished sessions"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.78)" }}>
              {session?.circuitName ?? "Finish a session to unlock the recap"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Stack spacing={2.25} sx={{ p: 3, flex: 1 }}>
        <Typography color="text.secondary">
          Driver: {session?.driverName ?? "No driver recorded"}
        </Typography>
        <Divider />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <Stat label="Fastest lap" value={formatMs(session?.fastestLapMs)} />
          <Stat label="Top speed" value={hasSession ? `${session?.topSpeedKmh ?? 0} km/h` : "--"} />
          <Stat label="Clean laps" value={hasSession ? `${session?.totalCleanLaps ?? 0}` : "--"} />
          <Stat
            label="Best streak"
            value={hasSession ? `${session?.bestCleanLapStreak ?? 0}` : "--"}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default LatestSessionRecap;
