import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAllSeasons } from "@/utils/seasonUtils";
import { format } from "date-fns";

const Trades = () => {
  const [selectedSeason, setSelectedSeason] = useState("13");

  const { data: trades, isLoading } = useQuery({
    queryKey: ["trades", selectedSeason],
    queryFn: async () => {
      const { data: tradesData, error } = await supabase
        .from("trades")
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
        .eq("season_id", selectedSeason)
        .order("trade_date", { ascending: false });

      if (error) throw error;
      return tradesData;
    },
  });

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Trade History</h1>
            <p className="text-muted-foreground">View all trades across seasons</p>
          </div>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {getAllSeasons()
                .reverse()
                .map((season) => (
                  <SelectItem key={season.value} value={season.value}>
                    {season.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-4">Loading trades...</div>
        ) : trades && trades.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    {format(new Date(trade.trade_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to={`/team/${trade.team1_id}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {trade.team1.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {trade.items
                        .filter(
                          (item) => item.to_team_id === trade.team1_id
                        )
                        .map((item, index) => (
                          <li key={index} className="text-sm">
                            {item.item_description}
                          </li>
                        ))}
                    </ul>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to={`/team/${trade.team2_id}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {trade.team2.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {trade.items
                        .filter(
                          (item) => item.to_team_id === trade.team2_id
                        )
                        .map((item, index) => (
                          <li key={index} className="text-sm">
                            {item.item_description}
                          </li>
                        ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No trades found for this season
          </div>
        )}
      </Card>
    </div>
  );
};

export default Trades;