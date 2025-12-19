import { Button } from "@mui/material";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

const SignInButton = () => {
  const openSignUpDialog = useUIStore((s) => s.openSignUpDialog);
  const { signedIn, clearUser } = useAuthStore();

  return (
    <>
      {!signedIn && (
        <Button
          sx={{ ml: 4, py: 2, px: 4, fontSize: "20px", color: "white" }}
          variant="contained"
          color="error"
          onClick={openSignUpDialog}
        >
          Sign in
        </Button>
      )}
      {signedIn && (
        <Button
          sx={{ ml: 4, py: 2, px: 4, fontSize: "20px", color: "white" }}
          variant="contained"
          color="primary"
          onClick={clearUser}
        >
          Sign out
        </Button>
      )}
    </>
  );
};
export default SignInButton;
