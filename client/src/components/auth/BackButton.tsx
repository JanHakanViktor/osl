import { IconButton, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useUIStore } from "../../store/uiStore";

const AuthBackButton = () => {
  const closeAuth = useUIStore((s) => s.closeAuth);
  const closeDrawer = useUIStore((s) => s.closeDrawer);

  const handleBackNagivation = () => {
    closeAuth();
    closeDrawer();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <IconButton onClick={handleBackNagivation} size="large" color="error">
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );
};

export default AuthBackButton;
