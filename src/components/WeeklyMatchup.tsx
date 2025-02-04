import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const WeeklyMatchup = () => {
  const [selectedWeek, setSelectedWeek] = useState("1");
  const weeks = Array.from({ length: 17 }, (_, i) => i + 1);

  const { data: matchup, isLoading } = useQuery({
    queryKey: ['matchup', selectedWeek],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_matchups')
        .select(`
          *,
          team1:teams!weekly_matchups_team1_id_fkey(name),
          team2:teams!weekly_matchups_team2_id_fkey(name)
        `)
        .eq('week_number', parseInt(selectedWeek, 10))
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Weekly Matchup</h2>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Week" />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((week) => (
              <SelectItem key={week} value={week.toString()}>
                Week {week}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {matchup ? (
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-lg font-semibold">{matchup.team1.name}</p>
            <p className="text-3xl font-bold text-primary">{matchup.team1_score}</p>
          </div>
          
          <div className="text-xl font-bold text-muted-foreground">VS</div>
          
          <div className="text-center">
            <p className="text-lg font-semibold">{matchup.team2.name}</p>
            <p className="text-3xl font-bold text-secondary">{matchup.team2_score}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No matchup found for Week {selectedWeek}
        </div>
      )}
    </Card>
  );
};

export default WeeklyMatchup;