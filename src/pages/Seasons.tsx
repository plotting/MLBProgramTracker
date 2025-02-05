import { Card } from "@/components/ui/card";
import { useState } from "react";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import PlayoffBracket from "@/components/PlayoffBracket";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import StandingsTable from "@/components/standings/StandingsTable";
import SeasonHeader from "@/components/seasons/SeasonHeader";

const Seasons = () => {
  const [selectedSeason, setSelectedSeason] = useState("13");

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data as Team[];
    },
  });

  // Create a map of team IDs to names
  const teamNames = teams?.reduce((acc, team) => ({
    ...acc,
    [team.id]: team.name
  }), {}) || {};

  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings', selectedSeason],
    queryFn: async () => {
      const { data: matchups, error } = await supabase
        .from('weekly_matchups')
        .select(`
          *,
          team1:teams!weekly_matchups_team1_id_fkey(*),
          team2:teams!weekly_matchups_team2_id_fkey(*)
        `)
        .eq('season_id', parseInt(selectedSeason))
        .eq('is_playoff', false);

      if (error) throw error;

      const standingsMap = new Map();
      
      matchups?.forEach((matchup) => {
        if (!standingsMap.has(matchup.team1_id)) {
          standingsMap.set(matchup.team1_id, {
            id: matchup.team1_id,
            team: teamNames[matchup.team1_id] || `Team ${matchup.team1_id}`,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
          });
        }
        
        if (!standingsMap.has(matchup.team2_id)) {
          standingsMap.set(matchup.team2_id, {
            id: matchup.team2_id,
            team: teamNames[matchup.team2_id] || `Team ${matchup.team2_id}`,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
          });
        }

        const team1Stats = standingsMap.get(matchup.team1_id);
        const team2Stats = standingsMap.get(matchup.team2_id);

        if (matchup.team1_score > matchup.team2_score) {
          team1Stats.wins++;
          team2Stats.losses++;
        } else {
          team1Stats.losses++;
          team2Stats.wins++;
        }

        team1Stats.pointsFor += Number(matchup.team1_score);
        team1Stats.pointsAgainst += Number(matchup.team2_score);
        team2Stats.pointsFor += Number(matchup.team2_score);
        team2Stats.pointsAgainst += Number(matchup.team1_score);
      });

      // If there are teams without any matchups, add them with 0s
      teams?.forEach(team => {
        if (!standingsMap.has(team.id)) {
          standingsMap.set(team.id, {
            id: team.id,
            team: teamNames[team.id],
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            avgPoints: 0,
          });
        }
      });

      return Array.from(standingsMap.values())
        .map(team => ({
          ...team,
          record: `${team.wins}-${team.losses}`,
          avgPoints: team.wins + team.losses > 0 ? team.pointsFor / (team.wins + team.losses) : 0,
        }))
        .sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);
    },
    enabled: !!teams, // Only run this query after teams are loaded
  });

  if (teamsLoading || standingsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen space-y-8">
      <SeasonHeader 
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
      />

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">League Standings</h2>
          <StandingsTable standings={standings || []} selectedSeason={selectedSeason} />
        </div>
      </Card>

      <PlayoffBracket season={selectedSeason} />

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Weekly Matchups</h2>
        <WeeklyMatchup />
      </div>
    </div>
  );
};

export default Seasons;