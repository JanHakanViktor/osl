import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import { formatLapTime } from "../telemetryFormatters";
import type { CompletedLap } from "../telemetryTypes";

type CompletedLapsListProps = {
  laps: CompletedLap[];
};

const sectorLabels = ["S1", "S2", "S3"] as const;

export default function CompletedLapsList({ laps }: CompletedLapsListProps) {
  const visibleLaps = [...laps].reverse();

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 360,
        p: { xs: 2, md: 2.5 },
        borderRadius: 2,
        backgroundColor: (theme) => alpha(getOslAppShell(theme).surfaceRaised, 0.88),
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
      }}
    >
      <Typography
        sx={{
          mb: 2,
          fontSize: { xs: "1.25rem", md: "1.6rem" },
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        Completed Laps
      </Typography>

      {visibleLaps.length === 0 ? (
        <Typography color="text.secondary">No completed laps yet</Typography>
      ) : (
        <Stack spacing={1}>
          {visibleLaps.map((lap) => {
            const sectors = [lap.sector1Ms, lap.sector2Ms, lap.sector3Ms];

            return (
              <Box
                key={lap.lapNumber}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.common.white, 0.06),
                  borderLeft: `4px solid ${lap.valid ? "#00E701" : "#8f9299"}`,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.85 }}
                >
                  <Typography sx={{ color: "text.secondary", fontWeight: 900 }}>
                    Lap {lap.lapNumber}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: "1.15rem",
                      fontWeight: 900,
                      color: lap.valid ? "#00E701" : "text.secondary",
                    }}
                  >
                    {formatLapTime(lap.lapTimeMs)}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 0.5,
                  }}
                >
                  {sectors.map((sectorMs, index) => (
                    <Box
                      key={sectorLabels[index]}
                      sx={{
                        minWidth: 0,
                        px: 1,
                        py: 0.75,
                        borderRadius: 1,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.common.black, 0.18),
                      }}
                    >
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.72rem",
                          fontWeight: 900,
                        }}
                      >
                        {sectorLabels[index]}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Roboto Mono', monospace",
                          fontSize: "0.95rem",
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatLapTime(sectorMs)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
