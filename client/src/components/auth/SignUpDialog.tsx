import { Dialog, DialogContent, Slide } from "@mui/material";
import { forwardRef } from "react";
import { useUIStore } from "../../store/uiStore";
import type { TransitionProps } from "@mui/material/transitions";
import SignUpForm from "./SignUpForm";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const SignUpDialog = () => {
  const open = useUIStore((s) => s.isOpen);
  const close = useUIStore((s) => s.closeSignUpDialog);

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="lg"
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
      <DialogContent sx={{ p: 2 }}>
        <SignUpForm />
      </DialogContent>
    </Dialog>
  );
};

export default SignUpDialog;
