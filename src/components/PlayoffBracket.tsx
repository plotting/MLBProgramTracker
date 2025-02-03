import React from "react";
import FourTeamPlayoffs from "./playoff-bracket/FourTeamPlayoffs";
import ModifiedPlayoffs from "./playoff-bracket/ModifiedPlayoffs";
import SixTeamPlayoffs from "./playoff-bracket/SixTeamPlayoffs";
import FiveTeamPlayoffs from "./playoff-bracket/FiveTeamPlayoffs";

const PlayoffBracket = ({ season }: { season: string }) => {
  const seasonNum = Number(season);

  // Seasons 1-7: 4-team playoffs
  if (seasonNum <= 7) {
    return <FourTeamPlayoffs />;
  }

  // Seasons 8-10: Modified consolation bracket
  if (seasonNum <= 10) {
    return <ModifiedPlayoffs />;
  }

  // Seasons 11-12: 6-team playoffs
  if (seasonNum <= 12) {
    return <SixTeamPlayoffs />;
  }

  // Season 13+: 5-team playoffs
  return <FiveTeamPlayoffs />;
};

export default PlayoffBracket;