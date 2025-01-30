import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import TeamStats from "@/components/TeamStats";

const TeamPage = () => {
  const { teamId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get("season") || "2023");

  useEffect(() => {
    setSearchParams({ season: selectedSeason });
  }, [selectedSeason, setSearchParams]);

  // Mock data - replace with real data later
  const teamData = {
    name: `Team ${teamId}`,
    owner: "John Doe",
    record: "10-3",
    pointsFor: 1724.8,
    pointsAgainst: 1652.3,
  };

  const weeklyMatchups = Array.from({ length: 17 }, (_, i) => ({
    week: i + 1,
    opponent: `Team ${Math.floor(Math.random() * 10) + 1}`,
    score: (Math.random() * 50 + 100).toFixed(1),
    opponentScore: (Math.random() * 50 + 100).toFixed(1),
    isPlayoff: i >= 14,
  }));

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
              <SelectItem value="2023">2023 Season</SelectItem>
              <SelectItem value="2022">2022 Season</SelectItem>
              <SelectItem value="2021">2021 Season</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <TeamStats />
        
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Season Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Record</span>
              <span className="font-semibold">{teamData.record}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Points For</span>
              <span className="font-semibold text-primary">{teamData.pointsFor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Points Against</span>
              <span className="font-semibold text-secondary">{teamData.pointsAgainst}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Weekly Matchups</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyMatchups.map((matchup) => (
                <TableRow key={matchup.week} className={matchup.isPlayoff ? "bg-primary/10" : ""}>
                  <TableCell>
                    Week {matchup.week}
                    {matchup.isPlayoff && <span className="ml-2 text-primary">(Playoff)</span>}
                  </TableCell>
                  <TableCell>{matchup.opponent}</TableCell>
                  <TableCell>
                    {matchup.score} - {matchup.opponentScore}
                  </TableCell>
                  <TableCell>
                    {parseFloat(matchup.score) > parseFloat(matchup.opponentScore) ? (
                      <span className="text-green-500">W</span>
                    ) : (
                      <span className="text-red-500">L</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default TeamPage;