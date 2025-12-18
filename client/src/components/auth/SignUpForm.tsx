import { Box, TextField, Typography, Autocomplete } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useSignUpStore } from "../../store/signupStore";
import { DriverProfileChip } from "../DriverProfileChip";
import { COUNTRIES } from "./countries";

export type SignUpFormValues = {
  username: string;
  password: string;
  country: string;
  teamId: string | null;
};

const SignUpForm = () => {
  const setField = useSignUpStore((s) => s.setField);

  const form = useForm<SignUpFormValues>({
    defaultValues: {
      username: "",
      password: "",
      country: "",
      teamId: null,
    },
  });

  const { control } = form;

  return (
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
          <Box sx={{ width: "300px", height: "150px" }}>
            TEAM SELECTOR TO BE BUILT
          </Box>
        </Box>
      </Box>
      <Box sx={{ flex: 1, ml: 4, mt: 20 }}>
        <DriverProfileChip />
      </Box>
    </Box>
  );
};
export default SignUpForm;
