
import { MatchupScoresView } from "@/types/database";

/**
 * Get semifinal losers' team IDs
 */
export const getSemiFinalLosers = (semiFinals: MatchupScoresView[]): number[] => {
  const losers: number[] = [];
  
  for (const match of semiFinals) {
    if (match.home_score === null || match.away_score === null) continue;
    
    const loser = match.home_score > match.away_score 
      ? match.away_team_id 
      : match.home_team_id;
    
    if (loser) losers.push(loser);
  }
  
  return losers;
};

/**
 * Find the third place game from a list of matchups
 */
export const findThirdPlaceGame = (
  matchups: MatchupScoresView[],
  semiFinalLosers: number[]
): MatchupScoresView | null => {
  // First check all week 16 matchups
  const week16Matchups = matchups.filter(m => m.week_number === 16);
  
  for (const matchup of week16Matchups) {
    if (semiFinalLosers.includes(matchup.home_team_id || 0) && 
        semiFinalLosers.includes(matchup.away_team_id || 0)) {
      return matchup;
    }
  }
  
  return null;
};
