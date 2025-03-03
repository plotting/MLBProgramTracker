
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface DraftPicksTableProps {
  seasonId: number;
}

const DraftPicksTable = ({ seasonId }: DraftPicksTableProps) => {
  const { data: draftPicks, isLoading } = useQuery({
    queryKey: ['draft-picks', seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('draft_picks')
        .select('*, team:teams(id, name)')
        .eq('season_id', seasonId)
        .order('round')
        .order('pick_number');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="text-center py-4">Loading draft picks...</p>;
  }

  if (!draftPicks || draftPicks.length === 0) {
    return <Card className="p-6 text-center text-muted-foreground">
      No draft data available for this season
    </Card>;
  }

  return (
    <Card className="mb-8">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Draft Results</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Round</TableHead>
              <TableHead>Pick #</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Player</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draftPicks.map((pick) => (
              <TableRow key={`${pick.round}-${pick.pick_number}`}>
                <TableCell>{pick.round}</TableCell>
                <TableCell>{pick.pick_number}</TableCell>
                <TableCell>
                  {pick.team && (
                    <Link 
                      to={`/team/${pick.team.id}?season=${seasonId}`} 
                      className="text-primary hover:underline"
                    >
                      {pick.team.name}
                    </Link>
                  )}
                </TableCell>
                <TableCell>{pick.player_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default DraftPicksTable;
