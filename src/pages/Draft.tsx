import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Draft = () => {
  const [selectedSeason, setSelectedSeason] = useState("1"); // Start with season 1 to see the first draft

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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="text-center py-8">Loading draft data...</div>
      </div>
    );
  }

  const isStartupDraft = selectedSeason === "1";
  const rounds = isStartupDraft ? 16 : 2;
  const picksPerRound = 10;

  const formatDraftGrid = () => {
    if (!draftPicks) return [];

    if (isStartupDraft) {
      return Array.from({ length: rounds }, (_, roundIndex) => {
        const roundNumber = roundIndex + 1;
        const roundPicks = draftPicks.filter(pick => pick.round === roundNumber);
        
        // Sort picks based on snake draft order
        const sortedPicks = roundNumber % 2 === 1
          ? roundPicks.sort((a, b) => a.pick_number - b.pick_number)
          : roundPicks.sort((a, b) => b.pick_number - a.pick_number);

        return {
          round: roundNumber,
          picks: sortedPicks,
        };
      });
    }

    return draftPicks;
  };

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Draft History</h1>
            <p className="text-muted-foreground">View draft picks across all seasons</p>
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
        {isStartupDraft ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{getSeasonLabel("1")} Startup Draft</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Round</TableHead>
                    {Array.from({ length: picksPerRound }, (_, i) => (
                      <TableHead key={i}>Pick {i + 1}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formatDraftGrid().map((round) => (
                    <TableRow key={round.round}>
                      <TableCell className="font-medium">{round.round}</TableCell>
                      {round.picks.map((pick) => (
                        <TableCell key={pick.id} className="text-sm">
                          <div className="text-xs text-muted-foreground mb-1">
                            {pick.team?.name}
                          </div>
                          {pick.player_name}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              {getSeasonLabel(selectedSeason)} Draft
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pick</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Player</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formatDraftGrid().map((pick) => (
                  <TableRow key={pick.id}>
                    <TableCell>{pick.round}.{pick.pick_number}</TableCell>
                    <TableCell>
                      <Link 
                        to={`/team/${pick.team_id}?season=${selectedSeason}`} 
                        className="text-primary hover:underline"
                      >
                        {pick.team?.name}
                      </Link>
                    </TableCell>
                    <TableCell>{pick.player_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Draft;