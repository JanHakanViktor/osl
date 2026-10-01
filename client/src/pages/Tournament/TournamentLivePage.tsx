import { useMemo, useState } from "react";
import { useParams } from "react-router";
import LiveTelemetryDashboard from "../Telemetry/components/LiveTelemetryDashboard";
import { useTelemetrySocket } from "../Telemetry/hooks/useTelemetrySocket";
import { buildLiveTelemetryView } from "../Telemetry/liveTelemetryView";
import TournamentHeatBar from "./components/TournamentHeatBar";
import TournamentStatusMessage from "./components/TournamentStatusMessage";
import { useTournament, useTournamentActions } from "./hooks/useTournament";
import { useTournamentRedirect } from "./hooks/useTournamentRedirect";

export default function TournamentLivePage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { data: tournament, error, isLoading } = useTournament(tournamentId);
  const actions = useTournamentActions(tournamentId ?? "");
  const telemetry = useTelemetrySocket();
  const view = useMemo(() => buildLiveTelemetryView(telemetry), [telemetry]);

  // Remember which round the live heat belongs to, so that once it ends we
  // can show that round's results if it was the round's final heat.
  const liveHeat =
    tournament?.activeHeat?.status === "LIVE" ? tournament.activeHeat : null;
  const [heatRoundNumber, setHeatRoundNumber] = useState<number | null>(null);
  if (liveHeat && liveHeat.roundNumber !== heatRoundNumber) {
    setHeatRoundNumber(liveHeat.roundNumber);
  }

  const redirect = useTournamentRedirect(tournament, "live", heatRoundNumber);

  if (isLoading) return <TournamentStatusMessage kind="loading" />;
  if (error || !tournament) {
    return (
      <TournamentStatusMessage
        kind="error"
        message={error?.message ?? "Tournament not found"}
      />
    );
  }
  if (redirect || !liveHeat) return null;

  const lapsRemaining = Math.max(liveHeat.lapsTarget - liveHeat.lapsCompleted, 0);

  return (
    <LiveTelemetryDashboard
      view={view}
      connected={telemetry.connected}
      driverName={liveHeat.driver.driverName}
      sessionName={`${tournament.name} · ${liveHeat.circuit.grandPrix}`}
      circuitName={liveHeat.circuit.name}
      circuitImage={liveHeat.circuit.image ?? undefined}
      target={{
        label: "Laps Remaining",
        value: String(lapsRemaining),
        visible: true,
      }}
      exitAction={{
        label: "End Heat",
        busyLabel: "Ending Heat",
        busy: actions.finish.isPending,
        disabled: !tournament.isHost,
        onClick: () => actions.finish.mutate(),
      }}
      header={
        <TournamentHeatBar
          tournament={tournament}
          heat={liveHeat}
          cancelling={actions.abort.isPending}
          onCancelHeat={() => actions.abort.mutate()}
        />
      }
    />
  );
}
