import { Box, Typography } from "@mui/material";
import { useSignUpStore } from "../store/signupStore";
import "flag-icons/css/flag-icons.min.css";
import { TEAMS } from "../data/team";
import TeamLogo from "./TeamLogo";

export function DriverProfileChip() {
  const { drivername, country, teamId } = useSignUpStore();
  const team = TEAMS.find((t) => t.id === teamId);

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
    >
      <Box
        sx={{
          display: "flex",
          flex: 0.5,
        }}
      >
        <span
          className={`fi fi-${country.toLowerCase()}`}
          style={{
            width: "161px",
          }}
        />
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
          {drivername.toUpperCase() || "MAX VERSTAPPEN"}
        </Typography>
        <Typography fontSize="24px" fontWeight="bold">
          {getSurnameAbbreviation(drivername)}
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
