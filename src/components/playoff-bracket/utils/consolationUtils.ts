
import { MatchupScoresView } from "@/types/database";

/**
 * Get final teams for the toilet bowl (the worst-performing teams)
 * Used in the modified playoffs bracket (seasons 8-10)
 */
export const getToiletBowlTeams = (
  consolationMatchups: MatchupScoresView[],
  seasonNumber: number = 0
): { round1Winners: number[], round1Losers: number[] } => {
  const round1Winners: number[] = [];
  const round1Losers: number[] = [];

  // Get week 15 consolation matchups (round 1)
  // For 17-week regular seasons, playoffs start in week 16 (not 15)
  const playoffStartWeek = seasonNumber >= 11 ? 16 : 15;
  const round1Matchups = consolationMatchups.filter(m => m.week_number === playoffStartWeek);
  
  // For seasons 8-10, the toilet bowl format is "loser advances"
  const isLoserAdvancesFormat = seasonNumber >= 8 && seasonNumber <= 10;
  
  for (const matchup of round1Matchups) {
    if (matchup.home_score === null || matchup.away_score === null) continue;
    
    const winner = matchup.home_score > matchup.away_score 
      ? matchup.home_team_id 
      : matchup.away_team_id;
    
    const loser = matchup.home_score > matchup.away_score 
      ? matchup.away_team_id 
      : matchup.home_team_id;
    
    if (winner) round1Winners.push(winner);
    if (loser) round1Losers.push(loser);
  }
  
  return { round1Winners, round1Losers };
};

/**
 * Determine if a matchup is a specific place game in the playoffs
 * For example, identifying 5th place, 7th place or 9th place games
 */
export const identifyPlacementGame = (
  matchup: MatchupScoresView, 
  round1Winners: number[], 
  round1Losers: number[],
  seasonNumber: number = 0
): { isFifthPlace: boolean, isSeventhPlace: boolean, isNinthPlace: boolean } => {
  // For seasons 8-10, the toilet bowl format is "loser advances"
  const isLoserAdvancesFormat = seasonNumber >= 8 && seasonNumber <= 10;
  
  // In loser advances format (seasons 8-10):
  // - 5th place game is between consolation winners
  // - 7th place game could be mixed teams or undefined
  // - 9th place game (toilet bowl) is between consolation losers
  
  const homeId = matchup.home_team_id;
  const awayId = matchup.away_team_id;
  
  // Check if both teams in the matchup are from winners bracket
  const isBothWinners = 
    (homeId && round1Winners.includes(homeId)) && 
    (awayId && round1Winners.includes(awayId));
  
  // Check if both teams in the matchup are from losers bracket
  const isBothLosers = 
    (homeId && round1Losers.includes(homeId)) && 
    (awayId && round1Losers.includes(awayId));
  
  // In loser advances format, 9th place game (toilet bowl) is between consolation losers
  const isNinthPlace = isBothLosers;
  
  // 5th place game is between consolation winners in both formats
  const isFifthPlace = isBothWinners;
  
  // 7th place game is typically mixed teams or otherwise undefined
  const isSeventhPlace = !isFifthPlace && !isNinthPlace;
  
  return { isFifthPlace, isSeventhPlace, isNinthPlace };
};
