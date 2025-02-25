import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import type { Deputy, UserVote } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDeputies() {
  const { toast } = useToast();

  const { data: deputies, error: deputiesError } = useQuery<Deputy[]>({
    queryKey: ["/api/deputies"],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: Error) => {
      toast({
        title: "Kļūda ielādējot deputātu sarakstu",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: userVotes, isLoading, error: votesError } = useQuery<UserVote>({
    queryKey: ["/api/votes"],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: Error) => {
      toast({
        title: "Kļūda ielādējot balsojumu datus",
        description: error.message,
        variant: "destructive",
      });
    },
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

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Savienojuma kļūda",
        description: "Neizdevās izveidot savienojumu ar serveri",
        variant: "destructive",
      });
    };

    return () => {
      ws.close();
    };
  }, [toast]);

  return { 
    deputies, 
    userVotes, 
    isLoading,
    error: deputiesError || votesError 
  };
}