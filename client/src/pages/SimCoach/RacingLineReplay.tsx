import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import SkipNextRoundedIcon from "@mui/icons-material/SkipNextRounded";
import SkipPreviousRoundedIcon from "@mui/icons-material/SkipPreviousRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import type {
  SimCoachAnalysis,
  SimCoachCornerAnalysis,
  SimCoachRacingLineSample,
  SimCoachWorldPosition,
} from "../../types/sim-coach.types";
import { getOslAppShell } from "../../theme";
import RacingLineReplayDetails, {
  RacingLineDriverInputs,
} from "./RacingLineReplayDetails";

const TARGET_COLOR = "#ff3048";
const REFERENCE_COLOR = "#6dc8ff";
const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 520;
const VIEWBOX_PADDING = 44;
const PLAYBACK_TICK_MS = 40;
const SPEEDS = [0.25, 0.5, 1, 2] as const;
const EMPTY_RACING_LINE: SimCoachRacingLineSample[] = [];

const INPUT_COLORS = {
  braking: "#ff5364",
  coasting: "#f6b94a",
  throttle: "#55d98b",
} as const;

type PositionedSample = SimCoachRacingLineSample & {
  position: SimCoachWorldPosition;
};

type ProjectedPoint = {
  x: number;
  y: number;
};

type Projection = {
  project: (position: SimCoachWorldPosition) => ProjectedPoint;
};

type InputPhase = keyof typeof INPUT_COLORS;

type InputPathSegment = {
  phase: InputPhase;
  path: string;
};

type TrackEvent = {
  color: string;
  label: string;
  name: string;
  point: ProjectedPoint;
};


function hasPosition(
  sample: SimCoachRacingLineSample,
): sample is PositionedSample {
  return Boolean(sample.position);
}

function createProjection(samples: PositionedSample[]): Projection {
  const xValues = samples.map((sample) => sample.position.x);
  const zValues = samples.map((sample) => sample.position.z);
  const minimumX = Math.min(...xValues);
  const maximumX = Math.max(...xValues);
  const minimumZ = Math.min(...zValues);
  const maximumZ = Math.max(...zValues);
  const xRange = Math.max(1, maximumX - minimumX);
  const zRange = Math.max(1, maximumZ - minimumZ);
  const availableWidth = VIEWBOX_WIDTH - VIEWBOX_PADDING * 2;
  const availableHeight = VIEWBOX_HEIGHT - VIEWBOX_PADDING * 2;
  const scale = Math.min(availableWidth / xRange, availableHeight / zRange);
  const renderedWidth = xRange * scale;
  const renderedHeight = zRange * scale;
  const offsetX = (VIEWBOX_WIDTH - renderedWidth) / 2;
  const offsetY = (VIEWBOX_HEIGHT - renderedHeight) / 2;

  return {
    project: (position) => ({
      x: offsetX + (position.x - minimumX) * scale,
      y: offsetY + (maximumZ - position.z) * scale,
    }),
  };
}

