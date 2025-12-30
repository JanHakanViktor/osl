import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "../../service/auth";
import { useUIStore } from "../../store/uiStore";
import type { AuthUser, LoginFormValues } from "../../types/auth.types";
import BackButton from "./BackButton";

const logo = "/osl_logo.png";

const SignInForm = () => {
  const queryClient = useQueryClient();
  const closeDialog = useUIStore((s) => s.closeAuth);
  const switchToSignUp = useUIStore((s) => s.switchToSignUp);
  const authMessage = useUIStore((s) => s.authMessage);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation<AuthUser, Error, LoginFormValues>({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      closeDialog();
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <BackButton />
      <Box display="flex" justifyContent="center">
        <img src={logo} style={{ maxWidth: 200 }} />
      </Box>

      {authMessage && (
        <Typography color="error" textAlign="center" mb={2}>
          {authMessage}
        </Typography>
      )}

      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        p={{ xs: 2, sm: 4 }}
        width="100%"
      >
        {loginMutation.isError && (
          <Typography color="error" textAlign="center">
            {loginMutation.error.message}
          </Typography>
        )}
        <Controller
          name="username"
          control={control}
          rules={{ required: "Username is required" }}
          render={({ field }) => (
            <TextField {...field} label="Username" fullWidth autoFocus />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{ required: "Password is required" }}
          render={({ field }) => (
            <TextField {...field} type="password" label="Password" fullWidth />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={loginMutation.isPending}
          size="large"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>

        <Divider />
        <Typography
          variant="body2"
          textAlign="center"
          mt={2}
          fontStyle="italic"
        >
          Passwords cannot be recovered. Lost your password or need to create an
          account?
        </Typography>
        <Typography
          color="error"
          textAlign="center"
          sx={{
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={switchToSignUp}
        >
          REGISTER HERE
        </Typography>
      </Box>
    </form>
  );
};

export default SignInForm;
