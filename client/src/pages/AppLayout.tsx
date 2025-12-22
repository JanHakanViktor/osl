import "../index.css";
import AppBar from "../components/AppBar";
import Footer from "../components/Footer";
import AuthDialog from "../components/auth/AuthDialog";
import { Outlet } from "react-router";
import { useCurrentUser } from "../components/auth/auth.queries";

const AppLayout = () => {
  useCurrentUser();
  return (
    <>
      <AppBar />
      <Outlet />
      <AuthDialog />
      <Footer />
    </>
  );
};

export default AppLayout;
