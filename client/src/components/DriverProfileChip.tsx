import { Box, Typography } from "@mui/material";
import "flag-icons/css/flag-icons.min.css";
import { TEAMS } from "../data/team";
import TeamLogo from "./TeamLogo";

export interface DriverProfile {
  id: string;
  name: string;
  country?: string;
  teamId?: string;
}

type DriverProfileProps = {
  driver: DriverProfile;
};

export function DriverProfileChip({ driver }: DriverProfileProps) {
  const team =
    TEAMS.find((t) => t.id === driver.teamId) ??
    TEAMS.find((t) => t.id === "redbull");

  const getSurnameAbbreviation = (drivername: string) =>
    drivername.split(/\s+/).slice(1).join(" ").slice(0, 3).toUpperCase() ||
    "VER";

  return (
    <Box
      display="flex"
      width={500}
      height={125}
      overflow="hidden"
      border="2px solid #86868659"
      borderRadius="10px"
      mb={4}
    >
      <Box
        sx={{
          display: "flex",
          flex: 0.5,
        }}
      >
        {(driver.country && (
          <span
            className={`fi fi-${driver.country ?? "nl".toLowerCase()}`}
            style={{
              width: "161px",
            }}
          />
        )) || (
          <span
            className={`fi fi-nl`}
            style={{
              width: "161px",
            }}
          ></span>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-start",
          flexDirection: "column",
          pl: 2,
          pt: 2,
        }}
      >
        <Typography fontSize="18px" fontWeight="bold">
          {driver.name.toUpperCase() || "MAX VERSTAPPEN"}
        </Typography>
        <Typography fontSize="24px" fontWeight="bold">
          {getSurnameAbbreviation(driver.name)}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {team && <TeamLogo src={team.logo} alt={team.name} size={100} />}
      </Box>
    </Box>
  );
}
