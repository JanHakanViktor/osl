import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Box,
  Button,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router";
import {
  TOURNAMENT_STATUS_CHIPS,
  WEATHER_LABELS,
} from "../../pages/Tournament/tournamentFormatters";
import { tournamentPath } from "../../pages/Tournament/tournamentRouting";
import { getOslAppShell } from "../../theme";
import type { TournamentHighlight } from "../../types/tournament.types";
import TournamentMiniStandings from "./tournament/TournamentMiniStandings";
import TournamentSpotlightRow from "./tournament/TournamentSpotlightRow";
import TournamentTrackStrip from "./tournament/TournamentTrackStrip";
import { buildTournamentSpotlight, featuredCircuit } from "./tournamentSpotlight";

type LatestTournamentWidgetProps = {
  tournament: TournamentHighlight | null;
  loading: boolean;
};

function LiveDot() {
  return (
    <Box
      aria-hidden
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: (theme) => getOslAppShell(theme).accent,
        animation: "tournamentLivePulse 1.4s ease-in-out infinite",
        "@keyframes tournamentLivePulse": {
          "0%, 100%": { opacity: 0.35 },
          "50%": { opacity: 1 },
        },
      }}
    />
  );
}

const LatestTournamentWidget = ({
  tournament,
  loading,
}: LatestTournamentWidgetProps) => {
  const navigate = useNavigate();
  const isLive = tournament?.status === "HEAT_LIVE";
  const circuit = tournament ? featuredCircuit(tournament) : null;
  const spotlight = tournament ? buildTournamentSpotlight(tournament) : null;
  const status = tournament ? TOURNAMENT_STATUS_CHIPS[tournament.status] : null;

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 320,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.28)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          minHeight: 120,
          p: 3,
          color: "common.white",
          overflow: "hidden",
          background: (theme) => getOslAppShell(theme).appBarGradient,
          borderBottom: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        }}
      >
        {circuit?.image && (
          <Box
            component="img"
            src={circuit.image}
            alt=""
            sx={{
              position: "absolute",
              top: 8,
              right: { xs: 8, sm: 12 },
              width: { xs: "40%", sm: "38%" },
              height: "calc(100% - 16px)",
              objectFit: "contain",
              objectPosition: "right center",
              opacity: 0.6,
              filter: "brightness(0) invert(1)",
              pointerEvents: "none",
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: (theme) =>
              `linear-gradient(90deg, ${alpha(
                getOslAppShell(theme).surface,
                0.82,
              )}, ${alpha(getOslAppShell(theme).surface, 0.2)})`,
          }}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              {isLive && <LiveDot />}
              <Typography
                variant="overline"
                sx={{
                  color: (theme) => getOslAppShell(theme).accent,
                  fontWeight: 800,
                }}
              >
                {isLive ? "Tournament live" : "Latest tournament"}
              </Typography>
            </Stack>
            <Typography variant="h5" noWrap sx={{ fontWeight: 900 }}>
              {tournament?.name ?? "No tournaments yet"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.78)" }}>
              {tournament
                ? `${tournament.ruleSetName} · ${WEATHER_LABELS[tournament.weather]} · ${tournament.lapsPerDriver} laps per driver`
                : "One rig, a dice and your friends"}
            </Typography>
          </Box>
          {status && (
            <Chip size="small" label={status.label} color={status.color} />
          )}
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: 3, flex: 1 }}>
        {loading && !tournament ? (
          <>
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={88} />
          </>
        ) : tournament ? (
          <>
            {spotlight && <TournamentSpotlightRow spotlight={spotlight} />}
            <TournamentMiniStandings standings={tournament.standings} />
            <Divider />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              flexWrap="wrap"
              sx={{ mt: "auto" }}
            >
              <TournamentTrackStrip rounds={tournament.rounds} />
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(tournamentPath.standings(tournament.id))}
              >
                Open tournament
              </Button>
            </Stack>
          </>
        ) : (
          <Stack spacing={2} alignItems="flex-start" sx={{ my: "auto" }}>
            <Typography color="text.secondary">
              Pick a rule set, add your friends and the tracks, and let the
              dice decide who drives first.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(tournamentPath.create())}
            >
              Start a tournament
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default LatestTournamentWidget;
