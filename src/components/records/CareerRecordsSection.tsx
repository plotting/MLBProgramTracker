
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CareerStats {
  team: string;
  regularSeason: {
    wins: number;
    losses: number;
    ties: number;
    percentage: number;
  };
  playoffs: {
    wins: number;
    losses: number;
    ties: number;
    percentage: number;
  };
  consolation: {
    wins: number;
    losses: number;
    ties: number;
    percentage: number;
  };
  hypothetical: {
    wins: number;
    losses: number;
    ties: number;
    percentage: number;
  };
  scoring: {
    hundredPlus: number;
    highestScore: number;
    lowestScore: number;
    timesHighest: number;
    timesLowest: number;
    vsHighest: number;
    vsLowest: number;
  };
}

interface CareerRecordsSectionProps {
  careerStats: CareerStats[];
}

export const CareerRecordsSection = ({ careerStats }: CareerRecordsSectionProps) => {
  // Sort stats by regular season percentage in descending order
  const sortedStats = [...careerStats].sort(
    (a, b) => b.regularSeason.percentage - a.regularSeason.percentage
  );
  
  // Team placement emojis by final position
  const positionEmojis: Record<number, string> = {
    1: "🥇 1st Place",
    2: "🥈 2nd Place",
    3: "🥉 3rd Place",
    4: "🏆 4th Place",
    5: "🌟 5th Place",
    6: "🛡️ 6th Place",
    7: "🚽 7th Place",
    8: "🤡 8th Place",
    9: "🤮 9th Place",
    10: "💩 10th Place"
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Career Records</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Regular Season</TableHead>
              <TableHead>Playoffs</TableHead>
              <TableHead>Consolation</TableHead>
              <TableHead>Vs All</TableHead>
              <TableHead>100+ Games</TableHead>
              <TableHead>High/Low</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStats.map((stat, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium whitespace-nowrap">{stat.team}</TableCell>
                <TableCell>
                  {`${stat.regularSeason.wins}-${stat.regularSeason.losses}-${stat.regularSeason.ties}`}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {stat.regularSeason.percentage.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  {`${stat.playoffs.wins}-${stat.playoffs.losses}-${stat.playoffs.ties}`}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {stat.playoffs.percentage.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  {`${stat.consolation.wins}-${stat.consolation.losses}-${stat.consolation.ties}`}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {stat.consolation.percentage.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  {`${stat.hypothetical.wins}-${stat.hypothetical.losses}-${stat.hypothetical.ties}`}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {stat.hypothetical.percentage.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>{stat.scoring.hundredPlus}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    Highest: {stat.scoring.timesHighest}<br />
                    Lowest: {stat.scoring.timesLowest}<br />
                    vs High: {stat.scoring.vsHighest}<br />
                    vs Low: {stat.scoring.vsLowest}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
