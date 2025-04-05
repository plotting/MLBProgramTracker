
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getSeasonLabel } from "@/utils/seasonUtils";
import { useState } from "react";
import TradeAssetModal from "@/components/TradeAssetModal";

interface TeamDraftHistoryProps {
  teamId: number;
}

const TeamDraftHistory = ({ teamId }: TeamDraftHistoryProps) => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);

  const { data: draftPicks, isLoading } = useQuery({
    queryKey: ['team-draft-history', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('draft_picks')
        .select('*, season:seasons(season_number)')
        .eq('team_id', teamId)
        .order('season_id', { ascending: false })
        .order('round')
        .order('pick_number');
      
      if (error) throw error;
      return data;
    },
  });

  const handlePlayerClick = (playerName: string) => {
    setSelectedAsset(playerName);
    setAssetModalOpen(true);
  };

  if (isLoading) {
    return <p className="text-center py-4">Loading draft history...</p>;
  }

  if (!draftPicks || draftPicks.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No draft history available for this team
      </Card>
    );
  }

  // Group draft picks by season for easier display
  const draftPicksBySeason = draftPicks.reduce((acc, pick) => {
    const seasonNumber = pick.season?.season_number || 0;
    if (!acc[seasonNumber]) {
      acc[seasonNumber] = [];
    }
    acc[seasonNumber].push(pick);
    return acc;
  }, {} as Record<number, typeof draftPicks>);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Draft History</h2>
      
      {Object.entries(draftPicksBySeason)
        .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort by season number descending
        .map(([seasonNumber, picks]) => (
          <div key={seasonNumber} className="mb-6 last:mb-0">
            <h3 className="text-lg font-medium mb-2">
              {getSeasonLabel(seasonNumber)}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Pick #</TableHead>
                  <TableHead>Player</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {picks.map((pick) => (
                  <TableRow key={`${pick.season_id}-${pick.round}-${pick.pick_number}`}>
                    <TableCell>{pick.round}</TableCell>
                    <TableCell>{pick.pick_number}</TableCell>
                    <TableCell>
                      <span 
                        className="cursor-pointer hover:text-primary hover:underline"
                        onClick={() => handlePlayerClick(pick.player_name)}
                      >
                        {pick.player_name}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}

      <TradeAssetModal 
        open={assetModalOpen} 
        onOpenChange={setAssetModalOpen} 
        assetDescription={selectedAsset} 
      />
    </Card>
  );
};

export default TeamDraftHistory;
