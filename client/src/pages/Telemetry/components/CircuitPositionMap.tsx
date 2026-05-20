import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import {
  buildCircuitPolylinePoints,
  getCircuitLayout,
  getPointAtCircuitProgress,
} from "../circuitLayouts";

type CircuitPositionMapProps = {
  circuitName: string;
  lapProgress?: number | null;
};

export default function CircuitPositionMap({
  circuitName,
  lapProgress,
}: CircuitPositionMapProps) {
  const layout = getCircuitLayout(circuitName);
  const circuitPath = buildCircuitPolylinePoints(layout.points);
  const currentPoint = getPointAtCircuitProgress(layout.points, lapProgress);

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
        <Box
          component="svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          sx={{
            position: "absolute",
            inset: "8%",
            width: "84%",
            height: "84%",
            overflow: "visible",
          }}
        >
          <polyline
            points={circuitPath}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8.5"
          />
          <polyline
            points={circuitPath}
            fill="none"
            stroke="rgba(255,255,255,0.84)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <polyline
            points={circuitPath}
            fill="none"
            stroke="rgba(12,16,26,0.55)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
          <circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r="4.2"
            fill="#ff3048"
            stroke="#fff"
            strokeWidth="1.7"
            style={{
              filter: "drop-shadow(0 0 8px rgba(255,48,72,0.9))",
              transition: "cx 180ms linear, cy 180ms linear",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
