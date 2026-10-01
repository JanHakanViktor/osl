import { Box } from "@mui/material";
import { findTeam } from "../driverProfile";

/** Team logos range from square badges to ~3.3:1 wordmarks. */
const MAX_LOGO_ASPECT_RATIO = 3.4;

type DriverTeamLogoProps = {
  teamId: string | null;
  /** Logo height in px; wordmarks grow wider, badges stay square. */
  height?: number;
};

/** The driver's team logo, or nothing when the driver has not chosen a team. */
export default function DriverTeamLogo({
  teamId,
  height = 18,
}: DriverTeamLogoProps) {
  const team = findTeam(teamId);
  if (!team) return null;

  return (
    <Box
      component="img"
      src={team.logo}
      alt={team.name}
      title={team.name}
      sx={{
        height,
        width: "auto",
        maxWidth: height * MAX_LOGO_ASPECT_RATIO,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
}
