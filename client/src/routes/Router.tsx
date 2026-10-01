import { createBrowserRouter } from "react-router";
import NotFoundPage from "../pages/NotFoundPage";
import LandingPage from "../pages/LandingPage";
import Telemetry from "../pages/Telemetry/Telemetry.tsx";
import AppLayout from "../pages/AppLayout.tsx";
import ProtectedRoute from "./ProtectecRoute.tsx";
import CreateSessionPage from "../pages/Session/CreateSessionPage.tsx";
import SessionOverviewPage from "../pages/Session/SessionOverviewPage.tsx";
import SessionHistoryPage from "../pages/Session/SessionHistoryPage.tsx";

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
              { index: true, element: <SessionHistoryPage /> },
              { path: "new", element: <CreateSessionPage /> },

              {
                path: ":sessionId",
                children: [
                  { path: "live", element: <Telemetry /> },
                  { path: "overview", element: <SessionOverviewPage /> },
                  {
                    path: "coach",
                    lazy: async () => ({
                      Component: (
                        await import("../pages/SimCoach/SimCoachPage.tsx")
                      ).default,
                    }),
                  },
                ],
              },
            ],
          },
          {
            path: "tournaments",
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (
                    await import("../pages/Tournament/TournamentListPage.tsx")
                  ).default,
                }),
              },
              {
                path: "new",
                lazy: async () => ({
                  Component: (
                    await import(
                      "../pages/Tournament/CreateTournament/CreateTournamentPage.tsx"
                    )
                  ).default,
                }),
              },
              {
                path: ":tournamentId",
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (
                        await import(
                          "../pages/Tournament/TournamentStandingsPage.tsx"
                        )
                      ).default,
                    }),
                  },
                  {
                    path: "live",
                    lazy: async () => ({
                      Component: (
                        await import("../pages/Tournament/TournamentLivePage.tsx")
                      ).default,
                    }),
                  },
                  {
                    path: "rounds/:roundNumber",
                    lazy: async () => ({
                      Component: (
                        await import("../pages/Tournament/TournamentRoundPage.tsx")
                      ).default,
                    }),
                  },
                  {
                    path: "podium",
                    lazy: async () => ({
                      Component: (
                        await import("../pages/Tournament/TournamentPodiumPage.tsx")
                      ).default,
                    }),
                  },
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
