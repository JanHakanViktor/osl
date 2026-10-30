import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  getCurrentLiveTiming,
  getTimingSession,
  getTimingSessions,
} from "../../../service/liveTiming";
import type {
  LiveTimingCurrent,
  TimingBoard,
  TimingFrame,
} from "../../../types/liveTiming.types";

const SERVER_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
/** Frames arrive four times a second; a few missed ones mean the relay stopped. */
const FRAME_TIMEOUT_MS = 3_000;

export const liveTimingKeys = {
  current: () => ["liveTiming", "current"] as const,
  sessions: () => ["liveTiming", "sessions"] as const,
  session: (sessionUid: string) =>
    ["liveTiming", "sessions", sessionUid] as const,
};

type LiveTimingState = {
  board: TimingBoard | null;
  /** Null until a frame of the board's session arrives. */
  frame: TimingFrame | null;
  connected: boolean;
  /** True while frames keep arriving from the relay. */
  receiving: boolean;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Loads the session the relay is sending and follows it over the
 * /live-timing socket: standings when they change, car positions several
 * times a second.
 */
export function useLiveTiming(): LiveTimingState {
  const queryClient = useQueryClient();
  const [liveFrame, setLiveFrame] = useState<TimingFrame | null>(null);
  const [connected, setConnected] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const query = useQuery({
    queryKey: liveTimingKeys.current(),
    queryFn: getCurrentLiveTiming,
  });

  useEffect(() => {
    const socket = io(`${SERVER_URL.replace(/\/$/, "")}/live-timing`, {
      reconnection: true,
    });
    let frameTimeout: ReturnType<typeof setTimeout> | undefined;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("timingFrame", (frame: TimingFrame) => {
      setLiveFrame(frame);
      setReceiving(true);
      clearTimeout(frameTimeout);
      frameTimeout = setTimeout(() => setReceiving(false), FRAME_TIMEOUT_MS);
    });
    socket.on("timingBoard", (board: TimingBoard) =>
      queryClient.setQueryData<LiveTimingCurrent>(
        liveTimingKeys.current(),
        (current) => ({ frame: current?.frame ?? null, board }),
      ),
    );

    return () => {
      clearTimeout(frameTimeout);
      socket.disconnect();
    };
  }, [queryClient]);

  const board = query.data?.board ?? null;
  const frame = liveFrame ?? query.data?.frame ?? null;

  return {
    board,
    frame: frame?.sessionUid === board?.session.sessionUid ? frame : null,
    connected,
    receiving: connected && receiving,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useTimingSessions() {
  return useQuery({
    queryKey: liveTimingKeys.sessions(),
    queryFn: getTimingSessions,
  });
}

export function useTimingSession(sessionUid?: string) {
  return useQuery({
    queryKey: liveTimingKeys.session(sessionUid ?? ""),
    queryFn: () => getTimingSession(sessionUid!),
    enabled: Boolean(sessionUid),
  });
}
