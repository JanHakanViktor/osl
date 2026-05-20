import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  CarTelemetryPacket,
  CircuitTracePoint,
  CompletedLap,
  LapDataPacket,
  MotionPacket,
  SessionFinishedPayload,
  SessionHistoryPacket,
  SessionPacket,
} from "../telemetryTypes";
import { firstFiniteNumber, getLapDataSectors } from "../telemetryFormatters";

type TelemetrySocketState = {
  connected: boolean;
  carTelemetry: CarTelemetryPacket | null;
  motion: MotionPacket | null;
  lapData: LapDataPacket | null;
  session: SessionPacket | null;
  sessionHistory: SessionHistoryPacket | null;
  playerSessionHistory: SessionHistoryPacket | null;
  liveLaps: CompletedLap[];
  circuitTracePoints: CircuitTracePoint[];
  heldSector3Ms: number | null;
  heldSector3Until: number | null;
  topSpeed: number | null;
  sessionFinished: SessionFinishedPayload | null;
};

const defaultSocketState: TelemetrySocketState = {
  connected: false,
  carTelemetry: null,
  motion: null,
  lapData: null,
  session: null,
  sessionHistory: null,
  playerSessionHistory: null,
  liveLaps: [],
  circuitTracePoints: [],
  heldSector3Ms: null,
  heldSector3Until: null,
  topSpeed: null,
  sessionFinished: null,
};

function readPlayerWorldPosition(packet: MotionPacket): CircuitTracePoint | null {
  const playerIndex = packet.m_header?.m_playerCarIndex ?? 0;
  const motion = packet.m_carMotionData?.[playerIndex];

  if (
    typeof motion?.m_worldPositionX !== "number" ||
    typeof motion.m_worldPositionZ !== "number" ||
    !Number.isFinite(motion.m_worldPositionX) ||
    !Number.isFinite(motion.m_worldPositionZ)
  ) {
    return null;
  }

  return {
    x: motion.m_worldPositionX,
    z: motion.m_worldPositionZ,
  };
}

function appendTracePoint(
  points: CircuitTracePoint[],
  nextPoint: CircuitTracePoint | null,
) {
  if (!nextPoint) return points;

  const latestPoint = points[points.length - 1];
  if (
    latestPoint &&
    Math.hypot(latestPoint.x - nextPoint.x, latestPoint.z - nextPoint.z) < 1
  ) {
    return points;
  }

  return [...points, nextPoint].slice(-900);
}

function readCompletedLap(
  liveLaps: CompletedLap[],
  packet: LapDataPacket,
): CompletedLap | null {
  const playerIndex = packet.m_header?.m_playerCarIndex ?? 0;
  const lap = packet.m_lapData?.[playerIndex];
  const currentLapNumber = lap?.m_currentLapNum;
  const lastLapMs = firstFiniteNumber(
    lap?.m_lastLapTimeInMS,
    lap?.m_lastLapTimeInMs,
  );

  if (!lastLapMs || !currentLapNumber || currentLapNumber <= 1) {
    return null;
  }

  const lapNumber = currentLapNumber - 1;
  if (liveLaps.some((completedLap) => completedLap.lapNumber === lapNumber)) {
    return null;
  }

  const [sector1Ms, sector2Ms] = getLapDataSectors(lap);
  const sector3Ms =
    sector1Ms != null && sector2Ms != null
      ? Math.max(lastLapMs - sector1Ms - sector2Ms, 0)
      : null;

  return {
    lapNumber,
    sector1Ms,
    sector2Ms,
    sector3Ms,
    lapTimeMs: lastLapMs,
    valid: lap?.m_currentLapInvalid === 0,
  };
}

export function useTelemetrySocket(
  serverUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030",
  namespace = "/telemetry",
): TelemetrySocketState {
  const [state, setState] = useState<TelemetrySocketState>(defaultSocketState);

  useEffect(() => {
    const url = `${serverUrl.replace(/\/$/, "")}${namespace}`;
    const socket: Socket = io(url, {
      autoConnect: true,
      reconnection: true,
      timeout: 20000,
    });

    const setConnected = (connected: boolean) =>
      setState((current) => ({ ...current, connected }));

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("carTelemetry", (packet: CarTelemetryPacket) => {
      const playerIndex = packet.m_header?.m_playerCarIndex ?? 0;
      const speed = packet.m_carTelemetryData?.[playerIndex]?.m_speed;

      setState((current) => ({
        ...current,
        carTelemetry: packet,
        topSpeed:
          typeof speed === "number"
            ? Math.max(current.topSpeed ?? 0, speed)
            : current.topSpeed,
      }));
    });
    socket.on("motion", (packet: MotionPacket) =>
      setState((current) => ({
        ...current,
        motion: packet,
        circuitTracePoints: appendTracePoint(
          current.circuitTracePoints,
          readPlayerWorldPosition(packet),
        ),
      })),
    );
    socket.on("lapData", (packet: LapDataPacket) =>
      setState((current) => {
        const completedLap = readCompletedLap(current.liveLaps, packet);
        const now = Date.now();
        const hasHeldSector3 =
          current.heldSector3Ms != null &&
          current.heldSector3Until != null &&
          current.heldSector3Until > now;

        return {
          ...current,
          lapData: packet,
          liveLaps: completedLap
            ? [...current.liveLaps, completedLap].slice(-30)
            : current.liveLaps,
          heldSector3Ms:
            completedLap?.sector3Ms ?? (hasHeldSector3 ? current.heldSector3Ms : null),
          heldSector3Until: completedLap?.sector3Ms ? now + 3_000 : current.heldSector3Until,
        };
      }),
    );
    socket.on("session", (packet: SessionPacket) =>
      setState((current) => ({ ...current, session: packet })),
    );
    socket.on("sessionHistory", (packet: SessionHistoryPacket) => {
      const playerIndex = packet.m_header?.m_playerCarIndex ?? 0;
      const belongsToPlayer =
        typeof packet.m_carIdx !== "number" || packet.m_carIdx === playerIndex;

      setState((current) => ({
        ...current,
        sessionHistory: packet,
        playerSessionHistory: belongsToPlayer
          ? packet
          : current.playerSessionHistory,
      }));
    });
    socket.on("sessionFinished", (packet: SessionFinishedPayload) =>
      setState((current) => ({ ...current, sessionFinished: packet })),
    );
    socket.on("connect_error", (error: unknown) =>
      console.warn("Telemetry socket connect_error:", error),
    );

    return () => {
      socket.disconnect();
    };
  }, [serverUrl, namespace]);

  return state;
}
