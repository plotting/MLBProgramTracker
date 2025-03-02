
import React from "react";
import FourTeamPlayoffs from "./playoff-bracket/FourTeamPlayoffs";
import ModifiedPlayoffs from "./playoff-bracket/ModifiedPlayoffs";
import SixTeamPlayoffs from "./playoff-bracket/SixTeamPlayoffs";
import FiveTeamPlayoffs from "./playoff-bracket/FiveTeamPlayoffs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PlayoffBracket = ({ season }: { season: string }) => {
  const seasonNum = Number(season);
  
  // Fetch playoff matchups data based on season
  const { data: matchups, isLoading } = useQuery({
    queryKey: ['playoff-matchups', seasonNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .eq('season_id', seasonNum)
        .eq('is_playoff', true)
        .order('week_number');
        
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="text-center py-4">Loading playoff data...</p>;
  }

  // Seasons 1-7: 4-team playoffs
  if (seasonNum <= 7) {
    return <FourTeamPlayoffs matchups={matchups || []} />;
  }

  // Seasons 8-10: Modified consolation bracket
  if (seasonNum <= 10) {
    return <ModifiedPlayoffs matchups={matchups || []} />;
  }

  // Seasons 11-12: 6-team playoffs
  if (seasonNum <= 12) {
    return <SixTeamPlayoffs matchups={matchups || []} />;
  }

  // Season 13+: 5-team playoffs
  return <FiveTeamPlayoffs matchups={matchups || []} />;
};

export default PlayoffBracket;
