import { useMemo } from "react";
import { Link as RouterLink } from "react-router";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import type { TimingBoard, TimingFrame } from "../../types/liveTiming.types";
import { formatDuration } from "../Telemetry/telemetryFormatters";
import TournamentPanel from "../Tournament/components/TournamentPanel";
import LiveTrackMap from "./components/LiveTrackMap";
import TimingBoardDetails from "./components/TimingBoardDetails";
import TimingSessionHeader from "./components/TimingSessionHeader";
import TimingTower from "./components/TimingTower";
import { useLiveTiming } from "./hooks/useLiveTiming";
import { buildTowerRows, buildTrackMarkers } from "./liveTimingView";

function sessionProgressLabel(
  board: TimingBoard,
  frame: TimingFrame | null,
): string | null {
  const { sessionKind, totalLaps } = board.session;

  if (sessionKind === "RACE") {
    const leaderLap =
      frame?.cars.find((car) => car.position === 1)?.lapNumber ??
      board.drivers[0]?.currentLapNumber;
    if (!leaderLap) return null;
    return totalLaps
      ? `Lap ${Math.min(leaderLap, totalLaps)}/${totalLaps}`
      : `Lap ${leaderLap}`;
  }

  return frame?.timeLeftSeconds != null
    ? `${formatDuration(frame.timeLeftSeconds)} left`
    : null;
}

function WaitingForTelemetry() {
  return (
    <TournamentPanel title="Waiting for telemetry">
      <Stack spacing={1.5}>
        <Typography color="text.secondary">
          Start the telemetry relay and join a session in F1 25. Live timing
          picks up every car in the session: you, the other drivers in your
          lobby and the AI.
        </Typography>
        <Typography color="text.secondary">
          In the game's telemetry settings, turn UDP telemetry on and set the
          UDP format to 2025.
        </Typography>
      </Stack>
    </TournamentPanel>
  );
}

export default function LiveTimingPage() {
  const { board, frame, connected, receiving, isLoading, error } =
    useLiveTiming();
  const rows = useMemo(
    () => (board ? buildTowerRows(board, frame) : []),
    [board, frame],
  );
  const markers = useMemo(
    () => (board ? buildTrackMarkers(board, frame) : []),
    [board, frame],
  );
  const progressLabel = board ? sessionProgressLabel(board, frame) : null;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{ mb: { xs: 1, md: 0 } }}
      >
        <Button
          component={RouterLink}
          to="/live-timing/sessions"
          startIcon={<HistoryIcon />}
          variant="outlined"
          size="small"
        >
          Saved sessions
        </Button>
      </Stack>

      {isLoading && (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color="error">{error.message}</Typography>}
      {!isLoading && !error && !board && <WaitingForTelemetry />}

      {board && (
        <>
          <TimingSessionHeader eyebrow="Live timing" session={board.session}>
            <Chip
              size="small"
              color={receiving ? "error" : "default"}
              label={
                receiving ? "● Live" : connected ? "No telemetry" : "Offline"
              }
              sx={{ fontWeight: 900 }}
            />
            {progressLabel && (
              <Chip
                size="small"
                label={progressLabel}
                sx={{ fontWeight: 900 }}
              />
            )}
          </TimingSessionHeader>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
              },
              gap: { xs: 2, md: 2.5 },
              mb: { xs: 2, md: 2.5 },
              alignItems: "start",
            }}
          >
            <TournamentPanel title="Track">
              <LiveTrackMap
                circuitName={board.session.circuit?.name ?? null}
                markers={markers}
              />
            </TournamentPanel>
            <TournamentPanel title="Timing">
              <TimingTower rows={rows} live />
            </TournamentPanel>
          </Box>

          <TimingBoardDetails board={board} />
        </>
      )}
    </Container>
  );
}
