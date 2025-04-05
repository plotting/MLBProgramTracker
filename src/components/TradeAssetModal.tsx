
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TradeAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetDescription: string | null;
}

const TradeAssetModal = ({ open, onOpenChange, assetDescription }: TradeAssetModalProps) => {
  const { data: trades, isLoading } = useQuery({
    queryKey: ["trades-by-asset", assetDescription],
    queryFn: async () => {
      if (!assetDescription) return [];
      
      const { data, error } = await supabase
        .from("trades")
        .select(`
          *,
          team1:teams!trades_team1_id_fkey(id, name),
          team2:teams!trades_team2_id_fkey(id, name),
          items:trade_items(
            item_type,
            item_description,
            from_team_id,
            to_team_id,
            from_team:teams!trade_items_from_team_id_fkey(name),
            to_team:teams!trade_items_to_team_id_fkey(name)
          ),
          season:seasons(season_number)
        `)
        .filter("items.item_description", "ilike", `%${assetDescription}%`);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!assetDescription && open
  });

  if (!assetDescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trades involving "{assetDescription}"</DialogTitle>
          <DialogDescription>
            All trades involving this asset
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            Loading trades...
          </div>
        ) : trades && trades.length > 0 ? (
          <div className="space-y-6 mt-4">
            {trades.map((trade) => (
              <Card key={trade.id} className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      <span className="text-muted-foreground">Trade between </span>
                      <Link 
                        to={`/team/${trade.team1.id}?season=${trade.season.season_number}`}
                        className="text-primary hover:underline"
                      >
                        {trade.team1.name}
                      </Link>
                      <span className="text-muted-foreground"> and </span>
                      <Link 
                        to={`/team/${trade.team2.id}?season=${trade.season.season_number}`}
                        className="text-primary hover:underline"
                      >
                        {trade.team2.name}
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(trade.trade_date), "MMM d, yyyy")}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm font-medium mb-1">{trade.team1.name} received:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {trade.items
                          ?.filter(item => item.to_team_id === trade.team1_id)
                          .map((item, index) => (
                            <li key={index} className={
                              item.item_description === assetDescription 
                                ? "font-bold text-primary" 
                                : "text-muted-foreground"
                            }>
                              {item.item_description}
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{trade.team2.name} received:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {trade.items
                          ?.filter(item => item.to_team_id === trade.team2_id)
                          .map((item, index) => (
                            <li key={index} className={
                              item.item_description === assetDescription 
                                ? "font-bold text-primary" 
                                : "text-muted-foreground"
                            }>
                              {item.item_description}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-sm text-right">
                    <Link 
                      to={`/trades?season=${trade.season.season_number}`}
                      className="text-primary hover:underline"
                    >
                      View season {trade.season.season_number} trades
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No trades found involving this asset
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TradeAssetModal;
