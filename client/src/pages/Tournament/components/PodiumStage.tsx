import { Box, Stack, Typography } from "@mui/material";
import { getOslAppShell } from "../../../theme";
import type { Standing } from "../../../types/tournament.types";
import { driverCode, formatPoints } from "../tournamentFormatters";
import DriverFlag from "./DriverFlag";
import DriverTeamLogo from "./DriverTeamLogo";

/** Podium heights in px for P1, P2 and P3. */
const STEP_HEIGHTS: Record<number, { xs: number; md: number }> = {
  1: { xs: 170, md: 250 },
  2: { xs: 125, md: 180 },
  3: { xs: 95, md: 135 },
};
/** Lower places rise first, the winner last. */
const RISE_DELAY_S: Record<number, number> = { 3: 0.1, 2: 0.45, 1: 0.8 };

type PodiumStageProps = {
  standings: Standing[];
};

export default function PodiumStage({ standings }: PodiumStageProps) {
  const [first, second, third] = standings;
  const steps = [second, first, third].filter(
    (standing): standing is Standing => standing != null,
  );

  return (
    <Box
      role="img"
      aria-label={steps
        .map((standing) => `P${standing.position} ${standing.driver.driverName}`)
        .join(", ")}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: { xs: 1, md: 1.5 },
        pt: 4,
        pb: 3,
        borderBottom: (theme) => `2px solid ${getOslAppShell(theme).borderStrong}`,
      }}
    >
      {steps.map((standing) => {
        const height = STEP_HEIGHTS[standing.position];
        const isWinner = standing.position === 1;

        return (
          <Box
            key={standing.driver.id}
            sx={{
              width: { xs: "31%", md: 200 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              flexWrap="wrap"
              gap={1}
              sx={{ mb: 1 }}
            >
              <DriverFlag
                country={standing.driver.country}
                size={isWinner ? 24 : 18}
              />
              <DriverTeamLogo
                teamId={standing.driver.teamId}
                height={isWinner ? 28 : 22}
              />
            </Stack>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: isWinner
                  ? { xs: "2.6rem", md: "4.4rem" }
                  : { xs: "1.9rem", md: "3.2rem" },
                lineHeight: 1,
              }}
            >
              {driverCode(standing.driver.driverName)}
            </Typography>
            <Typography
              noWrap
              sx={{ maxWidth: "100%", fontWeight: 800, color: "text.secondary", mb: 1 }}
            >
              {standing.driver.driverName}
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: { xs: height.xs, md: height.md },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                pt: 1.5,
                borderRadius: "14px 14px 4px 4px",
                bgcolor: (theme) => getOslAppShell(theme).accent,
                border: "3px solid rgba(0, 0, 0, 0.55)",
                boxShadow: (theme) =>
                  isWinner ? getOslAppShell(theme).accentGlow : "none",
                transformOrigin: "bottom",
                animation: `podiumRise 0.7s ${RISE_DELAY_S[standing.position]}s cubic-bezier(0.2, 0.8, 0.2, 1) both`,
                "@keyframes podiumRise": {
                  from: { transform: "scaleY(0)", opacity: 0 },
                  to: { transform: "scaleY(1)", opacity: 1 },
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: isWinner
                    ? { xs: "3.4rem", md: "5.4rem" }
                    : { xs: "2.6rem", md: "4rem" },
                  lineHeight: 1,
                  color: "common.white",
                }}
              >
                {standing.position}
              </Typography>
              <Typography sx={{ fontWeight: 900, color: "common.white" }}>
                {formatPoints(standing.points)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
