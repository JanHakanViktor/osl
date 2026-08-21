import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SimCoachRacingLineSample } from "../../types/sim-coach.types";
import { getOslAppShell } from "../../theme";

const TARGET_COLOR = "#ff3048";
const REFERENCE_COLOR = "#6dc8ff";
const BRAKE_COLOR = "#ff5364";
const THROTTLE_COLOR = "#55d98b";
const STEERING_COLOR = "#a887ff";
const TRACE_WINDOW_MS = 6_000;

type TelemetryChannel = {
  label: string;
  color: string;
  minimum: number;
  maximum: number;
  read: (sample: SimCoachRacingLineSample) => number;
  format: (value: number) => string;
};

const CHANNELS: TelemetryChannel[] = [
  {
    label: "Brake",
    color: BRAKE_COLOR,
    minimum: 0,
    maximum: 1,
    read: (sample) => sample.brake,
    format: (value) => `${Math.round(value * 100)}%`,
  },
  {
    label: "Throttle",
    color: THROTTLE_COLOR,
    minimum: 0,
    maximum: 1,
    read: (sample) => sample.throttle,
    format: (value) => `${Math.round(value * 100)}%`,
  },
  {
    label: "Steering",
    color: STEERING_COLOR,
    minimum: -1,
    maximum: 1,
    read: (sample) => sample.steer,
    format: (value) => {
      if (Math.abs(value) < 0.02) return "CENTRE";
      return `${Math.round(Math.abs(value) * 100)}% ${value < 0 ? "L" : "R"}`;
    },
  },
];

function formatReplayTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const milliseconds = Math.round(ms % 1_000);
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function buildTracePath(
  samples: SimCoachRacingLineSample[],
  elapsedMs: number,
  channel: TelemetryChannel,
): string {
  const halfWindow = TRACE_WINDOW_MS / 2;
  const windowStart = elapsedMs - halfWindow;
  const windowEnd = elapsedMs + halfWindow;
  const visibleSamples = samples.filter(
    (sample) =>
      sample.elapsedMs >= windowStart && sample.elapsedMs <= windowEnd,
  );

  if (visibleSamples.length < 2) return "";

  return visibleSamples
    .map((sample, index) => {
      const x = ((sample.elapsedMs - windowStart) / TRACE_WINDOW_MS) * 1000;
      const normalized =
        (channel.read(sample) - channel.minimum) /
        (channel.maximum - channel.minimum);
      const y = 54 - Math.max(0, Math.min(1, normalized)) * 44;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function InputBar({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}
        >
          {percent}%
        </Typography>
      </Stack>
      <Box
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,.09)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: "inherit",
            bgcolor: color,
            boxShadow: percent > 3 ? `0 0 12px ${alpha(color, 0.65)}` : "none",
            transition: "width 40ms linear",
          }}
        />
      </Box>
    </Box>
  );
}

function SteeringGauge({ value }: { value: number }) {
  const clamped = Math.max(-1, Math.min(1, value));
  const position = (clamped + 1) * 50;
  const direction =
    Math.abs(clamped) < 0.02
      ? "CENTRE"
      : `${Math.round(Math.abs(clamped) * 100)}% ${clamped < 0 ? "LEFT" : "RIGHT"}`;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color="text.secondary">
          Steering
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: STEERING_COLOR, fontWeight: 900 }}
        >
          {direction}
        </Typography>
      </Stack>
      <Box
        sx={{
          position: "relative",
          height: 8,
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,.09)",
          "&::after": {
            content: '""',
            position: "absolute",
            left: "50%",
            top: -3,
            bottom: -3,
            width: "1px",
            bgcolor: "rgba(255,255,255,.5)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: `${position}%`,
            top: "50%",
            width: 14,
            height: 14,
            borderRadius: "50%",
            bgcolor: STEERING_COLOR,
            border: "2px solid #fff",
            boxShadow: `0 0 12px ${STEERING_COLOR}`,
            transform: "translate(-50%, -50%)",
            transition: "left 40ms linear",
          }}
        />
      </Box>
      <Stack direction="row" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.disabled">
          L
        </Typography>
        <Typography variant="caption" color="text.disabled">
          R
        </Typography>
      </Stack>
    </Box>
  );
}

function DriverInputCard({
  color,
  label,
  sample,
}: {
  color: string;
  label: string;
  sample?: SimCoachRacingLineSample;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: { xs: 1, sm: 1.5 },
        borderRadius: 1.5,
        border: (theme) =>
          `1px solid ${getOslAppShell(theme).borderStrong}`,
        borderTop: `3px solid ${color}`,
        bgcolor: "rgba(5,8,15,.88)",
        boxShadow: "0 16px 40px rgba(0,0,0,.32)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="start">
        <Box>
          <Typography variant="overline" sx={{ color, fontWeight: 900 }}>
            {label}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {formatReplayTime(sample?.elapsedMs ?? 0)} · {Math.round(sample?.distanceM ?? 0)} m
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="baseline">
          <Box textAlign="right">
            <Typography variant="h5" sx={{ lineHeight: 1 }}>
              {Math.round(sample?.speedKmh ?? 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              KM/H
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ lineHeight: 1, color }}>
              {sample?.gear ?? "-"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              GEAR
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={0.9} mt={1.25}>
        <InputBar color={BRAKE_COLOR} label="Brake" value={sample?.brake ?? 0} />
        <InputBar
          color={THROTTLE_COLOR}
          label="Throttle"
          value={sample?.throttle ?? 0}
        />
        <SteeringGauge value={sample?.steer ?? 0} />
      </Stack>

      <Stack direction="row" justifyContent="space-between" mt={0.75}>
        <Typography variant="caption" color="text.secondary">
          Engine
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(sample?.engineRpm ?? 0).toLocaleString()} RPM
        </Typography>
      </Stack>
    </Box>
  );
}

