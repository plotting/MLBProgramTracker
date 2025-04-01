
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamRecordsView, MatchupScoresView } from "@/types/database";
import { getTeamFinalPlacements } from "../playoff-bracket/utils/bracketUtils";

export const useStandingsData = (seasonId: number) => {
  // Fetch team records data
  const { 
    data: standings, 
    isLoading: recordsLoading 
  } = useQuery({
    queryKey: ['standings', seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_records_view')
        .select('*')
        .eq('season_id', seasonId);
        
      if (error) throw error;
      return data as TeamRecordsView[];
    },
  });

  // Fetch playoff matchups to determine final standings
  const { 
    data: playoffMatchups, 
    isLoading: matchupsLoading 
  } = useQuery({
    queryKey: ['playoff-matchups', seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .eq('season_id', seasonId)
        .or('is_playoff.eq.true,is_consolation.eq.true,week_number.gte.15');
        
      if (error) throw error;
      return data as MatchupScoresView[];
    },
  });

  const isLoading = recordsLoading || matchupsLoading;

  // Sort by regular season record
  const sortedByRegularSeason = standings ? [...standings].sort((a, b) => {
    const aTotal = a.regular_season_wins + a.regular_season_losses + a.regular_season_ties;
    const bTotal = b.regular_season_wins + b.regular_season_losses + b.regular_season_ties;
    
    const aPercentage = aTotal === 0 ? 0 : (a.regular_season_wins + 0.5 * a.regular_season_ties) / aTotal;
    const bPercentage = bTotal === 0 ? 0 : (b.regular_season_wins + 0.5 * b.regular_season_ties) / bTotal;
    
    if (aPercentage !== bPercentage) {
      return bPercentage - aPercentage;
    }
    return b.regular_season_points_for - a.regular_season_points_for;
  }) : [];

  // Get team placements
  const teamPlacements = playoffMatchups ? getTeamFinalPlacements(playoffMatchups) : new Map();

  return {
    sortedByRegularSeason,
    teamPlacements,
    isLoading
  };
};
