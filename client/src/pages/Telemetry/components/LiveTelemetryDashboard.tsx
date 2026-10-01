import type { ReactNode } from "react";
import { Box, Container } from "@mui/material";
import { getOslAppShell } from "../../../theme";
import type { LiveTarget, LiveTelemetryView } from "../liveTelemetryView";
import CompletedLapsList from "./CompletedLapsList";
import DriverTelemetryHero from "./DriverTelemetryHero";
import SectorTimingBar from "./SectorTimingBar";
import SessionTargetPanel from "./SessionTargetPanel";

export type LiveExitAction = {
  label: string;
  busyLabel: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
};

type LiveTelemetryDashboardProps = {
  view: LiveTelemetryView;
  connected: boolean;
  driverName: string;
  sessionName: string;
  circuitName: string;
  circuitImage?: string;
  target: LiveTarget;
  exitAction: LiveExitAction;
  /** Optional strip shown above the sector timing bar. */
  header?: ReactNode;
};

export default function LiveTelemetryDashboard({
  view,
  connected,
  driverName,
  sessionName,
  circuitName,
  circuitImage,
  target,
  exitAction,
  header,
}: LiveTelemetryDashboardProps) {
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
      {header}
      <SectorTimingBar sectors={view.sectorDisplays} />

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
          <CompletedLapsList laps={view.completedLaps} />
          <DriverTelemetryHero
            connected={connected}
            driverName={driverName}
            sessionName={sessionName}
            speed={view.speed}
            gear={view.gear}
            throttle={view.throttle}
            brake={view.brake}
            sessionElapsedSeconds={view.sessionElapsedSeconds}
          />
          <SessionTargetPanel
            currentLapMs={view.currentLapMs}
            fastestLapMs={view.fastestLapMs}
            fastestLapDeltaLabel={view.fastestLapDeltaLabel}
            remainingLabel={target.label}
            remainingValue={target.value}
            showTarget={target.visible}
            circuitName={circuitName}
            circuitImage={circuitImage}
            lapProgress={view.lapProgress}
            finishDisabled={exitAction.disabled}
            finishing={exitAction.busy}
            finishLabel={exitAction.label}
            finishingLabel={exitAction.busyLabel}
            onFinishSession={exitAction.onClick}
          />
        </Box>
      </Container>
    </Box>
  );
}
