import { Box, Stack, Typography } from "@mui/material";
import type { TimingBoard } from "../../../types/liveTiming.types";
import TournamentPanel from "../../Tournament/components/TournamentPanel";
import { buildTyreStintBars, TYRE_STYLES } from "../liveTimingView";

/** Each driver's tyre stints across the session's laps. */
export default function TyreStrategyPanel({ board }: { board: TimingBoard }) {
  const drivers = board.drivers.map((driver) => ({
    driver,
    bars: buildTyreStintBars(driver),
  }));
  const totalLaps = Math.max(
    board.session.totalLaps ?? 0,
    ...drivers.flatMap(({ bars }) => bars.map((bar) => bar.endLap)),
    1,
  );

  return (
    <TournamentPanel title="Tyre strategy">
      <Stack spacing={1}>
        {drivers.map(({ driver, bars }) => (
          <Box
            key={driver.carIndex}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "96px 1fr", sm: "140px 1fr" },
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography noWrap sx={{ fontWeight: 800, fontSize: "0.85rem" }}>
              {driver.name}
            </Typography>
            <Box
              sx={{
                position: "relative",
                height: 18,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.05)",
              }}
            >
              {bars.map((bar) => {
                const style = bar.compound ? TYRE_STYLES[bar.compound] : null;
                const laps = bar.endLap - bar.startLap + 1;

                return (
                  <Box
                    key={bar.startLap}
                    title={`${bar.compound?.toLowerCase() ?? "unknown"}: laps ${bar.startLap}-${bar.endLap}`}
                    sx={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${((bar.startLap - 1) / totalLaps) * 100}%`,
                      width: `${(laps / totalLaps) * 100}%`,
                      borderRadius: 1,
                      border: "1px solid rgba(8,10,18,0.8)",
                      bgcolor: style?.color ?? "grey.600",
                      color: "#0b0d14",
                      fontSize: "0.68rem",
                      fontWeight: 900,
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    {style?.label ?? "?"}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Stack>
      <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "0.8rem" }}>
        Scale: {totalLaps} laps.
      </Typography>
    </TournamentPanel>
  );
}
