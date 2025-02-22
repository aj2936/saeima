import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import type { Deputy, UserVote } from "@shared/schema";

export function useDeputies() {
  const { data: deputies } = useQuery<Deputy[]>({
    queryKey: ["/api/deputies"],
  });

  const { data: userVotes, isLoading } = useQuery<UserVote>({
    queryKey: ["/api/votes"],
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "VOTE_UPDATE") {
        queryClient.setQueryData(["/api/deputies"], data.deputies);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return { deputies, userVotes, isLoading };
}
