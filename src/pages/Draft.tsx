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

const Draft = () => {
  const [selectedSeason, setSelectedSeason] = useState("2023");

  // Mock data - replace with real data later
  const draftPicks = [
    {
      id: 1,
      round: 1,
      pick: 1,
      team: "Team 1",
      player: "Patrick Mahomes",
      position: "QB",
    },
    {
      id: 2,
      round: 1,
      pick: 2,
      team: "Team 2",
      player: "Christian McCaffrey",
      position: "RB",
    },
    {
      id: 3,
      round: 1,
      pick: 3,
      team: "Team 3",
      player: "Justin Jefferson",
      position: "WR",
    },
    // Add more mock draft picks...
  ];

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Draft History</h1>
            <p className="text-muted-foreground">View draft picks across all seasons</p>
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

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Round</TableHead>
              <TableHead>Pick</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draftPicks.map((pick) => (
              <TableRow key={pick.id}>
                <TableCell>{pick.round}</TableCell>
                <TableCell>{pick.pick}</TableCell>
                <TableCell className="font-medium">{pick.team}</TableCell>
                <TableCell>{pick.player}</TableCell>
                <TableCell>{pick.position}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Draft;