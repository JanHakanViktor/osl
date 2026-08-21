import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FlagIcon from "@mui/icons-material/Flag";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { Box, Button, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import { formatLapTime } from "../telemetryFormatters";
import CircuitPositionMap from "./CircuitPositionMap";

type SessionTargetPanelProps = {
  currentLapMs?: number | null;
  fastestLapMs?: number | null;
  fastestLapDeltaLabel?: string | null;
  remainingLabel: string;
  remainingValue: string;
  showTarget: boolean;
  circuitName: string;
  circuitImage?: string | null;
  lapProgress?: number | null;
  finishDisabled: boolean;
  finishing: boolean;
  onFinishSession: () => void;
};

export default function SessionTargetPanel({
  currentLapMs,
  fastestLapMs,
  fastestLapDeltaLabel,
  remainingLabel,
  remainingValue,
  showTarget,
  circuitName,
  circuitImage,
  lapProgress,
  finishDisabled,
  finishing,
  onFinishSession,
}: SessionTargetPanelProps) {
  return (
    <Stack spacing={2} sx={{ height: "100%" }}>
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 2,
          backgroundColor: (theme) =>
            alpha(getOslAppShell(theme).surfaceRaised, 0.88),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" mb={2}>
          <EmojiEventsIcon
            sx={{ color: (theme) => getOslAppShell(theme).warningAccent }}
          />
          <Typography
            sx={{
              fontSize: { xs: "1.5rem", md: "2.1rem" },
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            Current Lap
          </Typography>
        </Stack>
        <Box
          sx={{
            display: "inline-flex",
            px: 2,
            py: 1.25,
            borderRadius: 1,
            backgroundColor: (theme) => alpha(theme.palette.common.white, 0.06),
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: { xs: "2.1rem", md: "3rem" },
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {formatLapTime(currentLapMs)}
          </Typography>
        </Box>
      </Box>

      {showTarget && (
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            flex: 1,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: (theme) =>
              alpha(getOslAppShell(theme).surfaceRaised, 0.88),
            border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <FlagIcon sx={{ color: (theme) => getOslAppShell(theme).accent }} />
            <Typography
              sx={{
                fontSize: { xs: "1.4rem", md: "2rem" },
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              {remainingLabel}
            </Typography>
          </Stack>

          <Typography
            sx={{
              alignSelf: "flex-end",
              px: 2,
              py: 1,
              minWidth: 90,
              textAlign: "center",
              borderRadius: 1,
              border: (theme) =>
                `1px solid ${getOslAppShell(theme).borderStrong}`,
              fontFamily: "'Roboto Mono', monospace",
              fontSize: { xs: "3rem", md: "4.4rem" },
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {remainingValue}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.76rem",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              Fastest lap
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="baseline"
              justifyContent="flex-end"
            >
              <Typography
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: { xs: "1.7rem", md: "2.25rem" },
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {formatLapTime(fastestLapMs)}
              </Typography>
              {fastestLapDeltaLabel && (
                <Typography
                  sx={{
                    color: (theme) => getOslAppShell(theme).accent,
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: "0.9rem",
                    fontWeight: 900,
                  }}
                >
                  {fastestLapDeltaLabel}
                </Typography>
              )}
            </Stack>
          </Box>

          <CircuitPositionMap
            circuitName={circuitName}
            circuitImage={circuitImage}
            lapProgress={lapProgress}
          />
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={<StopCircleIcon />}
        disabled={finishDisabled || finishing}
        onClick={onFinishSession}
        sx={{
          minHeight: 54,
          fontWeight: 900,
          boxShadow: (theme) => getOslAppShell(theme).accentGlow,
        }}
      >
        {finishing ? "Ending Session" : "Exit Session"}
      </Button>
    </Stack>
  );
}
