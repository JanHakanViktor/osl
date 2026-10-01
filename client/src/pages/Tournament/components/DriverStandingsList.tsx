import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import type { Standing } from "../../../types/tournament.types";
import DriverAvatar from "./DriverAvatar";

type DriverStandingsListProps = {
  standings: Standing[];
};

export default function DriverStandingsList({
  standings,
}: DriverStandingsListProps) {
  return (
    <Stack component="ol" spacing={1.25} sx={{ listStyle: "none", p: 0, m: 0 }}>
      {standings.map((standing) => {
        const isLeader = standing.position === 1 && standing.points > 0;

        return (
          <Box
            component="li"
            key={standing.driver.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "36px auto minmax(0, 1fr) auto",
              alignItems: "center",
              gap: { xs: 1.25, sm: 2 },
              px: { xs: 1.5, sm: 2 },
              py: 1.25,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.common.white, 0.04),
              border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
              borderLeft: (theme) =>
                `4px solid ${
                  isLeader
                    ? getOslAppShell(theme).accent
                    : getOslAppShell(theme).borderStrong
                }`,
            }}
          >
            <Typography
              sx={{ fontWeight: 900, fontSize: "1.35rem", textAlign: "center" }}
            >
              {standing.position}
            </Typography>
            <DriverAvatar name={standing.driver.driverName} highlighted={isLeader} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontWeight: 900, textTransform: "uppercase" }}
              >
                {standing.driver.driverName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {standing.roundWins} track {standing.roundWins === 1 ? "win" : "wins"}
              </Typography>
            </Box>
            <Typography
              aria-label={`${standing.points} points`}
              sx={{
                minWidth: 56,
                textAlign: "right",
                fontFamily: "'Roboto Mono', monospace",
                fontSize: { xs: "1.8rem", sm: "2.2rem" },
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {standing.points}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}
