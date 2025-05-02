
import React from "react";
import FourTeamPlayoffs from "./playoff-bracket/FourTeamPlayoffs";
import ModifiedPlayoffs from "./playoff-bracket/ModifiedPlayoffs";
import SixTeamPlayoffs from "./playoff-bracket/SixTeamPlayoffs";
import FiveTeamPlayoffs from "./playoff-bracket/FiveTeamPlayoffs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { MatchupScoresView, TeamRecordsView } from "@/types/database";

const PlayoffBracket = ({ season }: { season: string }) => {
  const seasonNum = Number(season);
  
  // Fetch playoff and consolation matchups data based on season
  const { data: matchups, isLoading: matchupsLoading } = useQuery({
    queryKey: ['playoff-matchups', seasonNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .eq('season_id', seasonNum)
        .or('is_playoff.eq.true,is_consolation.eq.true')
        .order('week_number');
        
      if (error) throw error;
      return data as MatchupScoresView[];
    },
  });

  // Fetch teams data
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Fetch regular season standings to determine seeding
  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings', seasonNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_records_view')
        .select('*')
        .eq('season_id', seasonNum);
        
      if (error) throw error;
      return data as TeamRecordsView[];
    },
  });

  const isLoading = matchupsLoading || teamsLoading || standingsLoading;

  if (isLoading) {
    return <p className="text-center py-4">Loading playoff data...</p>;
  }

  // Sort teams by regular season record to determine seeding
  const sortedTeams = standings ? [...standings].sort((a, b) => {
    const aTotal = a.regular_season_wins + a.regular_season_losses + (a.regular_season_ties || 0);
    const bTotal = b.regular_season_wins + b.regular_season_losses + (b.regular_season_ties || 0);
    
    const aPercentage = aTotal === 0 ? 0 : (a.regular_season_wins + 0.5 * (a.regular_season_ties || 0)) / aTotal;
    const bPercentage = bTotal === 0 ? 0 : (b.regular_season_wins + 0.5 * (b.regular_season_ties || 0)) / bTotal;
    
    if (aPercentage !== bPercentage) {
      return bPercentage - aPercentage;
    }
    return b.regular_season_points_for - a.regular_season_points_for;
  }) : [];

  // Create a map of team ID to seed number
  const teamSeeds = new Map<number, number>();
  sortedTeams.forEach((team, index) => {
    if (team.team_id) {
      teamSeeds.set(team.team_id, index + 1);
    }
  });

  // Display appropriate bracket based on season
  const renderBracket = () => {
    // Seasons 1-7: 4-team playoffs (standard format)
    if (seasonNum <= 7) {
      return <FourTeamPlayoffs 
        matchups={matchups || []} 
        teams={teams || []} 
        teamSeeds={teamSeeds}
      />;
    }

    // Seasons 8-10: Modified playoffs with loser-advances format
    if (seasonNum <= 10) {
      return <ModifiedPlayoffs 
        matchups={matchups || []} 
        teams={teams || []} 
        teamSeeds={teamSeeds}
        seasonNumber={seasonNum}
      />;
    }

    // Seasons 11-12: 6-team playoffs with playoffs starting in week 15
    if (seasonNum <= 12) {
      return <SixTeamPlayoffs 
        matchups={matchups || []} 
        teams={teams || []}
        teamSeeds={teamSeeds} 
      />;
    }

    // Season 13+: 5-team playoffs
    return <FiveTeamPlayoffs 
      matchups={matchups || []} 
      teams={teams || []}
      teamSeeds={teamSeeds}
    />;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center">Playoff Bracket</h2>
      </div>

      {renderBracket()}
    </Card>
  );
};

export default PlayoffBracket;
