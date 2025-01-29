import { Card } from "@/components/ui/card";
import { ChartBar, Trophy, Users } from "lucide-react";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import TeamStats from "@/components/TeamStats";

const Index = () => {
  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Fantasy Football Stats</h1>
        <p className="text-muted-foreground">Track your league's performance and statistics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="stat-value">1st Place</p>
              <p className="stat-label">Current Standing</p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <ChartBar className="w-8 h-8 text-primary" />
            <div>
              <p className="stat-value">156.7</p>
              <p className="stat-label">Average Points</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="stat-value">8-3</p>
              <p className="stat-label">Win-Loss Record</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeeklyMatchup />
        <TeamStats />
      </div>
    </div>
  );
};

export default Index;