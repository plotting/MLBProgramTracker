
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StandingsProps = {
  standings: Array<{
    id: number;
    team: string;
    record: string;
    pointsFor: number;
    pointsAgainst: number;
    avgPoints: number;
  }>;
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
          <TableHead>Placement</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Record</TableHead>
          <TableHead>Points For</TableHead>
          <TableHead>Points Against</TableHead>
          <TableHead>Avg Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings?.map((team, index) => (
          <TableRow key={team.id}>
            <TableCell>{getPlacementEmoji(index)}</TableCell>
            <TableCell className="font-medium">
              <Link 
                to={`/team/${team.id}?season=${selectedSeason}`} 
                className="text-primary hover:underline"
              >
                {team.team}
              </Link>
            </TableCell>
            <TableCell>{team.record}</TableCell>
            <TableCell>{team.pointsFor.toFixed(1)}</TableCell>
            <TableCell>{team.pointsAgainst.toFixed(1)}</TableCell>
            <TableCell>{team.avgPoints.toFixed(1)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StandingsTable;
