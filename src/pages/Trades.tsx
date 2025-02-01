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

const Trades = () => {
  const [selectedSeason, setSelectedSeason] = useState("13");

  const teams = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
  }));

  // Mock data - replace with real data later
  const trades = [
    {
      id: 1,
      date: "2023-08-15",
      team1: teams[0],
      team2: teams[1],
      team1Receives: ["Player A", "2024 1st Round Pick"],
      team2Receives: ["Player B", "Player C", "2024 2nd Round Pick"],
    },
    {
      id: 2,
      date: "2023-08-20",
      team1: teams[2],
      team2: teams[3],
      team1Receives: ["Player D", "2024 3rd Round Pick"],
      team2Receives: ["Player E"],
    },
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
              {getAllSeasons().reverse().map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
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
                <TableCell className="font-medium">
                  <Link 
                    to={`/team/${trade.team1.id}?season=${selectedSeason}`} 
                    className="text-primary hover:underline"
                  >
                    {trade.team1.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {trade.team1Receives.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="font-medium">
                  <Link 
                    to={`/team/${trade.team2.id}?season=${selectedSeason}`} 
                    className="text-primary hover:underline"
                  >
                    {trade.team2.name}
                  </Link>
                </TableCell>
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