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
  const arcDegrees = Math.max(normalizedSpeed * 240, 8);
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
          background: (theme) => {
            const shell = getOslAppShell(theme);
            return [
              `repeating-conic-gradient(from 210deg, ${alpha(
                theme.palette.common.white,
                0.52,
              )} 0deg 1.4deg, transparent 1.4deg 10deg)`,
              `conic-gradient(from 210deg, ${shell.accent} 0deg, ${
                shell.warningAccent
              } ${arcDegrees}deg, ${alpha(
                theme.palette.common.white,
                0.12,
              )} ${arcDegrees}deg, ${alpha(
                theme.palette.common.white,
                0.12,
              )} 240deg, transparent 240deg)`,
            ].join(", ");
          },
          mask:
            "radial-gradient(circle, transparent 0 52%, #000 53% 67%, transparent 68%)",
          WebkitMask:
            "radial-gradient(circle, transparent 0 52%, #000 53% 67%, transparent 68%)",
          filter: (theme) =>
            `drop-shadow(0 0 28px ${alpha(getOslAppShell(theme).accent, 0.34)})`,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: "12%",
          borderRadius: "50%",
          border: (theme) =>
            `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
          boxShadow: (theme) =>
            `inset 0 0 34px ${alpha(theme.palette.common.black, 0.24)}`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          p: 1.25,
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
