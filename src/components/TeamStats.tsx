import { Card } from "@/components/ui/card";

const TeamStats = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Team Performance</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Points For</span>
          <span className="font-semibold text-primary">1,724.8</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Points Against</span>
          <span className="font-semibold text-secondary">1,652.3</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Highest Score</span>
          <span className="font-semibold text-green-500">168.4</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Lowest Score</span>
          <span className="font-semibold text-red-500">98.2</span>
        </div>
      </div>
    </Card>
  );
};

export default TeamStats;