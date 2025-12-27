import { Box, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import { useSignUpStore } from "../store/signupStore";
import type { Control, FieldErrors } from "react-hook-form";
import type { Team } from "../types/team.types";
import TeamLogo from "./TeamLogo";
import type { SignUpFormValues } from "../types/auth.types";

type Props = {
  control: Control<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
  teams: Team[];
};

const TeamPicker = ({ control, teams }: Props) => {
  const setField = useSignUpStore((s) => s.setField);

  return (
    <Box>
      <Typography fontWeight="bold" mb={1}>
        Choose team
      </Typography>

      <Controller
        name="teamId"
        control={control}
        render={({ field }) => (
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              maxHeight: 300,
              overflowY: "auto",
              backgroundColor: "#7e7e7e1e",
              p: 4,
              borderRadius: "10px",
            }}
          >
            {teams.map((team) => {
              const selected = field.value === team.id;

              return (
                <Box
                  key={team.id}
                  onClick={() => {
                    field.onChange(team.id);
                    setField("teamId", team.id);
                  }}
                  sx={{
                    width: 64,
                    height: 64,
                    cursor: "pointer",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    filter: selected ? "none" : "grayscale(1)",
                    opacity: selected ? 1 : 0.4,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      opacity: 0.8,
                    },
                  }}
                >
                  <TeamLogo src={team.logo} alt={team.name} size={60} />
                </Box>
              );
            })}
          </Box>
        )}
      />
    </Box>
  );
};

export default TeamPicker;
