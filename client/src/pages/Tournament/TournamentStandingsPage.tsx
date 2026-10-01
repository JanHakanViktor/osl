import { Box, Chip, Container, Stack } from "@mui/material";
import { useParams } from "react-router";
import DriverStandingsList from "./components/DriverStandingsList";
import NextHeatPanel from "./components/NextHeatPanel";
import RoundProgress from "./components/RoundProgress";
import TournamentPageHeader from "./components/TournamentPageHeader";
import TournamentPanel from "./components/TournamentPanel";
import TournamentStatusMessage from "./components/TournamentStatusMessage";
import TrackOrderCard from "./components/TrackOrderCard";
import WeatherIcon from "./components/WeatherIcon";
import { useTournament } from "./hooks/useTournament";
import { useTournamentRedirect } from "./hooks/useTournamentRedirect";
import { WEATHER_LABELS } from "./tournamentFormatters";

export default function TournamentStandingsPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { data: tournament, error, isLoading } = useTournament(tournamentId);
  const redirect = useTournamentRedirect(tournament, "standings");

  if (isLoading) return <TournamentStatusMessage kind="loading" />;
  if (error || !tournament) {
    return (
      <TournamentStatusMessage
        kind="error"
        message={error?.message ?? "Tournament not found"}
      />
    );
  }
  if (redirect) return null;

  const { settings } = tournament;
  const currentRound = tournament.rounds.find(
    (round) => round.roundNumber === tournament.currentRoundNumber,
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <TournamentPageHeader eyebrow={tournament.name} title="League standings">
        <Chip label={settings.ruleSet.name} color="primary" variant="outlined" />
        <Chip
          icon={<WeatherIcon weather={settings.weather} />}
          label={WEATHER_LABELS[settings.weather]}
        />
        <Chip label={`${settings.lapsPerDriver} laps per driver`} />
        {settings.cleanLapBonus && <Chip label="+1 clean laps" />}
        {settings.topSpeedBonus && <Chip label="+1 top speed" />}
      </TournamentPageHeader>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.35fr) minmax(0, 1fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Stack spacing={3}>
          <TournamentPanel title="Driver standing">
            <DriverStandingsList standings={tournament.standings} />
          </TournamentPanel>
          {currentRound && (
            <TournamentPanel title={`${currentRound.circuit.grandPrix} so far`}>
              <RoundProgress tournament={tournament} />
            </TournamentPanel>
          )}
        </Stack>

        <Stack spacing={3}>
          <TrackOrderCard tournament={tournament} />
          <NextHeatPanel tournament={tournament} />
        </Stack>
      </Box>
    </Container>
  );
}
