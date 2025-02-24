import { useDeputies } from "@/hooks/use-votes";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HomePage() {
  const { deputies, isLoading } = useDeputies();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalVotes = deputies?.reduce((sum, deputy) => sum + deputy.votes, 0) || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="flex justify-between items-center mb-12">
          <div className="animate-in fade-in duration-700">
            <div className="flex flex-col items-start gap-6">
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent drop-shadow-sm">
                hinvu
              </h1>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                Deputātu Popularitāte
              </h2>
              <p className="text-lg text-muted-foreground">
                Seko līdzi statistikai un dalies ar citiem!
              </p>
            </div>
          </div>
          <Link href="/auth">
            <Button variant="destructive">Balsot</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {deputies?.map((deputy, index) => {
            const votePercentage = (deputy.votes / totalVotes) * 100;
            return (
              <Card key={deputy.id} className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-xl font-bold text-muted-foreground min-w-[40px]">
                      #{index + 1}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{deputy.name}</h3>
                          <p className="text-sm text-muted-foreground">{deputy.faction}</p>
                        </div>
                        <div className="text-lg font-bold">
                          {votePercentage.toFixed(0)}%
                        </div>
                      </div>
                      <Progress value={votePercentage} className="h-2 bg-gray-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}