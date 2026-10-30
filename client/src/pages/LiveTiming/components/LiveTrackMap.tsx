import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import {
  buildCircuitPolylinePoints,
  getCircuitLayout,
  getCircuitMarkerLine,
  getPointAtCircuitProgress,
  getTelemetryCircuitProgress,
} from "../../Telemetry/circuitLayouts";
import { markerTextColor, type TrackMarker } from "../liveTimingView";

/** The API sends car positions every 250 ms; dots glide between them. */
const FRAME_TRANSITION_MS = 250;

type LiveTrackMapProps = {
  circuitName: string | null;
  markers: TrackMarker[];
};

/** Every car on the circuit, as a team-coloured dot with its position. */
export default function LiveTrackMap({
  circuitName,
  markers,
}: LiveTrackMapProps) {
  const layout = getCircuitLayout(circuitName);
  const trackPath = buildCircuitPolylinePoints(layout.points);
  const startLine = getCircuitMarkerLine(
    layout.points,
    layout.markers[0]?.progress ?? 0,
    8,
  );

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        maxHeight: 560,
        mx: "auto",
        borderRadius: 2,
        overflow: "hidden",
        background: (theme) =>
          `radial-gradient(circle at 50% 40%, ${alpha(
            getOslAppShell(theme).surfaceStrong,
            0.95,
          )}, ${alpha(theme.palette.common.black, 0.35)})`,
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Live car positions on ${circuitName ?? "the circuit"}`}
        sx={{ position: "absolute", inset: "6%", width: "88%", height: "88%" }}
      >
        <polyline
          points={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
        <polyline
          points={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
        {startLine && (
          <line
            x1={startLine.start.x}
            y1={startLine.start.y}
            x2={startLine.end.x}
            y2={startLine.end.y}
            stroke="#ff3048"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
        )}
        {markers.map((marker) => {
          const point = getPointAtCircuitProgress(
            layout.points,
            getTelemetryCircuitProgress(layout, marker.progress),
          );

          return (
            <g
              key={marker.carIndex}
              style={{
                transform: `translate(${point.x}px, ${point.y}px)`,
                transition: `transform ${FRAME_TRANSITION_MS}ms linear`,
              }}
            >
              <title>{`P${marker.position} ${marker.name}`}</title>
              <circle
                r={marker.isPlayer ? 3.4 : 2.8}
                fill={marker.color}
                stroke={marker.isPlayer ? "#ffffff" : "rgba(8,10,18,0.9)"}
                strokeWidth={marker.isPlayer ? 0.9 : 0.5}
                style={
                  marker.isPlayer
                    ? { filter: "drop-shadow(0 0 2px rgba(255,255,255,0.9))" }
                    : undefined
                }
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="2.7"
                fontWeight="900"
                fill={markerTextColor(marker.color)}
              >
                {marker.position}
              </text>
            </g>
          );
        })}
      </Box>

      {markers.length === 0 && (
        <Typography
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "text.secondary",
            fontWeight: 800,
          }}
        >
          No cars on track
        </Typography>
      )}
    </Box>
  );
}
