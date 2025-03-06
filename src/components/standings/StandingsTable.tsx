
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Award, Star, Shield } from "lucide-react";

interface StandingsTableProps {
  seasonId: number;
}

const StandingsTable = ({ seasonId }: StandingsTableProps) => {
  const { data: standings, isLoading } = useQuery({
    queryKey: ['standings', seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_records_view')
        .select('*')
        .eq('season_id', seasonId);
        
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="text-center py-4">Loading standings...</p>;
  }

  const sortedStandings = standings ? [...standings].sort((a, b) => {
    const aTotal = a.regular_season_wins + a.regular_season_losses + a.regular_season_ties;
    const bTotal = b.regular_season_wins + b.regular_season_losses + b.regular_season_ties;
    
    const aPercentage = aTotal === 0 ? 0 : (a.regular_season_wins + 0.5 * a.regular_season_ties) / aTotal;
    const bPercentage = bTotal === 0 ? 0 : (b.regular_season_wins + 0.5 * b.regular_season_ties) / bTotal;
    
    if (aPercentage !== bPercentage) {
      return bPercentage - aPercentage;
    }
    return b.regular_season_points_for - a.regular_season_points_for;
  }) : [];

  const getFinalPlacement = (position: number): React.ReactNode => {
    switch (position) {
      case 0: return <span title="1st Place">🥇</span>;
      case 1: return <span title="2nd Place">🥈</span>;
      case 2: return <span title="3rd Place">🥉</span>;
      case 3: return <span title="4th Place">🏆</span>;
      case 4: return <span title="5th Place">🌟</span>;
      case 5: return <span title="6th Place">🛡️</span>;
      case 6: return <span title="7th Place">🚽</span>;
      case 7: return <span title="8th Place">🤡</span>;
      case 8: return <span title="9th Place">🤮</span>;
      case 9: return <span title="10th Place">💩</span>;
      default: return `${position + 1}`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[180px]">Team</TableHead>
            <TableHead className="text-center">Regular Season</TableHead>
            <TableHead className="text-center">Playoffs</TableHead>
            <TableHead className="text-center">PF</TableHead>
            <TableHead className="text-center">PA</TableHead>
            <TableHead className="text-center">Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStandings.map((team, index) => (
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
              <TableCell className="text-center font-medium text-xl">{getFinalPlacement(index)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StandingsTable;
