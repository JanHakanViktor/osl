import AddIcon from "@mui/icons-material/Add";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  Alert,
  AvatarGroup,
  Box,
  Button,
  ButtonBase,
  Chip,
  Container,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { getTournaments } from "../../service/tournament";
import { getOslAppShell } from "../../theme";
import type { TournamentSummary } from "../../types/tournament.types";
import DriverAvatar from "./components/DriverAvatar";
import TournamentPageHeader from "./components/TournamentPageHeader";
import TournamentPanel from "./components/TournamentPanel";
import { tournamentKeys } from "./hooks/useTournament";
import { TOURNAMENT_STATUS_CHIPS } from "./tournamentFormatters";
import { tournamentPath } from "./tournamentRouting";

function TournamentCard({ tournament }: { tournament: TournamentSummary }) {
  const navigate = useNavigate();
  const status = TOURNAMENT_STATUS_CHIPS[tournament.status];

  return (
    <ButtonBase
      onClick={() => navigate(tournamentPath.standings(tournament.id))}
      sx={{
        display: "block",
        width: "100%",
        textAlign: "left",
        p: 2.5,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.28)",
        transition: "border-color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: (theme) => getOslAppShell(theme).accent,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" gap={2} mb={1.5}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {tournament.name}
        </Typography>
        <Chip size="small" label={status.label} color={status.color} />
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <AvatarGroup max={5} sx={{ "& .MuiAvatar-root": { borderWidth: 2 } }}>
          {tournament.drivers.map((driver) => (
            <DriverAvatar key={driver.id} name={driver.driverName} size={34} />
          ))}
        </AvatarGroup>
        <Typography color="text.secondary" variant="body2">
          {tournament.roundsCompleted}/{tournament.roundsTotal} tracks
        </Typography>
      </Stack>
      {tournament.winner && (
        <Stack direction="row" alignItems="center" gap={1} mt={1.5}>
          <EmojiEventsIcon
            fontSize="small"
            sx={{ color: (theme) => getOslAppShell(theme).warningAccent }}
          />
          <Typography sx={{ fontWeight: 800 }}>
            {tournament.winner.driverName}
          </Typography>
        </Stack>
      )}
    </ButtonBase>
  );
}

export default function TournamentListPage() {
  const navigate = useNavigate();
  const { data, error, isLoading } = useQuery({
    queryKey: tournamentKeys.list(),
    queryFn: getTournaments,
  });

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <TournamentPageHeader eyebrow="One rig, many drivers" title="Tournaments">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(tournamentPath.create())}
          sx={{ minHeight: 48 }}
        >
          New tournament
        </Button>
      </TournamentPageHeader>

      {error && <Alert severity="error">{error.message}</Alert>}

      {isLoading && (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { md: "1fr 1fr" } }}>
          {[0, 1].map((index) => (
            <Skeleton key={index} variant="rounded" height={150} />
          ))}
        </Box>
      )}

      {data && data.length === 0 && (
        <TournamentPanel sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
            No tournaments yet
          </Typography>
          <Typography color="text.secondary">
            Pick a rule set, add your friends and the tracks, and let the dice
            decide who drives first.
          </Typography>
        </TournamentPanel>
      )}

      {data && data.length > 0 && (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { md: "1fr 1fr" } }}>
          {data.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </Box>
      )}
    </Container>
  );
}
