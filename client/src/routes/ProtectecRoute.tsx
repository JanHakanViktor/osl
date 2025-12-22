import { Outlet } from "react-router";
import { useCurrentUser } from "../components/auth/auth.queries";
import { useEffect } from "react";
import { useUIStore } from "../store/uiStore";

export default function ProtectedRoute() {
  const { data: user, isLoading } = useCurrentUser();
  const openSignInDialog = useUIStore((s) => s.openSignInDialog);

  useEffect(() => {
    if (!isLoading && !user) {
      openSignInDialog("You are not signed in. Sign in to continue.");
    }
  }, [isLoading, user, openSignInDialog]);

  if (isLoading || !user) {
    return null;
  }

  return <Outlet />;
}
