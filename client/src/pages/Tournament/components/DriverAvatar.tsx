import { Avatar } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../theme";
import { driverInitials } from "../tournamentFormatters";

type DriverAvatarProps = {
  name: string;
  size?: number;
  highlighted?: boolean;
};

export default function DriverAvatar({
  name,
  size = 40,
  highlighted = false,
}: DriverAvatarProps) {
  return (
    <Avatar
      aria-hidden
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        fontWeight: 900,
        color: "common.white",
        bgcolor: (theme) =>
          highlighted
            ? getOslAppShell(theme).accent
            : alpha(theme.palette.common.white, 0.1),
        border: (theme) =>
          `2px solid ${
            highlighted
              ? alpha(theme.palette.common.white, 0.7)
              : getOslAppShell(theme).borderStrong
          }`,
      }}
    >
      {driverInitials(name)}
    </Avatar>
  );
}
