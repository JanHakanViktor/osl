import "../index.css";
import AppBar from "../components/AppBar";
import Footer from "../components/Footer";
import AuthDialog from "../components/auth/AuthDialog";
import { Outlet, useLocation } from "react-router";
import { useCurrentUser } from "../components/auth/auth.queries";
import { Box } from "@mui/material";

const AppLayout = () => {
  useCurrentUser();
  const location = useLocation();
  const isLiveTelemetryPage = /^\/sessions\/[^/]+\/live$/.test(
    location.pathname,
  );

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      {!isLiveTelemetryPage && <AppBar />}
      <Box component="main" flex="1">
        <Outlet />
      </Box>
      <AuthDialog />
      {!isLiveTelemetryPage && <Footer />}
    </Box>
  );
};

export default AppLayout;
