import "../index.css";
import AppBar from "../components/AppBar";
import Footer from "../components/Footer";
import AuthDialog from "../components/auth/AuthDialog";
import { Outlet } from "react-router";
import { useCurrentUser } from "../components/auth/auth.queries";
import { Box } from "@mui/material";

const AppLayout = () => {
  useCurrentUser();
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <AppBar />
      <Box component="main" flex="1">
        <Outlet />
      </Box>
      <AuthDialog />
      <Footer />
    </Box>
  );
};

export default AppLayout;
