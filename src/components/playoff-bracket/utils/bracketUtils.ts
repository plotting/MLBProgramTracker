
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
    
    losers.push(loser);
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

/**
 * Calculate team final placements based on playoff results
 */
export const getTeamFinalPlacements = (
  playoffMatchups: MatchupScoresView[]
): Map<number, number> => {
  if (!playoffMatchups || playoffMatchups.length === 0) return new Map();
  
  // Map to track team placement
  const teamPlacements = new Map<number, number>();
  
  // Get championship game (week 16)
  const championshipGame = playoffMatchups.find(m => 
    m.week_number === 16 && 
    m.is_playoff && 
    !m.is_consolation &&
    // For seasons with unusual configuration, find the championship game explicitly
    // by looking at who played (usually the top 2 teams from semifinals)
    ((playoffMatchups.filter(m => m.week_number === 15 && m.is_playoff && !m.is_consolation).length >= 2) ||
     (m === playoffMatchups.find(game => 
       game.week_number === 16 && 
       game.is_playoff && 
       !game.is_consolation
     )))
  );
  
  if (championshipGame && championshipGame.home_score !== null && championshipGame.away_score !== null) {
    // Championship winner (1st place)
    const championTeamId = championshipGame.home_score > championshipGame.away_score 
      ? championshipGame.home_team_id 
      : championshipGame.away_team_id;
    
    // Championship loser (2nd place)
    const runnerUpTeamId = championshipGame.home_score > championshipGame.away_score 
      ? championshipGame.away_team_id 
      : championshipGame.home_team_id;
    
    teamPlacements.set(championTeamId, 1); // 1st place
    teamPlacements.set(runnerUpTeamId, 2); // 2nd place
    
    // Get semifinal games (week 15)
    const semiFinals = filterMatchupsByWeek(playoffMatchups, 15, true);
    
    // Identify semifinal losers
    const semiFinalLosers = getSemiFinalLosers(semiFinals);
    
    // Find 3rd place game
    const thirdPlaceGame = findThirdPlaceGame(playoffMatchups, semiFinalLosers);
    
    if (thirdPlaceGame && thirdPlaceGame.home_score !== null && thirdPlaceGame.away_score !== null) {
      const thirdPlaceTeamId = thirdPlaceGame.home_score > thirdPlaceGame.away_score 
        ? thirdPlaceGame.home_team_id 
        : thirdPlaceGame.away_team_id;
      
      const fourthPlaceTeamId = thirdPlaceGame.home_score > thirdPlaceGame.away_score 
        ? thirdPlaceGame.away_team_id 
        : thirdPlaceGame.home_team_id;
      
      teamPlacements.set(thirdPlaceTeamId, 3); // 3rd place
      teamPlacements.set(fourthPlaceTeamId, 4); // 4th place
    }
    
    // Process consolation games for 5th-10th places
    const consolidationGames = playoffMatchups.filter(m => 
      m.week_number === 16 && 
      (m.is_consolation || (!m.is_playoff && m !== thirdPlaceGame)) &&
      m !== thirdPlaceGame && 
      m !== championshipGame
    );
    
    // Sort consolation games to make assignment consistent
    const sortedConsolationGames = [...consolidationGames].sort((a, b) => {
      const aSum = (a.home_team_id || 0) + (a.away_team_id || 0);
      const bSum = (b.home_team_id || 0) + (b.away_team_id || 0);
      return aSum - bSum;
    });
    
    // Assign 5th-10th places
    sortedConsolationGames.forEach((game, index) => {
      if (game.home_score === null || game.away_score === null) return;
      
      // Calculate placements based on index (0=5th place, 1=7th place, 2=9th place)
      const winnerPlace = 5 + (index * 2);
      const loserPlace = 6 + (index * 2);
      
      const winnerTeamId = game.home_score > game.away_score 
        ? game.home_team_id 
        : game.away_team_id;
      
      const loserTeamId = game.home_score > game.away_score 
        ? game.away_team_id 
        : game.home_team_id;
      
      teamPlacements.set(winnerTeamId, winnerPlace);
      teamPlacements.set(loserTeamId, loserPlace);
    });
  }
  
  return teamPlacements;
};

/**
 * Get emoji for final placement
 */
export const getFinalPlacementEmoji = (placement: number | undefined): JSX.Element | string => {
  if (!placement) return "";
  
  switch (placement) {
    case 1: return <span title="1st Place">🥇</span>;
    case 2: return <span title="2nd Place">🥈</span>;
    case 3: return <span title="3rd Place">🥉</span>;
    case 4: return <span title="4th Place">🏆</span>;
    case 5: return <span title="5th Place">🌟</span>;
    case 6: return <span title="6th Place">🛡️</span>;
    case 7: return <span title="7th Place">🚽</span>;
    case 8: return <span title="8th Place">🤡</span>;
    case 9: return <span title="9th Place">🤮</span>;
    case 10: return <span title="10th Place">💩</span>;
    default: return "";
  }
};
