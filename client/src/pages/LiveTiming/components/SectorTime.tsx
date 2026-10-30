import { Box } from "@mui/material";
import { F1_SECTOR_COLORS } from "../../Telemetry/telemetryFormatters";
import type { SectorStatus } from "../../Telemetry/telemetryTypes";
import { formatSectorTime } from "../liveTimingView";

type SectorTimeProps = {
  timeMs: number | null | undefined;
  status: SectorStatus;
};

/** A sector time coloured as on the game's timing screens. */
export default function SectorTime({ timeMs, status }: SectorTimeProps) {
  return (
    <Box
      component="span"
      sx={{
        fontFamily: "'Roboto Mono', monospace",
        fontWeight: 800,
        color: status === "muted" ? "text.secondary" : F1_SECTOR_COLORS[status],
      }}
    >
      {formatSectorTime(timeMs)}
    </Box>
  );
}
