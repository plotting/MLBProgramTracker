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

const WeeklyRecords = () => {
  const [selectedWeek, setSelectedWeek] = useState("1");

  // Mock data - replace with real data later
  const weeklyStats = {
    records: [
      { 
        team: "Team 1",
        wins: 8,
        losses: 5,
        ties: 0,
        avgPoints: 145.6,
        bestScore: 198.5,
        worstScore: 89.2,
        seasons: "1-13"
      },
      { 
        team: "Team 2",
        wins: 7,
        losses: 6,
        ties: 0,
        avgPoints: 142.3,
        bestScore: 185.2,
        worstScore: 92.8,
        seasons: "1-13"
      },
      // Add more teams as needed
    ],
  };

  // Generate weeks 1-17
  const weeks = Array.from({ length: 17 }, (_, i) => (i + 1).toString());

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Weekly Records</h1>
            <p className="text-muted-foreground">Historical performance by week</p>
          </div>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Week" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week) => (
                <SelectItem key={week} value={week}>
                  Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Week {selectedWeek} Statistics</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Record (W-L-T)</TableHead>
              <TableHead>Avg Points</TableHead>
              <TableHead>Best Score</TableHead>
              <TableHead>Worst Score</TableHead>
              <TableHead>Seasons</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeklyStats.records.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.team}</TableCell>
                <TableCell>{`${record.wins}-${record.losses}-${record.ties}`}</TableCell>
                <TableCell>{record.avgPoints.toFixed(1)}</TableCell>
                <TableCell>{record.bestScore.toFixed(1)}</TableCell>
                <TableCell>{record.worstScore.toFixed(1)}</TableCell>
                <TableCell>{record.seasons}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WeeklyRecords;