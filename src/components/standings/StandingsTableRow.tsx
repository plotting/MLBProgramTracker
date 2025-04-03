
import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { TeamRecordsView } from "@/types/database";
import { getFinalPlacementEmoji } from "../playoff-bracket/utils/bracketUtils";

interface StandingsTableRowProps {
  team: TeamRecordsView;
  index: number;
  seasonId: number;
  teamPlacement?: number;
}

const StandingsTableRow = ({ team, index, seasonId, teamPlacement }: StandingsTableRowProps) => {
  // Get placement title based on placement number
  const getPlacementTitle = (placement?: number): string => {
    if (!placement) return "";
    
    switch (placement) {
      case 1: return "1st Place";
      case 2: return "2nd Place";
      case 3: return "3rd Place";
      case 4: return "4th Place";
      case 5: return "5th Place";
      case 6: return "6th Place";
      case 7: return "7th Place";
      case 8: return "8th Place";
      case 9: return "9th Place";
      case 10: return "10th Place";
      default: return `${placement}th Place`;
    }
  };

  return (
    <TableRow key={team.team_id}>
      <TableCell className="font-medium">
        {index + 1}
      </TableCell>
      <TableCell>
        <Link 
          to={`/team/${team.team_id}?season=${seasonId}`} 
          className="text-primary hover:underline"
        >
          {team.team_name}
        </Link>
      </TableCell>
      <TableCell className="text-center">
        {team.regular_season_wins}-{team.regular_season_losses}
        {team.regular_season_ties > 0 ? `-${team.regular_season_ties}` : ''}
      </TableCell>
      <TableCell className="text-center">
        {team.playoff_wins}-{team.playoff_losses}
        {team.playoff_ties > 0 ? `-${team.playoff_ties}` : ''}
      </TableCell>
      <TableCell className="text-center">{team.regular_season_points_for.toFixed(1)}</TableCell>
      <TableCell className="text-center">{team.regular_season_points_against.toFixed(1)}</TableCell>
      <TableCell className="text-center font-medium text-xl">
        {teamPlacement ? (
          <span title={getPlacementTitle(teamPlacement)}>
            {getFinalPlacementEmoji(teamPlacement)}
          </span>
        ) : ""}
      </TableCell>
    </TableRow>
  );
};

export default StandingsTableRow;
