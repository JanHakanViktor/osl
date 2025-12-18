import { Box, Typography } from "@mui/material";
import { useSignUpStore } from "../store/signupStore";
import "flag-icons/css/flag-icons.min.css";
import { TEAMS } from "../data/team";
import TeamLogo from "./TeamLogo";

export function DriverProfileChip() {
  const { username, country, teamId } = useSignUpStore();
  const team = TEAMS.find((t) => t.id === teamId);

  return (
    <Box
      display="flex"
      bgcolor="#fff"
      border="2px solid black"
      borderRadius="10px"
      width={500}
      height={125}
      overflow="hidden"
    >
      <Box
        sx={{
          width: 150,
          height: "100%",
        }}
      >
        <span
          className={`fi fi-${country ?? "se"}`}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-start",
          pl: 2,
          pt: 2,
        }}
      >
        <Typography fontSize="18px" fontWeight="bold">
          {username.toUpperCase() || "FIRSTNAME SURNAME"}
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
