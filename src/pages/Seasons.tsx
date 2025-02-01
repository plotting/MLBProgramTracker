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
import { useState } from "react";
import { Link } from "react-router-dom";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";

const Seasons = () => {
  const [selectedSeason, setSelectedSeason] = useState("13"); // Default to latest season
  
  const standings = Array.from({ length: 10 }, (_, i) => ({ 
    id: i + 1,
    team: `Team ${i + 1}`,
    record: "10-3",
    pointsFor: 1724.8 - (i * 20),
    pointsAgainst: 1652.3 - (i * 15),
    avgPoints: 156.8 - (i * 2)
  }));

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {getSeasonLabel(selectedSeason)}
            </h1>
            <p className="text-muted-foreground">League Standings and Weekly Matchups</p>
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

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">League Standings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Points For</TableHead>
                <TableHead>Points Against</TableHead>
                <TableHead>Avg Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    <Link 
                      to={`/team/${team.id}?season=${selectedSeason}`} 
                      className="text-primary hover:underline"
                    >
                      {team.team}
                    </Link>
                  </TableCell>
                  <TableCell>{team.record}</TableCell>
                  <TableCell>{team.pointsFor.toFixed(1)}</TableCell>
                  <TableCell>{team.pointsAgainst.toFixed(1)}</TableCell>
                  <TableCell>{team.avgPoints.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Weekly Matchups</h2>
        <WeeklyMatchup />
      </div>
    </div>
  );
};

export default Seasons;