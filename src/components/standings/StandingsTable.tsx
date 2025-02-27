
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamRecordsView } from "@/types/database";

type StandingsProps = {
  standings: TeamRecordsView[];
  selectedSeason: string;
};

const getPlacementEmoji = (index: number): string => {
  switch (index + 1) {
    case 1:
      return "🥇 1st Place";
    case 2:
      return "🥈 2nd Place";
    case 3:
      return "🥉 3rd Place";
    case 4:
      return "🏆 4th Place";
    case 5:
      return "🌟 5th Place";
    case 6:
      return "🛡️ 6th Place";
    case 7:
      return "🚽 7th Place";
    case 8:
      return "🤡 8th Place";
    case 9:
      return "🤮 9th Place";
    case 10:
      return "💩 10th Place";
    default:
      return `${index + 1}th Place`;
  }
};

const StandingsTable = ({ standings, selectedSeason }: StandingsProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team</TableHead>
          <TableHead>Record</TableHead>
          <TableHead>Points For</TableHead>
          <TableHead>Points Against</TableHead>
          <TableHead>Avg Points</TableHead>
          <TableHead>Final Standing</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings?.map((team, index) => {
          const totalGames = team.regular_season_wins + team.regular_season_losses + team.regular_season_ties;
          const avgPoints = totalGames > 0 
            ? (team.regular_season_points_for / totalGames).toFixed(1) 
            : "0.0";
            
          const record = team.regular_season_ties > 0
            ? `${team.regular_season_wins}-${team.regular_season_losses}-${team.regular_season_ties}`
            : `${team.regular_season_wins}-${team.regular_season_losses}`;

          return (
            <TableRow key={team.team_id}>
              <TableCell className="font-medium">
                <Link 
                  to={`/team/${team.team_id}?season=${selectedSeason}`} 
                  className="text-primary hover:underline"
                >
                  {team.team_name}
                </Link>
              </TableCell>
              <TableCell>{record}</TableCell>
              <TableCell>{team.regular_season_points_for.toFixed(1)}</TableCell>
              <TableCell>{team.regular_season_points_against.toFixed(1)}</TableCell>
              <TableCell>{avgPoints}</TableCell>
              <TableCell>{getPlacementEmoji(index)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default StandingsTable;
