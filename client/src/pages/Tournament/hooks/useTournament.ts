import { useEffect, useEffectEvent } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  abortHeat,
  finishHeat,
  getLatestTournamentHighlight,
  getTournament,
  rollNextDriver,
  startHeat,
} from "../../../service/tournament";
import type { Tournament } from "../../../types/tournament.types";

const SERVER_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
/** Fallback refresh while the rig is busy, in case the socket drops. */
const BUSY_REFRESH_MS = 5_000;
const IDLE_REFRESH_MS = 30_000;

export const tournamentKeys = {
  all: ["tournaments"] as const,
  list: () => ["tournaments", "list"] as const,
  detail: (id: string) => ["tournaments", "detail", id] as const,
  latestHighlight: () => ["tournaments", "latest-highlight"] as const,
  ruleSets: () => ["tournaments", "rule-sets"] as const,
  drivers: () => ["tournaments", "drivers"] as const,
};

function isRigBusy(tournament?: Pick<Tournament, "status">) {
  return (
    tournament?.status === "AWAITING_DRIVER" ||
    tournament?.status === "HEAT_LIVE"
  );
}

/** Calls onUpdated with the id of every tournament the API reports changed. */
function useTournamentUpdatedEvents(
  enabled: boolean,
  onUpdated: (tournamentId: string) => void,
) {
  const handleUpdated = useEffectEvent(onUpdated);

  useEffect(() => {
    if (!enabled) return;

    const socket = io(`${SERVER_URL.replace(/\/$/, "")}/tournaments`, {
      reconnection: true,
    });
    socket.on("tournamentUpdated", (event: { tournamentId: string }) =>
      handleUpdated(event.tournamentId),
    );

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
}

export function useTournament(tournamentId?: string) {
  const queryClient = useQueryClient();
  useTournamentUpdatedEvents(Boolean(tournamentId), (updatedId) => {
    if (updatedId === tournamentId) {
      void queryClient.invalidateQueries({
        queryKey: tournamentKeys.detail(updatedId),
      });
    }
  });

  return useQuery({
    queryKey: tournamentKeys.detail(tournamentId ?? ""),
    queryFn: () => getTournament(tournamentId!),
    enabled: Boolean(tournamentId),
    refetchInterval: (query) =>
      isRigBusy(query.state.data) ? BUSY_REFRESH_MS : false,
  });
}

/** The tournament that changed last, kept fresh for the landing page. */
export function useLatestTournamentHighlight() {
  const queryClient = useQueryClient();
  useTournamentUpdatedEvents(true, () => {
    void queryClient.invalidateQueries({
      queryKey: tournamentKeys.latestHighlight(),
    });
  });

  return useQuery({
    queryKey: tournamentKeys.latestHighlight(),
    queryFn: getLatestTournamentHighlight,
    refetchInterval: (query) =>
      isRigBusy(query.state.data?.tournament ?? undefined)
        ? BUSY_REFRESH_MS
        : IDLE_REFRESH_MS,
  });
}

export function useTournamentActions(tournamentId: string) {
  const queryClient = useQueryClient();
  const onSuccess = (tournament: Tournament) => {
    queryClient.setQueryData(tournamentKeys.detail(tournament.id), tournament);
    void queryClient.invalidateQueries({ queryKey: tournamentKeys.list() });
  };

  return {
    roll: useMutation({
      mutationFn: () => rollNextDriver(tournamentId),
      onSuccess,
    }),
    start: useMutation({
      mutationFn: () => startHeat(tournamentId),
      onSuccess,
    }),
    finish: useMutation({
      mutationFn: () => finishHeat(tournamentId),
      onSuccess,
    }),
    abort: useMutation({
      mutationFn: () => abortHeat(tournamentId),
      onSuccess,
    }),
  };
}
