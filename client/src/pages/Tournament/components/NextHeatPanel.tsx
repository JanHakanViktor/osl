import { useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { getOslAppShell } from "../../../theme";
import type { Tournament } from "../../../types/tournament.types";
import { useTournamentActions } from "../hooks/useTournament";
import { WEATHER_LABELS } from "../tournamentFormatters";
import { findTeam } from "../driverProfile";
import DriverAvatar from "./DriverAvatar";
import DriverCaption from "./DriverCaption";
import DriverDice from "./DriverDice";
import TournamentPanel from "./TournamentPanel";

/** Keeps the dice tumbling long enough to feel like a roll. */
const MIN_ROLL_MS = 1_200;

type NextHeatPanelProps = {
  tournament: Tournament;
};

function WaitingForRig() {
  return (
    <Stack direction="row" alignItems="center" gap={1.25}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: (theme) => getOslAppShell(theme).warningAccent,
          animation: "rigPulse 1.4s ease-in-out infinite",
          "@keyframes rigPulse": {
            "0%, 100%": { opacity: 0.35, transform: "scale(0.8)" },
            "50%": { opacity: 1, transform: "scale(1.15)" },
          },
        }}
      />
      <Typography variant="body2" color="text.secondary">
        Waiting for the rig…
      </Typography>
    </Stack>
  );
}

export default function NextHeatPanel({ tournament }: NextHeatPanelProps) {
  const actions = useTournamentActions(tournament.id);
  const [rolling, setRolling] = useState(false);
  const heat = tournament.activeHeat;
  const currentRound = tournament.rounds.find(
    (round) => round.roundNumber === tournament.currentRoundNumber,
  );
  const finishedIds = new Set(
    currentRound?.results.map((result) => result.driver.id),
  );
  const waitingDrivers = tournament.drivers.filter(
    (driver) => !finishedIds.has(driver.id),
  );
  const error = actions.roll.error ?? actions.start.error ?? actions.abort.error;
  const grandPrix = currentRound?.circuit.grandPrix ?? "the next track";

  const rollDice = () => {
    const startedAt = Date.now();
    setRolling(true);
    actions.roll.mutate(undefined, {
      onSettled: () => {
        const remainingMs = Math.max(MIN_ROLL_MS - (Date.now() - startedAt), 0);
        window.setTimeout(() => setRolling(false), remainingMs);
      },
    });
  };

  const showStagedDriver = heat?.status === "STAGED" && !rolling;

  return (
    <TournamentPanel title={showStagedDriver ? "Up next" : "Next driver"}>
      {showStagedDriver ? (
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" gap={2}>
            <DriverAvatar name={heat.driver.driverName} size={64} highlighted />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary">
                Round {heat.roundNumber} · {heat.circuit.grandPrix}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  color: (theme) => getOslAppShell(theme).accent,
                  overflowWrap: "anywhere",
                }}
              >
                {heat.driver.driverName}
              </Typography>
              <DriverCaption driver={heat.driver}>
                {findTeam(heat.driver.teamId)?.name}
              </DriverCaption>
            </Box>
          </Stack>

          <Stack component="ol" spacing={0.75} sx={{ pl: 2.5, m: 0 }}>
            <Typography component="li">Take a seat in the rig.</Typography>
            <Typography component="li">
              Load <strong>{heat.circuit.grandPrix}</strong> in F1 25 (
              {WEATHER_LABELS[tournament.settings.weather].toLowerCase()}) and
              start a new session.
            </Typography>
            <Typography component="li">
              The heat starts by itself once the game is on track:{" "}
              {heat.lapsTarget} {heat.lapsTarget === 1 ? "lap" : "laps"}, best
              valid lap counts.
            </Typography>
          </Stack>

          {heat.detectedCircuit && (
            <Alert severity="warning">
              F1 25 is on {heat.detectedCircuit.grandPrix} – this round is{" "}
              {heat.circuit.grandPrix}.
            </Alert>
          )}

          <WaitingForRig />

          {tournament.isHost && (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => actions.start.mutate()}
                disabled={actions.start.isPending}
              >
                Start now
              </Button>
              <Button
                variant="outlined"
                onClick={rollDice}
                disabled={waitingDrivers.length < 2}
              >
                Re-roll
              </Button>
              <Button
                color="inherit"
                onClick={() => actions.abort.mutate()}
                disabled={actions.abort.isPending}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </Stack>
      ) : tournament.isHost ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">
            Roll the dice to pick who drives {grandPrix} next.
          </Typography>
          <DriverDice
            candidates={waitingDrivers}
            rolling={rolling}
            label="Roll the dice"
            onRoll={rollDice}
          />
        </Stack>
      ) : (
        <Typography color="text.secondary">
          Waiting for the host to roll the dice.
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error.message}
        </Alert>
      )}
    </TournamentPanel>
  );
}
