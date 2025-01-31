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

const Trades = () => {
  const [selectedSeason, setSelectedSeason] = useState("2023");

  // Mock data - replace with real data later
  const trades = [
    {
      id: 1,
      date: "2023-08-15",
      team1: "Team 1",
      team2: "Team 2",
      team1Receives: ["Player A", "2024 1st Round Pick"],
      team2Receives: ["Player B", "Player C", "2024 2nd Round Pick"],
    },
    {
      id: 2,
      date: "2023-08-20",
      team1: "Team 3",
      team2: "Team 4",
      team1Receives: ["Player D", "2024 3rd Round Pick"],
      team2Receives: ["Player E"],
    },
    // Add more mock trades...
  ];

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Trade History</h1>
            <p className="text-muted-foreground">View all trades across seasons</p>
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
              <TableHead>Date</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>{trade.date}</TableCell>
                <TableCell className="font-medium">{trade.team1}</TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {trade.team1Receives.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="font-medium">{trade.team2}</TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {trade.team2Receives.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Trades;