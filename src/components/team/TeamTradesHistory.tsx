
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState } from "react";
import TradeAssetModal from "@/components/TradeAssetModal";

interface TeamTradesHistoryProps {
  teamId: number;
  selectedSeason: string;
}

const TeamTradesHistory = ({ teamId, selectedSeason }: TeamTradesHistoryProps) => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);

  const { data: trades, isLoading } = useQuery({
    queryKey: ['team-trades', teamId, selectedSeason],
    queryFn: async () => {
      if (!teamId) throw new Error('No team ID provided');
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
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .order('trade_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!teamId,
    retry: 1,
  });

  const handleAssetClick = (assetDescription: string) => {
    setSelectedAsset(assetDescription);
    setAssetModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Trades History</h2>
        <div className="flex justify-center py-4">
          Loading trades...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Trades History</h2>
      {trades && trades.length > 0 ? (
        <div className="space-y-4">
          {trades.map((trade) => {
            const isTeam1 = trade.team1_id === teamId;
            const otherTeam = isTeam1 ? trade.team2 : trade.team1;
            const receivedItems = trade.items.filter(item => 
              item.to_team_id === teamId
            );
            const sentItems = trade.items.filter(item => 
              item.from_team_id === teamId
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
                    {receivedItems.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {receivedItems.map((item, index) => (
                          <li 
                            key={index} 
                            className="text-muted-foreground cursor-pointer hover:text-primary hover:underline"
                            onClick={() => handleAssetClick(item.item_description)}
                          >
                            {item.item_description}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No items received</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Sent:</p>
                    {sentItems.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {sentItems.map((item, index) => (
                          <li 
                            key={index} 
                            className="text-muted-foreground cursor-pointer hover:text-primary hover:underline"
                            onClick={() => handleAssetClick(item.item_description)}
                          >
                            {item.item_description}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No items sent</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">No trades found for this season</p>
      )}

      <TradeAssetModal 
        open={assetModalOpen} 
        onOpenChange={setAssetModalOpen} 
        assetDescription={selectedAsset} 
      />
    </Card>
  );
};

export default TeamTradesHistory;
