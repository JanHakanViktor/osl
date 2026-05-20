import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Container } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { getOslAppShell } from "../../theme";
import { useCurrentUser } from "../../components/auth/auth.queries";
import CircuitLibrary from "../../data/circuit";
import { finishSession, getLiveSessionDetails } from "../../service/session";
import CompletedLapsList from "./components/CompletedLapsList";
import DriverTelemetryHero from "./components/DriverTelemetryHero";
import SectorTimingBar from "./components/SectorTimingBar";
import SessionTargetPanel from "./components/SessionTargetPanel";
import { useTelemetrySocket } from "./hooks/useTelemetrySocket";
import {
  buildSectorDisplays,
  buildFastestLapDeltaLabel,
  calculateLapsRemaining,
  findFastestLap,
  firstFiniteNumber,
  formatDuration,
  getLapDataSectors,
  mapHistoryLaps,
  mergeCompletedLaps,
} from "./telemetryFormatters";

function getPlayerIndex(
  lapDataPlayerIndex?: number,
  telemetryPlayerIndex?: number,
  motionPlayerIndex?: number,
  sessionPlayerIndex?: number,
): number {
  return (
    lapDataPlayerIndex ??
    telemetryPlayerIndex ??
    motionPlayerIndex ??
    sessionPlayerIndex ??
    0
  );
}

