import "../index.css";
import AppBar from "../components/AppBar";
import Footer from "../components/Footer";
import AuthDialog from "../components/auth/AuthDialog";
import { Outlet } from "react-router";

const AppLayout = () => {
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
