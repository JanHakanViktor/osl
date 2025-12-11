import { createBrowserRouter } from "react-router";
import CreateGame from "../pages/Create/CreateSession";
import NotFoundPage from "../pages/NotFoundPage";
import LandingPage from "../pages/LandingPage";
import SessionSettings from "../pages/Create/SessionSettings";
import RegisterDriver from "../pages/Create/RegisterDriver";
import NewDriver from "../pages/Create/NewDriver";
import TrackSelection from "../pages/Create/TrackSelection";
import SessionOverview from "../pages/Session/SessionOverview";
import DriverTelemetryPage from "../pages/Session/DriverTelemetry";
import HotlapPage from "../pages/Session/HotlapPage";
import Podium from "../pages/Session/Podium";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  {
    path: "/create",
    children: [
      { index: true, element: <CreateGame /> },
      {
        path: "session-settings",
        element: <SessionSettings />,
      },
      {
        path: "register",
        element: <RegisterDriver />,
      },
      {
        path: "new-driver",
        element: <NewDriver />,
      },
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
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
