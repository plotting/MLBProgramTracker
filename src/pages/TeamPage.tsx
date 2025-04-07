
import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TeamHeader from "@/components/team/TeamHeader";
import TeamStatsCards from "@/components/team/TeamStatsCards";
import TeamMatchups from "@/components/team/TeamMatchups";
import TeamDraftHistory from "@/components/team/TeamDraftHistory";
import TeamTradesHistory from "@/components/team/TeamTradesHistory";
import TradeAssetModal from "@/components/TradeAssetModal";

const TeamPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get("season") || "career");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);

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

  const { data: teamRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['team-records', id, selectedSeason],
    queryFn: async () => {
      if (!id) throw new Error('No team ID provided');
      
      if (selectedSeason === 'career') {
        // For career view, we need to aggregate data from all seasons
        const { data, error } = await supabase
          .from('team_records_view')
          .select('*')
          .eq('team_id', parseInt(id));

        if (error) throw error;
        
        // Aggregate the data
        if (data && data.length > 0) {
          return {
            season_id: null, // Use null for career view
            team_id: parseInt(id),
            team_name: team?.name || '',
            regular_season_wins: data.reduce((sum, record) => sum + (record.regular_season_wins || 0), 0),
            regular_season_losses: data.reduce((sum, record) => sum + (record.regular_season_losses || 0), 0),
            regular_season_ties: data.reduce((sum, record) => sum + (record.regular_season_ties || 0), 0),
            regular_season_points_for: data.reduce((sum, record) => sum + (record.regular_season_points_for || 0), 0),
            regular_season_points_against: data.reduce((sum, record) => sum + (record.regular_season_points_against || 0), 0),
            playoff_wins: data.reduce((sum, record) => sum + (record.playoff_wins || 0), 0),
            playoff_losses: data.reduce((sum, record) => sum + (record.playoff_losses || 0), 0),
            playoff_ties: data.reduce((sum, record) => sum + (record.playoff_ties || 0), 0),
            playoff_points_for: data.reduce((sum, record) => sum + (record.playoff_points_for || 0), 0),
            playoff_points_against: data.reduce((sum, record) => sum + (record.playoff_points_against || 0), 0),
          };
        }
        return null;
      } else {
        // For specific season, get that season's data
        const { data, error } = await supabase
          .from('team_records_view')
          .select('*')
          .eq('season_id', parseInt(selectedSeason))
          .eq('team_id', parseInt(id))
          .maybeSingle();

        if (error) throw error;
        return data;
      }
    },
    enabled: !!id && !!team,
    retry: 1,
  });

  const isPageLoading = isLoading || recordsLoading;
  
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading team data...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Team not found or error loading data</p>
      </div>
    );
  }

  const handleAssetClick = (assetDescription: string) => {
    setSelectedAsset(assetDescription);
    setAssetModalOpen(true);
  };

  const parsedTeamId = parseInt(id!);

  return (
    <div className="min-h-screen container mx-auto px-4 py-6">
      <TeamHeader 
        teamName={team.name} 
        selectedSeason={selectedSeason} 
        setSelectedSeason={setSelectedSeason} 
      />

      <TeamStatsCards teamRecords={teamRecords} isLoading={recordsLoading} />

      <div className="grid grid-cols-1 gap-6 mt-6">
        {selectedSeason !== 'career' && (
          <TeamMatchups teamId={parsedTeamId} selectedSeason={selectedSeason} />
        )}

        <TeamDraftHistory 
          teamId={parsedTeamId} 
          onAssetClick={handleAssetClick} 
          selectedSeason={selectedSeason}
        />

        <TeamTradesHistory 
          teamId={parsedTeamId} 
          selectedSeason={selectedSeason} 
        />
      </div>

      <TradeAssetModal 
        open={assetModalOpen} 
        onOpenChange={setAssetModalOpen} 
        assetDescription={selectedAsset} 
      />
    </div>
  );
};

export default TeamPage;
