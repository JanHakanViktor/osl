import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SportsMotorsportsIcon from "@mui/icons-material/SportsMotorsports";
import { Stack, Typography } from "@mui/material";
import { getOslAppShell } from "../../../theme";
import type { Tournament } from "../../../types/tournament.types";
import { formatLapTime } from "../../Telemetry/telemetryFormatters";

type RoundProgressProps = {
  tournament: Tournament;
};

/** Who has driven the current track, who is up, and who is still waiting. */
export default function RoundProgress({ tournament }: RoundProgressProps) {
  const round = tournament.rounds.find(
    (candidate) => candidate.roundNumber === tournament.currentRoundNumber,
  );
  if (!round) return null;

  const upNow = tournament.activeHeat?.driver.id;

  return (
    <Stack spacing={1}>
      {tournament.drivers.map((driver) => {
        const result = round.results.find((entry) => entry.driver.id === driver.id);
        const isUp = driver.id === upNow;

        return (
          <Stack key={driver.id} direction="row" alignItems="center" gap={1.5}>
            {result ? (
              <CheckCircleIcon fontSize="small" color="success" />
            ) : isUp ? (
              <SportsMotorsportsIcon
                fontSize="small"
                sx={{ color: (theme) => getOslAppShell(theme).accent }}
              />
            ) : (
              <HourglassEmptyIcon fontSize="small" color="disabled" />
            )}
            <Typography sx={{ flex: 1, fontWeight: 800, textTransform: "uppercase" }}>
              {driver.driverName}
            </Typography>
            <Typography
              color={result ? "text.primary" : "text.secondary"}
              sx={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 800 }}
            >
              {result
                ? result.bestLapMs
                  ? formatLapTime(result.bestLapMs)
                  : "NO TIME"
                : isUp
                  ? "Up now"
                  : "Waiting"}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
