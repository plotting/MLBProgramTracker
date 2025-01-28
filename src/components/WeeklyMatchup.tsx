import { Card } from "@/components/ui/card";

const WeeklyMatchup = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Weekly Matchup</h2>
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