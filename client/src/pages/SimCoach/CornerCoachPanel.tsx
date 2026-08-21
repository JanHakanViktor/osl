import { useState } from "react";
import {
  Alert,
  Box,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SportsScoreRoundedIcon from "@mui/icons-material/SportsScoreRounded";
import type {
  SimCoachAnalysis,
  SimCoachCornerAnalysis,
  SimCoachCornerMetrics,
} from "../../types/sim-coach.types";
import { getOslAppShell } from "../../theme";

const TARGET_COLOR = "#ff3048";
const REFERENCE_COLOR = "#6dc8ff";
const BRAKE_COLOR = "#ff4055";
const COAST_COLOR = "#ffb000";
const THROTTLE_COLOR = "#20d46b";

function formatSeconds(ms: number | null): string {
  return ms == null ? "—" : `${(ms / 1_000).toFixed(2)}s`;
}

function formatDelta(ms: number): string {
  const sign = ms > 0 ? "+" : "";
  return `${sign}${(ms / 1_000).toFixed(3)}s`;
}

function positionPercent(
  distanceM: number | null,
  corner: SimCoachCornerAnalysis,
): number | null {
  if (distanceM == null) return null;
  const length = Math.max(1, corner.endDistanceM - corner.startDistanceM);
  return Math.min(
    100,
    Math.max(0, ((distanceM - corner.startDistanceM) / length) * 100),
  );
}

function Zone({
  color,
  end,
  start,
}: {
  color: string;
  end: number | null;
  start: number | null;
}) {
  if (start == null || end == null || end <= start) return null;
  return (
    <Box
      sx={{
        position: "absolute",
        left: `${start}%`,
        top: 0,
        bottom: 0,
        width: `${end - start}%`,
        bgcolor: color,
        boxShadow: `0 0 12px ${alpha(color, 0.42)}`,
      }}
    />
  );
}

function InputLane({
  color,
  corner,
  label,
  metrics,
}: {
  color: string;
  corner: SimCoachCornerAnalysis;
  label: string;
  metrics: SimCoachCornerMetrics;
}) {
  const brakeStart = positionPercent(metrics.brakeStartDistanceM, corner);
  const brakeEnd = positionPercent(metrics.brakeReleaseEndDistanceM, corner);
  const throttleStart = positionPercent(
    metrics.throttleStartDistanceM,
    corner,
  );
  const fullThrottle = positionPercent(metrics.fullThrottleDistanceM, corner);

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Typography
        variant="caption"
        sx={{ width: 72, color, fontWeight: 900, textTransform: "uppercase" }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          position: "relative",
          flex: 1,
          height: 13,
          overflow: "hidden",
          borderRadius: 10,
          bgcolor: "rgba(255,255,255,0.08)",
          outline: `1px solid ${alpha(color, 0.25)}`,
        }}
      >
        <Zone color={BRAKE_COLOR} start={brakeStart} end={brakeEnd} />
        <Zone color={COAST_COLOR} start={brakeEnd} end={throttleStart} />
        <Zone color={alpha(THROTTLE_COLOR, 0.55)} start={throttleStart} end={fullThrottle} />
        <Zone color={THROTTLE_COLOR} start={fullThrottle} end={100} />
      </Box>
    </Stack>
  );
}

function CornerSequence({ corner }: { corner: SimCoachCornerAnalysis }) {
  const apex = positionPercent(corner.apexDistanceM, corner) ?? 50;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Approach
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Corner exit
        </Typography>
      </Stack>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: -8,
            bottom: -8,
            left: `${apex}%`,
            width: 2,
            bgcolor: "rgba(255,255,255,0.82)",
            zIndex: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              left: "50%",
              bottom: "100%",
              transform: "translate(-50%, -5px)",
              fontWeight: 900,
            }}
          >
            APEX
          </Typography>
        </Box>
        <Stack spacing={2}>
          <InputLane
            color={TARGET_COLOR}
            corner={corner}
            label="Your lap"
            metrics={corner.target}
          />
          <InputLane
            color={REFERENCE_COLOR}
            corner={corner}
            label="Reference"
            metrics={corner.reference}
          />
        </Stack>
      </Box>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        sx={{ mt: 2 }}
      >
        {[
          [BRAKE_COLOR, "Brake"],
          [COAST_COLOR, "Coast"],
          [THROTTLE_COLOR, "Throttle"],
        ].map(([color, label]) => (
          <Stack key={label} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function Metric({
  comparison,
  label,
  value,
}: {
  comparison: string;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        minWidth: 0,
        borderRadius: 1,
        bgcolor: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", fontWeight: 800 }}
      >
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        Ref {comparison}
      </Typography>
    </Box>
  );
}

function CornerMetrics({ corner }: { corner: SimCoachCornerAnalysis }) {
  const target = corner.target;
  const reference = corner.reference;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
        gap: 1,
      }}
    >
      <Metric
        label="Peak brake"
        value={`${target.maximumBrakePercent}%`}
        comparison={`${reference.maximumBrakePercent}%`}
      />
      <Metric
        label="Brake release"
        value={`${target.brakeReleaseSmoothness}/100`}
        comparison={`${reference.brakeReleaseSmoothness}/100`}
      />
      <Metric
        label="Coasting"
        value={formatSeconds(target.coastingTimeMs)}
        comparison={formatSeconds(reference.coastingTimeMs)}
      />
      <Metric
        label="Minimum speed"
        value={`${Math.round(target.minimumSpeedKmh)} km/h`}
        comparison={`${Math.round(reference.minimumSpeedKmh)} km/h`}
      />
      <Metric
        label="To full throttle"
        value={formatSeconds(target.timeToFullThrottleMs)}
        comparison={formatSeconds(reference.timeToFullThrottleMs)}
      />
      <Metric
        label="Corrections"
        value={String(target.steeringCorrections)}
        comparison={String(reference.steeringCorrections)}
      />
    </Box>
  );
}

