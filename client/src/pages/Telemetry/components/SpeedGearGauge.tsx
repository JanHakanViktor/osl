import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";

type SpeedGearGaugeProps = {
  speed?: number;
  gear?: number;
};

const maxDisplaySpeed = 360;

export default function SpeedGearGauge({ speed, gear }: SpeedGearGaugeProps) {
  const normalizedSpeed =
    typeof speed === "number" ? Math.min(Math.max(speed / maxDisplaySpeed, 0), 1) : 0;
  const rotation = 150 + normalizedSpeed * 240;
  const speedLabel = speed ?? "--";
  const gearLabel = gear ?? "--";

  return (
    <Box
      sx={{
        width: "min(100%, 520px)",
        aspectRatio: "1.18 / 1",
        position: "relative",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "5%",
          borderRadius: "50%",
          background: (theme) =>
            `conic-gradient(from 210deg, ${getOslAppShell(theme).accent} 0deg, ${
              getOslAppShell(theme).warningAccent
            } ${Math.max(normalizedSpeed * 240, 8)}deg, ${alpha(
              theme.palette.common.white,
              0.1,
            )} ${Math.max(normalizedSpeed * 240, 8)}deg, ${alpha(
              theme.palette.common.white,
              0.1,
            )} 240deg, transparent 240deg)`,
          mask:
            "radial-gradient(circle, transparent 0 56%, #000 57% 70%, transparent 71%)",
          WebkitMask:
            "radial-gradient(circle, transparent 0 56%, #000 57% 70%, transparent 71%)",
          filter: (theme) =>
            `drop-shadow(0 0 28px ${alpha(getOslAppShell(theme).accent, 0.34)})`,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "36%",
          height: 4,
          borderRadius: 999,
          background: (theme) => theme.palette.text.primary,
          transformOrigin: "0 50%",
          transform: `rotate(${rotation}deg)`,
          boxShadow: "0 0 18px rgba(255, 255, 255, 0.36)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 18,
          height: 18,
          borderRadius: "50%",
          backgroundColor: "text.primary",
          boxShadow: "0 0 22px rgba(255, 255, 255, 0.42)",
        }}
      />

      <Stack
        spacing={1}
        alignItems="center"
        sx={{
          position: "relative",
          pt: "13%",
        }}
      >
        <Stack direction="row" justifyContent="center" alignItems="baseline">
          <Typography
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: { xs: "4.8rem", sm: "6.4rem", lg: "8.8rem" },
              fontWeight: 900,
              lineHeight: 0.88,
            }}
          >
            {speedLabel}
          </Typography>
        </Stack>
        <Typography
          sx={{
            px: 2,
            py: 0.4,
            minWidth: 72,
            borderRadius: 1,
            textAlign: "center",
            fontFamily: "'Roboto Mono', monospace",
            fontSize: { xs: "2.1rem", md: "2.8rem" },
            fontWeight: 900,
            lineHeight: 1,
            color: (theme) => getOslAppShell(theme).accent,
            backgroundColor: (theme) => alpha(theme.palette.common.white, 0.06),
          }}
        >
          {gearLabel}
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Gear
        </Typography>
      </Stack>
    </Box>
  );
}
