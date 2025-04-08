
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
