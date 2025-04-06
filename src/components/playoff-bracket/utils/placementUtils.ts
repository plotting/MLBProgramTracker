
import { MatchupScoresView } from "@/types/database";
import { findThirdPlaceGame } from "./semifinalUtils";
import { getSemiFinalLosers } from "./semifinalUtils";

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
    
    if (championTeamId) teamPlacements.set(championTeamId, 1); // 1st place
    if (runnerUpTeamId) teamPlacements.set(runnerUpTeamId, 2); // 2nd place
    
    // Get semifinal games (week 15)
    const semiFinals = playoffMatchups.filter(m => 
      m.week_number === 15 && 
      m.is_playoff && 
      !m.is_consolation
    );
    
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
      
      if (thirdPlaceTeamId) teamPlacements.set(thirdPlaceTeamId, 3); // 3rd place
      if (fourthPlaceTeamId) teamPlacements.set(fourthPlaceTeamId, 4); // 4th place
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
      
      if (winnerTeamId) teamPlacements.set(winnerTeamId, winnerPlace);
      if (loserTeamId) teamPlacements.set(loserTeamId, loserPlace);
    });
  }
  
  return teamPlacements;
};
