
import { MatchupScoresView } from "@/types/database";

/**
 * Get final teams for the toilet bowl (the worst-performing teams)
 * Used in the modified playoffs bracket (seasons 8-10)
 */
export const getToiletBowlTeams = (
  consolationMatchups: MatchupScoresView[]
): { round1Winners: number[], round1Losers: number[] } => {
  const round1Winners: number[] = [];
  const round1Losers: number[] = [];

  // Get week 15 consolation matchups (round 1)
  const week15Matchups = consolationMatchups.filter(m => m.week_number === 15);
  
  for (const matchup of week15Matchups) {
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
