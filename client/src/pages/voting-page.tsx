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
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VotingPage() {
  const { user } = useAuth();
  const { deputies, userVotes, isLoading } = useDeputies();
  const { toast } = useToast();
  const [selectedFaction, setSelectedFaction] = useState<string | undefined>(undefined);

  const voteMutation = useMutation({
    mutationFn: async (deputyId: string) => {
      const res = await apiRequest("POST", `/api/vote/${deputyId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Balss reģistrēta", 
        description: "Jūsu balss ir veiksmīgi reģistrēta.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Balsošana neizdevās",
        description: error.message || "Neizdevās reģistrēt balsi. Lūdzu mēģiniet vēlreiz.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const remainingVotes = userVotes ? 5 - userVotes.votedDeputies.length : 5;
  const hasVotedFor = (deputyId: string) => userVotes?.votedDeputies.includes(deputyId);

  // Get unique factions for the filter dropdown
  const uniqueFactions = Array.from(new Set(deputies.map(d => d.faction)));

  // Filter deputies based on selected faction
  const filteredDeputies = deputies.filter(deputy => 
    !selectedFaction || deputy.faction === selectedFaction
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Balso par Deputātiem</h1>
          <p className="text-muted-foreground">
            Sveiki! Jums atlikušas {remainingVotes} balsis
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4" />
            Uz sākumu
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <Select value={selectedFaction || "all"} onValueChange={(value) => setSelectedFaction(value === "all" ? undefined : value)}>
          <SelectTrigger className="max-w-xs bg-white/50 border-gray-100">
            <SelectValue placeholder="Izvēlies frakciju" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Visas frakcijas</SelectItem>
              {uniqueFactions.map(faction => (
                <SelectItem key={faction} value={faction}>
                  {faction}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredDeputies.map((deputy) => (
          <Card key={deputy.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{deputy.name}</CardTitle>
              <Button 
                variant="destructive"
                onClick={() => voteMutation.mutate(deputy.id)}
                disabled={hasVotedFor(deputy.id) || remainingVotes === 0}
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