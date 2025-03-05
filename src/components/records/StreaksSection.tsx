
import { MatchupScoresView } from "@/types/database";
import { StreakTable } from "./StreakTable";
import { calculateStreaks, getStreakArrays } from "@/utils/streakUtils";

interface StreaksSectionProps {
  matchups: MatchupScoresView[];
}

export const StreaksSection = ({ matchups }: StreaksSectionProps) => {
  const streaks = calculateStreaks(matchups);
  const streakArrays = getStreakArrays(streaks);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <StreakTable 
        title="Longest Winning Streaks" 
        allRecords={streakArrays.winningStreaks} 
        matchups={matchups}
      />
      <StreakTable 
        title="Longest Losing Streaks" 
        allRecords={streakArrays.losingStreaks} 
        matchups={matchups}
      />
      <StreakTable 
        title="Most Consecutive 100+ Point Games" 
        allRecords={streakArrays.hundredPlusStreaks} 
        matchups={matchups}
      />
      <StreakTable 
        title="Most Consecutive Sub-100 Point Games" 
        allRecords={streakArrays.underHundredStreaks} 
        matchups={matchups}
      />
    </div>
  );
};
