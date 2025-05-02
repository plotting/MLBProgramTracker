
/**
 * Utility functions for determining playoff weeks based on season
 */

/**
 * Get playoff week numbers based on season
 */
export const getPlayoffWeeks = (seasonNumber: number) => {
  // Determine playoff weeks based on season
  // For seasons 11-12, playoffs start in week 15 (not 16)
  const playoffStartWeek = (seasonNumber >= 11 && seasonNumber <= 12) ? 15 : 
                           seasonNumber >= 13 ? 16 : 15;
  const champWeek = (seasonNumber >= 11 && seasonNumber <= 12) ? 17 : 
                    seasonNumber >= 13 ? 17 : 16;
  const finalWeek = champWeek + 1;
  
  return {
    playoffStartWeek,
    champWeek,
    finalWeek,
    displayWeeks: [playoffStartWeek, playoffStartWeek + 1, champWeek],
    // Determine if this season should use the loser advances format for consolation brackets
    isLoserAdvancesFormat: seasonNumber >= 8 && seasonNumber <= 12 // Updated to include seasons 11-12
  };
};

