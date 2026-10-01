import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import type { TournamentDriver } from "../../../types/tournament.types";
import DriverFlag from "./DriverFlag";
import DriverTeamLogo from "./DriverTeamLogo";

type DriverCaptionProps = {
  driver: TournamentDriver;
  children?: ReactNode;
};

/** The line under a driver's name: flag, team logo, then a short caption. */
export default function DriverCaption({ driver, children }: DriverCaptionProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      columnGap={1}
      rowGap={0.25}
      sx={{ minWidth: 0 }}
    >
      <DriverFlag country={driver.country} size={13} />
      <DriverTeamLogo teamId={driver.teamId} height={14} />
      {children != null && (
        <Typography variant="caption" color="text.secondary">
          {children}
        </Typography>
      )}
    </Stack>
  );
}
