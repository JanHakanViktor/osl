import { useState } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import type { ActiveHeat, Tournament } from "../../../types/tournament.types";
import { formatLapTime } from "../../Telemetry/telemetryFormatters";

type TournamentHeatBarProps = {
  tournament: Tournament;
  heat: ActiveHeat;
  cancelling: boolean;
  onCancelHeat: () => void;
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: "0.7rem",
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, textTransform: "uppercase" }}>
        {value}
      </Typography>
    </Box>
  );
}

/** Tournament context shown above the live telemetry during a heat. */
export default function TournamentHeatBar({
  tournament,
  heat,
  cancelling,
  onCancelHeat,
}: TournamentHeatBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 1.5,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: { xs: 2, md: 4 },
        background: (theme) => getOslAppShell(theme).appBarGradient,
        borderBottom: (theme) =>
          `2px solid ${alpha(getOslAppShell(theme).accent, 0.7)}`,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mr: "auto" }}>
        <EmojiEventsIcon
          sx={{ color: (theme) => getOslAppShell(theme).warningAccent }}
        />
        <Typography sx={{ fontWeight: 900 }}>{tournament.name}</Typography>
      </Stack>
      <Fact
        label="Round"
        value={`${heat.roundNumber}/${tournament.rounds.length} · ${heat.circuit.grandPrix}`}
      />
      <Fact label="Driver" value={heat.driver.driverName} />
      <Fact label="Laps" value={`${heat.lapsCompleted}/${heat.lapsTarget}`} />
      <Fact label="Heat best" value={formatLapTime(heat.bestLapMs)} />
      {tournament.isHost && (
        <Button
          color="inherit"
          size="small"
          onClick={() => setConfirmOpen(true)}
          disabled={cancelling}
        >
          Cancel heat
        </Button>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Cancel this heat?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {heat.driver.driverName}'s laps on {heat.circuit.grandPrix} are
            discarded and the dice can be rolled again. Use “End heat” instead
            to keep the laps driven so far.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Keep driving</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setConfirmOpen(false);
              onCancelHeat();
            }}
          >
            Discard heat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
