import { createBrowserRouter } from "react-router";
import NotFoundPage from "../pages/NotFoundPage";
import LandingPage from "../pages/LandingPage";
import Telemetry from "../pages/Telemetry/Telemetry.tsx";
import AppLayout from "../pages/AppLayout.tsx";
import ProtectedRoute from "./ProtectecRoute.tsx";
import CreateSessionPage from "../pages/Session/CreateSessionPage.tsx";
import SessionOverviewPage from "../pages/Session/SessionOverviewPage.tsx";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "sessions",
            children: [
              { path: "new", element: <CreateSessionPage /> },

              {
                path: ":sessionId",
                children: [
                  { path: "live", element: <Telemetry /> },
                  { path: "overview", element: <SessionOverviewPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);

export default router;
