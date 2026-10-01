import { Stack, Typography } from "@mui/material";
import DriverFlag from "../../../pages/Tournament/components/DriverFlag";
import type { Standing } from "../../../types/tournament.types";

const SHOWN_DRIVERS = 3;

export default function TournamentMiniStandings({
  standings,
}: {
  standings: Standing[];
}) {
  return (
    <Stack component="ol" spacing={0.75} sx={{ listStyle: "none", p: 0, m: 0 }}>
      {standings.slice(0, SHOWN_DRIVERS).map((standing) => (
        <Stack
          component="li"
          key={standing.driver.id}
          direction="row"
          alignItems="center"
          gap={1.25}
        >
          <Typography sx={{ width: 18, fontWeight: 900, textAlign: "center" }}>
            {standing.position}
          </Typography>
          <DriverFlag country={standing.driver.country} size={14} />
          <Typography
            noWrap
            sx={{ flex: 1, fontWeight: 800, textTransform: "uppercase" }}
          >
            {standing.driver.driverName}
          </Typography>
          <Typography
            aria-label={`${standing.points} points`}
            sx={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 900 }}
          >
            {standing.points}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
