
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import type { Deputy, UserVote } from "@shared/schema";

export function useDeputies() {
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

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "VOTE_UPDATE") {
          queryClient.invalidateQueries({ queryKey: ["/api/deputies"] });
          queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return { 
    deputies: deputies || [], 
    userVotes, 
    isLoading: isDeputiesLoading || isVotesLoading 
  };
}
