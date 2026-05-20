import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";

type CircuitPositionMapProps = {
  circuitName: string;
  circuitImage?: string | null;
  progress?: number | null;
};

function getMarkerPosition(progress?: number | null) {
  const normalized =
    progress == null || !Number.isFinite(progress)
      ? 0
      : Math.min(Math.max(progress, 0), 1);
  const angle = normalized * Math.PI * 2 - Math.PI / 2;

  return {
    left: `${50 + Math.cos(angle) * 35}%`,
    top: `${50 + Math.sin(angle) * 31}%`,
  };
}

export default function CircuitPositionMap({
  circuitName,
  circuitImage,
  progress,
}: CircuitPositionMapProps) {
  const markerPosition = getMarkerPosition(progress);

  return (
    <Box
      sx={{
        mt: 2,
        pt: 2,
        borderTop: (theme) => `1px solid ${getOslAppShell(theme).border}`,
      }}
    >
      <Typography
        sx={{
          mb: 1,
          color: "text.secondary",
          fontSize: "0.76rem",
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {circuitName}
      </Typography>

      <Box
        sx={{
          position: "relative",
          minHeight: 170,
          borderRadius: 1,
          overflow: "hidden",
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(
              getOslAppShell(theme).surfaceStrong,
              0.9,
            )}, ${alpha(theme.palette.common.black, 0.24)})`,
          border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        }}
      >
        {circuitImage && (
          <Box
            component="img"
            src={circuitImage}
            alt=""
            sx={{
              position: "absolute",
              inset: "12%",
              width: "76%",
              height: "76%",
              objectFit: "contain",
              opacity: 0.66,
              filter: "drop-shadow(0 14px 22px rgba(0, 0, 0, 0.42))",
            }}
          />
        )}

        <Box
          sx={{
            position: "absolute",
            inset: "16%",
            borderRadius: "50%",
            border: (theme) =>
              `1px dashed ${alpha(theme.palette.common.white, 0.18)}`,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            left: markerPosition.left,
            top: markerPosition.top,
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#ff3048",
            border: "2px solid #fff",
            boxShadow: "0 0 18px rgba(255, 48, 72, 0.85)",
            transform: "translate(-50%, -50%)",
            transition: "left 360ms ease, top 360ms ease",
          }}
        />
      </Box>
    </Box>
  );
}
