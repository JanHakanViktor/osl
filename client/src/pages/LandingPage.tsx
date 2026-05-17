import "../index.css";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import HeroBanner from "../components/HeroBanner";
import LiveTelemetryPreview from "../components/widgets/LiveTelemetryPreview";
import LatestSessionRecap from "../components/widgets/LatestSessionRecap";
import FastestLapBreakdown from "../components/widgets/FastestLapBreakdown";
import DriverImprovementTrend from "../components/widgets/DriverImprovementTrend";
import { getLandingSummary } from "../service/session";
import type { LandingSummary } from "../types/session.types";

function LandingPage() {
  const [summary, setSummary] = useState<LandingSummary | null>(null);

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
          <DriverImprovementTrend trend={summary?.improvementTrend ?? null} />
        </Box>
      </Box>
    </>
  );
}

export default LandingPage;
