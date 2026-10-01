import { Box, Stack, Typography } from "@mui/material";
import { getOslAppShell } from "../../../theme";
import type { TournamentAwards } from "../../../types/tournament.types";
import { formatSpeed } from "../tournamentFormatters";
import TournamentPanel from "./TournamentPanel";

type Award = {
  title: string;
  driverName: string | null;
  value: string;
  detail?: string;
};

function AwardRow({ title, driverName, value, detail }: Award) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography sx={{ fontWeight: 900, fontSize: "1.35rem", textTransform: "uppercase" }}>
        {title}
      </Typography>
      <Typography sx={{ fontWeight: 800, textTransform: "uppercase" }}>
        {driverName ?? "Nobody yet"}
      </Typography>
      {detail && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {detail}
        </Typography>
      )}
      <Box
        sx={{
          display: "inline-block",
          mt: 0.75,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          border: (theme) => `1px solid ${getOslAppShell(theme).borderStrong}`,
          fontFamily: "'Roboto Mono', monospace",
          fontSize: "1.4rem",
          fontWeight: 900,
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

export default function AwardsPanel({ awards }: { awards: TournamentAwards }) {
  const rows: Award[] = [
    {
      title: "Most track wins",
      driverName: awards.mostRoundWins?.driver.driverName ?? null,
      value: `${awards.mostRoundWins?.count ?? 0}x`,
    },
    {
      title: "Top speed",
      driverName: awards.topSpeed?.driver.driverName ?? null,
      value: awards.topSpeed ? formatSpeed(awards.topSpeed.speedKmh) : "--",
      detail: awards.topSpeed?.circuit.grandPrix,
    },
    {
      title: "Most clean laps",
      driverName: awards.mostCleanLaps?.driver.driverName ?? null,
      value: `${awards.mostCleanLaps?.count ?? 0}x`,
    },
  ];

  return (
    <TournamentPanel title="Awards">
      <Stack spacing={3}>
        {rows.map((row) => (
          <AwardRow key={row.title} {...row} />
        ))}
      </Stack>
    </TournamentPanel>
  );
}
