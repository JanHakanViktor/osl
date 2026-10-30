import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import type { TimingBoard } from "../../../types/liveTiming.types";
import {
  F1_SECTOR_COLORS,
  formatLapTime,
} from "../../Telemetry/telemetryFormatters";
import TournamentPanel from "../../Tournament/components/TournamentPanel";
import { formatSectorTime } from "../liveTimingView";

type BestTileProps = {
  label: string;
  value: string;
  holder: string | null;
  detail?: string;
  accent: string;
};

function BestTile({ label, value, holder, detail, accent }: BestTileProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        background: alpha(accent, 0.1),
        borderTop: `3px solid ${accent}`,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: "0.72rem",
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: { xs: "1.2rem", md: "1.4rem" },
          fontWeight: 800,
        }}
      >
        {value}
      </Typography>
      <Typography noWrap sx={{ fontWeight: 800 }}>
        {holder ?? "No time yet"}
      </Typography>
      {detail && (
        <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
          {detail}
        </Typography>
      )}
    </Box>
  );
}

/** Who holds the session's fastest lap, each fastest sector, and top speed. */
export default function SessionBestsPanel({ board }: { board: TimingBoard }) {
  const { fastestLap, fastestSectors, theoreticalBestLapMs, topSpeed } = board;

  return (
    <TournamentPanel title="Session bests">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
        }}
      >
        <BestTile
          label="Fastest lap"
          value={formatLapTime(fastestLap?.timeMs)}
          holder={fastestLap?.driverName ?? null}
          detail={fastestLap ? `Lap ${fastestLap.lapNumber}` : undefined}
          accent={F1_SECTOR_COLORS.purple}
        />
        {fastestSectors.map((sector, index) => (
          <BestTile
            key={index}
            label={`Sector ${index + 1}`}
            value={formatSectorTime(sector?.timeMs)}
            holder={sector?.driverName ?? null}
            detail={sector ? `Lap ${sector.lapNumber}` : undefined}
            accent={F1_SECTOR_COLORS.purple}
          />
        ))}
        <BestTile
          label="Theoretical best"
          value={formatLapTime(theoreticalBestLapMs)}
          holder={theoreticalBestLapMs ? "Best sectors" : null}
          detail={theoreticalBestLapMs ? "Combined" : undefined}
          accent="#6dc8ff"
        />
        <BestTile
          label="Speed trap"
          value={topSpeed ? `${topSpeed.speedKmh.toFixed(1)} km/h` : "--"}
          holder={topSpeed?.driverName ?? null}
          accent="#ffb000"
        />
      </Box>
    </TournamentPanel>
  );
}
