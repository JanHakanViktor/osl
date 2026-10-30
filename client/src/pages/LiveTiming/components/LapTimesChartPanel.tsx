import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import type { TimingBoard } from "../../../types/liveTiming.types";
import { formatLapTime } from "../../Telemetry/telemetryFormatters";
import TournamentPanel from "../../Tournament/components/TournamentPanel";
import {
  buildLapTimeSeries,
  defaultChartDrivers,
  teamColor,
} from "../liveTimingView";

/** Lap times of the drivers you pick, lap by lap. */
export default function LapTimesChartPanel({ board }: { board: TimingBoard }) {
  // Follows the top five until someone picks drivers themselves.
  const [pickedCarIndexes, setPickedCarIndexes] = useState<number[] | null>(
    null,
  );
  const selected = pickedCarIndexes ?? defaultChartDrivers(board);
  const { lapNumbers, series } = buildLapTimeSeries(board.drivers, selected);
  const hasLaps = series.some((line) => line.data.some((value) => value));

  const toggleDriver = (carIndex: number) =>
    setPickedCarIndexes(
      selected.includes(carIndex)
        ? selected.filter((index) => index !== carIndex)
        : [...selected, carIndex],
    );

  return (
    <TournamentPanel title="Lap times">
      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
        {board.drivers.map((driver) => {
          const active = selected.includes(driver.carIndex);
          const color = teamColor(driver.teamId);

          return (
            <Chip
              key={driver.carIndex}
              label={driver.name}
              size="small"
              clickable
              onClick={() => toggleDriver(driver.carIndex)}
              aria-pressed={active}
              variant={active ? "filled" : "outlined"}
              sx={{
                fontWeight: 800,
                borderColor: color,
                bgcolor: active ? `${color}33` : "transparent",
              }}
            />
          );
        })}
      </Stack>

      {hasLaps ? (
        <Box sx={{ width: "100%", minHeight: 300 }}>
          <LineChart
            height={300}
            xAxis={[
              {
                data: lapNumbers,
                scaleType: "point",
                label: "Lap",
                // Room for the lap numbers above the axis label.
                height: 48,
              },
            ]}
            yAxis={[
              {
                width: 72,
                valueFormatter: (value: number) => formatLapTime(value),
              },
            ]}
            series={series.map((line) => ({
              data: line.data,
              label: line.label,
              color: line.color,
              connectNulls: true,
              curve: "linear",
              // A dot per lap, so a single lap still shows.
              showMark: true,
              valueFormatter: (value: number | null) =>
                value == null ? "—" : formatLapTime(value),
            }))}
            grid={{ horizontal: true }}
          />
        </Box>
      ) : (
        <Typography color="text.secondary">
          Lap times appear here once the selected drivers complete valid laps.
        </Typography>
      )}
      <Typography color="text.secondary" sx={{ mt: 1, fontSize: "0.8rem" }}>
        Valid laps only; pit and safety car laps are left out.
      </Typography>
    </TournamentPanel>
  );
}