export default function CornerCoachPanel({
  analysis,
}: {
  analysis: SimCoachAnalysis;
}) {
  const instructions = analysis.recommendations.slice(0, 3);
  const [selectedTurn, setSelectedTurn] = useState(
    instructions[0]?.turnNumber ?? 1,
  );
  const selectedInstruction =
    instructions.find((item) => item.turnNumber === selectedTurn) ??
    instructions[0];
  const selectedCorner = analysis.corners?.find(
    (corner) => corner.turnNumber === selectedInstruction?.turnNumber,
  );

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap={1}
      >
        <Box>
          <Typography variant="overline" color="primary.light">
            Your next lap
          </Typography>
          <Typography variant="h4">Three things to work on</Typography>
          <Typography color="text.secondary">
            The highest-impact corner changes, ranked and demonstrated.
          </Typography>
        </Box>
        <Chip
          icon={<SportsScoreRoundedIcon />}
          label={`${analysis.corners?.length ?? 0} corners measured`}
          variant="outlined"
        />
      </Stack>

      {instructions.length === 0 ? (
        <Alert severity="success">
          No meaningful corner-level loss was found against this reference.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(290px, 0.8fr) minmax(0, 1.5fr)" },
            gap: 2,
          }}
        >
          <Stack spacing={1.25}>
            {instructions.map((instruction) => {
              const selected = instruction.turnNumber === selectedInstruction?.turnNumber;
              return (
                <ButtonBase
                  key={`${instruction.turnNumber}-${instruction.rank}`}
                  onClick={() => setSelectedTurn(instruction.turnNumber)}
                  aria-pressed={selected}
                  sx={{
                    display: "block",
                    width: "100%",
                    borderRadius: 1.5,
                    textAlign: "left",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      width: "100%",
                      borderRadius: 1.5,
                      border: (theme) =>
                        `1px solid ${selected ? alpha(theme.palette.primary.main, 0.68) : getOslAppShell(theme).border}`,
                      bgcolor: (theme) =>
                        selected
                          ? alpha(theme.palette.primary.main, 0.1)
                          : getOslAppShell(theme).surfaceRaised,
                      boxShadow: selected
                        ? `0 0 24px ${alpha(TARGET_COLOR, 0.12)}`
                        : "none",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          width: 42,
                          height: 42,
                          flex: "0 0 auto",
                          borderRadius: "50%",
                          bgcolor: selected ? TARGET_COLOR : "rgba(255,255,255,0.08)",
                          fontWeight: 900,
                        }}
                      >
                        T{instruction.turnNumber}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          gap={1}
                        >
                          <Typography variant="subtitle2" color="text.secondary">
                            #{instruction.rank} priority
                          </Typography>
                          <Typography
                            variant="caption"
                            color="warning.main"
                            sx={{ fontWeight: 900 }}
                          >
                            {formatDelta(instruction.timeLossMs)}
                          </Typography>
                        </Stack>
                        <Typography sx={{ mt: 0.5, fontWeight: 800 }}>
                          {instruction.action}
                        </Typography>
                      </Box>
                      <ChevronRightRoundedIcon
                        color={selected ? "primary" : "disabled"}
                      />
                    </Stack>
                  </Box>
                </ButtonBase>
              );
            })}
          </Stack>

          <Card>
            <CardContent sx={{ height: "100%" }}>
              {selectedCorner && selectedInstruction ? (
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Box>
                      <Typography variant="overline" color="primary.light">
                        Turn {selectedCorner.turnNumber} demonstration
                      </Typography>
                      <Typography variant="h5">
                        {selectedInstruction.title}
                      </Typography>
                    </Box>
                    <Chip
                      color={
                        selectedCorner.timeDeltaMs > 0 ? "warning" : "success"
                      }
                      label={`${formatDelta(selectedCorner.timeDeltaMs)} through corner`}
                    />
                  </Stack>
                  <CornerSequence corner={selectedCorner} />
                  <CornerMetrics corner={selectedCorner} />
                </Stack>
              ) : (
                <Alert severity="info">
                  Restart the API to load the corner-by-corner visual analysis.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Stack>
  );
}
