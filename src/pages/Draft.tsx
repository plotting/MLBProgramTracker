
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
import { Link } from "react-router-dom";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";

const Draft = () => {
  const [selectedSeason, setSelectedSeason] = useState("1");

  const { data: draftPicks, isLoading } = useQuery({
    queryKey: ['draft', selectedSeason],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('draft_picks')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('season_id', parseInt(selectedSeason))
        .order('round')
        .order('pick_number');

      if (error) throw error;
      console.log('Draft picks:', data);
      return data;
    },
  });

  // Group picks by round and organize by team
  const organizedPicks = draftPicks?.reduce((acc, pick) => {
    if (!acc[pick.round]) {
      acc[pick.round] = {};
    }
    acc[pick.round][pick.team?.name || 'Unknown'] = {
      player: pick.player_name,
      pick: `${pick.round}.${String(pick.pick_number).padStart(2, '0')}`
    };
    return acc;
  }, {} as Record<number, Record<string, { player: string; pick: string }>>);

  // Get unique team names
  const teams = Array.from(new Set(draftPicks?.map(pick => pick.team?.name || 'Unknown')));

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {getSeasonLabel(selectedSeason)} Draft
            </h1>
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
          <div className="text-center py-4">Loading draft picks...</div>
        ) : draftPicks && draftPicks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Round</TableHead>
                {teams.map((team) => (
                  <TableHead key={team}>
                    <Link 
                      to={`/team/${draftPicks.find(p => p.team?.name === team)?.team_id}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {team}
                    </Link>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(organizedPicks || {}).map(([round, roundPicks]) => (
                <TableRow key={round}>
                  <TableCell className="font-medium">Round {round}</TableCell>
                  {teams.map((team) => (
                    <TableCell key={team} className="text-center">
                      <div>{roundPicks[team]?.player || '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        {roundPicks[team]?.pick || '-'}
                      </div>
                    </TableCell>
                  ))}
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
