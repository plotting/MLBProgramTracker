
import { MatchupScoresView } from "@/types/database";

/**
 * Get final teams for the toilet bowl (the worst-performing teams)
 * Used in the modified playoffs bracket (seasons 8-10)
 */
export const getToiletBowlTeams = (
  consolationMatchups: MatchupScoresView[],
  seasonNumber: number = 0
): { round1Winners: number[], round1Losers: number[], round2Winners: number[], round2Losers: number[] } => {
  const round1Winners: number[] = [];
  const round1Losers: number[] = [];
  const round2Winners: number[] = [];
  const round2Losers: number[] = [];

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

  // Process round 2 matchups (week 16) for seasons 8-10
  if (isLoserAdvancesFormat) {
    const round2Matchups = consolationMatchups.filter(m => m.week_number === playoffStartWeek + 1);
    
    for (const matchup of round2Matchups) {
      if (matchup.home_score === null || matchup.away_score === null) continue;

      // In seasons 8-10, we have a mix of matchups in week 16:
      // 1. The winners from round 1 play each other (5th place game)
      // 2. The losers from round 1 play against the bottom seeds
      
      const isFifthPlaceGame = round1Winners.includes(matchup.home_team_id || 0) && 
                              round1Winners.includes(matchup.away_team_id || 0);
                              
      if (!isFifthPlaceGame) {
        // For the toilet bowl track, the winners advance to 7th place game, losers to 9th place
        const winner = matchup.home_score > matchup.away_score 
          ? matchup.home_team_id 
          : matchup.away_team_id;
        
        const loser = matchup.home_score > matchup.away_score 
          ? matchup.away_team_id 
          : matchup.home_team_id;
        
        if (winner) round2Winners.push(winner);
        if (loser) round2Losers.push(loser);
      }
    }
  }
  
  return { round1Winners, round1Losers, round2Winners, round2Losers };
};

/**
 * Determine if a matchup is a specific place game in the playoffs
 * For example, identifying 5th place, 7th place or 9th place games
 */
export const identifyPlacementGame = (
  matchup: MatchupScoresView, 
  round1Winners: number[], 
  round1Losers: number[],
  round2Winners: number[],
  round2Losers: number[],
  seasonNumber: number = 0
): { isFifthPlace: boolean, isSeventhPlace: boolean, isNinthPlace: boolean } => {
  // For seasons 8-10, the toilet bowl format is "loser advances"
  const isLoserAdvancesFormat = seasonNumber >= 8 && seasonNumber <= 10;
  
  const homeId = matchup.home_team_id;
  const awayId = matchup.away_team_id;
  const champWeek = seasonNumber >= 11 ? 17 : 16;
  
  // Check if this is the final week
  const isFinalWeek = matchup.week_number === champWeek + 1;
  
  // Different logic for seasons 8-10
  if (isLoserAdvancesFormat) {
    // In seasons 8-10, during the championship week (week 17):
    // - 5th place game was determined in week 16 (played between winners of week 15 consolation games)
    // - 7th place game is between the winners of week 16 toilet bowl games
    // - 9th place game (toilet bowl) is between the losers of week 16 toilet bowl games
    
    if (isFinalWeek) {
      // If both teams are week 16 winners, it's the 7th place game
      const isSeventhPlace = 
        (homeId && round2Winners.includes(homeId)) && 
        (awayId && round2Winners.includes(awayId));
      
      // If both teams are week 16 losers, it's the 9th place game (toilet bowl)
      const isNinthPlace = 
        (homeId && round2Losers.includes(homeId)) && 
        (awayId && round2Losers.includes(awayId));
      
      return { 
        isFifthPlace: false, // 5th place game happens in week 16 for seasons 8-10
        isSeventhPlace, 
        isNinthPlace 
      };
    } else if (matchup.week_number === champWeek) {
      // In week 16, if both teams are from winners bracket, it's the 5th place game
      const isFifthPlace = 
        (homeId && round1Winners.includes(homeId)) && 
        (awayId && round1Winners.includes(awayId));
      
      return {
        isFifthPlace,
        isSeventhPlace: false,
        isNinthPlace: false
      };
    }
  } else {
    // Standard logic for other seasons
    // Check if both teams in the matchup are from winners bracket
    const isBothWinners = 
      (homeId && round1Winners.includes(homeId)) && 
      (awayId && round1Winners.includes(awayId));
    
    // Check if both teams in the matchup are from losers bracket
    const isBothLosers = 
      (homeId && round1Losers.includes(homeId)) && 
      (awayId && round1Losers.includes(awayId));
    
    // In standard format, 9th place game is between consolation losers
    const isNinthPlace = isBothLosers;
    
    // 5th place game is between consolation winners
    const isFifthPlace = isBothWinners;
    
    // 7th place game is typically mixed teams or otherwise undefined
    const isSeventhPlace = !isFifthPlace && !isNinthPlace;
    
    return { isFifthPlace, isSeventhPlace, isNinthPlace };
  }
  
  return { isFifthPlace: false, isSeventhPlace: false, isNinthPlace: false };
};
