
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
        {getFinalPlacementEmoji(teamPlacement)}
      </TableCell>
    </TableRow>
  );
};

export default StandingsTableRow;
