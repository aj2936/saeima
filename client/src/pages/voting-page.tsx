import { useDeputies } from "@/hooks/use-votes";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { HomeIcon, Loader2 } from "lucide-react";

export default function VotingPage() {
  const { user } = useAuth();
  const { deputies, userVotes, isLoading, error } = useDeputies();
  const { toast } = useToast();

  const voteMutation = useMutation({
    mutationFn: async (deputyId: string) => {
      const response = await apiRequest("POST", `/api/vote/${deputyId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Radās kļūda balsošanas laikā");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
      toast({
        title: "Balss reģistrēta",
        description: "Jūsu balss ir veiksmīgi reģistrēta.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Balsošana neizdevās",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Neizdevās ielādēt datus
        </h1>
        <p className="text-muted-foreground mb-4">
          Lūdzu, mēģiniet vēlreiz vēlāk
        </p>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4" />
            Uz sākumu
          </Button>
        </Link>
      </div>
    );
  }

  const remainingVotes = userVotes ? 5 - userVotes.votedDeputies.length : 5;
  const hasVotedFor = (deputyId: string) => userVotes?.votedDeputies.includes(deputyId);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Balso par Deputātiem</h1>
          <p className="text-muted-foreground">
            Sveicināti! Jums atlikušas {remainingVotes} balsis
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4" />
            Uz sākumu
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {deputies?.map((deputy) => (
          <Card key={deputy.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{deputy.name}</h3>
                  <p className="text-sm text-muted-foreground">{deputy.faction}</p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={() => voteMutation.mutate(deputy.id)}
                  disabled={
                    voteMutation.isPending || 
                    hasVotedFor(deputy.id) || 
                    userVotes?.hasVoted
                  }
                >
                  {voteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Balsot"
                  )}
                </Button>
              </div>
              <Progress 
                value={deputy.votes} 
                max={100} 
                className="h-2 mt-4" 
              />
              <div className="mt-2 text-sm text-right">
                {deputy.votes} balsis
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}