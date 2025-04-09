
import { MatchupScoresView } from "@/types/database";

/**
 * Filter playoff matchups (non-consolation)
 */
export const getPlayoffMatchups = (matchups: MatchupScoresView[]): MatchupScoresView[] => {
  return matchups.filter(
    (matchup) => matchup.is_playoff && !matchup.is_consolation
  );
};

/**
 * Get wildcard matchups (week 15) - for 5-team format
 */
export const getWildcardGames = (playoffMatchups: MatchupScoresView[]): MatchupScoresView[] => {
  return playoffMatchups.filter(
    (matchup) => matchup.week_number === 15 && matchup.home_team_id !== 1
  );
};

/**
 * Get semifinal matchup with the 1 seed (week 15)
 */
export const getSeedOneSemifinal = (playoffMatchups: MatchupScoresView[]): MatchupScoresView | undefined => {
  return playoffMatchups.find(
    (matchup) => matchup.week_number === 15 && matchup.home_team_id === 1
  );
};

/**
 * Get championship matchup (week 16)
 */
export const getChampionship = (playoffMatchups: MatchupScoresView[]): MatchupScoresView | undefined => {
  return playoffMatchups.find(
    (matchup) => matchup.week_number === 16
  );
};

/**
 * Get consolation matchups
 */
export const getConsolationMatchups = (matchups: MatchupScoresView[]): MatchupScoresView[] => {
  return matchups.filter(
    (matchup) => matchup.is_consolation
  );
};

/**
 * Get week 15 consolation matchups
 */
export const getWeekFifteenConsolation = (consolationMatchups: MatchupScoresView[]): MatchupScoresView[] => {
  return consolationMatchups.filter(
    (matchup) => matchup.week_number === 15
  );
};

/**
 * Get week 16 consolation matchups (3rd place and other games)
 */
export const getWeekSixteenConsolation = (consolationMatchups: MatchupScoresView[]): MatchupScoresView[] => {
  return consolationMatchups.filter(
    (matchup) => matchup.week_number === 16
  );
};

/**
 * Get winners from week 15 consolation matchups (loser advances format)
 */
export const getWeekFifteenConsolationWinners = (
  weekFifteenConsolation: MatchupScoresView[]
): number[] => {
  return weekFifteenConsolation
    .filter(m => m.home_score !== null && m.away_score !== null)
    .map(m => {
      // In "loser advances" format, we want the winners (who don't advance)
      return m.home_score! > m.away_score! ? m.home_team_id : m.away_team_id;
    })
    .filter((id): id is number => id !== null && id !== undefined);
};

/**
 * Get losers from week 15 consolation matchups (loser advances format)
 */
export const getWeekFifteenConsolationLosers = (
  weekFifteenConsolation: MatchupScoresView[]
): number[] => {
  return weekFifteenConsolation
    .filter(m => m.home_score !== null && m.away_score !== null)
    .map(m => {
      // In "loser advances" format, we want the losers (who advance)
      return m.home_score! > m.away_score! ? m.away_team_id : m.home_team_id;
    })
    .filter((id): id is number => id !== null && id !== undefined);
};

/**
 * Identify specific placement games in week 16
 */
export const identifyPlacementGames = (
  weekSixteenConsolation: MatchupScoresView[],
  weekFifteenLosers: number[]
): { 
  seventhPlaceGame?: MatchupScoresView,
  ninthPlaceGame?: MatchupScoresView 
} => {
  // Filter for games that include week 15 losers (in loser advances format)
  const gamesWithLosers = weekSixteenConsolation.filter(game => 
    (game.home_team_id && weekFifteenLosers.includes(game.home_team_id)) ||
    (game.away_team_id && weekFifteenLosers.includes(game.away_team_id))
  );

  // The first game with week 15 losers is likely the 7th place game
  const seventhPlaceGame = gamesWithLosers[0];
  
  // The second game with week 15 losers is likely the 9th place game (toilet bowl)
  const ninthPlaceGame = gamesWithLosers[1];

  return { seventhPlaceGame, ninthPlaceGame };
};
