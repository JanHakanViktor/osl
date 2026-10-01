import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { getOslAppShell } from "../../../theme";
import type { Tournament } from "../../../types/tournament.types";
import { tournamentPath } from "../tournamentRouting";
import TournamentPanel from "./TournamentPanel";

type TrackOrderCardProps = {
  tournament: Tournament;
};

export default function TrackOrderCard({ tournament }: TrackOrderCardProps) {
  const navigate = useNavigate();
  const currentRound = tournament.rounds.find(
    (round) => round.roundNumber === tournament.currentRoundNumber,
  );
  const anyRoundComplete = tournament.rounds.some(
    (round) => round.status === "COMPLETE",
  );

  return (
    <TournamentPanel title="Race track order">
      <Stack component="ol" spacing={0.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
        {tournament.rounds.map((round) => {
          const complete = round.status === "COMPLETE";
          const current = round.status === "IN_PROGRESS";
          const winner = round.results.find((result) => result.position === 1);

          return (
            <Box component="li" key={round.roundNumber}>
              <ButtonBase
                disabled={!complete}
                onClick={() =>
                  navigate(tournamentPath.round(tournament.id, round.roundNumber))
                }
                aria-label={
                  complete
                    ? `${round.circuit.grandPrix} results`
                    : round.circuit.grandPrix
                }
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 1.5,
                  px: 1,
                  py: 0.75,
                  borderRadius: 1,
                  textAlign: "left",
                  "&:hover": complete
                    ? { bgcolor: "rgba(255, 255, 255, 0.06)" }
                    : undefined,
                }}
              >
                <Typography color="text.secondary" sx={{ width: 22, fontWeight: 800 }}>
                  {round.roundNumber}
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    fontWeight: 900,
                    fontSize: "1.2rem",
                    textTransform: "uppercase",
                    textDecoration: complete ? "line-through" : "none",
                    opacity: complete ? 0.55 : 1,
                    color: (theme) =>
                      current ? getOslAppShell(theme).accent : "inherit",
                  }}
                >
                  {round.circuit.grandPrix}
                </Typography>
                {complete && winner && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {winner.driver.driverName}
                  </Typography>
                )}
              </ButtonBase>
            </Box>
          );
        })}
      </Stack>

      {currentRound && (
        <Box
          sx={{
            mt: 3,
            pt: 2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            columnGap: 2,
            borderTop: (theme) => `1px solid ${getOslAppShell(theme).border}`,
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: "1.3rem", textTransform: "uppercase" }}>
            {anyRoundComplete ? "Upcoming race" : "First track"}
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.2rem", md: "2.8rem" },
              lineHeight: 1.1,
              textTransform: "uppercase",
              color: (theme) => getOslAppShell(theme).accent,
            }}
          >
            {currentRound.circuit.grandPrix}
          </Typography>
        </Box>
      )}
    </TournamentPanel>
  );
}
