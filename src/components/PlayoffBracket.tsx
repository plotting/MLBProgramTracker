
import React from "react";
import FourTeamPlayoffs from "./playoff-bracket/FourTeamPlayoffs";
import ModifiedPlayoffs from "./playoff-bracket/ModifiedPlayoffs";
import SixTeamPlayoffs from "./playoff-bracket/SixTeamPlayoffs";
import FiveTeamPlayoffs from "./playoff-bracket/FiveTeamPlayoffs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";

const PlayoffBracket = ({ season }: { season: string }) => {
  const seasonNum = Number(season);
  
  // Fetch playoff and consolation matchups data based on season
  const { data: matchups, isLoading } = useQuery({
    queryKey: ['playoff-matchups', seasonNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .eq('season_id', seasonNum)
        .or('is_playoff.eq.true,is_consolation.eq.true')
        .order('week_number');
        
      if (error) throw error;
      return data;
    },
  });

  // Fetch teams data
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="text-center py-4">Loading playoff data...</p>;
  }

  // Display appropriate bracket based on season
  const renderBracket = () => {
    // Seasons 1-7: 4-team playoffs
    if (seasonNum <= 7) {
      return <FourTeamPlayoffs matchups={matchups || []} teams={teams || []} />;
    }

    // Seasons 8-10: Modified consolation bracket
    if (seasonNum <= 10) {
      return <ModifiedPlayoffs matchups={matchups || []} teams={teams || []} />;
    }

    // Seasons 11-12: 6-team playoffs
    if (seasonNum <= 12) {
      return <SixTeamPlayoffs matchups={matchups || []} teams={teams || []} />;
    }

    // Season 13+: 5-team playoffs
    return <FiveTeamPlayoffs matchups={matchups || []} teams={teams || []} />;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Playoff Bracket</h2>
      </div>

      {renderBracket()}
    </Card>
  );
};

export default PlayoffBracket;
