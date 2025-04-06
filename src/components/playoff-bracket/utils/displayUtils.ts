
/**
 * Get emoji for final placement
 * Returns a string instead of JSX to avoid requiring a .tsx file
 */
export const getFinalPlacementEmoji = (placement: number | undefined): string => {
  if (!placement) return "";
  
  switch (placement) {
    case 1: return "🥇";  // 1st place
    case 2: return "🥈";  // 2nd place
    case 3: return "🥉";  // 3rd place
    case 4: return "🏆";  // 4th place
    case 5: return "🌟";  // 5th place
    case 6: return "🛡️";  // 6th place
    case 7: return "🚽";  // 7th place - toilet bowl winner
    case 8: return "🤡";  // 8th place
    case 9: return "🤮";  // 9th place
    case 10: return "💩"; // 10th place - toilet bowl loser
    default: return "";
  }
};
