import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import type { RoundResult } from "../../../types/tournament.types";
import { formatLapTime } from "../../Telemetry/telemetryFormatters";
import { describeBonuses, formatPoints } from "../tournamentFormatters";
import DriverAvatar from "./DriverAvatar";

type RoundClassificationProps = {
  results: RoundResult[];
  lapsTarget: number;
  showPoints: boolean;
};

function lapSummary(result: RoundResult, lapsTarget: number): string {
  const invalid = result.lapsCompleted - result.validLaps;
  const parts = [`${result.lapsCompleted}/${lapsTarget} laps`];
  if (invalid > 0) parts.push(`${invalid} invalid`);
  if (result.endReason === "ENDED_BY_HOST") parts.push("ended early");
  return parts.join(" · ");
}

export default function RoundClassification({
  results,
  lapsTarget,
  showPoints,
}: RoundClassificationProps) {
  return (
    <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
      {results.map((result) => (
        <Box
          component="li"
          key={result.driver.id}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "26px minmax(0, 1fr) auto",
              sm: "40px minmax(0, 1fr) auto",
            },
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "1.6rem", sm: "2.2rem" },
              fontWeight: 900,
              textAlign: "center",
              color: result.position == null ? "text.disabled" : "text.primary",
            }}
          >
            {result.position ?? "–"}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: { xs: "wrap", sm: "nowrap" },
              alignItems: "center",
              columnGap: 1.5,
              rowGap: 0.5,
              px: { xs: 1.5, sm: 2 },
              py: 1.5,
              minWidth: 0,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.common.white, 0.04),
              border: (theme) =>
                `1px solid ${
                  result.position === 1
                    ? getOslAppShell(theme).accent
                    : getOslAppShell(theme).border
                }`,
            }}
          >
            <DriverAvatar
              name={result.driver.driverName}
              highlighted={result.position === 1}
            />
            <Box
              sx={{
                minWidth: 0,
                flex: 1,
                flexBasis: { xs: "calc(100% - 56px)", sm: "auto" },
              }}
            >
              <Typography noWrap sx={{ fontWeight: 900, textTransform: "uppercase" }}>
                {result.driver.driverName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lapSummary(result, lapsTarget)}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: { xs: "1.3rem", sm: "1.8rem" },
                fontWeight: 900,
                whiteSpace: "nowrap",
                flexBasis: { xs: "100%", sm: "auto" },
                pl: { xs: 7, sm: 0 },
              }}
            >
              {result.bestLapMs ? formatLapTime(result.bestLapMs) : "NO TIME"}
            </Typography>
          </Box>

          {showPoints ? (
            <Stack alignItems="flex-end" spacing={0.5} sx={{ minWidth: { xs: 0, sm: 72 } }}>
              <Chip
                label={`+${formatPoints(result.points)}`}
                color={result.points > 0 ? "primary" : "default"}
                sx={{ fontWeight: 900 }}
              />
              {describeBonuses(result).map((bonus) => (
                <Typography key={bonus} variant="caption" color="text.secondary">
                  {bonus}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Box sx={{ minWidth: 72 }} />
          )}
        </Box>
      ))}
    </Stack>
  );
}
