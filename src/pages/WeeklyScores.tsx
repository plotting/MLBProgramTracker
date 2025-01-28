import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const WeeklyScores = () => {
  // Mock data - replace with real data later
  const teams = [
    { name: "Team 1", owner: "Owner 1", scores: [142.6, 135.8, 128.4, 156.2] },
    { name: "Team 2", owner: "Owner 2", scores: [138.2, 145.6, 132.8, 148.9] },
    { name: "Team 3", owner: "Owner 3", scores: [129.4, 152.3, 144.7, 137.5] },
  ];

  const weeks = Array.from({ length: 17 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Weekly Scores</h1>
        <p className="text-muted-foreground">Track all teams' weekly performance</p>
      </header>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-card">Team</TableHead>
              {weeks.map((week) => (
                <TableHead key={week} className="bg-card text-center">
                  Week {week}
                </TableHead>
              ))}
              <TableHead className="bg-card text-center">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.name}>
                <TableCell className="font-medium">{team.name}</TableCell>
                {weeks.map((week) => (
                  <TableCell key={week} className="text-center">
                    {team.scores[week - 1] || "-"}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-primary">
                  {team.scores.reduce((a, b) => a + b, 0).toFixed(1)}
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