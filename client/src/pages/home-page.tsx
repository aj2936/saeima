import { useDeputies } from "@/hooks/use-votes";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal } from "lucide-react";

const DEPUTIES_PER_PAGE = 25;

export default function HomePage() {
  const { deputies, isLoading } = useDeputies();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaction, setSelectedFaction] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"name" | "votes">("votes");
  const [showFilters, setShowFilters] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Get unique factions for the filter dropdown
  const uniqueFactions = Array.from(new Set(deputies.map(d => d.faction)));

  // Filter and sort deputies
  let filteredDeputies = deputies.filter(deputy => {
    const matchesSearch = deputy.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaction = !selectedFaction || deputy.faction === selectedFaction;
    return matchesSearch && matchesFaction;
  });

  // Sort deputies
  filteredDeputies.sort((a, b) => {
    if (sortOrder === "name") {
      return a.name.localeCompare(b.name);
    }
    return b.votes - a.votes;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredDeputies.length / DEPUTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * DEPUTIES_PER_PAGE;
  const paginatedDeputies = filteredDeputies.slice(startIndex, startIndex + DEPUTIES_PER_PAGE);

  const totalVotes = deputies.reduce((sum, deputy) => sum + deputy.votes, 0) || 1;

  const handlePreviousPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  };

  const handleFactionChange = (value: string) => {
    setSelectedFaction(value === "all" ? undefined : value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="flex justify-between items-center mb-6">
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

        {/* Filter toggle button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Rādīt filtrus
          </Button>
        </div>

        {/* Filters and sorting */}
        <div className={`grid gap-4 mb-6 transition-all duration-300 ease-in-out ${showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="flex flex-wrap gap-4 py-4">
              <Input
                placeholder="Meklēt pēc vārda..."
                value={searchTerm}
                onChange={handleSearch}
                className="max-w-xs"
              />
              <Select value={selectedFaction || "all"} onValueChange={handleFactionChange}>
                <SelectTrigger className="max-w-xs">
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
              <Select value={sortOrder} onValueChange={(value: "name" | "votes") => setSortOrder(value)}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Kārtot pēc..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="votes">Kārtot pēc balsīm</SelectItem>
                    <SelectItem value="name">Kārtot pēc vārda</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 mb-6">
          {paginatedDeputies.map((deputy, index) => {
            const votePercentage = (deputy.votes / totalVotes) * 100;
            const globalIndex = startIndex + index + 1;
            return (
              <Card key={deputy.id} className="bg-white hover:bg-gray-50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-xl font-bold text-muted-foreground min-w-[48px]">
                      #{globalIndex}
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

        {/* Pagination controls */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="gap-2"
              >
                <PaginationPrevious />
                Iepriekšējā
              </Button>
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <Button
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Nākamā
                <PaginationNext />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}