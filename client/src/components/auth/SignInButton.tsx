import { Button } from "@mui/material";
import { useUIStore } from "../../store/uiStore";
import { useCurrentUser } from "./auth.queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../service/auth";

const SignInButton = () => {
  const openSignInDialog = useUIStore((s) => s.openSignInDialog);
  const { data: user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  const signedIn = !!user;

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  if (isLoading) return null;

  return (
    <>
      {!signedIn && (
        <Button
          sx={{ ml: 4, py: 2, px: 4, fontSize: "20px", color: "white" }}
          variant="contained"
          color="error"
          onClick={openSignInDialog}
        >
          Sign in
        </Button>
      )}
      {signedIn && (
        <Button
          sx={{ ml: 4, py: 2, px: 4, fontSize: "20px", color: "white" }}
          variant="contained"
          color="primary"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </Button>
      )}
    </>
  );
};
export default SignInButton;
