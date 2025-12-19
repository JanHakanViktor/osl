import {
  Box,
  TextField,
  Typography,
  Autocomplete,
  Button,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useSignUpStore } from "../../store/signupStore";
import { DriverProfileChip } from "../DriverProfileChip";
import { COUNTRIES } from "./countries";
import TeamPicker from "./TeamPicker";
import { TEAMS } from "../../data/team";

export type SignUpFormValues = {
  username: string;
  password: string;
  drivername: string;
  country: string;
  teamId: string | null;
};

const SignUpForm = () => {
  const setField = useSignUpStore((s) => s.setField);

  const form = useForm<SignUpFormValues>({
    defaultValues: {
      username: "",
      password: "",
      drivername: "",
      country: "",
      teamId: "",
    },
  });

  const { control } = form;

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", height: "700px" }}>
        <Box sx={{ flex: 1 }}>
          <Box p={4} display="flex" flexDirection="column" gap={3}>
            <Typography fontSize="28px" fontWeight="bold">
              Sign up
            </Typography>

            <Controller
              name="username"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e);
                    setField("username", e.target.value);
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ required: true, minLength: 6 }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="password"
                  label="Password"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e);
                    setField("password", e.target.value);
                  }}
                />
              )}
            />

            <Controller
              name="drivername"
              control={control}
              rules={{ required: true, minLength: 6 }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="drivername"
                  label="Driver Name"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e);
                    setField("drivername", e.target.value);
                  }}
                />
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={COUNTRIES}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, value) => {
                    field.onChange(value?.code ?? "");
                    setField("country", value?.code ?? "");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Country" fullWidth />
                  )}
                />
              )}
            />
            <TeamPicker control={control} teams={TEAMS} />
          </Box>
        </Box>
        <Box sx={{ flex: 1, ml: 4, mt: 12 }}>
          <DriverProfileChip />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button>Sign Up</Button>
      </Box>
    </>
  );
};
export default SignUpForm;
