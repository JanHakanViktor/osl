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
    py: isMobile ? 1.1 : 1.25,
    px: isMobile ? 2 : 2.5,
    width: isMobile ? "100%" : "auto",
    minHeight: isMobile ? 44 : 44,
    borderRadius: 2,
    fontSize: isMobile ? "16px" : "14px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0,
    whiteSpace: "nowrap",
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.28)",
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
