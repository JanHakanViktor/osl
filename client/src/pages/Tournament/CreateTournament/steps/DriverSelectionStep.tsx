import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  ButtonBase,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../../theme";
import type { DriverOption } from "../../../../types/tournament.types";
import DriverAvatar from "../../components/DriverAvatar";
import TournamentPanel from "../../components/TournamentPanel";
import { MAX_DRIVERS, MIN_DRIVERS } from "../tournamentDraft";

type DriverSelectionStepProps = {
  drivers: DriverOption[];
  loading: boolean;
  selectedIds: string[];
  onToggle: (driverId: string) => void;
};

export default function DriverSelectionStep({
  drivers,
  loading,
  selectedIds,
  onToggle,
}: DriverSelectionStepProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleDrivers = drivers.filter((driver) =>
    driver.driverName.toLowerCase().includes(query),
  );
  const selectedDrivers = selectedIds
    .map((id) => drivers.find((driver) => driver.id === id))
    .filter((driver): driver is DriverOption => driver != null);
  const gridIsFull = selectedIds.length >= MAX_DRIVERS;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.6fr) minmax(0, 1fr)" },
        gap: 3,
        alignItems: "start",
      }}
    >
      <TournamentPanel
        title="Available drivers"
        action={
          <TextField
            size="small"
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{ htmlInput: { "aria-label": "Search drivers" } }}
            sx={{ maxWidth: 200 }}
          />
        }
      >
        <Stack
          direction="row"
          sx={{
            px: 2,
            pb: 1,
            color: "text.secondary",
            fontSize: "0.75rem",
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          <Box sx={{ flex: 1 }}>Name</Box>
          <Box sx={{ width: 96, textAlign: "right" }}>Total wins</Box>
          <Box sx={{ width: 40 }} />
        </Stack>

        <Stack spacing={1} sx={{ maxHeight: 460, overflowY: "auto", pr: 0.5 }}>
          {loading &&
            [0, 1, 2].map((index) => (
              <Skeleton key={index} variant="rounded" height={64} />
            ))}

          {!loading && visibleDrivers.length === 0 && (
            <Typography color="text.secondary" sx={{ px: 2, py: 3 }}>
              No registered drivers match “{search}”.
            </Typography>
          )}

          {visibleDrivers.map((driver) => {
            const selected = selectedIds.includes(driver.id);
            const disabled = !selected && gridIsFull;

            return (
              <ButtonBase
                key={driver.id}
                onClick={() => onToggle(driver.id)}
                disabled={disabled}
                aria-pressed={selected}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  textAlign: "left",
                  opacity: disabled ? 0.45 : 1,
                  bgcolor: (theme) =>
                    selected
                      ? getOslAppShell(theme).accent
                      : alpha(theme.palette.common.white, 0.04),
                  border: (theme) =>
                    `1px solid ${
                      selected
                        ? getOslAppShell(theme).accent
                        : getOslAppShell(theme).border
                    }`,
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    bgcolor: (theme) =>
                      selected
                        ? theme.palette.primary.light
                        : alpha(getOslAppShell(theme).accent, 0.16),
                  },
                }}
              >
                <DriverAvatar name={driver.driverName} highlighted={selected} />
                <Typography
                  sx={{ flex: 1, fontWeight: 900, textTransform: "uppercase" }}
                >
                  {driver.driverName}
                </Typography>
                <Typography sx={{ width: 96, textAlign: "right", fontWeight: 800 }}>
                  {driver.tournamentWins}x
                </Typography>
                <Box sx={{ width: 40, display: "grid", placeItems: "center" }}>
                  {selected ? <CheckIcon /> : <AddIcon color="disabled" />}
                </Box>
              </ButtonBase>
            );
          })}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Drivers appear here once they have signed up with their own OSL account.
        </Typography>
      </TournamentPanel>

      <TournamentPanel
        title="Current driver list"
        action={<Chip label={`${selectedIds.length}/${MAX_DRIVERS}`} />}
        sx={{ borderColor: (theme) => getOslAppShell(theme).accent }}
      >
        {selectedDrivers.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            Pick at least {MIN_DRIVERS} drivers from the list.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {selectedDrivers.map((driver, index) => (
              <Stack
                key={driver.id}
                direction="row"
                alignItems="center"
                gap={1.5}
                sx={{
                  py: 1,
                  borderBottom: (theme) =>
                    `1px solid ${getOslAppShell(theme).border}`,
                }}
              >
                <IconButton
                  size="small"
                  aria-label={`Remove ${driver.driverName}`}
                  onClick={() => onToggle(driver.id)}
                  sx={{
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.common.white, 0.08),
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <Typography color="text.secondary" sx={{ width: 22, fontWeight: 800 }}>
                  {index + 1}
                </Typography>
                <Typography sx={{ fontWeight: 900, textTransform: "uppercase" }}>
                  {driver.driverName}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </TournamentPanel>
    </Box>
  );
}
