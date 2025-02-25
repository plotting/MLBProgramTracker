
import { Card } from "@/components/ui/card";
import { useState } from "react";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import PlayoffBracket from "@/components/PlayoffBracket";
import { supabase } from "@/integrations/supabase/client";
import { TeamRecordsView } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import StandingsTable from "@/components/standings/StandingsTable";
import SeasonHeader from "@/components/seasons/SeasonHeader";

const Seasons = () => {
  const [selectedSeason, setSelectedSeason] = useState("1");

  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings', selectedSeason],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_records_view')
        .select('*')
        .eq('season_id', parseInt(selectedSeason))
        .order('regular_season_wins', { ascending: false })
        .order('regular_season_points_for', { ascending: false });

      if (error) throw error;
      return data as TeamRecordsView[];
    },
  });

  if (standingsLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-muted-foreground">Loading league data...</div>
    </div>;
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
        <WeeklyMatchup season={selectedSeason} />
      </div>
    </div>
  );
};

export default Seasons;
