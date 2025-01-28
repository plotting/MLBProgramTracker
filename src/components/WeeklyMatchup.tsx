import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const WeeklyMatchup = () => {
  const [selectedWeek, setSelectedWeek] = useState("current");
  const weeks = Array.from({ length: 17 }, (_, i) => i + 1);

  // Mock data - replace with real data later
  const matchups = {
    current: {
      team1: { name: "Your Team", score: 142.6, projected: 138.5 },
      team2: { name: "Opponent", score: 138.2, projected: 135.8 },
    },
    // Add historical matchups here
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Weekly Matchup</h2>
        <Select
          value={selectedWeek}
          onValueChange={(value) => setSelectedWeek(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Week</SelectItem>
            {weeks.map((week) => (
              <SelectItem key={week} value={week.toString()}>
                Week {week}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Your Team</p>
          <p className="text-3xl font-bold text-primary">142.6</p>
          <p className="text-sm text-muted-foreground">Projected: 138.5</p>
        </div>
        
        <div className="text-xl font-bold text-muted-foreground">VS</div>
        
        <div className="text-center">
          <p className="text-lg font-semibold">Opponent</p>
          <p className="text-3xl font-bold text-secondary">138.2</p>
          <p className="text-sm text-muted-foreground">Projected: 135.8</p>
        </div>
      </div>
    </Card>
  );
};

export default WeeklyMatchup;