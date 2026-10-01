import { Box, Stack, Typography } from "@mui/material";
import type { FastestSector } from "../../../types/tournament.types";
import {
  F1_SECTOR_COLORS,
  formatLapTime,
} from "../../Telemetry/telemetryFormatters";
import TournamentPanel from "./TournamentPanel";

type FastestSectorsPanelProps = {
  sectors: FastestSector[];
};

export default function FastestSectorsPanel({ sectors }: FastestSectorsPanelProps) {
  return (
    <TournamentPanel title="Fastest sectors">
      <Stack spacing={2.5}>
        {[0, 1, 2].map((index) => {
          const sector = sectors[index] ?? null;

          return (
            <Box key={index}>
              <Typography noWrap sx={{ fontWeight: 900, textTransform: "uppercase", mb: 0.75 }}>
                {sector?.driver.driverName ?? "No valid sector"}
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 1,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    color: "common.white",
                    bgcolor: F1_SECTOR_COLORS.purple,
                  }}
                >
                  Sector {index + 1}
                </Box>
                <Typography
                  sx={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 800 }}
                >
                  {sector ? formatLapTime(sector.sectorMs) : "--:--.---"}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </TournamentPanel>
  );
}
