import { useDeputies } from "@/hooks/use-votes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HomePage() {
  const { deputies, isLoading } = useDeputies();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Deputātu Popularitāte</h1>
          <p className="text-muted-foreground">
            Pievienojieties, lai balsotu par deputātiem
          </p>
        </div>
        <Link href="/auth">
          <Button>Pieslēgties</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {deputies?.map((deputy) => (
          <Card key={deputy.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{deputy.name}</CardTitle>
              <div className="text-lg font-bold">{deputy.votes} balsis</div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">{deputy.faction}</div>
              <Progress value={deputy.votes} max={100} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}