import { useEffect, useState } from "react";
import CasinoIcon from "@mui/icons-material/Casino";
import { Box, Button, Typography } from "@mui/material";
import { getOslAppShell } from "../../../theme";
import type { TournamentDriver } from "../../../types/tournament.types";

const NAME_FLICKER_MS = 90;

type DriverDiceProps = {
  candidates: TournamentDriver[];
  rolling: boolean;
  disabled?: boolean;
  label: string;
  onRoll: () => void;
};

/** Dice button that flickers through the waiting drivers while it rolls. */
export default function DriverDice({
  candidates,
  rolling,
  disabled = false,
  label,
  onRoll,
}: DriverDiceProps) {
  const [flickerIndex, setFlickerIndex] = useState(0);

  useEffect(() => {
    if (!rolling || candidates.length === 0) return;

    const intervalId = window.setInterval(
      () => setFlickerIndex((index) => (index + 1) % candidates.length),
      NAME_FLICKER_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [rolling, candidates.length]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      <Button
        variant="contained"
        onClick={onRoll}
        disabled={disabled || rolling}
        startIcon={
          <CasinoIcon
            sx={{
              animation: rolling ? "diceTumble 0.45s linear infinite" : "none",
              "@keyframes diceTumble": {
                "0%": { transform: "rotate(0deg) scale(1)" },
                "50%": { transform: "rotate(180deg) scale(1.25)" },
                "100%": { transform: "rotate(360deg) scale(1)" },
              },
            }}
          />
        }
        sx={{ minHeight: 52, px: 3, "& .MuiButton-startIcon svg": { fontSize: 30 } }}
      >
        {rolling ? "Rolling…" : label}
      </Button>
      {rolling && candidates.length > 0 && (
        <Typography
          aria-live="polite"
          sx={{
            fontWeight: 900,
            fontSize: "1.4rem",
            textTransform: "uppercase",
            color: (theme) => getOslAppShell(theme).warningAccent,
          }}
        >
          {candidates[flickerIndex % candidates.length].driverName}
        </Typography>
      )}
    </Box>
  );
}
