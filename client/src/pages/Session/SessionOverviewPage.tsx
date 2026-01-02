import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { getSessionOverview } from "../../service/session";

interface TelemetryOverview {
  fastestLapMs: number;
  topSpeedKmh: number;
  bestCleanLapStreak: number;
  totalCleanLaps: number;
}

interface SessionOverview {
  sessionName: string;
  circuitName: string;
  startedAt: string;
  finishedAt: string;
  telemetry: TelemetryOverview;
}

function fmtMs(ms?: number | null) {
  if (!ms) return "—";
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const mmm = ms % 1000;
  return `${mm}:${String(ss).padStart(2, "0")}.${String(mmm).padStart(3, "0")}`;
}

function fmtDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function SessionOverviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<SessionOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    (async () => {
      try {
        const res = await getSessionOverview(sessionId);
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load session overview");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading session overview…</Typography>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">{error ?? "No data"}</Typography>
      </Container>
    );
  }

  const { sessionName, circuitName, startedAt, finishedAt, telemetry } = data;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Session Overview
          </Typography>
          <Typography color="text.secondary">
            {sessionName} · {circuitName}
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Timing
              </Typography>

              <Box display="flex" justifyContent="space-between">
                <Typography>Started</Typography>
                <Typography>{fmtDate(startedAt)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography>Finished</Typography>
                <Typography>{fmtDate(finishedAt)}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Performance
            </Typography>

            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography>Fastest Lap</Typography>
                <Typography>{fmtMs(telemetry.fastestLapMs)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography>Top Speed</Typography>
                <Typography>{telemetry.topSpeedKmh} km/h</Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography>Best Clean Lap Streak</Typography>
                <Chip label={telemetry.bestCleanLapStreak} color="success" />
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography>Total Clean Laps</Typography>
                <Chip label={telemetry.totalCleanLaps} />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => navigate("/")}>
            Back to Home
          </Button>

          <Button variant="outlined" onClick={() => navigate("/sessions/new")}>
            New Session
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
