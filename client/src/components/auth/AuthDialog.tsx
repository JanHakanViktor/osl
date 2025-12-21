import { Dialog, DialogContent, Slide } from "@mui/material";
import { forwardRef } from "react";
import { useUIStore } from "../../store/uiStore";
import type { TransitionProps } from "@mui/material/transitions";
import SignUpForm from "./SignUpForm";
import SignInForm from "./SignInForm";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const AuthDialog = () => {
  const open = useUIStore((s) => s.isOpen);
  const close = useUIStore((s) => s.closeAuth);
  const mode = useUIStore((s) => s.authMode);

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth={mode === "sign-up" ? "lg" : "xs"}
      disableScrollLock
      slots={{
        transition: Transition,
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(0,0,0,0.4)",
          },
        },
        paper: {
          sx: {
            borderRadius: "10px",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogContent sx={{ p: mode === "sign-in" ? 2 : null }}>
        {mode === "sign-in" && <SignInForm />}
        {mode === "sign-up" && <SignUpForm />}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
