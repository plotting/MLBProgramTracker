
import { Card } from "@/components/ui/card";
import type { TeamRecordsView } from "@/types/database";

interface TeamStatsCardsProps {
  teamRecords: TeamRecordsView | null;
  isLoading: boolean;
}

const TeamStatsCards = ({ teamRecords, isLoading }: TeamStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Loading...</h3>
            <div className="animate-pulse h-16 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const regularSeasonWins = teamRecords?.regular_season_wins || 0;
  const regularSeasonLosses = teamRecords?.regular_season_losses || 0;
  const regularSeasonTies = teamRecords?.regular_season_ties || 0;
  const regularSeasonPointsFor = teamRecords?.regular_season_points_for || 0;
  const regularSeasonPointsAgainst = teamRecords?.regular_season_points_against || 0;
  
  const playoffWins = teamRecords?.playoff_wins || 0;
  const playoffLosses = teamRecords?.playoff_losses || 0;
  const playoffTies = teamRecords?.playoff_ties || 0;
  const playoffPointsFor = teamRecords?.playoff_points_for || 0;
  const playoffPointsAgainst = teamRecords?.playoff_points_against || 0;
  
  const totalWins = regularSeasonWins + playoffWins;
  const totalLosses = regularSeasonLosses + playoffLosses;
  const totalTies = regularSeasonTies + playoffTies;
  const totalPointsFor = regularSeasonPointsFor + playoffPointsFor;
  const totalPointsAgainst = regularSeasonPointsAgainst + playoffPointsAgainst;
  
  const totalGames = totalWins + totalLosses + totalTies;
  const regularSeasonGames = regularSeasonWins + regularSeasonLosses + regularSeasonTies;
  const playoffGames = playoffWins + playoffLosses + playoffTies;
  
  const avgPoints = totalGames > 0 ? totalPointsFor / totalGames : 0;
  const regularSeasonAvgPoints = regularSeasonGames > 0 ? regularSeasonPointsFor / regularSeasonGames : 0;
  const playoffAvgPoints = playoffGames > 0 ? playoffPointsFor / playoffGames : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Record</h3>
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Regular Season:</p>
            <p className="text-xl font-bold">
              {regularSeasonWins}-{regularSeasonLosses}{regularSeasonTies > 0 ? `-${regularSeasonTies}` : ''}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-medium">Playoffs:</p>
            <p className="text-xl font-bold">
              {playoffWins}-{playoffLosses}{playoffTies > 0 ? `-${playoffTies}` : ''}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
            <p className="text-sm font-medium">Total:</p>
            <p className="text-xl font-bold">
              {totalWins}-{totalLosses}{totalTies > 0 ? `-${totalTies}` : ''}
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Points For</h3>
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Regular Season:</p>
            <p className="text-xl font-bold">
              {regularSeasonPointsFor.toFixed(1)}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-medium">Playoffs:</p>
            <p className="text-xl font-bold">
              {playoffPointsFor.toFixed(1)}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
            <p className="text-sm font-medium">Total:</p>
            <p className="text-xl font-bold">
              {totalPointsFor.toFixed(1)}
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Points Against</h3>
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Regular Season:</p>
            <p className="text-xl font-bold">
              {regularSeasonPointsAgainst.toFixed(1)}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-medium">Playoffs:</p>
            <p className="text-xl font-bold">
              {playoffPointsAgainst.toFixed(1)}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
            <p className="text-sm font-medium">Total:</p>
            <p className="text-xl font-bold">
              {totalPointsAgainst.toFixed(1)}
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Points</h3>
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Regular Season:</p>
            <p className="text-xl font-bold">
              {regularSeasonAvgPoints.toFixed(1)}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-medium">Playoffs:</p>
            <p className="text-xl font-bold">
              {playoffAvgPoints.toFixed(1)}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
            <p className="text-sm font-medium">Total:</p>
            <p className="text-xl font-bold">
              {avgPoints.toFixed(1)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeamStatsCards;
