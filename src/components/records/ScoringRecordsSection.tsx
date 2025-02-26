
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScoringRecord {
  score: number;
  team: string;
  opponent: string;
  season: number;
  week: number;
  gameScore: string;
}

interface MarginRecord {
  margin: number;
  winner: string;
  loser: string;
  season: number;
  week: number;
  score: string;
}

interface CombinedRecord {
  total: number;
  teams: string;
  season: number;
  week: number;
  score: string;
}

interface ScoringRecordsSectionProps {
  regularSeasonHigh: ScoringRecord[];
  regularSeasonLow: ScoringRecord[];
  playoffHigh: ScoringRecord[];
  playoffLow: ScoringRecord[];
  largestMargins: MarginRecord[];
  highestCombined: CombinedRecord[];
}

export const ScoringRecordsSection = ({
  regularSeasonHigh,
  regularSeasonLow,
  playoffHigh,
  playoffLow,
  largestMargins,
  highestCombined,
}: ScoringRecordsSectionProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Highest Regular Season Scores</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Score</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead>Season/Week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regularSeasonHigh.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                <TableCell>{record.team}</TableCell>
                <TableCell>{record.opponent}</TableCell>
                <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h2 className="text-xl font-semibold mb-4 mt-6">Lowest Regular Season Scores</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Score</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead>Season/Week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regularSeasonLow.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                <TableCell>{record.team}</TableCell>
                <TableCell>{record.opponent}</TableCell>
                <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Highest Playoff Scores</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Score</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead>Season/Week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playoffHigh.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                <TableCell>{record.team}</TableCell>
                <TableCell>{record.opponent}</TableCell>
                <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h2 className="text-xl font-semibold mb-4 mt-6">Lowest Playoff Scores</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Score</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead>Season/Week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playoffLow.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                <TableCell>{record.team}</TableCell>
                <TableCell>{record.opponent}</TableCell>
                <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Largest Margins of Victory</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Winner</TableHead>
              <TableHead>Loser</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Season/Week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {largestMargins.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.winner}</TableCell>
                <TableCell>{record.loser}</TableCell>
                <TableCell>{record.score}</TableCell>
                <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Highest Combined Scores</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teams</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Season/Week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {highestCombined.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.teams}</TableCell>
                <TableCell>{record.score}</TableCell>
                <TableCell>{record.total.toFixed(1)}</TableCell>
                <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
