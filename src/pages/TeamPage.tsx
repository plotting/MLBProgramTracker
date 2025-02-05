import { useParams, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getAllSeasons } from "@/utils/seasonUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TeamPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get("season") || "1");

  useEffect(() => {
    setSearchParams({ season: selectedSeason });
  }, [selectedSeason, setSearchParams]);

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['team-stats', id, selectedSeason],
    queryFn: async () => {
      const { data: matchups, error } = await supabase
        .from('weekly_matchups')
        .select('*')
        .eq('season_id', parseInt(selectedSeason))
        .or(`team1_id.eq.${id},team2_id.eq.${id}`);

      if (error) throw error;

      const stats = {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      };

      matchups?.forEach(matchup => {
        const isTeam1 = matchup.team1_id === parseInt(id!);
        const teamScore = isTeam1 ? matchup.team1_score : matchup.team2_score;
        const opponentScore = isTeam1 ? matchup.team2_score : matchup.team1_score;

        if (teamScore > opponentScore) stats.wins++;
        else stats.losses++;

        stats.pointsFor += Number(teamScore);
        stats.pointsAgainst += Number(opponentScore);
      });

      return stats;
    },
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{team?.name}</h1>
            <p className="text-muted-foreground">Team Statistics</p>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Record</h3>
          <p className="text-2xl font-bold">
            {stats ? `${stats.wins}-${stats.losses}` : '0-0'}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Points For</h3>
          <p className="text-2xl font-bold">{stats?.pointsFor.toFixed(1) || '0.0'}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Points Against
          </h3>
          <p className="text-2xl font-bold">{stats?.pointsAgainst.toFixed(1) || '0.0'}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Average Points
          </h3>
          <p className="text-2xl font-bold">
            {stats && (stats.wins + stats.losses > 0)
              ? (stats.pointsFor / (stats.wins + stats.losses)).toFixed(1)
              : '0.0'}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Weekly Matchups</h2>
        <p className="text-muted-foreground">Matchup data coming soon...</p>
      </Card>
    </div>
  );
};

export default TeamPage;