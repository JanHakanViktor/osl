import {
  Box,
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
import type { TimingBoard } from "../../../types/liveTiming.types";
import { formatLapTime } from "../../Telemetry/telemetryFormatters";
import TournamentPanel from "../../Tournament/components/TournamentPanel";
import { bestSectorStatus, teamColor } from "../liveTimingView";
import SectorTime from "./SectorTime";

const MONO = { fontFamily: "'Roboto Mono', monospace" };

type DriverStatsPanelProps = {
  board: TimingBoard;
  selectedCarIndex: number | null;
  onSelectDriver: (carIndex: number) => void;
};

function formatGained(gained: number | null): string {
  if (gained == null) return "—";
  return gained > 0 ? `+${gained}` : String(gained);
}

/** Every driver's session in numbers; a row opens their laps. */
export default function DriverStatsPanel({
  board,
  selectedCarIndex,
  onSelectDriver,
}: DriverStatsPanelProps) {
  const isRace = board.session.sessionKind === "RACE";

  return (
    <TournamentPanel title="Driver statistics">
      <Typography color="text.secondary" sx={{ mb: 1.5, fontSize: "0.85rem" }}>
        Average and consistency use valid laps within 7% of each driver's best.
        Ideal lap adds up a driver's best sectors. Select a driver to see their
        laps.
      </Typography>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" aria-label="Driver statistics">
          <TableHead>
            <TableRow>
              <TableCell>Driver</TableCell>
              <TableCell align="right">Best</TableCell>
              <TableCell align="right">S1</TableCell>
              <TableCell align="right">S2</TableCell>
              <TableCell align="right">S3</TableCell>
              <TableCell align="right">Ideal</TableCell>
              <TableCell align="right">Average</TableCell>
              <TableCell align="right">Consistency</TableCell>
              <TableCell align="right">Valid laps</TableCell>
              <TableCell align="right">Speed trap</TableCell>
              <TableCell align="right">Pits</TableCell>
              <TableCell align="right">Warnings</TableCell>
              <TableCell align="right">Penalties</TableCell>
              {isRace && <TableCell align="right">+/-</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {board.drivers.map((driver) => {
              const { stats } = driver;
              const selected = driver.carIndex === selectedCarIndex;

              return (
                <TableRow
                  key={driver.carIndex}
                  hover
                  selected={selected}
                  onClick={() => onSelectDriver(driver.carIndex)}
                  sx={{
                    cursor: "pointer",
                    "&.Mui-selected, &.Mui-selected:hover": {
                      bgcolor: (theme) =>
                        alpha(getOslAppShell(theme).accent, 0.16),
                    },
                    "& td": {
                      borderColor: (theme) => getOslAppShell(theme).border,
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 4,
                          height: 22,
                          borderRadius: 1,
                          bgcolor: teamColor(driver.teamId),
                        }}
                      />
                      <Typography sx={{ fontWeight: 900 }}>
                        {driver.position ? `P${driver.position} ` : ""}
                        {driver.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ ...MONO, fontWeight: 800 }}>
                    {formatLapTime(stats.bestLap?.timeMs)}
                  </TableCell>
                  {[0, 1, 2].map((index) => (
                    <TableCell key={index} align="right">
                      <SectorTime
                        timeMs={stats.bestSectors[index]?.timeMs}
                        status={bestSectorStatus(driver, board, index)}
                      />
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={MONO}>
                    {formatLapTime(stats.idealLapMs)}
                  </TableCell>
                  <TableCell align="right" sx={MONO}>
                    {formatLapTime(stats.averageLapMs)}
                  </TableCell>
                  <TableCell align="right" sx={MONO}>
                    {stats.consistencyMs == null
                      ? "—"
                      : `±${(stats.consistencyMs / 1000).toFixed(3)}`}
                  </TableCell>
                  <TableCell align="right" sx={MONO}>
                    {stats.validLaps}/{stats.lapsCompleted}
                  </TableCell>
                  <TableCell align="right" sx={MONO}>
                    {stats.topSpeedKmh == null
                      ? "—"
                      : stats.topSpeedKmh.toFixed(1)}
                  </TableCell>
                  <TableCell align="right" sx={MONO}>
                    {stats.pitStops}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={MONO}
                    title={`${stats.cornerCuttingWarnings} for corner cutting`}
                  >
                    {stats.warnings}
                  </TableCell>
                  <TableCell align="right" sx={MONO}>
                    {stats.penaltiesSeconds > 0
                      ? `${stats.penaltiesSeconds}s`
                      : "—"}
                  </TableCell>
                  {isRace && (
                    <TableCell
                      align="right"
                      sx={{
                        ...MONO,
                        fontWeight: 800,
                        color:
                          (stats.positionsGained ?? 0) > 0
                            ? "success.main"
                            : (stats.positionsGained ?? 0) < 0
                              ? "error.main"
                              : "inherit",
                      }}
                    >
                      {formatGained(stats.positionsGained)}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </TournamentPanel>
  );
}
