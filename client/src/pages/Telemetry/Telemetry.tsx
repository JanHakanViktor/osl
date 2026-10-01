import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useCurrentUser } from "../../components/auth/auth.queries";
import CircuitLibrary from "../../data/circuit";
import { finishSession, getLiveSessionDetails } from "../../service/session";
import LiveTelemetryDashboard from "./components/LiveTelemetryDashboard";
import { useTelemetrySocket } from "./hooks/useTelemetrySocket";
import { buildLiveTelemetryView, buildSessionTarget } from "./liveTelemetryView";

export default function TelemetryPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: user } = useCurrentUser();
  const telemetry = useTelemetrySocket();
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

  const view = useMemo(() => buildLiveTelemetryView(telemetry), [telemetry]);
  const target = buildSessionTarget(liveSession, view, telemetry.session);
  const { sessionFinished } = telemetry;

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
    <LiveTelemetryDashboard
      view={view}
      connected={telemetry.connected}
      driverName={driverName}
      sessionName={liveSession?.sessionName ?? "Active Session"}
      circuitName={liveSession?.circuitName ?? "Selected circuit"}
      circuitImage={activeCircuit?.image}
      target={target}
      exitAction={{
        label: "Exit Session",
        busyLabel: "Ending Session",
        busy: finishingSession,
        disabled: !sessionId,
        onClick: handleFinishSession,
      }}
    />
  );
}
