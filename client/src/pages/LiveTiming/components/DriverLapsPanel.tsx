import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type {
  TimingBoard,
  TimingDriver,
} from "../../../types/liveTiming.types";
import {
  F1_SECTOR_COLORS,
  formatLapTime,
} from "../../Telemetry/telemetryFormatters";
import TournamentPanel from "../../Tournament/components/TournamentPanel";
import { lapSectorStatuses } from "../liveTimingView";
import SectorTime from "./SectorTime";

type DriverLapsPanelProps = {
  board: TimingBoard;
  driver: TimingDriver;
};

/** One driver's laps with sectors coloured purple, green or yellow. */
export default function DriverLapsPanel({
  board,
  driver,
}: DriverLapsPanelProps) {
  const laps = [...driver.laps].reverse();

  return (
    <TournamentPanel title={`${driver.name}'s laps`}>
      {laps.length === 0 ? (
        <Typography color="text.secondary">No completed laps yet.</Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 420, overflowY: "auto" }}>
          <Table size="small" stickyHeader aria-label={`${driver.name}'s laps`}>
            <TableHead>
              <TableRow>
                <TableCell>Lap</TableCell>
                <TableCell align="right">Time</TableCell>
                <TableCell align="right">S1</TableCell>
                <TableCell align="right">S2</TableCell>
                <TableCell align="right">S3</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {laps.map((lap) => {
                const statuses = lapSectorStatuses(lap, driver, board);
                const isBest =
                  driver.stats.bestLap?.lapNumber === lap.lapNumber;
                const isFastest =
                  board.fastestLap?.carIndex === driver.carIndex &&
                  board.fastestLap.lapNumber === lap.lapNumber;

                return (
                  <TableRow key={lap.lapNumber}>
                    <TableCell sx={{ fontWeight: 900 }}>
                      {lap.lapNumber}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontWeight: 800,
                        color: isFastest
                          ? F1_SECTOR_COLORS.purple
                          : isBest
                            ? F1_SECTOR_COLORS.green
                            : "inherit",
                        textDecoration: lap.valid ? "none" : "line-through",
                      }}
                    >
                      {formatLapTime(lap.lapTimeMs)}
                    </TableCell>
                    {lap.sectorsMs.map((sectorMs, index) => (
                      <TableCell key={index} align="right">
                        <SectorTime
                          timeMs={sectorMs}
                          status={statuses[index]}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      {!lap.valid && (
                        <Chip
                          label="Invalid"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </TournamentPanel>
  );
}
