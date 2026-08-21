import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import { LineChart } from "@mui/x-charts/LineChart";
import { useNavigate, useParams } from "react-router";
import {
  clearSimCoachReference,
  getSimCoachAnalysis,
  getSimCoachLaps,
  selectSimCoachReference,
} from "../../service/simCoach";
import type {
  SimCoachAnalysis,
  SimCoachLapSummary,
} from "../../types/sim-coach.types";
import CornerCoachPanel from "./CornerCoachPanel";
import RacingLineReplay from "./RacingLineReplay";

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const milliseconds = Math.round(ms % 1_000);
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function formatDelta(ms: number): string {
  const sign = ms > 0 ? "+" : "";
  return `${sign}${(ms / 1_000).toFixed(3)}s`;
}

function findLatestLap(
  laps: SimCoachLapSummary[],
): SimCoachLapSummary | undefined {
  return laps.reduce<SimCoachLapSummary | undefined>(
    (latest, lap) =>
      !latest || lap.lapNumber > latest.lapNumber ? lap : latest,
    undefined,
  );
}

const EMPTY_LAPS: SimCoachLapSummary[] = [];
const DEFAULT_REFERENCE_VALUE = "professional-default";

function CoachChart({ analysis }: { analysis: SimCoachAnalysis }) {
  const points = analysis.alignedPoints;
  const distance = points.map((point) => point.distanceM);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Speed comparison</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Both laps aligned to the same track distance.
          </Typography>
          <Box sx={{ width: "100%", minHeight: 320 }}>
            <LineChart
              height={320}
              xAxis={[{ data: distance, label: "Track distance (m)" }]}
              yAxis={[{ label: "Speed (km/h)" }]}
              series={[
                {
                  data: points.map((point) => point.targetSpeedKmh),
                  label: `Lap ${analysis.targetLap.lapNumber}`,
                  color: "#ff3048",
                  showMark: false,
                },
                {
                  data: points.map((point) => point.referenceSpeedKmh),
                  label: analysis.referenceLap.driverName
                    ? `${analysis.referenceLap.driverName} reference`
                    : `Reference lap ${analysis.referenceLap.lapNumber}`,
                  color: "#6dc8ff",
                  showMark: false,
                },
              ]}
              grid={{ horizontal: true, vertical: true }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Time delta</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            A rising line shows where the selected lap loses time.
          </Typography>
          <Box sx={{ width: "100%", minHeight: 280 }}>
            <LineChart
              height={280}
              xAxis={[{ data: distance, label: "Track distance (m)" }]}
              yAxis={[
                {
                  label: "Delta",
                  valueFormatter: (value: number) => formatDelta(value),
                },
              ]}
              series={[
                {
                  data: points.map((point) => point.deltaMs),
                  label: "Lap delta",
                  color: "#ffb000",
                  showMark: false,
                  valueFormatter: (value: number | null) =>
                    value == null ? "--" : formatDelta(value),
                },
              ]}
              grid={{ horizontal: true, vertical: true }}
            />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default function SimCoachPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [targetLapId, setTargetLapId] = useState<string>();

  const lapsQuery = useQuery({
    queryKey: ["sim-coach-laps", sessionId],
    queryFn: () => getSimCoachLaps(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: (query) =>
      query.state.status === "success" && query.state.data?.length === 0
        ? 3_000
        : false,
  });
  const laps = lapsQuery.data ?? EMPTY_LAPS;
  const resolvedTargetId = targetLapId ?? findLatestLap(laps)?.id;
  const targetLap = laps.find((lap) => lap.id === resolvedTargetId);
  const resolvedReferenceId =
    targetLap?.referenceLapId ?? DEFAULT_REFERENCE_VALUE;

  const analysisQuery = useQuery({
    queryKey: [
      "sim-coach-analysis",
      resolvedTargetId,
      targetLap?.referenceLapId,
    ],
    queryFn: () => getSimCoachAnalysis(resolvedTargetId!),
    enabled: Boolean(resolvedTargetId),
  });

  const referenceMutation = useMutation({
    mutationFn: (referenceLapId: string) =>
      referenceLapId === DEFAULT_REFERENCE_VALUE
        ? clearSimCoachReference(resolvedTargetId!)
        : selectSimCoachReference(resolvedTargetId!, referenceLapId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sim-coach-laps", sessionId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["sim-coach-analysis", resolvedTargetId],
      });
    },
  });

  if (lapsQuery.isPending) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (lapsQuery.error) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{lapsQuery.error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoGraphRoundedIcon color="primary" />
              <Typography variant="overline" color="primary.light">
                Sim coach
              </Typography>
            </Stack>
            <Typography variant="h3">Lap analysis</Typography>
            <Typography color="text.secondary">
              Distance-aligned telemetry with evidence behind every
              recommendation.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/sessions/${sessionId}/overview`)}
          >
            Back to overview
          </Button>
        </Stack>

        {laps.length === 0 ? (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="flex-start">
                <FlagRoundedIcon color="primary" fontSize="large" />
                <Typography variant="h5">
                  No completed coaching laps yet
                </Typography>
                <Typography color="text.secondary">
                  Start this OSL session, then complete two laps in F1 25 Time
                  Trial or practice. The relay will upload them automatically.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel id="target-lap-label">
                      Lap to analyze
                    </InputLabel>
                    <Select
                      labelId="target-lap-label"
                      label="Lap to analyze"
                      value={resolvedTargetId ?? ""}
                      onChange={(event) => setTargetLapId(event.target.value)}
                    >
                      {laps.map((lap) => (
                        <MenuItem key={lap.id} value={lap.id}>
                          Lap {lap.lapNumber} · {formatLapTime(lap.lapTimeMs)}
                          {lap.valid ? "" : " · invalid"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    disabled={!resolvedTargetId}
                  >
                    <InputLabel id="reference-lap-label">
                      Reference lap
                    </InputLabel>
                    <Select
                      labelId="reference-lap-label"
                      label="Reference lap"
                      value={resolvedReferenceId ?? ""}
                      onChange={(event) =>
                        referenceMutation.mutate(event.target.value)
                      }
                    >
                      <MenuItem value={DEFAULT_REFERENCE_VALUE}>
                        Professional default · RaceNet
                      </MenuItem>
                      {laps
                        .filter((lap) => lap.id !== resolvedTargetId)
                        .map((lap) => (
                          <MenuItem key={lap.id} value={lap.id}>
                            Lap {lap.lapNumber} · {formatLapTime(lap.lapTimeMs)}
                            {lap.valid ? "" : " · invalid"}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {!targetLap?.referenceLapId ? (
              <Alert severity="info">
                Using the validated no-assist professional RaceNet reference for
                this circuit.
              </Alert>
            ) : null}

            {analysisQuery.isPending || referenceMutation.isPending ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress />
              </Box>
            ) : analysisQuery.error ? (
              <Alert severity="error">{analysisQuery.error.message}</Alert>
            ) : referenceMutation.error ? (
              <Alert severity="error">{referenceMutation.error.message}</Alert>
            ) : analysisQuery.data ? (
              <>
                <Card>
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      gap={2}
                    >
                      <Box>
                        <Typography color="text.secondary">Lap time</Typography>
                        <Typography variant="h4">
                          {formatLapTime(
                            analysisQuery.data.targetLap.lapTimeMs,
                          )}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography color="text.secondary">
                          Reference
                        </Typography>
                        <Typography variant="h4">
                          {formatLapTime(
                            analysisQuery.data.referenceLap.lapTimeMs,
                          )}
                        </Typography>
                        {analysisQuery.data.referenceLap.driverName ? (
                          <Typography color="text.secondary">
                            {analysisQuery.data.referenceLap.driverName}
                            {analysisQuery.data.referenceLap.leaderboardRank
                              ? ` · RaceNet P${analysisQuery.data.referenceLap.leaderboardRank}`
                              : ""}
                          </Typography>
                        ) : null}
                      </Box>
                      <Box>
                        <Typography color="text.secondary">
                          Total delta
                        </Typography>
                        <Typography
                          variant="h4"
                          color={
                            analysisQuery.data.totalDeltaMs > 0
                              ? "warning.main"
                              : "success.main"
                          }
                        >
                          {formatDelta(analysisQuery.data.totalDeltaMs)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {!analysisQuery.data.referenceLap.valid ? (
                  <Alert severity="warning">
                    No valid reference lap was available, so this report uses a
                    completed invalid lap. Track-limit or reset events may
                    influence the recommendations.
                  </Alert>
                ) : null}

                <CornerCoachPanel analysis={analysisQuery.data} />
                <RacingLineReplay analysis={analysisQuery.data} />
                <CoachChart analysis={analysisQuery.data} />
              </>
            ) : null}
          </>
        )}
      </Stack>
    </Container>
  );
}
