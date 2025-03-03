
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface TeamDraftHistoryProps {
  teamId: number;
}

const TeamDraftHistory = ({ teamId }: TeamDraftHistoryProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  const { data: seasons } = useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('season_number');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: draftPicks, isLoading } = useQuery({
    queryKey: ['team-draft-picks', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('draft_picks')
        .select('*, season:seasons(id, year, season_number)')
        .eq('team_id', teamId)
        .order('season_id', { ascending: false })
        .order('round')
        .order('pick_number');
      
      if (error) throw error;
      return data;
    },
  });

  const filteredPicks = filter === "all" 
    ? draftPicks 
    : draftPicks?.filter(pick => pick.season?.id === parseInt(filter));

  if (isLoading) {
    return <p className="text-center py-4">Loading draft history...</p>;
  }

  if (!draftPicks || draftPicks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Draft History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No draft history available for this team</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Draft History</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            {seasons?.map(season => (
              <SelectItem key={season.id} value={season.id.toString()}>
                Season {season.season_number} ({season.year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Season</TableHead>
              <TableHead>Round</TableHead>
              <TableHead>Pick #</TableHead>
              <TableHead>Player</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPicks?.map((pick) => (
              <TableRow key={`${pick.season_id}-${pick.round}-${pick.pick_number}`}>
                <TableCell>{pick.season ? `Season ${pick.season.season_number}` : ''}</TableCell>
                <TableCell>{pick.round}</TableCell>
                <TableCell>{pick.pick_number}</TableCell>
                <TableCell>{pick.player_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TeamDraftHistory;
