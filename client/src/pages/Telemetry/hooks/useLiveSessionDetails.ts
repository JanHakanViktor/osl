import { useEffect } from "react";
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { getLiveSessionDetails } from "../../../service/session";
import type { LiveSessionDetails } from "../../../types/session.types";

/**
 * Loads the live session and refetches it whenever the game starts a new lap,
 * so `lapsCompleted` follows the lap count the API finishes the session on.
 */
export function useLiveSessionDetails(
  sessionId?: string,
  currentLapNumber?: number,
): UseQueryResult<LiveSessionDetails> {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["liveSession", sessionId],
    queryFn: () => getLiveSessionDetails(sessionId!),
    enabled: Boolean(sessionId),
    retry: false,
  });

  useEffect(() => {
    if (!sessionId || currentLapNumber == null) return;

    // The API saves a completed lap before it broadcasts the packet that
    // starts the next lap, so this refetch reads the updated count.
    void queryClient.invalidateQueries({
      queryKey: ["liveSession", sessionId],
    });
  }, [currentLapNumber, queryClient, sessionId]);

  return query;
}
