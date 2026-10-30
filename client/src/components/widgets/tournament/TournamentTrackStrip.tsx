import CheckIcon from "@mui/icons-material/Check";
import { Chip, Stack } from "@mui/material";
import { driverCode } from "../../../pages/Tournament/tournamentFormatters";
import type { TournamentHighlight } from "../../../types/tournament.types";

/** The race track order: done tracks with their winner, the current one lit. */
export default function TournamentTrackStrip({
  rounds,
}: {
  rounds: TournamentHighlight["rounds"];
}) {
  return (
    <Stack
      component="ol"
      direction="row"
      flexWrap="wrap"
      gap={0.75}
      aria-label="Race track order"
      sx={{ listStyle: "none", p: 0, m: 0 }}
    >
      {rounds.map((round) => {
        const complete = round.status === "COMPLETE";
        const label =
          complete && round.winner
            ? `${round.circuit.grandPrix} · ${driverCode(round.winner.driverName)}`
            : round.circuit.grandPrix;

        return (
          <li key={round.roundNumber}>
            <Chip
              size="small"
              label={label}
              icon={complete ? <CheckIcon /> : undefined}
              color={round.status === "IN_PROGRESS" ? "primary" : "default"}
              variant={round.status === "UPCOMING" ? "outlined" : "filled"}
              sx={{
                textTransform: "uppercase",
                opacity: complete ? 0.75 : 1,
              }}
            />
          </li>
        );
      })}
    </Stack>
  );
}
