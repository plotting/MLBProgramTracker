import { useParams, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";

const TeamPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get("season") || "13");

  useEffect(() => {
    setSearchParams({ season: selectedSeason });
  }, [selectedSeason, setSearchParams]);

  // Mock data - replace with real data later
  const teamData = {
    name: `Team ${id}`,
    owner: `Owner ${id}`,
    stats: {
      wins: 8,
      losses: 5,
      pointsFor: 1523.5,
      pointsAgainst: 1432.8,
    },
  };

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{teamData.name}</h1>
            <p className="text-muted-foreground">Owned by {teamData.owner}</p>
          </div>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {getAllSeasons().reverse().map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Record</h3>
          <p className="text-2xl font-bold">
            {teamData.stats.wins}-{teamData.stats.losses}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Points For</h3>
          <p className="text-2xl font-bold">{teamData.stats.pointsFor}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Points Against
          </h3>
          <p className="text-2xl font-bold">{teamData.stats.pointsAgainst}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Average Points
          </h3>
          <p className="text-2xl font-bold">
            {(teamData.stats.pointsFor / (teamData.stats.wins + teamData.stats.losses)).toFixed(1)}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Weekly Matchups</h2>
        <p className="text-muted-foreground">Matchup data coming soon...</p>
      </Card>
    </div>
  );
};

export default TeamPage;