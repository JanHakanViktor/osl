import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import SensorsIcon from "@mui/icons-material/Sensors";
import SpeedIcon from "@mui/icons-material/Speed";
import { io, type Socket } from "socket.io-client";
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
    milliseconds
  ).padStart(3, "0")}`;
};

const LiveTelemetryPreview = ({ activeSession }: { activeSession: ActiveSession }) => {
  const [lapData, setLapData] = useState<LapDataPacket | null>(null);
  const [carTelemetry, setCarTelemetry] = useState<CarTelemetryPacket | null>(null);
  const [connected, setConnected] = useState(false);
  const hasActiveSession = Boolean(activeSession);

  useEffect(() => {
    setLapData(null);
    setCarTelemetry(null);
    setConnected(false);

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
    socket.on("carTelemetry", (packet: CarTelemetryPacket) => setCarTelemetry(packet));

    return () => {
      socket.disconnect();
    };
  }, [activeSession?.id, hasActiveSession]);

  const playerIndex =
    lapData?.m_header?.m_playerCarIndex ??
    carTelemetry?.m_header?.m_playerCarIndex ??
    0;

  const currentLapMs = lapData?.m_lapData?.[playerIndex]?.m_currentLapTimeInMS;
  const telemetry = useMemo(
    () => carTelemetry?.m_carTelemetryData?.[playerIndex] ?? null,
    [carTelemetry, playerIndex]
  );

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 320,
        borderRadius: 2,
        overflow: "hidden",
        color: "#fff",
        bgcolor: "#111",
        backgroundImage:
          "linear-gradient(135deg, rgba(0,0,0,0.88), rgba(14,14,14,0.72)), url('/heroBanner.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="overline" sx={{ color: "#ff4d4d", fontWeight: 800 }}>
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
            bgcolor: hasActiveSession && connected ? "#ff1f1f" : "rgba(255,255,255,0.18)",
            color: "#fff",
            fontWeight: 900,
            "& .MuiChip-icon": { color: "#fff" },
          }}
        />
      </Stack>

      <Box>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
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
          <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.72)", fontWeight: 700 }}>
            No ongoing session
          </Typography>
        )}
        {hasActiveSession && activeSession?.circuitName && (
          <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.72)" }}>
            {activeSession.circuitName}
          </Typography>
        )}
      </Box>

      {hasActiveSession && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SpeedIcon sx={{ color: "#ff4d4d" }} />
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                Speed
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: "2rem", fontWeight: 900 }}>
              {telemetry?.m_speed ?? "--"}
              <Typography component="span" sx={{ ml: 0.5, color: "rgba(255,255,255,0.68)" }}>
                km/h
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
              Gear
            </Typography>
            <Typography sx={{ fontSize: "2rem", fontWeight: 900 }}>
              {telemetry?.m_gear ?? "--"}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
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
              sx={{ height: 9, borderRadius: 1, bgcolor: "rgba(255,255,255,0.18)" }}
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
              sx={{ height: 9, borderRadius: 1, bgcolor: "rgba(255,255,255,0.18)" }}
            />
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default LiveTelemetryPreview;
