import { useParams, useSearchParams } from "react-router-dom";
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
import { useState, useEffect } from "react";
import { getAllSeasons } from "@/utils/seasonUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import type { MatchupScoresView, TeamRecordsView } from "@/types/database";

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

  const { data: matchups } = useQuery({
    queryKey: ['team-matchups', id, selectedSeason],
    queryFn: async () => {
      if (!id) throw new Error('No team ID provided');
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .eq('season_id', parseInt(selectedSeason))
        .or(`home_team_id.eq.${parseInt(id)},away_team_id.eq.${parseInt(id)}`)
        .order('week_number');

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: teamRecords } = useQuery({
    queryKey: ['team-records', id, selectedSeason],
    queryFn: async () => {
      if (!id) throw new Error('No team ID provided');
      const { data, error } = await supabase
        .from('team_records_view')
        .select('*')
        .eq('season_id', parseInt(selectedSeason))
        .eq('team_id', parseInt(id))
        .maybeSingle();

      if (error) throw error;
      return data as TeamRecordsView;
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
        .order('trade_date', { ascending: true });

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
            {teamRecords ? 
              `${teamRecords.regular_season_wins + teamRecords.playoff_wins}-${teamRecords.regular_season_losses + teamRecords.playoff_losses}` 
              : '0-0'}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Points For</h3>
          <p className="text-2xl font-bold">
            {teamRecords ? 
              (teamRecords.regular_season_points_for + teamRecords.playoff_points_for).toFixed(1) 
              : '0.0'}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Points Against</h3>
          <p className="text-2xl font-bold">
            {teamRecords ? 
              (teamRecords.regular_season_points_against + teamRecords.playoff_points_against).toFixed(1) 
              : '0.0'}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Points</h3>
          <p className="text-2xl font-bold">
            {teamRecords && (teamRecords.regular_season_wins + teamRecords.regular_season_losses + teamRecords.playoff_wins + teamRecords.playoff_losses > 0)
              ? ((teamRecords.regular_season_points_for + teamRecords.playoff_points_for) / 
                 (teamRecords.regular_season_wins + teamRecords.regular_season_losses + teamRecords.playoff_wins + teamRecords.playoff_losses)).toFixed(1)
              : '0.0'}
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Weekly Matchups</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchups?.map((matchup) => {
                const isHomeTeam = matchup.home_team_id === parseInt(id);
                const opponentId = isHomeTeam ? matchup.away_team_id : matchup.home_team_id;
                const opponentName = isHomeTeam ? matchup.away_team_name : matchup.home_team_name;
                const teamScore = isHomeTeam ? matchup.home_score : matchup.away_score;
                const opponentScore = isHomeTeam ? matchup.away_score : matchup.home_score;
                const result = teamScore && opponentScore 
                  ? teamScore > opponentScore 
                    ? 'W' 
                    : teamScore < opponentScore 
                      ? 'L'
                      : 'T'
                  : null;

                return (
                  <TableRow key={matchup.week_number}>
                    <TableCell>Week {matchup.week_number}</TableCell>
                    <TableCell>
                      <Link 
                        to={`/team/${opponentId}?season=${selectedSeason}`}
                        className="text-primary hover:underline"
                      >
                        {opponentName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {teamScore !== null && opponentScore !== null ? (
                        <span className={
                          result === 'W' 
                            ? 'text-green-500' 
                            : result === 'L' 
                              ? 'text-red-500'
                              : 'text-yellow-500'
                        }>
                          {teamScore.toFixed(2)} - {opponentScore.toFixed(2)}
                        </span>
                      ) : (
                        'TBD'
                      )}
                    </TableCell>
                    <TableCell>
                      {teamScore !== null && opponentScore !== null && (
                        <span className={`font-bold ${
                          result === 'W' 
                            ? 'text-green-500' 
                            : result === 'L'
                              ? 'text-red-500'
                              : 'text-yellow-500'
                        }`}>
                          {result}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {matchup.is_playoff ? (
                        matchup.is_playoff_bracket ? 'Playoff' : 'Consolation'
                      ) : (
                        'Regular Season'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
