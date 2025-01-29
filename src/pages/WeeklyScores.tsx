import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
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
import { useState } from "react";

const WeeklyScores = () => {
  const [selectedSeason, setSelectedSeason] = useState("13");
  const seasons = Array.from({ length: 13 }, (_, i) => (i + 1).toString());

  // Mock data - replace with real data later
  const teams = [
    { name: "Team 1", owner: "Owner 1", scores: Array(17).fill(null).map(() => (Math.random() * 50 + 100).toFixed(1)) },
    { name: "Team 2", owner: "Owner 2", scores: Array(17).fill(null).map(() => (Math.random() * 50 + 100).toFixed(1)) },
    { name: "Team 3", owner: "Owner 3", scores: Array(17).fill(null).map(() => (Math.random() * 50 + 100).toFixed(1)) },
    // Add more teams...
  ];

  const isPlayoffWeek = (season: string, week: number) => {
    const seasonNum = parseInt(season);
    if (seasonNum <= 10) {
      return week >= 15 && week <= 16;
    }
    return week >= 15 && week <= 17;
  };

  const getWeeksForSeason = (season: string) => {
    const seasonNum = parseInt(season);
    return seasonNum <= 10 ? 16 : 17;
  };

  const calculateRegularSeasonTotal = (scores: string[]) => {
    return scores
      .slice(0, 14)
      .reduce((a, b) => a + parseFloat(b || "0"), 0)
      .toFixed(1);
  };

  const weeks = Array.from(
    { length: getWeeksForSeason(selectedSeason) },
    (_, i) => i + 1
  );

  return (
    <div className="min-h-screen p-6">
      <Navigation />
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Weekly Scores</h1>
            <p className="text-muted-foreground">Track all teams' weekly performance</p>
          </div>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season} value={season}>
                  Season {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-card sticky left-0 z-10">Team</TableHead>
              {weeks.map((week) => (
                <TableHead 
                  key={week} 
                  className={`bg-card text-center ${
                    isPlayoffWeek(selectedSeason, week) 
                      ? "bg-primary/20" 
                      : ""
                  }`}
                >
                  Week {week}
                </TableHead>
              ))}
              <TableHead className="bg-card text-center">Regular Season Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.name}>
                <TableCell className="font-medium sticky left-0 bg-background z-10">
                  {team.name}
                </TableCell>
                {weeks.map((week) => (
                  <TableCell 
                    key={week} 
                    className={`text-center ${
                      isPlayoffWeek(selectedSeason, week)
                        ? "bg-primary/10"
                        : ""
                    }`}
                  >
                    {team.scores[week - 1] || "-"}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-primary">
                  {calculateRegularSeasonTotal(team.scores)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WeeklyScores;