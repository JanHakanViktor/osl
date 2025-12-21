import {
  Box,
  TextField,
  Typography,
  Autocomplete,
  Button,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { DriverProfileChip } from "../DriverProfileChip";
import { COUNTRIES } from "../../service/countries";
import TeamPicker from "../TeamPicker";
import { TEAMS } from "../../data/team";
import { useUIStore } from "../../store/uiStore";
import { registerUser } from "../../service/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SignUpFormValues } from "../../types/auth.types";
import { useSignUpStore } from "../../store/signupStore";

const SignUpForm = () => {
  const setField = useSignUpStore((s) => s.setField);
  const closeDialog = useUIStore((s) => s.closeAuth);
  const queryClient = useQueryClient();

  const { handleSubmit, control } = useForm<SignUpFormValues>({
    defaultValues: {
      username: "",
      password: "",
      drivername: "",
      country: "",
      teamId: null,
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      closeDialog();
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });

  const onSubmit = (data: SignUpFormValues) => {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      drivername: data.drivername,
      country: data.country,
      teamId: data.teamId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box sx={{ display: "flex", flexDirection: "row", height: "700px" }}>
        <Box sx={{ flex: 1 }}>
          <Box p={4} display="flex" flexDirection="column" gap={3}>
            <Typography fontSize="28px" fontWeight="bold">
              Create new account
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
        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? "Creating..." : "Create account"}
        </Button>
      </Box>
      <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
        Already have an account?{" "}
        <Typography
          component="span"
          color="error"
          sx={{ cursor: "pointer", fontWeight: 500 }}
          onClick={() => useUIStore.getState().switchToSignIn()}
        >
          SIGN IN
        </Typography>
      </Typography>
    </form>
  );
};
export default SignUpForm;
