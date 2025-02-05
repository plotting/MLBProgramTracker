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
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings?.map((team) => (
          <TableRow key={team.id}>
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