function TraceRow({
  channel,
  targetSamples,
  referenceSamples,
  targetElapsedMs,
  referenceElapsedMs,
  currentTarget,
  currentReference,
}: {
  channel: TelemetryChannel;
  targetSamples: SimCoachRacingLineSample[];
  referenceSamples: SimCoachRacingLineSample[];
  targetElapsedMs: number;
  referenceElapsedMs: number;
  currentTarget?: SimCoachRacingLineSample;
  currentReference?: SimCoachRacingLineSample;
}) {
  const targetPath = buildTracePath(targetSamples, targetElapsedMs, channel);
  const referencePath = buildTracePath(
    referenceSamples,
    referenceElapsedMs,
    channel,
  );
  const targetValue = currentTarget ? channel.read(currentTarget) : 0;
  const referenceValue = currentReference ? channel.read(currentReference) : 0;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "72px minmax(0, 1fr)", sm: "105px minmax(0, 1fr)" },
        gap: 1.5,
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="caption" sx={{ color: channel.color, fontWeight: 900 }}>
          {channel.label}
        </Typography>
        <Typography variant="caption" display="block">
          {channel.format(targetValue)}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          Ref {channel.format(referenceValue)}
        </Typography>
      </Box>
      <Box
        component="svg"
        viewBox="0 0 1000 64"
        preserveAspectRatio="none"
        aria-label={`${channel.label} trace, three seconds before and after the playhead`}
        sx={{ width: "100%", height: 64, overflow: "visible" }}
      >
        <line x1="0" y1="54" x2="1000" y2="54" stroke="rgba(255,255,255,.12)" />
        {channel.minimum < 0 ? (
          <line x1="0" y1="32" x2="1000" y2="32" stroke="rgba(255,255,255,.08)" />
        ) : null}
        <line x1="500" y1="4" x2="500" y2="60" stroke="rgba(255,255,255,.65)" strokeWidth="2" />
        {referencePath ? (
          <path
            d={referencePath}
            fill="none"
            stroke={REFERENCE_COLOR}
            strokeDasharray="11 8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {targetPath ? (
          <path
            d={targetPath}
            fill="none"
            stroke={channel.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        <circle cx="500" cy="4" r="4" fill="#fff" />
      </Box>
    </Box>
  );
}

export function RacingLineDriverInputs({
  currentReference,
  currentTarget,
  referenceLabel,
  targetLabel,
}: {
  currentReference?: SimCoachRacingLineSample;
  currentTarget?: SimCoachRacingLineSample;
  referenceLabel: string;
  targetLabel: string;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        zIndex: 3,
        pointerEvents: "none",
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "230px 230px" },
        gap: 1.5,
        left: { xs: 8, md: 14 },
        right: { xs: 8, md: 14 },
        bottom: { xs: 8, md: "auto" },
        top: { xs: "auto", md: 76 },
        justifyContent: { md: "space-between" },
      }}
    >
        <DriverInputCard
          color={TARGET_COLOR}
          label={targetLabel}
          sample={currentTarget}
        />
        <DriverInputCard
          color={REFERENCE_COLOR}
          label={referenceLabel}
          sample={currentReference}
        />
    </Box>
  );
}

export default function RacingLineReplayDetails({
  currentReference,
  currentTarget,
  referenceElapsedMs,
  referenceSamples,
  targetElapsedMs,
  targetSamples,
}: {
  currentReference?: SimCoachRacingLineSample;
  currentTarget?: SimCoachRacingLineSample;
  referenceElapsedMs: number;
  referenceSamples: SimCoachRacingLineSample[];
  targetElapsedMs: number;
  targetSamples: SimCoachRacingLineSample[];
}) {
  return (
      <Box
        sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: 1.5,
          border: (theme) => `1px solid ${getOslAppShell(theme).borderStrong}`,
          bgcolor: "rgba(5,8,15,.38)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1}
          mb={1.5}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={900}>
              Six-second input window
            </Typography>
            <Typography variant="caption" color="text.secondary">
              The centre line is now. Solid is your lap; dashed blue is the reference.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              −3 s
            </Typography>
            <Typography variant="caption" fontWeight={900}>
              NOW
            </Typography>
            <Typography variant="caption" color="text.secondary">
              +3 s
            </Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.75}>
          {CHANNELS.map((channel) => (
            <TraceRow
              key={channel.label}
              channel={channel}
              targetSamples={targetSamples}
              referenceSamples={referenceSamples}
              targetElapsedMs={targetElapsedMs}
              referenceElapsedMs={referenceElapsedMs}
              currentTarget={currentTarget}
              currentReference={currentReference}
            />
          ))}
        </Stack>
      </Box>
  );
}
