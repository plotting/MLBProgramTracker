
import { MatchupScoresView } from "@/types/database";

/**
 * Filters playoff matchups for a specific week
 */
export const filterMatchupsByWeek = (
  matchups: MatchupScoresView[],
  weekNumber: number,
  playoffOnly: boolean = false,
  consolationOnly: boolean = false
): MatchupScoresView[] => {
  return matchups.filter((matchup) => {
    const isCorrectWeek = matchup.week_number === weekNumber;
    
    if (playoffOnly) {
      return isCorrectWeek && matchup.is_playoff && !matchup.is_consolation;
    }
    
    if (consolationOnly) {
      return isCorrectWeek && matchup.is_consolation;
    }
    
    return isCorrectWeek;
  });
};
