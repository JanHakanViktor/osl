import { Link as RouterLink } from "react-router";
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import SensorsIcon from "@mui/icons-material/Sensors";
import { format } from "date-fns";
import { getOslAppShell } from "../../theme";
import type { TimingSessionSummary } from "../../types/liveTiming.types";
import { formatLapTime } from "../Telemetry/telemetryFormatters";
import TournamentPanel from "../Tournament/components/TournamentPanel";
import { useTimingSessions } from "./hooks/useLiveTiming";

function SessionCard({ summary }: { summary: TimingSessionSummary }) {
  const { circuit, fastestLap, leader } = summary;

  return (
    <ButtonBase
      component={RouterLink}
      to={`/live-timing/sessions/${summary.sessionUid}`}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "64px 1fr", sm: "88px 1fr auto" },
        alignItems: "center",
        gap: 2,
        p: 2,
        width: "100%",
        textAlign: "left",
        borderRadius: 2,
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        transition: "border-color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: (theme) => getOslAppShell(theme).accent,
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        component="img"
        src={circuit?.image ?? "/f125LogoDark.png"}
        alt=""
        sx={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain" }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 900, textTransform: "uppercase" }}>
          {circuit ? `${circuit.grandPrix} · ` : ""}
          {summary.sessionName}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
          {format(new Date(summary.startedAt), "d MMM yyyy, HH:mm")} ·{" "}
          {summary.driverCount} drivers
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
          {summary.isOnline && <Chip size="small" label="Online" />}
          {summary.isFinished && (
            <Chip size="small" color="success" label="Final" />
          )}
          {leader && (
            <Chip
              size="small"
              variant="outlined"
              label={`P1 ${leader.driverName}`}
            />
          )}
        </Stack>
      </Box>
      <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
        <Typography
          sx={{ color: "text.secondary", fontSize: "0.72rem", fontWeight: 900 }}
        >
          FASTEST LAP
        </Typography>
        <Typography
          sx={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 800 }}
        >
          {formatLapTime(fastestLap?.timeMs)}
        </Typography>
        <Typography sx={{ fontWeight: 800 }}>
          {fastestLap?.driverName ?? ""}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

/** Game sessions live timing saved, newest first. */
export default function TimingSessionsPage() {
  const { data: sessions, isLoading, error } = useTimingSessions();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
        sx={{ mb: 3 }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "1.7rem", md: "2.4rem" },
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Timing sessions
        </Typography>
        <Button
          component={RouterLink}
          to="/live-timing"
          variant="contained"
          startIcon={<SensorsIcon />}
        >
          Live timing
        </Button>
      </Stack>

      <TournamentPanel>
        {isLoading && (
          <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Typography color="error">{error.message}</Typography>}
        {sessions?.length === 0 && (
          <Typography color="text.secondary">
            No saved sessions yet. Live timing saves a session as soon as a car
            completes a lap.
          </Typography>
        )}
        <Stack spacing={1.5}>
          {sessions?.map((summary) => (
            <SessionCard key={summary.sessionUid} summary={summary} />
          ))}
        </Stack>
      </TournamentPanel>
    </Container>
  );
}
