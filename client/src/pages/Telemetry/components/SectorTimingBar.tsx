import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import { F1_SECTOR_COLORS, formatLapTime } from "../telemetryFormatters";
import type { SectorDisplay } from "../telemetryTypes";

type SectorTimingBarProps = {
  sectors: SectorDisplay[];
};

export default function SectorTimingBar({ sectors }: SectorTimingBarProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        borderBottom: (theme) => `1px solid ${getOslAppShell(theme).border}`,
        boxShadow: "0 20px 44px rgba(0, 0, 0, 0.24)",
      }}
    >
      {sectors.map((sector) => {
        const backgroundColor = F1_SECTOR_COLORS[sector.status];
        const isMuted = sector.status === "muted";

        return (
          <Stack
            key={sector.label}
            spacing={0.5}
            sx={{
              minHeight: { xs: 92, md: 116 },
              justifyContent: "center",
              alignItems: "center",
              px: 2,
              color: isMuted ? "text.primary" : "#050505",
              backgroundColor,
              borderRight: {
                xs: 0,
                md: (theme) => `1px solid ${alpha(theme.palette.common.black, 0.28)}`,
              },
              backgroundImage: isMuted
                ? (theme) =>
                    `linear-gradient(135deg, ${alpha(
                      getOslAppShell(theme).surfaceGlass,
                      0.9,
                    )}, ${alpha(getOslAppShell(theme).surfaceStrong, 0.72)})`
                : "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(0,0,0,0.08))",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.72rem", md: "0.82rem" },
                fontWeight: 900,
                lineHeight: 1,
                textTransform: "uppercase",
                opacity: isMuted ? 0.7 : 0.8,
              }}
            >
              {sector.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: { xs: "2.4rem", sm: "3.4rem", lg: "4.4rem" },
                fontWeight: 900,
                lineHeight: 0.96,
              }}
            >
              {formatLapTime(sector.valueMs)}
            </Typography>
          </Stack>
        );
      })}
    </Box>
  );
}
