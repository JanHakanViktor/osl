import { createBrowserRouter } from "react-router";
import NotFoundPage from "../pages/NotFoundPage";
import LandingPage from "../pages/LandingPage";
import Telemetry from "../pages/Telemetry/Telemetry.tsx";
import CreateGamePage from "../pages/Create/CreateGamePage.tsx";
import AppLayout from "../pages/AppLayout.tsx";
import ProtectedRoute from "./ProtectecRoute.tsx";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/create-session",
            children: [{ index: true, element: <CreateGamePage /> }],
          },
          {
            path: "/telemetry/:sessionId",
            children: [
              {
                index: true,
                element: <Telemetry />,
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
