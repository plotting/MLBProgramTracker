import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getAllSeasons } from "@/utils/seasonUtils";

const Draft = () => {
  const [selectedSeason, setSelectedSeason] = useState("1");

  const { data: draftPicks, isLoading } = useQuery({
    queryKey: ['draft', selectedSeason],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('draft_picks')
        .select(`
          *,
          team:teams(name)
        `)
        .eq('season_id', parseInt(selectedSeason))
        .order('round')
        .order('pick_number');

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Draft History</h1>
            <p className="text-muted-foreground">View draft picks across seasons</p>
          </div>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {getAllSeasons().reverse().map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card className="p-6">
        {isLoading ? (
          <div>Loading draft picks...</div>
        ) : draftPicks && draftPicks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Round</TableHead>
                <TableHead>Pick</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Player</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draftPicks.map((pick) => (
                <TableRow key={pick.id}>
                  <TableCell>{pick.round}</TableCell>
                  <TableCell>{pick.pick_number}</TableCell>
                  <TableCell>{pick.team.name}</TableCell>
                  <TableCell>{pick.player_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No draft picks found for this season
          </div>
        )}
      </Card>
    </div>
  );
};

export default Draft;