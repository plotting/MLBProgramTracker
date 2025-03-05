
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PlayoffBracket from "@/components/PlayoffBracket";
import StandingsTable from "@/components/standings/StandingsTable";
import SeasonHeader from "@/components/seasons/SeasonHeader";
import ScheduleSwapTable from "@/components/schedule/ScheduleSwapTable";
import TeamComparison from "@/components/seasons/TeamComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Seasons = () => {
  const [selectedSeason, setSelectedSeason] = useState("1");
  const [activeTab, setActiveTab] = useState("overview");
  const seasonNumber = parseInt(selectedSeason);

  // Reset to overview tab when season changes
  useEffect(() => {
    setActiveTab("overview");
  }, [selectedSeason]);

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("id");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen space-y-8">
      <SeasonHeader 
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Team Comparison</TabsTrigger>
          <TabsTrigger value="playoffs">Playoff Bracket</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">League Standings</h2>
              <StandingsTable seasonId={parseInt(selectedSeason)} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <TeamComparison seasonId={seasonNumber} teams={teams} />
        </TabsContent>

        <TabsContent value="playoffs">
          <PlayoffBracket season={selectedSeason} />
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Schedule Analysis</h2>
              <ScheduleSwapTable seasonId={seasonNumber} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Seasons;
