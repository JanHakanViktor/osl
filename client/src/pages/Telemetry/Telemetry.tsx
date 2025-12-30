import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { io, Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router";
import { finishSession } from "../../service/session";

/* -------------------------
   Types (trimmed & focused)
   ------------------------- */

interface PacketHeader {
  m_playerCarIndex?: number;
  m_sessionTime?: number;
}

interface CarTelemetry {
  m_speed?: number;
  m_throttle?: number;
  m_brake?: number;
  m_gear?: number;
  m_engineRPM?: number;
}

interface CarTelemetryPacket {
  m_header?: PacketHeader;
  m_carTelemetryData?: CarTelemetry[];
}

interface LapData {
  m_lastLapTimeInMS?: number;
  m_currentLapTimeInMS?: number;
  m_sector1TimeMSPart?: number;
  m_sector1TimeMinutesPart?: number;
  m_sector2TimeMSPart?: number;
  m_sector2TimeMinutesPart?: number;
  m_sector3TimeMSPart?: number;
  m_sector3TimeMinutesPart?: number;
  m_bestLapTimeInMS?: number;
  m_currentLapInvalid?: number; // 0 = valid
}

interface LapDataPacket {
  m_header?: PacketHeader;
  m_lapData?: LapData[];
}

interface SessionPacket {
  m_header?: PacketHeader;
  m_totalLaps?: number;
}

function fmtMs(ms?: number | null) {
  if (ms == null || !isFinite(ms)) return "--:--.---";
  const totalMs = Math.max(0, Math.round(ms));
  const s = Math.floor(totalMs / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const mmm = totalMs % 1000;
  return `${mm}:${String(ss).padStart(2, "0")}.${String(mmm).padStart(3, "0")}`;
}

function combineSector(mins?: number, ms?: number) {
  if (mins == null && ms == null) return null;
  const minutes = mins ?? 0;
  const msPart = ms ?? 0;
  return minutes * 60 + msPart / 1000;
}

function useTelemetry(
  serverUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030",
  namespace = "/telemetry"
) {
  const [connected, setConnected] = useState(false);
  const [carTelemetry, setCarTelemetry] = useState<CarTelemetryPacket | null>(
    null
  );
  const [lapDataPkt, setLapDataPkt] = useState<LapDataPacket | null>(null);
  const [sessionPkt, setSessionPkt] = useState<SessionPacket | null>(null);

  useEffect(() => {
    const url = `${serverUrl.replace(/\/$/, "")}${namespace}`;
    const socket: Socket = io(url, {
      autoConnect: true,
      reconnection: true,
      timeout: 20000,
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("carTelemetry", (d: CarTelemetryPacket) =>
      setCarTelemetry(() => d)
    );
    socket.on("lapData", (d: LapDataPacket) => setLapDataPkt(() => d));
    socket.on("session", (d: SessionPacket) => setSessionPkt(() => d));
    socket.on("connect_error", (err: unknown) =>
      console.warn("Telemetry socket connect_error:", err)
    );

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("carTelemetry");
      socket.off("lapData");
      socket.off("session");
      socket.disconnect();
    };
  }, [serverUrl, namespace]);

  return { connected, carTelemetry, lapDataPkt, sessionPkt };
}

/* -----------
   Components
   ----------- */

function SectorChip({
  label,
  valueSec,
  deltaSec,
  isPb = false,
}: {
  label: string;
  valueSec: number | null;
  deltaSec: number | null;
  isPb?: boolean;
}) {
  const deltaColor =
    deltaSec == null
      ? "text.secondary"
      : deltaSec <= 0
      ? "success.main"
      : "error.main";
  const deltaText =
    deltaSec == null
      ? "—"
      : deltaSec <= 0
      ? `▲ ${Math.abs(deltaSec).toFixed(3)}s`
      : `▼ ${deltaSec.toFixed(3)}s`;

  return (
    <Card
      variant="outlined"
      sx={{ minWidth: 120, p: 1, bgcolor: "background.paper" }}
    >
      <Stack spacing={0.25}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontFamily: "'Roboto Mono', monospace" }}
        >
          {valueSec != null ? `${valueSec.toFixed(3)} s` : "—"}
        </Typography>
        <Typography variant="caption" sx={{ color: deltaColor }}>
          {deltaText} {isPb ? " • PB" : ""}
        </Typography>
      </Stack>
    </Card>
  );
}

function TelemetryGauges({
  speed,
  rpm,
  gear,
  throttle,
  brake,
}: {
  speed?: number;
  rpm?: number;
  gear?: number;
  throttle?: number;
  brake?: number;
}) {
  const theme = useTheme();

  return (
    <Stack spacing={1}>
      <Box
        sx={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Speed
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontFamily: "'Roboto Mono', monospace" }}
          >
            {speed ?? "—"}
            <Typography
              component="span"
              variant="subtitle2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              km/h
            </Typography>
          </Typography>
        </Box>

        <Stack direction="column" spacing={0.5}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              RPM
            </Typography>
            <Typography variant="h6">{rpm ?? "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Gear
            </Typography>
            <Typography variant="h6">{gear ?? "—"}</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Throttle
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(throttle ?? 0) * 100}
            sx={{
              height: 8,
              borderRadius: 2,
              "& .MuiLinearProgress-bar": {
                borderRadius: 2,
                bgcolor: theme.palette.primary.main,
              },
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Brake
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(brake ?? 0) * 100}
            sx={{
              height: 8,
              borderRadius: 2,
              "& .MuiLinearProgress-bar": {
                borderRadius: 2,
                bgcolor: theme.palette.error.main,
              },
            }}
          />
        </Box>
      </Box>
    </Stack>
  );
}

/* -------------------------
   Telemetry page
   ------------------------- */

export default function TelemetryPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { connected, carTelemetry, lapDataPkt, sessionPkt } = useTelemetry();
  const [history, setHistory] = useState<
    Array<{ lapMs: number; valid: boolean; sectors?: number[] }>
  >([]);

  const prevBestRef = useRef<number | null>(null);

  // pick player index in header of whichever packet is present
  const playerIndex = useMemo(() => {
    const hdr =
      lapDataPkt?.m_header ?? carTelemetry?.m_header ?? sessionPkt?.m_header;
    return hdr?.m_playerCarIndex ?? 0;
  }, [lapDataPkt, carTelemetry, sessionPkt]);

  const lapArray = useMemo(
    () => (lapDataPkt?.m_lapData ?? []) as LapData[],
    [lapDataPkt]
  );
  const playerLapEntry = lapArray?.[playerIndex];

  const telemetryArray = (carTelemetry?.m_carTelemetryData ??
    []) as CarTelemetry[];

  const currentLapMs = playerLapEntry?.m_currentLapTimeInMS ?? null;
  const lastLapMs = playerLapEntry?.m_lastLapTimeInMS ?? null;
  const bestLapMs = playerLapEntry?.m_bestLapTimeInMS ?? null;
  const currentInvalid = playerLapEntry?.m_currentLapInvalid ?? 0;

  const s1 = combineSector(
    playerLapEntry?.m_sector1TimeMinutesPart,
    playerLapEntry?.m_sector1TimeMSPart
  );
  const s2 = combineSector(
    playerLapEntry?.m_sector2TimeMinutesPart,
    playerLapEntry?.m_sector2TimeMSPart
  );
  const s3 = combineSector(
    playerLapEntry?.m_sector3TimeMinutesPart,
    playerLapEntry?.m_sector3TimeMSPart
  );

  // push new lastLap to history (dedupe)
  useEffect(() => {
    if (lastLapMs == null) return;
    setHistory((prev) => {
      if (prev[0] && prev[0].lapMs === lastLapMs) return prev;
      const item = {
        lapMs: lastLapMs,
        valid: currentInvalid === 0,
        sectors: [s1 ?? 0, s2 ?? 0, s3 ?? 0],
      };
      const next = [item, ...prev].slice(0, 20);
      if (bestLapMs != null) prevBestRef.current = bestLapMs;
      return next;
    });
  }, [lastLapMs, currentInvalid, s1, s2, s3, bestLapMs]);

  const playerTelem = telemetryArray?.[playerIndex] ?? null;

  const rpm = playerTelem?.m_engineRPM;
  const speed = playerTelem?.m_speed;
  const gear = playerTelem?.m_gear;
  const throttle = playerTelem?.m_throttle;
  const brake = playerTelem?.m_brake;

  const deltaToBest =
    currentLapMs != null && bestLapMs != null
      ? (currentLapMs - bestLapMs) / 1000
      : null;
  const topSpeed = telemetryArray.length
    ? Math.max(...telemetryArray.map((t) => t.m_speed ?? 0))
    : null;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
            F1
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ letterSpacing: 0.3 }}>
              Telemetry Components
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live hotlap telemetry — clean minimal UI
            </Typography>
          </Box>
          <Chip
            label={connected ? "LIVE" : "OFFLINE"}
            color={connected ? "success" : "default"}
            sx={{ ml: 2 }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`Player: ${playerIndex}`} />
          <Chip
            label={`Session: ${
              sessionPkt?.m_header?.m_sessionTime?.toFixed(1) ?? "—"
            }s`}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            flex: "1 1 65%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Card variant="elevation" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Live Lap
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ fontFamily: "'Roboto Mono', monospace" }}
                  >
                    {fmtMs(currentLapMs)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={
                      deltaToBest == null
                        ? "text.secondary"
                        : deltaToBest <= 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {deltaToBest == null
                      ? "—"
                      : deltaToBest <= 0
                      ? `▲ ${Math.abs(deltaToBest).toFixed(3)}s vs PB`
                      : `▼ ${deltaToBest.toFixed(3)}s vs PB`}
                  </Typography>
                </Box>

                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary">
                    Best Lap
                  </Typography>
                  <Typography variant="h6">{fmtMs(bestLapMs)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lastLapMs != null
                      ? `Last: ${fmtMs(lastLapMs)} ${
                          currentInvalid ? "(INVALID)" : ""
                        }`
                      : ""}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} mt={2}>
                <SectorChip
                  label="Sector 1"
                  valueSec={s1 ?? null}
                  deltaSec={null}
                />
                <SectorChip
                  label="Sector 2"
                  valueSec={s2 ?? null}
                  deltaSec={null}
                />
                <SectorChip
                  label="Sector 3"
                  valueSec={s3 ?? null}
                  deltaSec={null}
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "stretch",
                }}
              >
                <Card variant="outlined" sx={{ flex: 1, minHeight: 160 }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Live Gauges
                    </Typography>
                    <TelemetryGauges
                      speed={speed}
                      rpm={rpm}
                      gear={gear}
                      throttle={throttle}
                      brake={brake}
                    />
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  sx={{ width: { xs: "100%", sm: 260 }, minHeight: 160 }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Session Highlights
                    </Typography>
                    <Stack spacing={1} mt={1}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Top Speed
                        </Typography>
                        <Typography variant="subtitle1">
                          {topSpeed ?? "—"} km/h
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Total Laps
                        </Typography>
                        <Typography variant="subtitle1">
                          {sessionPkt?.m_totalLaps ?? "—"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Connection
                        </Typography>
                        <Chip
                          label={connected ? "Connected" : "Disconnected"}
                          color={connected ? "success" : "default"}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="h6">Run History</Typography>
                <Button size="small" variant="outlined">
                  Export
                </Button>
              </Stack>

              <List dense>
                {history.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No laps yet
                  </Typography>
                )}
                {history.map((h, i) => (
                  <React.Fragment key={`${h.lapMs}-${i}`}>
                    <ListItem
                      secondaryAction={
                        <Chip
                          label={h.valid ? "Valid" : "Invalid"}
                          color={h.valid ? "success" : "error"}
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: h.valid ? "success.main" : "error.main",
                          }}
                        >
                          {h.valid ? "V" : "X"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{ fontFamily: "'Roboto Mono', monospace" }}
                          >
                            {fmtMs(h.lapMs)}
                          </Typography>
                        }
                        secondary={
                          h.sectors
                            ? `S1 ${h.sectors[0]?.toFixed(3) ?? "—"} / S2 ${
                                h.sectors[1]?.toFixed(3) ?? "—"
                              } / S3 ${h.sectors[2]?.toFixed(3) ?? "—"}`
                            : undefined
                        }
                      />
                    </ListItem>
                    {i < history.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Button
        color="error"
        variant="contained"
        onClick={async () => {
          if (!sessionId) {
            return (
              <Container>
                <Typography color="error">MISSING SESSION</Typography>
              </Container>
            );
          }

          await finishSession(sessionId);
          navigate(`/sessions/${sessionId}/overview`);
        }}
      >
        Finish Session
      </Button>
    </Container>
  );
}
