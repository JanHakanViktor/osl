import { IconButton, Box, type SxProps } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useUIStore } from "../../store/uiStore";
import { useNavigate } from "react-router";

interface BackButtonProps {
  path?: string;
  sx?: SxProps;
}

const BackButton = ({ path, sx, ...BoxProps }: BackButtonProps) => {
  const navigate = useNavigate();
  const closeAuth = useUIStore((s) => s.closeAuth);
  const closeDrawer = useUIStore((s) => s.closeDrawer);

  const handleBackNagivation = () => {
    closeAuth();
    closeDrawer();
    if (path) {
      navigate(path);
    }
  };

  return (
    <Box sx={sx} {...BoxProps}>
      <IconButton onClick={handleBackNagivation} size="large" color="error">
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );
};

export default BackButton;
