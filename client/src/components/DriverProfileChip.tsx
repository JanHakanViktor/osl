import { Box, Typography } from "@mui/material";
import { useSignUpStore } from "../store/signupStore";
import "flag-icons/css/flag-icons.min.css";

export function DriverProfileChip() {
  const { username, country, teamId } = useSignUpStore();

  return (
    <Box
      display="flex"
      flexDirection="row"
      bgcolor="#fff"
      border="2px solid black"
      borderRadius="10px"
      width={500}
      height={150}
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
          alignItems: "center",
          paddingLeft: 2,
        }}
      >
        <Typography fontSize="18px" fontWeight="bold">
          {username || "FIRSTNAME SURNAME"}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingRight: 2,
        }}
      >
        {teamId && <img src={teamId} height={60} alt="Team logo" />}
      </Box>
    </Box>
  );
}
