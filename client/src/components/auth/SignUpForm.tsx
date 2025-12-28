import {
  Box,
  TextField,
  Typography,
  Autocomplete,
  Button,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { DriverProfileChip } from "../DriverProfileChip";
import { COUNTRIES } from "../../data/countries";
import TeamPicker from "../TeamPicker";
import { TEAMS } from "../../data/team";
import { useUIStore } from "../../store/uiStore";
import { registerUser } from "../../service/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SignUpFormValues } from "../../types/auth.types";
import { useSignUpStore } from "../../store/signupStore";
import { signUpSchema, type SignUpSchema } from "./auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMobile } from "../../theme";
import BackButton from "./BackButton";

const SignUpForm = () => {
  const setField = useSignUpStore((s) => s.setField);
  const closeDialog = useUIStore((s) => s.closeAuth);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
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
      {isMobile && <BackButton />}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: { md: "700px" },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box p={4} display="flex" flexDirection="column" gap={3}>
            <Typography fontSize="28px" fontWeight="bold">
              Create new account
            </Typography>

            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
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
                  error={!!errors.password}
                  helperText={errors.password?.message}
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
                  error={!!errors.drivername}
                  helperText={errors.drivername?.message}
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
                    <TextField
                      {...params}
                      label="Country"
                      fullWidth
                      error={!!errors.country}
                      helperText={errors.country?.message}
                    />
                  )}
                />
              )}
            />

            {errors.teamId && (
              <Typography color="error" fontSize="1rem" mt={1}>
                {errors.teamId.message}
              </Typography>
            )}
            <TeamPicker control={control} teams={TEAMS} errors={errors} />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flex: 1,
            ml: { md: 4 },
            mt: { xs: 4, md: 12 },
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {!isMobile && <DriverProfileChip />}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              mt: "auto",
              mb: 4,
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
            <Typography variant="body2" sx={{ mt: 2 }}>
              Already have an account?
            </Typography>
            <Typography
              alignSelf="center"
              color="error"
              sx={{ cursor: "pointer", fontWeight: 500 }}
              onClick={() => useUIStore.getState().switchToSignIn()}
            >
              SIGN IN
            </Typography>
          </Box>
        </Box>
      </Box>
    </form>
  );
};
export default SignUpForm;
