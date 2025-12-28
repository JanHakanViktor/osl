import { IconButton, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { useUIStore } from "../../store/uiStore";

const AuthBackButton = () => {
  const navigate = useNavigate();
  const closeAuth = useUIStore((s) => s.closeAuth);
  const closeDrawer = useUIStore((s) => s.closeDrawer);

  const handleBackNagivation = () => {
    closeAuth();
    closeDrawer();
    navigate("/");
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
