
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Deputy, UserVote } from "@shared/schema";

export function useDeputies() {
  const queryClient = useQueryClient();

  const { data: deputies, isLoading: isDeputiesLoading } = useQuery<Deputy[]>({
    queryKey: ["/api/deputies"],
    staleTime: 0,
  });

  const { data: userVotes, isLoading: isVotesLoading } = useQuery<UserVote>({
    queryKey: ["/api/votes"],
    staleTime: 0,
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "VOTE_UPDATE") {
          await Promise.all([
            queryClient.setQueryData(["/api/deputies"], data.deputies),
            queryClient.setQueryData(["/api/votes"], data.userVotes)
          ]);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
      ws.close();
    };
  }, [queryClient]);

  return {
    deputies: deputies || [],
    userVotes,
    isLoading: isDeputiesLoading || isVotesLoading
  };
}
