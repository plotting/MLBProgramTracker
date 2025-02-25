
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MatchupScoresView } from "@/types/database";
import { Card } from "@/components/ui/card";

type ScheduleTableProps = {
  matchupScores?: MatchupScoresView[];
  selectedSeason: string;
};

const ScheduleTable = ({ matchupScores, selectedSeason }: ScheduleTableProps) => {
  return (
    <Card className="overflow-x-auto">
      <h2 className="text-lg font-semibold p-4 border-b">Schedule</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Home Team</TableHead>
            <TableHead>Away Team</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matchupScores?.map((matchup) => (
            <TableRow key={`${matchup.week_number}-${matchup.home_team_id}-${matchup.away_team_id}`}>
              <TableCell>Week {matchup.week_number}</TableCell>
              <TableCell>
                <Link 
                  to={`/team/${matchup.home_team_id}?season=${selectedSeason}`}
                  className="text-primary hover:underline"
                >
                  {matchup.home_team_name}
                </Link>
              </TableCell>
              <TableCell>
                <Link 
                  to={`/team/${matchup.away_team_id}?season=${selectedSeason}`}
                  className="text-primary hover:underline"
                >
                  {matchup.away_team_name}
                </Link>
              </TableCell>
              <TableCell>
                {matchup.home_score !== null && matchup.away_score !== null ? (
                  `${matchup.home_score.toFixed(2)} - ${matchup.away_score.toFixed(2)}`
                ) : (
                  'TBD'
                )}
              </TableCell>
              <TableCell>
                {matchup.is_playoff ? 'Playoff' : 'Regular Season'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ScheduleTable;
