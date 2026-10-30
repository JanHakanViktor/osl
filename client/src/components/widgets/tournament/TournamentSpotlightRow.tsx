import CasinoIcon from "@mui/icons-material/Casino";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import DriverAvatar from "../../../pages/Tournament/components/DriverAvatar";
import DriverCaption from "../../../pages/Tournament/components/DriverCaption";
import { formatPoints } from "../../../pages/Tournament/tournamentFormatters";
import { formatLapTime } from "../../../pages/Telemetry/telemetryFormatters";
import { getOslAppShell } from "../../../theme";
import type { TournamentSpotlight } from "../tournamentSpotlight";

function SpotlightFrame({
  icon,
  label,
  title,
  caption,
  aside,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  caption: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.common.white, 0.04),
        border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
      }}
    >
      {icon}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            display: "block",
            lineHeight: 1.4,
            fontWeight: 800,
            color: (theme) => getOslAppShell(theme).accent,
          }}
        >
          {label}
        </Typography>
        <Typography noWrap sx={{ fontWeight: 900, textTransform: "uppercase" }}>
          {title}
        </Typography>
        {caption}
      </Box>
      {aside}
    </Stack>
  );
}

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        color: (theme) => getOslAppShell(theme).warningAccent,
        bgcolor: (theme) => alpha(getOslAppShell(theme).warningAccent, 0.14),
      }}
    >
      {children}
    </Box>
  );
}

const captionSx = { color: "text.secondary", fontSize: "0.85rem" } as const;

export default function TournamentSpotlightRow({
  spotlight,
}: {
  spotlight: TournamentSpotlight;
}) {
  switch (spotlight.kind) {
    case "live":
      return (
        <SpotlightFrame
          icon={<DriverAvatar name={spotlight.driver.driverName} highlighted />}
          label={`On track · ${spotlight.circuit.grandPrix}`}
          title={spotlight.driver.driverName}
          caption={<DriverCaption driver={spotlight.driver} />}
          aside={
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                Lap {Math.min(spotlight.lapsCompleted + 1, spotlight.lapsTarget)}/
                {spotlight.lapsTarget}
              </Typography>
              <Typography sx={captionSx}>
                Best {formatLapTime(spotlight.bestLapMs)}
              </Typography>
            </Box>
          }
        />
      );
    case "upNext":
      return (
        <SpotlightFrame
          icon={<DriverAvatar name={spotlight.driver.driverName} />}
          label="Up next"
          title={spotlight.driver.driverName}
          caption={
            <Typography sx={captionSx}>
              Loading {spotlight.circuit.grandPrix} on the rig
            </Typography>
          }
        />
      );
    case "nextTrack":
      return (
        <SpotlightFrame
          icon={
            <IconBadge>
              <CasinoIcon />
            </IconBadge>
          }
          label={`Round ${spotlight.roundNumber}`}
          title={spotlight.circuit.grandPrix}
          caption={
            <Typography sx={captionSx}>
              Waiting for the dice to pick the next driver
            </Typography>
          }
        />
      );
    case "champion":
      return (
        <SpotlightFrame
          icon={
            <IconBadge>
              <EmojiEventsIcon />
            </IconBadge>
          }
          label="Champion"
          title={spotlight.driver.driverName}
          caption={
            <DriverCaption driver={spotlight.driver}>
              {formatPoints(spotlight.points)}
            </DriverCaption>
          }
        />
      );
  }
}
