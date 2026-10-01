import "../index.css";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import HeroBanner from "../components/HeroBanner";
import LiveTelemetryPreview from "../components/widgets/LiveTelemetryPreview";
import LatestSessionRecap from "../components/widgets/LatestSessionRecap";
import FastestLapBreakdown from "../components/widgets/FastestLapBreakdown";
import LatestTournamentWidget from "../components/widgets/LatestTournamentWidget";
import { getLandingSummary } from "../service/session";
import type { LandingSummary } from "../types/session.types";
import { useLatestTournamentHighlight } from "./Tournament/hooks/useTournament";

function LandingPage() {
  const [summary, setSummary] = useState<LandingSummary | null>(null);
  const latestTournament = useLatestTournamentHighlight();

  useEffect(() => {
    let mounted = true;

    const loadSummary = () => {
      getLandingSummary()
        .then((data) => {
          if (mounted) setSummary(data);
        })
        .catch((error) => {
          console.warn("Failed to load landing summary", error);
        });
    };

    loadSummary();
    const intervalId = window.setInterval(loadSummary, 3000);

    const onFocus = () => loadSummary();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <>
      <HeroBanner />
      <Box
        sx={{
          margin: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
          p: { xs: 1, sm: 2 },
          maxWidth: "1680px",
        }}
      >
        <Box>
          <LiveTelemetryPreview activeSession={summary?.activeSession ?? null} />
        </Box>

        <Box>
          <LatestSessionRecap session={summary?.latestSession ?? null} />
        </Box>

        <Box>
          <FastestLapBreakdown circuits={summary?.fastestLapByCircuit ?? []} />
        </Box>
        <Box>
          <LatestTournamentWidget
            tournament={latestTournament.data?.tournament ?? null}
            loading={latestTournament.isLoading}
          />
        </Box>
      </Box>
    </>
  );
}

export default LandingPage;
