import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  abortHeat,
  finishHeat,
  getTournament,
  rollNextDriver,
  startHeat,
} from "../../../service/tournament";
import type { Tournament } from "../../../types/tournament.types";

const SERVER_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
/** Fallback refresh while the rig is busy, in case the socket drops. */
const BUSY_REFRESH_MS = 5_000;

export const tournamentKeys = {
  all: ["tournaments"] as const,
  list: () => ["tournaments", "list"] as const,
  detail: (id: string) => ["tournaments", "detail", id] as const,
  ruleSets: () => ["tournaments", "rule-sets"] as const,
  drivers: () => ["tournaments", "drivers"] as const,
};

function isRigBusy(tournament?: Tournament) {
  return (
    tournament?.status === "AWAITING_DRIVER" ||
    tournament?.status === "HEAT_LIVE"
  );
}

/** Refetches the tournament whenever the API reports a change to it. */
function useTournamentUpdates(tournamentId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tournamentId) return;

    const socket = io(`${SERVER_URL.replace(/\/$/, "")}/tournaments`, {
      reconnection: true,
    });
    socket.on("tournamentUpdated", (event: { tournamentId: string }) => {
      if (event.tournamentId === tournamentId) {
        void queryClient.invalidateQueries({
          queryKey: tournamentKeys.detail(tournamentId),
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, tournamentId]);
}

export function useTournament(tournamentId?: string) {
  useTournamentUpdates(tournamentId);

  return useQuery({
    queryKey: tournamentKeys.detail(tournamentId ?? ""),
    queryFn: () => getTournament(tournamentId!),
    enabled: Boolean(tournamentId),
    refetchInterval: (query) =>
      isRigBusy(query.state.data) ? BUSY_REFRESH_MS : false,
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