export default function TelemetryPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: user } = useCurrentUser();
  const {
    connected,
    carTelemetry,
    motion,
    lapData,
    session,
    playerSessionHistory,
    liveLaps,
    circuitTracePoints,
    heldSector3Ms,
    sessionFinished,
  } = useTelemetrySocket();
  const { data: liveSession } = useQuery({
    queryKey: ["liveSession", sessionId],
    queryFn: () => getLiveSessionDetails(sessionId!),
    enabled: Boolean(sessionId),
    retry: false,
  });
  const [finishingSession, setFinishingSession] = useState(false);
  const hasNavigatedToOverviewRef = useRef(false);
  const driverName =
    user?.drivername && user.drivername !== user.username
      ? user.drivername
      : "Driver";

  const playerIndex = useMemo(
    () =>
      getPlayerIndex(
        lapData?.m_header?.m_playerCarIndex,
        carTelemetry?.m_header?.m_playerCarIndex,
        motion?.m_header?.m_playerCarIndex,
        session?.m_header?.m_playerCarIndex,
      ),
    [carTelemetry, lapData, motion, session],
  );

  const playerLap = lapData?.m_lapData?.[playerIndex] ?? null;
  const playerTelemetry = carTelemetry?.m_carTelemetryData?.[playerIndex] ?? null;
  const speed = playerTelemetry?.m_speed;
  const gear = playerTelemetry?.m_gear;
  const throttle = playerTelemetry?.m_throttle;
  const brake = playerTelemetry?.m_brake;
  const currentLapMs = firstFiniteNumber(
    playerLap?.m_currentLapTimeInMS,
    playerLap?.m_currentLapTimeInMs,
  );
  const bestLapMs = firstFiniteNumber(
    playerLap?.m_bestLapTimeInMS,
    playerLap?.m_bestLapTimeInMs,
  );
  const currentLapNumber = playerLap?.m_currentLapNum;
  const currentSectors = getLapDataSectors(playerLap);
  const visibleSectors = [
    currentSectors[0],
    currentSectors[1],
    currentSectors[2] ?? heldSector3Ms,
  ];

  const historyLaps = useMemo(() => {
    const lapCount = playerSessionHistory?.m_numLaps;
    const historyData =
      typeof lapCount === "number" && lapCount > 0
        ? playerSessionHistory?.m_lapHistoryData?.slice(0, lapCount)
        : playerSessionHistory?.m_lapHistoryData;

    return mapHistoryLaps(historyData ?? []);
  }, [playerSessionHistory]);

  const completedLaps = mergeCompletedLaps(historyLaps, liveLaps);
  const fastestCompletedLap = findFastestLap(completedLaps);
  const fastestLapMs = fastestCompletedLap?.lapTimeMs ?? bestLapMs;
  const previousFastestLap = fastestCompletedLap
    ? findFastestLap(
        completedLaps.filter((lap) => lap.lapNumber < fastestCompletedLap.lapNumber),
      )
    : null;
  const fastestLapDeltaLabel = buildFastestLapDeltaLabel({
    fastestLapMs,
    previousFastestLapMs: previousFastestLap?.lapTimeMs,
  });
  const sectorDisplays = buildSectorDisplays(
    visibleSectors,
    completedLaps,
    fastestCompletedLap,
  );
  const sessionElapsedSeconds = session?.m_header?.m_sessionTime ?? null;
  const lapTarget =
    liveSession?.limitType === "LAPS"
      ? liveSession.lapLimit
      : session?.m_totalLaps;
  const lapsRemaining = calculateLapsRemaining(
    lapTarget,
    currentLapNumber,
    completedLaps.length,
  );
  const remainingSeconds = firstFiniteNumber(
    session?.m_sessionTimeLeft,
    liveSession?.limitType === "TIME" &&
      liveSession.timeLimitSeconds != null &&
      sessionElapsedSeconds != null
      ? liveSession.timeLimitSeconds - sessionElapsedSeconds
      : session?.m_sessionDuration != null && sessionElapsedSeconds != null
        ? session.m_sessionDuration - sessionElapsedSeconds
        : null,
  );
  const target =
    lapsRemaining != null
      ? {
          kind: "laps" as const,
          label: "Laps Remaining",
          value: String(lapsRemaining),
        }
      : liveSession?.limitType === "LAPS"
        ? {
            kind: "laps" as const,
            label: "Laps Remaining",
            value: "--",
          }
        : {
            kind: "time" as const,
            label: "Time Remaining",
            value: formatDuration(remainingSeconds),
          };
  const showTargetPanel =
    target.kind === "laps" ||
    liveSession?.limitType === "TIME" ||
    remainingSeconds != null;

  useEffect(() => {
    if (
      !sessionId ||
      !sessionFinished ||
      sessionFinished.sessionId !== sessionId ||
      hasNavigatedToOverviewRef.current
    ) {
      return;
    }

    hasNavigatedToOverviewRef.current = true;
    navigate(`/sessions/${sessionId}/overview`);
  }, [navigate, sessionFinished, sessionId]);

  const handleFinishSession = async () => {
    if (!sessionId || finishingSession) return;

    setFinishingSession(true);
    try {
      await finishSession(sessionId);
      navigate(`/sessions/${sessionId}/overview`);
    } finally {
      setFinishingSession(false);
    }
  };

  const activeCircuit = CircuitLibrary.find(
    (circuit) => circuit.circuit === liveSession?.circuitName,
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: (theme) =>
          `linear-gradient(180deg, ${getOslAppShell(theme).surface} 0%, ${
            theme.palette.background.default
          } 100%)`,
      }}
    >
      <SectorTimingBar sectors={sectorDisplays} />

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(300px, 0.8fr) minmax(420px, 1.25fr) minmax(280px, 0.75fr)",
            },
            gap: { xs: 2, md: 2.5 },
            alignItems: "stretch",
          }}
        >
          <CompletedLapsList laps={completedLaps} />
          <DriverTelemetryHero
            connected={connected}
            driverName={driverName}
            sessionName={liveSession?.sessionName ?? "Active Session"}
            speed={speed}
            gear={gear}
            throttle={throttle}
            brake={brake}
            sessionElapsedSeconds={sessionElapsedSeconds}
          />
          <SessionTargetPanel
            currentLapMs={currentLapMs}
            fastestLapMs={fastestLapMs}
            fastestLapDeltaLabel={fastestLapDeltaLabel}
            remainingLabel={target.label}
            remainingValue={target.value}
            showTarget={showTargetPanel}
            circuitName={liveSession?.circuitName ?? "Selected circuit"}
            circuitImage={activeCircuit?.image}
            tracePoints={circuitTracePoints}
            finishDisabled={!sessionId}
            finishing={finishingSession}
            onFinishSession={handleFinishSession}
          />
        </Box>
      </Container>
    </Box>
  );
}
