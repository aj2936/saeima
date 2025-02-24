import { useDeputies } from "@/hooks/use-votes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { HomeIcon } from "lucide-react";

export default function VotingPage() {
  const { user } = useAuth();
  const { deputies, userVotes, isLoading } = useDeputies();
  const { toast } = useToast();

  const voteMutation = useMutation({
    mutationFn: async (deputyId: string) => {
      await apiRequest("POST", `/api/vote/${deputyId}`);
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
    return <div>Loading...</div>;
  }

  const remainingVotes = userVotes ? 5 - userVotes.votedDeputies.length : 5;
  const hasVotedFor = (deputyId: string) => userVotes?.votedDeputies.includes(deputyId);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Balso par Deputātiem</h1>
          <p className="text-muted-foreground">
            Sveicināts! Jums atlikušas {remainingVotes} balsis
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{deputy.name}</CardTitle>
              <Button 
                variant="destructive"
                onClick={() => voteMutation.mutate(deputy.id)}
                disabled={hasVotedFor(deputy.id) || userVotes?.hasVoted}
              >
                Balsot
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">{deputy.faction}</div>
              <Progress value={deputy.votes} max={100} className="h-2" />
              <div className="mt-2 text-sm text-right">{deputy.votes} balsis</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}