function buildPath(
  samples: PositionedSample[],
  projection: Projection,
): string {
  return samples
    .map((sample, index) => {
      const point = projection.project(sample.position);
      return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function getInputPhase(sample: SimCoachRacingLineSample): InputPhase {
  if (sample.brake >= 0.04 && sample.brake >= sample.throttle) {
    return "braking";
  }
  if (sample.throttle >= 0.04) return "throttle";
  return "coasting";
}

function buildInputSegments(
  samples: PositionedSample[],
  projection: Projection,
): InputPathSegment[] {
  if (samples.length < 2) return [];

  const segments: InputPathSegment[] = [];
  let phase = getInputPhase(samples[0]);
  let points = [projection.project(samples[0].position)];

  for (let index = 1; index < samples.length; index += 1) {
    const sample = samples[index];
    const nextPhase = getInputPhase(sample);
    const point = projection.project(sample.position);

    if (nextPhase !== phase) {
      points.push(point);
      segments.push({
        phase,
        path: points
          .map(
            (pathPoint, pathIndex) =>
              `${pathIndex === 0 ? "M" : "L"} ${pathPoint.x.toFixed(1)} ${pathPoint.y.toFixed(1)}`,
          )
          .join(" "),
      });
      phase = nextPhase;
      points = [point];
    } else {
      points.push(point);
    }
  }

  if (points.length > 1) {
    segments.push({
      phase,
      path: points
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
        )
        .join(" "),
    });
  }

  return segments;
}

function findSampleAtElapsed<T extends { elapsedMs: number }>(
  samples: T[],
  elapsedMs: number,
): T | undefined {
  if (samples.length === 0) return undefined;
  let lower = 0;
  let upper = samples.length - 1;

  while (lower < upper) {
    const middle = Math.ceil((lower + upper) / 2);
    if (samples[middle].elapsedMs <= elapsedMs) lower = middle;
    else upper = middle - 1;
  }

  return samples[lower];
}

function findSampleAtDistance<T extends { distanceM: number }>(
  samples: T[],
  distanceM: number,
): T | undefined {
  if (samples.length === 0) return undefined;
  let lower = 0;
  let upper = samples.length - 1;

  while (lower < upper) {
    const middle = Math.floor((lower + upper) / 2);
    if (samples[middle].distanceM < distanceM) lower = middle + 1;
    else upper = middle;
  }

  const current = samples[lower];
  const previous = samples[Math.max(0, lower - 1)];
  return Math.abs(previous.distanceM - distanceM) <=
    Math.abs(current.distanceM - distanceM)
    ? previous
    : current;
}

function findCornerAtDistance(
  corners: SimCoachCornerAnalysis[] | undefined,
  distanceM: number,
): SimCoachCornerAnalysis | undefined {
  return corners?.find(
    (corner) =>
      distanceM >= corner.startDistanceM && distanceM <= corner.endDistanceM,
  );
}

function getCornerPhase(
  corner: SimCoachCornerAnalysis | undefined,
  distanceM: number,
): string | undefined {
  if (!corner) return undefined;
  if (distanceM < corner.apexDistanceM - 15) return "APPROACH";
  if (distanceM <= corner.apexDistanceM + 15) return "APEX";
  return "EXIT";
}

function buildTrackEvents(
  projection: Projection | undefined,
  corner: SimCoachCornerAnalysis | undefined,
  targetLine: PositionedSample[],
): TrackEvent[] {
  if (!projection || !corner) return [];

  const eventDefinitions = [
    {
      color: INPUT_COLORS.braking,
      distanceM: corner.target.brakeStartDistanceM,
      label: "B",
      name: "Player braking starts",
    },
    {
      color: "#ffffff",
      distanceM: corner.apexDistanceM,
      label: "A",
      name: "Corner apex",
    },
    {
      color: INPUT_COLORS.throttle,
      distanceM: corner.target.throttleStartDistanceM,
      label: "T",
      name: "Player throttle starts",
    },
  ];

  return eventDefinitions.flatMap((event) => {
    if (event.distanceM == null) return [];
    const sample = findSampleAtDistance(targetLine, event.distanceM);
    if (!sample) return [];
    return [
      {
        color: event.color,
        label: event.label,
        name: event.name,
        point: projection.project(sample.position),
      },
    ];
  });
}

function getMarkerRotation(
  samples: PositionedSample[],
  current: PositionedSample,
  projection: Projection,
): number {
  const index = samples.indexOf(current);
  const neighbor = samples[Math.min(samples.length - 1, index + 1)] ?? current;
  const previous = samples[Math.max(0, index - 1)] ?? current;
  const start = projection.project(previous.position);
  const end = projection.project(neighbor.position);
  return (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
}

function formatReplayTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const milliseconds = Math.round(ms % 1_000);
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function CarMarker({
  color,
  label,
  point,
  rotation,
}: {
  color: string;
  label: string;
  point: ProjectedPoint;
  rotation: number;
}) {
  return (
    <g transform={`translate(${point.x} ${point.y}) rotate(${rotation})`}>
      <circle r="15" fill={alpha(color, 0.18)} />
      <path
        d="M 12 0 L -8 -7 L -4 0 L -8 7 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="2.5"
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
      <title>{label}</title>
    </g>
  );
}

function TrackEventMarker({ event }: { event: TrackEvent }) {
  const offset =
    event.label === "B"
      ? { x: -25, y: -27 }
      : event.label === "T"
        ? { x: 25, y: -27 }
        : { x: 0, y: 30 };

  return (
    <g transform={`translate(${event.point.x} ${event.point.y})`}>
      <circle r="4" fill={event.color} stroke="#fff" strokeWidth="1.5" />
      <line
        x1="0"
        y1="0"
        x2={offset.x}
        y2={offset.y}
        stroke={event.color}
        strokeWidth="2"
      />
      <circle
        cx={offset.x}
        cy={offset.y}
        r="13"
        fill="rgba(8,10,18,.9)"
        stroke={event.color}
        strokeWidth="3"
      />
      <text
        x={offset.x}
        y={offset.y + 4}
        fill="#fff"
        fontSize="10"
        fontWeight="900"
        textAnchor="middle"
      >
        {event.label}
      </text>
      <title>{event.name}</title>
    </g>
  );
}

export default function RacingLineReplay({
  analysis,
}: {
  analysis: SimCoachAnalysis;
}) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [synchronized, setSynchronized] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(2);
  const targetSamples = analysis.racingLines?.target ?? EMPTY_RACING_LINE;
  const referenceSamples =
    analysis.racingLines?.reference ?? EMPTY_RACING_LINE;
  const targetLine = useMemo(
    () => targetSamples.filter(hasPosition),
    [targetSamples],
  );
  const referenceLine = useMemo(
    () => referenceSamples.filter(hasPosition),
    [referenceSamples],
  );
  const positionedSamples = useMemo(
    () => [...targetLine, ...referenceLine],
    [targetLine, referenceLine],
  );
  const projection = useMemo(
    () =>
      positionedSamples.length > 0
        ? createProjection(positionedSamples)
        : undefined,
    [positionedSamples],
  );
  const referencePath = useMemo(
    () => (projection ? buildPath(referenceLine, projection) : ""),
    [projection, referenceLine],
  );
  const targetInputSegments = useMemo(
    () => (projection ? buildInputSegments(targetLine, projection) : []),
    [projection, targetLine],
  );
  const targetDuration = analysis.targetLap.lapTimeMs;
  const referenceDuration = analysis.referenceLap.lapTimeMs;
  const sharedDuration = Math.max(targetDuration, referenceDuration);
  const speed = SPEEDS[speedIndex];

  useEffect(() => {
    if (!playing || sharedDuration <= 0) return undefined;

    const interval = window.setInterval(() => {
      setProgress((current) =>
        (current + (PLAYBACK_TICK_MS * speed) / sharedDuration) % 1,
      );
    }, PLAYBACK_TICK_MS);

    return () => window.clearInterval(interval);
  }, [playing, sharedDuration, speed]);

  const targetElapsed = synchronized
    ? progress * targetDuration
    : Math.min(progress * sharedDuration, targetDuration);
  const referenceElapsed = synchronized
    ? progress * referenceDuration
    : Math.min(progress * sharedDuration, referenceDuration);
  const currentTarget = findSampleAtElapsed(targetSamples, targetElapsed);
  const currentReference = findSampleAtElapsed(
    referenceSamples,
    referenceElapsed,
  );
  const targetMarker = currentTarget?.position
    ? findSampleAtElapsed(targetLine, currentTarget.elapsedMs)
    : undefined;
  const referenceMarker = currentReference?.position
    ? findSampleAtElapsed(referenceLine, currentReference.elapsedMs)
    : undefined;
  const currentCorner = findCornerAtDistance(
    analysis.corners,
    currentTarget?.distanceM ?? 0,
  );
  const currentAlignedPoint = findSampleAtDistance(
    analysis.alignedPoints,
    currentTarget?.distanceM ?? 0,
  );
  const currentInputPhase = currentTarget
    ? getInputPhase(currentTarget)
    : "coasting";
  const trackEvents = buildTrackEvents(projection, currentCorner, targetLine);
  const cornerPhase = getCornerPhase(
    currentCorner,
    currentTarget?.distanceM ?? 0,
  );

  const nudgeReplay = (deltaMs: number) => {
    if (sharedDuration <= 0) return;
    setPlaying(false);
    setProgress((current) =>
      Math.max(0, Math.min(1, current + deltaMs / sharedDuration)),
    );
  };

  const targetLabel = `Lap ${analysis.targetLap.lapNumber}`;
  const referenceLabel = analysis.referenceLap.driverName ?? "Reference";

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography variant="overline" color="primary.light">
                Detailed comparison
              </Typography>
              <Typography variant="h5">Racing-line replay</Typography>
              <Typography color="text.secondary">
                Follow both cars through the lap with synchronized controls and
                inputs.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={targetLabel}
                sx={{ color: TARGET_COLOR, borderColor: TARGET_COLOR }}
                variant="outlined"
              />
              <Chip
                size="small"
                label={referenceLabel}
                sx={{ color: REFERENCE_COLOR, borderColor: REFERENCE_COLOR }}
                variant="outlined"
              />
            </Stack>
          </Stack>

          {!analysis.racingLines ? (
            <Alert severity="warning">
              Racing-line data is unavailable from the running API. Restart the
              OSL API once, then reload this page.
            </Alert>
          ) : null}

          {analysis.racingLines && targetLine.length === 0 ? (
            <Alert severity="info">
              This lap predates motion capture. Its telemetry still plays below;
              complete a new lap to add the player car and actual racing line.
            </Alert>
          ) : null}

          <Box
            sx={{
              position: "relative",
              minHeight: 560,
              overflow: "hidden",
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${getOslAppShell(theme).borderStrong}`,
              background: (theme) =>
                `radial-gradient(circle at 50% 45%, ${alpha(theme.palette.info.main, 0.08)}, transparent 48%), linear-gradient(145deg, #090c14 0%, ${getOslAppShell(theme).surfaceStrong} 100%)`,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.16,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />
            <Box
              component="svg"
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              aria-label="Animated comparison of target and reference racing lines"
              sx={{
                position: "absolute",
                top: { xs: 42, md: 0 },
                bottom: { xs: 210, md: 0 },
                left: { xs: 0, md: 245 },
                right: { xs: 0, md: 245 },
                width: "auto",
                height: "auto",
              }}
            >
              {referencePath ? (
                <>
                  <path
                    d={referencePath}
                    fill="none"
                    stroke="rgba(245,247,252,.72)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="42"
                    style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,.6))" }}
                  />
                  <path
                    d={referencePath}
                    fill="none"
                    stroke="#242b37"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="34"
                  />
                </>
              ) : null}
              {targetInputSegments.map((segment, index) => (
                <path
                  key={`${segment.phase}-${index}`}
                  d={segment.path}
                  fill="none"
                  stroke={INPUT_COLORS[segment.phase]}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="9"
                  opacity="0.96"
                />
              ))}
              {projection && referenceMarker ? (
                <CarMarker
                  color={REFERENCE_COLOR}
                  label={referenceLabel}
                  point={projection.project(referenceMarker.position)}
                  rotation={getMarkerRotation(
                    referenceLine,
                    referenceMarker,
                    projection,
                  )}
                />
              ) : null}
              {projection && targetMarker ? (
                <CarMarker
                  color={TARGET_COLOR}
                  label={targetLabel}
                  point={projection.project(targetMarker.position)}
                  rotation={getMarkerRotation(
                    targetLine,
                    targetMarker,
                    projection,
                  )}
                />
              ) : null}
              {trackEvents.map((event) => (
                <TrackEventMarker key={event.name} event={event} />
              ))}
            </Box>
            <RacingLineDriverInputs
              currentReference={currentReference}
              currentTarget={currentTarget}
              referenceLabel={referenceLabel}
              targetLabel={targetLabel}
            />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ position: "absolute", top: 14, left: 14 }}
            >
              <Chip
                size="small"
                label={synchronized ? "Progress synced" : "Clock synced"}
                icon={<SyncRoundedIcon />}
                sx={{ backdropFilter: "blur(10px)", bgcolor: "rgba(8,10,18,.78)" }}
              />
              <Chip
                size="small"
                label={
                  currentInputPhase === "braking"
                    ? `BRAKE ${Math.round((currentTarget?.brake ?? 0) * 100)}%`
                    : currentInputPhase === "throttle"
                      ? `THROTTLE ${Math.round((currentTarget?.throttle ?? 0) * 100)}%`
                      : "COASTING"
                }
                sx={{
                  color: INPUT_COLORS[currentInputPhase],
                  borderColor: INPUT_COLORS[currentInputPhase],
                  bgcolor: "rgba(8,10,18,.78)",
                  backdropFilter: "blur(10px)",
                  fontWeight: 900,
                }}
                variant="outlined"
              />
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                zIndex: 3,
                top: 14,
                left: "50%",
                transform: "translateX(-50%)",
                display: { xs: "none", md: "flex" },
              }}
            >
              {currentCorner ? (
                <Chip
                  label={`TURN ${currentCorner.turnNumber}${cornerPhase ? ` · ${cornerPhase}` : ""}`}
                  color="primary"
                  size="small"
                />
              ) : null}
              <Chip
                label={`${Math.round(currentTarget?.distanceM ?? 0)} m`}
                size="small"
                sx={{ bgcolor: "rgba(8,10,18,.82)" }}
                variant="outlined"
              />
              {currentAlignedPoint ? (
                <Chip
                  label={`${currentAlignedPoint.deltaMs >= 0 ? "+" : "−"}${Math.abs(currentAlignedPoint.deltaMs / 1_000).toFixed(3)} s`}
                  color={currentAlignedPoint.deltaMs > 0 ? "error" : "success"}
                  size="small"
                  sx={{ bgcolor: "rgba(8,10,18,.82)" }}
                  variant="outlined"
                />
              ) : null}
            </Stack>
            <Stack
              direction="row"
              spacing={1.25}
              useFlexGap
              flexWrap="wrap"
              sx={{
                position: "absolute",
                zIndex: 3,
                left: "50%",
                transform: "translateX(-50%)",
                bottom: { xs: 205, md: 12 },
                px: 1.25,
                py: 0.75,
                borderRadius: 1,
                bgcolor: "rgba(8,10,18,.78)",
                backdropFilter: "blur(10px)",
              }}
            >
              {Object.entries(INPUT_COLORS).map(([label, color]) => (
                <Stack key={label} direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color }} />
                  <Typography variant="caption" sx={{ textTransform: "capitalize" }}>
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
          >
            <Tooltip title={playing ? "Pause replay" : "Play replay"}>
              <IconButton
                aria-label={playing ? "Pause replay" : "Play replay"}
                color="primary"
                onClick={() => setPlaying((current) => !current)}
              >
                {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Restart replay">
              <IconButton
                aria-label="Restart replay"
                onClick={() => setProgress(0)}
              >
                <ReplayRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Step back 100 ms">
              <IconButton
                aria-label="Step replay back 100 milliseconds"
                size="small"
                onClick={() => nudgeReplay(-100)}
              >
                <SkipPreviousRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Step forward 100 ms">
              <IconButton
                aria-label="Step replay forward 100 milliseconds"
                size="small"
                onClick={() => nudgeReplay(100)}
              >
                <SkipNextRoundedIcon />
              </IconButton>
            </Tooltip>
            <Typography
              variant="body2"
              sx={{ minWidth: 82, fontVariantNumeric: "tabular-nums" }}
            >
              {formatReplayTime(progress * sharedDuration)}
            </Typography>
            <Slider
              aria-label="Replay position"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={(_, value) => {
                setPlaying(false);
                setProgress(value as number);
              }}
              sx={{ flex: "1 1 220px", minWidth: 140 }}
            />
            <Button
              size="small"
              variant={synchronized ? "contained" : "outlined"}
              startIcon={<SyncRoundedIcon />}
              onClick={() => setSynchronized((current) => !current)}
            >
              {synchronized ? "Progress" : "Clock"}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setSpeedIndex((current) => (current + 1) % SPEEDS.length)
              }
              sx={{ minWidth: 62 }}
            >
              x{speed}
            </Button>
          </Stack>

          <RacingLineReplayDetails
            currentReference={currentReference}
            currentTarget={currentTarget}
            referenceElapsedMs={referenceElapsed}
            referenceSamples={referenceSamples}
            targetElapsedMs={targetElapsed}
            targetSamples={targetSamples}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
