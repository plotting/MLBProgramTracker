
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Team } from "@/types/database";
import { Card } from "@/components/ui/card";

type WeeklyScoresTableProps = {
  teams?: Team[];
  teamData: Record<number, { scores: string[] }>;
  weekCount: number;
  regularSeasonWeeks: number;
  selectedSeason: string;
};

const WeeklyScoresTable = ({
  teams,
  teamData,
  weekCount,
  regularSeasonWeeks,
  selectedSeason,
}: WeeklyScoresTableProps) => {
  return (
    <Card className="overflow-x-auto">
      <h2 className="text-lg font-semibold p-4 border-b">Weekly Scores</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky left-0 z-10">Team</TableHead>
            {Array.from({ length: weekCount }, (_, i) => (
              <TableHead key={i} className="text-center">
                Week {i + 1}
                {i >= regularSeasonWeeks && <span className="text-xs ml-1">(Playoffs)</span>}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams?.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-medium sticky left-0 bg-background z-10">
                <Link 
                  to={`/team/${team.id}?season=${selectedSeason}`} 
                  className="text-primary hover:underline"
                >
                  {team.name}
                </Link>
              </TableCell>
              {Array.from({ length: weekCount }, (_, weekIndex) => (
                <TableCell key={weekIndex} className="text-center">
                  {teamData[team.id]?.scores[weekIndex] || "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default WeeklyScoresTable;
