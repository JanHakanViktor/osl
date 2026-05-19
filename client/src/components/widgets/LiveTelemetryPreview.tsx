import { useEffect, useMemo, useState } from "react";
import { Box, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import SensorsIcon from "@mui/icons-material/Sensors";
import SpeedIcon from "@mui/icons-material/Speed";
import { alpha } from "@mui/material/styles";
import { io, type Socket } from "socket.io-client";
import { getOslAppShell } from "../../theme";
import type { LandingSummary } from "../../types/session.types";

type ActiveSession = LandingSummary["activeSession"];

type PacketHeader = {
  m_playerCarIndex?: number;
};

type LapDataPacket = {
  m_header?: PacketHeader;
  m_lapData?: Array<{
    m_currentLapTimeInMS?: number;
  }>;
};

type CarTelemetryPacket = {
  m_header?: PacketHeader;
  m_carTelemetryData?: Array<{
    m_speed?: number;
    m_throttle?: number;
    m_brake?: number;
    m_gear?: number;
    m_engineRPM?: number;
  }>;
};

const formatMs = (ms?: number | null) => {
  if (ms == null || !isFinite(ms)) return "--:--.---";

  const totalMs = Math.max(0, Math.round(ms));
  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = totalMs % 1000;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}.${String(
    milliseconds,
  ).padStart(3, "0")}`;
};

const LiveTelemetryPreview = ({
  activeSession,
}: {
  activeSession: ActiveSession;
}) => {
  const [lapData, setLapData] = useState<LapDataPacket | null>(null);
  const [carTelemetry, setCarTelemetry] = useState<CarTelemetryPacket | null>(
    null,
  );
  const [connected, setConnected] = useState(false);
  const hasActiveSession = Boolean(activeSession);

  useEffect(() => {
    if (!hasActiveSession) {
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
    const socket: Socket = io(`${serverUrl.replace(/\/$/, "")}/telemetry`, {
      autoConnect: true,
      reconnection: true,
      timeout: 20000,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("lapData", (packet: LapDataPacket) => setLapData(packet));
    socket.on("carTelemetry", (packet: CarTelemetryPacket) =>
      setCarTelemetry(packet),
    );

    return () => {
      socket.disconnect();
    };
  }, [activeSession?.id, hasActiveSession]);

  const playerIndex =
    lapData?.m_header?.m_playerCarIndex ??
    carTelemetry?.m_header?.m_playerCarIndex ??
    0;

  const currentLapMs = hasActiveSession
    ? lapData?.m_lapData?.[playerIndex]?.m_currentLapTimeInMS
    : undefined;
  const telemetry = useMemo(
    () =>
      hasActiveSession
        ? (carTelemetry?.m_carTelemetryData?.[playerIndex] ?? null)
        : null,
    [carTelemetry, hasActiveSession, playerIndex],
  );

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 320,
        borderRadius: 2,
        overflow: "hidden",
        color: "common.white",
        backgroundColor: (theme) => getOslAppShell(theme).surface,
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${alpha(
            getOslAppShell(theme).surface,
            0.9,
          )}, ${alpha(
            getOslAppShell(theme).surfaceStrong,
            0.74,
          )}), url('/heroBanner.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.28)",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 3,
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
            Live telemetry
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {activeSession?.sessionName ?? "Active Session Preview"}
          </Typography>
        </Box>
        <Chip
          icon={<SensorsIcon />}
          label={hasActiveSession && connected ? "LIVE" : "OFFLINE"}
          size="small"
          sx={{
            bgcolor: (theme) =>
              hasActiveSession && connected
                ? getOslAppShell(theme).accent
                : getOslAppShell(theme).surfaceGlass,
            color: "common.white",
            fontWeight: 900,
            border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
            "& .MuiChip-icon": { color: "common.white" },
          }}
        />
      </Stack>

      <Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Current lap
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: { xs: "2.6rem", sm: "3.6rem" },
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          {formatMs(currentLapMs)}
        </Typography>
        {!hasActiveSession && (
          <Typography sx={{ mt: 1, color: "text.secondary", fontWeight: 700 }}>
            No ongoing session
          </Typography>
        )}
        {hasActiveSession && activeSession?.circuitName && (
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            {activeSession.circuitName}
          </Typography>
        )}
      </Box>

      {hasActiveSession && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SpeedIcon
                sx={{ color: (theme) => getOslAppShell(theme).accent }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Speed
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: "2rem", fontWeight: 900 }}>
              {telemetry?.m_speed ?? "--"}
              <Typography
                component="span"
                sx={{ ml: 0.5, color: "text.secondary" }}
              >
                km/h
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Gear
            </Typography>
            <Typography sx={{ fontSize: "2rem", fontWeight: 900 }}>
              {telemetry?.m_gear ?? "--"}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              RPM
            </Typography>
            <Typography sx={{ fontSize: "2rem", fontWeight: 900 }}>
              {telemetry?.m_engineRPM?.toLocaleString() ?? "--"}
            </Typography>
          </Box>
        </Stack>
      )}

      {hasActiveSession && (
        <Stack spacing={1.5} sx={{ mt: "auto" }}>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption">Throttle</Typography>
              <Typography variant="caption">
                {Math.round((telemetry?.m_throttle ?? 0) * 100)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(telemetry?.m_throttle ?? 0) * 100}
              sx={{
                height: 9,
                borderRadius: 1,
                bgcolor: (theme) => getOslAppShell(theme).surfaceGlass,
              }}
            />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption">Brake</Typography>
              <Typography variant="caption">
                {Math.round((telemetry?.m_brake ?? 0) * 100)}%
              </Typography>
            </Stack>
            <LinearProgress
              color="error"
              variant="determinate"
              value={(telemetry?.m_brake ?? 0) * 100}
              sx={{
                height: 9,
                borderRadius: 1,
                bgcolor: (theme) => getOslAppShell(theme).surfaceGlass,
              }}
            />
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default LiveTelemetryPreview;
