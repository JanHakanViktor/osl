import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../../theme";
import type { TournamentWeather } from "../../../../types/tournament.types";
import TournamentPanel from "../../components/TournamentPanel";
import WeatherIcon from "../../components/WeatherIcon";
import { WEATHER_LABELS } from "../../tournamentFormatters";
import {
  MAX_LAPS_PER_DRIVER,
  MAX_NAME_LENGTH,
  type TournamentDraft,
} from "../tournamentDraft";

const WEATHER_OPTIONS: TournamentWeather[] = ["DRY", "WET", "NIGHT", "CHANGEABLE"];

type TournamentSettingsStepProps = {
  draft: TournamentDraft;
  onChange: (changes: Partial<TournamentDraft>) => void;
};

function BonusOption({
  checked,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <FormControlLabel
      sx={{ alignItems: "flex-start", m: 0, gap: 1 }}
      control={
        <Checkbox
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          sx={{ p: 0.5 }}
        />
      }
      label={
        <Box>
          <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      }
    />
  );
}

export default function TournamentSettingsStep({
  draft,
  onChange,
}: TournamentSettingsStepProps) {
  return (
    <TournamentPanel sx={{ maxWidth: 820, mx: "auto" }}>
      <Stack spacing={4}>
        <TextField
          autoFocus
          fullWidth
          label="League name"
          value={draft.name}
          onChange={(event) => onChange({ name: event.target.value })}
          slotProps={{ htmlInput: { maxLength: MAX_NAME_LENGTH } }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
            gap: { xs: 3, sm: 5 },
          }}
        >
          <Box>
            <Typography id="tournament-weather" sx={{ fontWeight: 800, mb: 1 }}>
              Weather
            </Typography>
            <ToggleButtonGroup
              exclusive
              aria-labelledby="tournament-weather"
              value={draft.weather}
              onChange={(_, weather: TournamentWeather | null) => {
                if (weather) onChange({ weather });
              }}
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 104px)",
                gap: 1,
                "& .MuiToggleButtonGroup-grouped": {
                  m: 0,
                  border: (theme) =>
                    `1px solid ${getOslAppShell(theme).border} !important`,
                  borderRadius: "8px !important",
                },
              }}
            >
              {WEATHER_OPTIONS.map((weather) => (
                <ToggleButton
                  key={weather}
                  value={weather}
                  sx={{
                    py: 1.5,
                    flexDirection: "column",
                    gap: 0.5,
                    color: "text.secondary",
                    "&.Mui-selected, &.Mui-selected:hover": {
                      color: "common.white",
                      borderColor: (theme) =>
                        `${getOslAppShell(theme).accent} !important`,
                      bgcolor: (theme) => alpha(getOslAppShell(theme).accent, 0.2),
                    },
                  }}
                >
                  <WeatherIcon weather={weather} />
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    {WEATHER_LABELS[weather]}
                  </Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1, maxWidth: 216 }}
            >
              Set these conditions in F1 25 before each heat.
            </Typography>
          </Box>

          <Stack spacing={3}>
            <TextField
              type="number"
              label="Laps for each driver"
              value={draft.lapsPerDriver || ""}
              onChange={(event) =>
                onChange({ lapsPerDriver: Number(event.target.value) })
              }
              helperText="Each driver's best valid lap counts"
              slotProps={{
                htmlInput: { min: 1, max: MAX_LAPS_PER_DRIVER, step: 1 },
              }}
              sx={{ maxWidth: 260 }}
            />
            <BonusOption
              checked={draft.cleanLapBonus}
              title="Extra point for clean laps"
              description="+1 when every lap of a driver's heat is valid"
              onChange={(cleanLapBonus) => onChange({ cleanLapBonus })}
            />
            <BonusOption
              checked={draft.topSpeedBonus}
              title="Extra point for top speed"
              description="+1 for the highest speed trap on each track"
              onChange={(topSpeedBonus) => onChange({ topSpeedBonus })}
            />
          </Stack>
        </Box>
      </Stack>
    </TournamentPanel>
  );
}
