import { Outlet, useNavigate } from "react-router";
import { useCurrentUser } from "../components/auth/auth.queries";
import { useEffect } from "react";
import { useUIStore } from "../store/uiStore";

export default function ProtectedRoute() {
  const { data: user, isLoading } = useCurrentUser();
  const openSignInDialog = useUIStore((s) => s.openSignInDialog);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/", { replace: true });
      openSignInDialog("You are not signed in. Sign in to create a session.");
    }
  }, [isLoading, user, openSignInDialog, navigate]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return <Outlet />;
}
