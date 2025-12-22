import { createBrowserRouter } from "react-router";
import NotFoundPage from "../pages/NotFoundPage";
import LandingPage from "../pages/LandingPage";
import TrackSelection from "../pages/Create/TrackSelection";
import SessionOverview from "../pages/Session/SessionOverview";
import DriverTelemetryPage from "../pages/Session/DriverTelemetry";
import HotlapPage from "../pages/Session/Hotlap.tsx";
import Podium from "../pages/Session/Podium";
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
        element: <ProtectedRoute />, // 🔐 PROTECTED
        children: [
          {
            path: "/create-session",
            children: [
              { index: true, element: <CreateGamePage /> },
              {
                path: "tracks",
                element: <TrackSelection />,
              },
            ],
          },
          {
            path: "/league/:leagueId",
            children: [
              {
                index: true,
                element: <SessionOverview />,
              },
              {
                path: "track/:trackId",
                element: <HotlapPage />,
              },
              {
                path: "track/:trackId/driver/:driverId",
                element: <DriverTelemetryPage />,
              },
              { path: "podium", element: <Podium /> },
            ],
          },
          {
            path: "/telemetry",
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
