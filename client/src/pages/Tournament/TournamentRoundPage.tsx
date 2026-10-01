import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { getOslAppShell } from "../../theme";
import { formatLapTime } from "../Telemetry/telemetryFormatters";
import FastestSectorsPanel from "./components/FastestSectorsPanel";
import RoundClassification from "./components/RoundClassification";
import TournamentPageHeader from "./components/TournamentPageHeader";
import TournamentPanel from "./components/TournamentPanel";
import TournamentStatusMessage from "./components/TournamentStatusMessage";
import { useTournament } from "./hooks/useTournament";
import { useTournamentRedirect } from "./hooks/useTournamentRedirect";
import { formatSpeed } from "./tournamentFormatters";
import { tournamentPath } from "./tournamentRouting";

export default function TournamentRoundPage() {
  const navigate = useNavigate();
  const { tournamentId, roundNumber } = useParams<{
    tournamentId: string;
    roundNumber: string;
  }>();
  const { data: tournament, error, isLoading } = useTournament(tournamentId);
  const redirect = useTournamentRedirect(tournament, "round");

  if (isLoading) return <TournamentStatusMessage kind="loading" />;
  const round = tournament?.rounds[Number(roundNumber) - 1];
  if (error || !tournament || !round) {
    return (
      <TournamentStatusMessage
        kind="error"
        message={error?.message ?? "Round not found"}
      />
    );
  }
  if (redirect) return null;

  const complete = round.status === "COMPLETE";
  const fastest = round.results.find((result) => result.position === 1);
  const topSpeed = round.results.reduce(
    (best, result) => Math.max(best, result.topSpeedKmh),
    0,
  );
  const continuePath =
    tournament.status === "FINISHED"
      ? tournamentPath.podium(tournament.id)
      : tournamentPath.standings(tournament.id);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <TournamentPageHeader
        eyebrow={`${tournament.name} · Round ${round.roundNumber} of ${tournament.rounds.length}`}
        title={`${round.circuit.grandPrix} hotlap`}
      >
        {!complete && <Chip label="Provisional" color="warning" variant="outlined" />}
      </TournamentPageHeader>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) minmax(0, 1.7fr)",
            xl: "minmax(0, 0.9fr) minmax(0, 1.7fr) minmax(0, 0.9fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <FastestSectorsPanel sectors={round.fastestSectors} />

        <TournamentPanel title="Drivers">
          <RoundClassification
            results={round.results}
            lapsTarget={tournament.settings.lapsPerDriver}
            showPoints={complete}
          />
        </TournamentPanel>

        <TournamentPanel
          title="Fastest lap"
          sx={{ gridColumn: { md: "1 / -1", xl: "auto" } }}
        >
          <Stack spacing={1.5}>
            <Box
              sx={{
                px: 2,
                py: 2,
                borderRadius: 1,
                textAlign: "center",
                border: (theme) => `1px solid ${getOslAppShell(theme).borderStrong}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: { xs: "2.4rem", md: "3rem" },
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {formatLapTime(fastest?.bestLapMs)}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 900, textTransform: "uppercase", textAlign: "center" }}>
              {fastest?.driver.driverName ?? "No valid laps"}
            </Typography>
            {topSpeed > 0 && (
              <Typography color="text.secondary" textAlign="center">
                Top speed this round: {formatSpeed(topSpeed)}
              </Typography>
            )}
          </Stack>
        </TournamentPanel>
      </Box>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(continuePath)}
          sx={{ minWidth: 180, minHeight: 48 }}
        >
          Continue
        </Button>
      </Stack>
    </Container>
  );
}
