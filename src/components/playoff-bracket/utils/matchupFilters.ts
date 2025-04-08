
import { MatchupScoresView } from "@/types/database";

/**
 * Filter playoff matchups (non-consolation)
 */
export const filterPlayoffMatchups = (matchups: MatchupScoresView[]): MatchupScoresView[] => {
  return matchups.filter(
    (matchup) => matchup.is_playoff && !matchup.is_consolation
  );
};

/**
 * Filter semifinal matchups by week
 */
export const getSemiFinals = (
  playoffMatchups: MatchupScoresView[], 
  playoffStartWeek: number
): MatchupScoresView[] => {
  return playoffMatchups.filter(
    (matchup) => matchup.week_number === playoffStartWeek
  );
};

/**
 * Sort semifinal matchups by seed
 */
export const sortSemiFinalsBySeeds = (
  semiFinals: MatchupScoresView[], 
  teamSeeds: Map<number, number>
): MatchupScoresView[] => {
  return [...semiFinals].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });
};

/**
 * Get championship matchup
 */
export const getChampionship = (
  playoffMatchups: MatchupScoresView[], 
  champWeek: number
): MatchupScoresView | undefined => {
  return playoffMatchups.find(
    (matchup) => matchup.week_number === champWeek && !matchup.is_consolation
  );
};

/**
 * Get consolation matchups for specific week
 */
export const getConsolationMatchups = (
  matchups: MatchupScoresView[],
  week: number
): MatchupScoresView[] => {
  return matchups
    .filter((matchup) => matchup.is_consolation)
    .filter((matchup) => matchup.week_number === week);
};
