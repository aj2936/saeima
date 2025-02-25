import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import type { Deputy, UserVote } from "@shared/schema";

export function useDeputies() {
  const { data: deputies, isLoading: isDeputiesLoading } = useQuery<Deputy[]>({
    queryKey: ["/api/deputies"],
    staleTime: 1000, // Reduce stale time to get more frequent updates
  });

  const { data: userVotes, isLoading: isVotesLoading } = useQuery<UserVote>({
    queryKey: ["/api/votes"],
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "VOTE_UPDATE") {
        queryClient.setQueryData(["/api/deputies"], data.deputies);
        queryClient.setQueryData(["/api/votes"], data.userVotes);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const isLoading = isDeputiesLoading || isVotesLoading;

  return { 
    deputies: deputies || [], 
    userVotes, 
    isLoading 
  };
}