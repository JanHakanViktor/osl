import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import {
  buildCircuitTraceViewBox,
  buildSvgPolylinePoints,
  mapWorldPositionToViewBox,
} from "../circuitTrace";
import type { CircuitTracePoint } from "../telemetryTypes";

type CircuitPositionMapProps = {
  circuitName: string;
  circuitImage?: string | null;
  tracePoints: CircuitTracePoint[];
};

export default function CircuitPositionMap({
  circuitName,
  circuitImage,
  tracePoints,
}: CircuitPositionMapProps) {
  const tracePath = buildSvgPolylinePoints(tracePoints);
  const traceViewBox = buildCircuitTraceViewBox(tracePoints);
  const currentPoint =
    traceViewBox && tracePoints.length > 1
      ? mapWorldPositionToViewBox(tracePoints[tracePoints.length - 1], traceViewBox)
      : null;
  const hasLiveTrace = tracePoints.length > 1 && Boolean(tracePath);

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
        {circuitImage && !hasLiveTrace && (
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
          {hasLiveTrace && (
            <>
              <polyline
                points={tracePath}
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="8"
              />
              <polyline
                points={tracePath}
                fill="none"
                stroke="rgba(255,255,255,0.76)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.8"
              />
              {currentPoint && (
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
              )}
            </>
          )}
        </Box>

        {!hasLiveTrace && (
          <Typography
            sx={{
              position: "absolute",
              left: 16,
              bottom: 14,
              color: "text.secondary",
              fontSize: "0.72rem",
              fontWeight: 900,
              letterSpacing: 0,
              textTransform: "uppercase",
            }}
          >
            Collecting live circuit trace
          </Typography>
        )}
      </Box>
    </Box>
  );
}
