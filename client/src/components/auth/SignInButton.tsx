import { Button } from "@mui/material";
import { useUIStore } from "../../store/uiStore";
import { useCurrentUser } from "./auth.queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../service/auth";
import { useIsMobile } from "../../theme";

const SignInButton = () => {
  const openSignInDialog = useUIStore((s) => s.openSignInDialog);
  const { data: user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  const isMobile = useIsMobile();

  const signedIn = !!user;

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  if (isLoading) return null;

  const buttonSx = {
    py: isMobile ? 1 : 2,
    px: isMobile ? 2 : 4,
    ml: isMobile ? 4 : 4,
    mb: isMobile ? 4 : 0,
    mt: isMobile ? "auto" : "none",
    width: isMobile ? "75%" : "100%",
    fontSize: isMobile ? "16px" : "20px",
  };

  return (
    <>
      {!signedIn && (
        <Button
          sx={buttonSx}
          variant="contained"
          color="error"
          onClick={() => {
            closeDrawer();
            openSignInDialog();
          }}
        >
          Sign in
        </Button>
      )}
      {signedIn && (
        <Button
          sx={buttonSx}
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
