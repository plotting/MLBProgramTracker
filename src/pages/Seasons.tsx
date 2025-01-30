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
import WeeklyMatchup from "@/components/WeeklyMatchup";

const Seasons = () => {
  const [selectedSeason, setSelectedSeason] = useState("2023");
  
  // Mock data - replace with real data later
  const standings = [
    { 
      team: "Team 1",
      record: "10-3",
      pointsFor: 1724.8,
      pointsAgainst: 1652.3,
      avgPoints: 156.8
    },
    { 
      team: "Team 2",
      record: "9-4",
      pointsFor: 1698.2,
      pointsAgainst: 1588.9,
      avgPoints: 154.4
    },
    // Add more teams as needed
  ];

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Season {selectedSeason}</h1>
            <p className="text-muted-foreground">League Standings and Weekly Matchups</p>
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
              {standings.map((team, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{team.team}</TableCell>
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
