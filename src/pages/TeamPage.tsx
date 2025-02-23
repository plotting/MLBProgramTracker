
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
import { format } from "date-fns";

const TeamPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get("season") || "1");

  useEffect(() => {
    setSearchParams({ season: selectedSeason });
  }, [selectedSeason, setSearchParams]);

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      if (!id) throw new Error('No team ID provided');
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', parseInt(id))
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Team not found');
      return data;
    },
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: ['team-stats', id, selectedSeason],
    queryFn: async () => {
      if (!id) throw new Error('No team ID provided');
      const { data: matchups, error } = await supabase
        .from('weekly_matchups')
        .select('*')
        .eq('season_id', parseInt(selectedSeason))
        .or(`team1_id.eq.${parseInt(id)},team2_id.eq.${parseInt(id)}`);

      if (error) throw error;

      const stats = {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      };

      matchups?.forEach(matchup => {
        const isTeam1 = matchup.team1_id === parseInt(id);
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

  const { data: trades } = useQuery({
    queryKey: ['team-trades', id, selectedSeason],
    queryFn: async () => {
      if (!id) throw new Error('No team ID provided');
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          team1:teams!trades_team1_id_fkey(name),
          team2:teams!trades_team2_id_fkey(name),
          items:trade_items(
            item_type,
            item_description,
            from_team_id,
            to_team_id,
            from_team:teams!trade_items_from_team_id_fkey(name),
            to_team:teams!trade_items_to_team_id_fkey(name)
          )
        `)
        .eq('season_id', parseInt(selectedSeason))
        .or(`team1_id.eq.${parseInt(id)},team2_id.eq.${parseInt(id)}`)
        .order('trade_date', { ascending: true }); // Changed to ascending order

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading team data...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Team not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{team.name}</h1>
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

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Weekly Matchups</h2>
          <p className="text-muted-foreground">Matchup data coming soon...</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Trades History</h2>
          {trades && trades.length > 0 ? (
            <div className="space-y-4">
              {trades.map((trade) => {
                const isTeam1 = trade.team1_id === parseInt(id);
                const otherTeam = isTeam1 ? trade.team2 : trade.team1;
                const receivedItems = trade.items.filter(item => 
                  item.to_team_id === parseInt(id)
                );
                const sentItems = trade.items.filter(item => 
                  item.from_team_id === parseInt(id)
                );

                return (
                  <div key={trade.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Trade with {otherTeam.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(trade.trade_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Received:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {receivedItems.map((item, index) => (
                            <li key={index} className="text-muted-foreground">
                              {item.item_description}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Sent:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {sentItems.map((item, index) => (
                            <li key={index} className="text-muted-foreground">
                              {item.item_description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No trades found for this season</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TeamPage;
