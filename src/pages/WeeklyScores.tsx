import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";

const WeeklyScores = () => {
  const [selectedSeason, setSelectedSeason] = useState("13");

  // Mock data for 10 teams
  const teams = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
    records: Array.from({ length: 17 }, (_, weekIndex) => {
      const wins = Math.floor(Math.random() * (weekIndex + 1));
      const losses = weekIndex + 1 - wins;
      return `${wins}-${losses}`;
    }),
  }));

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Weekly Scores</h1>
            <p className="text-muted-foreground">Track team records week by week</p>
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

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-card sticky left-0 z-10">Team</TableHead>
              {Array.from({ length: 17 }, (_, i) => (
                <TableHead key={i} className="text-center">
                  Week {i + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium sticky left-0 bg-background z-10">
                  <Link 
                    to={`/team/${team.id}?season=${selectedSeason}`} 
                    className="text-primary hover:underline"
                  >
                    {team.name}
                  </Link>
                </TableCell>
                {team.records.map((record, weekIndex) => (
                  <TableCell key={weekIndex} className="text-center">
                    {record}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WeeklyScores;