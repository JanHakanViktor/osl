import { useState } from "react";
import { Box, Stack } from "@mui/material";
import type { TimingBoard } from "../../../types/liveTiming.types";
import DriverLapsPanel from "./DriverLapsPanel";
import DriverStatsPanel from "./DriverStatsPanel";
import LapTimesChartPanel from "./LapTimesChartPanel";
import SessionBestsPanel from "./SessionBestsPanel";
import TyreStrategyPanel from "./TyreStrategyPanel";

/** The stats every timing screen shows, live or saved. */
export default function TimingBoardDetails({ board }: { board: TimingBoard }) {
  const [pickedCarIndex, setPickedCarIndex] = useState<number | null>(null);
  // Starts on the player, or the leader when the player is not racing.
  const selectedDriver =
    board.drivers.find((driver) => driver.carIndex === pickedCarIndex) ??
    board.drivers.find((driver) => driver.isPlayer) ??
    board.drivers[0] ??
    null;
  const hasTyreStints = board.drivers.some(
    (driver) => driver.tyreStints.length > 0,
  );

  return (
    <Stack spacing={{ xs: 2, md: 2.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1fr) minmax(0, 1.2fr)",
          },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <SessionBestsPanel board={board} />
        <LapTimesChartPanel board={board} />
      </Box>

      <DriverStatsPanel
        board={board}
        selectedCarIndex={selectedDriver?.carIndex ?? null}
        onSelectDriver={setPickedCarIndex}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: hasTyreStints ? "minmax(0, 1fr) minmax(0, 1fr)" : "1fr",
          },
          gap: { xs: 2, md: 2.5 },
          alignItems: "start",
        }}
      >
        {selectedDriver && (
          <DriverLapsPanel board={board} driver={selectedDriver} />
        )}
        {hasTyreStints && <TyreStrategyPanel board={board} />}
      </Box>
    </Stack>
  );
}
