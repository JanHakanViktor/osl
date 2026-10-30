import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import {
  F1_SECTOR_COLORS,
  formatLapTime,
} from "../../Telemetry/telemetryFormatters";
import type { TowerRow } from "../liveTimingView";
import TyreBadge from "./TyreBadge";

const MONO = "'Roboto Mono', monospace";
const WIDE_ONLY = { display: { xs: "none", md: "table-cell" } };
/** Phones leave the tags out; the player row is highlighted anyway. */
const TAG_SX = { height: 20, display: { xs: "none", sm: "inline-flex" } };

type TimingTowerProps = {
  rows: TowerRow[];
  /** Whether rows show live laps and pit stops, or a saved result. */
  live: boolean;
};

function DriverCell({ row }: { row: TowerRow }) {
  return (
    <Stack direction="row" alignItems="center" gap={1.25} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: 4,
          alignSelf: "stretch",
          borderRadius: 1,
          bgcolor: row.color,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 900, lineHeight: 1.2 }}>
          {row.name}
        </Typography>
        <Typography
          noWrap
          sx={{ color: "text.secondary", fontSize: "0.72rem", fontWeight: 700 }}
        >
          {[row.raceNumber && `#${row.raceNumber}`, row.teamName]
            .filter(Boolean)
            .join(" · ")}
        </Typography>
      </Box>
      {row.isPlayer && (
        <Chip label="You" size="small" color="primary" sx={TAG_SX} />
      )}
      {row.isAi && (
        <Chip label="AI" size="small" variant="outlined" sx={TAG_SX} />
      )}
    </Stack>
  );
}

/** Running order with gaps, lap times and tyres, like the game's tower. */
export default function TimingTower({ rows, live }: TimingTowerProps) {
  if (rows.length === 0) {
    return (
      <Typography color="text.secondary">
        No drivers in this session yet.
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        aria-label="Timing tower"
        sx={{ "& .MuiTableCell-root": { px: { xs: 0.75, md: 1 } } }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Pos</TableCell>
            <TableCell>Driver</TableCell>
            <TableCell align="right">Gap</TableCell>
            <TableCell align="right" sx={WIDE_ONLY}>
              Int
            </TableCell>
            <TableCell align="right" sx={WIDE_ONLY}>
              Last
            </TableCell>
            <TableCell align="right">Best</TableCell>
            <TableCell align="center">Tyre</TableCell>
            <TableCell align="right" sx={WIDE_ONLY}>
              {live ? "Lap" : "Laps"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.carIndex}
              sx={{
                bgcolor: (theme) =>
                  row.isPlayer
                    ? alpha(getOslAppShell(theme).accent, 0.12)
                    : "transparent",
                "& td": {
                  borderColor: (theme) => getOslAppShell(theme).border,
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableCell sx={{ fontWeight: 900, fontSize: "1.05rem" }}>
                {row.position ?? "—"}
              </TableCell>
              <TableCell sx={{ maxWidth: 240 }}>
                <DriverCell row={row} />
              </TableCell>
              <TableCell align="right" sx={{ fontFamily: MONO }}>
                {row.statusLabel ? (
                  <Chip
                    label={row.statusLabel}
                    size="small"
                    color={row.statusLabel === "PIT" ? "warning" : "default"}
                    sx={{ height: 20, fontWeight: 900 }}
                  />
                ) : (
                  row.gap
                )}
              </TableCell>
              <TableCell align="right" sx={{ ...WIDE_ONLY, fontFamily: MONO }}>
                {row.interval}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  ...WIDE_ONLY,
                  fontFamily: MONO,
                  color: "text.secondary",
                }}
              >
                {formatLapTime(row.lastLapMs)}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontFamily: MONO,
                  fontWeight: 800,
                  color: row.hasFastestLap
                    ? F1_SECTOR_COLORS.purple
                    : "inherit",
                }}
              >
                {formatLapTime(row.bestLapMs)}
              </TableCell>
              <TableCell align="center">
                <TyreBadge compound={row.tyre} />
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  ...WIDE_ONLY,
                  fontFamily: MONO,
                  color: row.currentLapInvalid ? "error.main" : "inherit",
                }}
                title={
                  row.currentLapInvalid ? "Current lap invalid" : undefined
                }
              >
                {live ? (row.lapNumber ?? "—") : row.lapsCompleted}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
