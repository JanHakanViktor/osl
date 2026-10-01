import HomeIcon from "@mui/icons-material/Home";
import { Box, Button, ButtonBase, Container, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import AwardsPanel from "./components/AwardsPanel";
import DriverStandingsList from "./components/DriverStandingsList";
import PodiumStage from "./components/PodiumStage";
import TournamentPageHeader from "./components/TournamentPageHeader";
import TournamentPanel from "./components/TournamentPanel";
import TournamentStatusMessage from "./components/TournamentStatusMessage";
import { useTournament } from "./hooks/useTournament";
import { useTournamentRedirect } from "./hooks/useTournamentRedirect";
import { tournamentPath } from "./tournamentRouting";

export default function TournamentPodiumPage() {
  const navigate = useNavigate();
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { data: tournament, error, isLoading } = useTournament(tournamentId);
  const redirect = useTournamentRedirect(tournament, "podium");

  if (isLoading) return <TournamentStatusMessage kind="loading" />;
  if (error || !tournament) {
    return (
      <TournamentStatusMessage
        kind="error"
        message={error?.message ?? "Tournament not found"}
      />
    );
  }
  if (redirect || !tournament.awards) return null;

  const champion = tournament.standings[0];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <TournamentPageHeader
        eyebrow={`${tournament.name} · Final results`}
        title={champion ? `${champion.driver.driverName} wins` : "Podium"}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Stack spacing={3}>
          <PodiumStage standings={tournament.standings} />
          <TournamentPanel title="Final standings">
            <DriverStandingsList standings={tournament.standings} />
          </TournamentPanel>
        </Stack>

        <Stack spacing={3}>
          <AwardsPanel awards={tournament.awards} />
          <TournamentPanel title="Track results">
            <Stack spacing={0.5}>
              {tournament.rounds.map((round) => (
                <ButtonBase
                  key={round.roundNumber}
                  onClick={() =>
                    navigate(tournamentPath.round(tournament.id, round.roundNumber))
                  }
                  sx={{
                    justifyContent: "space-between",
                    gap: 2,
                    px: 1,
                    py: 1,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.06)" },
                  }}
                >
                  <Typography sx={{ fontWeight: 900, textTransform: "uppercase" }}>
                    {round.circuit.grandPrix}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {round.results.find((result) => result.position === 1)?.driver
                      .driverName ?? "No winner"}
                  </Typography>
                </ButtonBase>
              ))}
            </Stack>
          </TournamentPanel>
        </Stack>
      </Box>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ minHeight: 48 }}
        >
          Back to main menu
        </Button>
      </Stack>
    </Container>
  );
}
