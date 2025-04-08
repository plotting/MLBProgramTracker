
/**
 * Utility functions for determining playoff weeks based on season
 */

/**
 * Get playoff week numbers based on season
 */
export const getPlayoffWeeks = (seasonNumber: number) => {
  // Determine playoff weeks based on season
  const playoffStartWeek = seasonNumber >= 11 ? 16 : 15;
  const champWeek = seasonNumber >= 11 ? 17 : 16;
  const finalWeek = champWeek + 1;
  
  return {
    playoffStartWeek,
    champWeek,
    finalWeek,
    displayWeeks: seasonNumber >= 8 && seasonNumber <= 10 
      ? [playoffStartWeek, champWeek, finalWeek] 
      : [playoffStartWeek, champWeek]
  };
};
