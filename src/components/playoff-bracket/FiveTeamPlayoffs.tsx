
import React, { useState } from "react";
import { MatchupScoresView } from "@/types/database";
import WeekLabels from "./WeekLabels";
import type { Team } from "@/types/database";
import Week15Matchups from "./five-team/Week15Matchups";
import Week16Matchups from "./five-team/Week16Matchups";
import {
  getPlayoffMatchups,
  getWildcardGames,
  getSeedOneSemifinal,
  getChampionship,
  getConsolationMatchups,
  getWeekFifteenConsolation,
  getWeekSixteenConsolation
} from "./five-team/fiveTeamUtils";

interface FiveTeamPlayoffsProps {
  matchups: MatchupScoresView[];
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  teamSeeds?: Map<number, number>;
}

const FiveTeamPlayoffs: React.FC<FiveTeamPlayoffsProps> = ({ 
  matchups,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  teamSeeds = new Map()
}) => {
  // State to track matchup counter across components
  const [matchupCounter, setMatchupCounter] = useState(0);
  
  // Filter and process matchups
  const playoffMatchups = getPlayoffMatchups(matchups);
  const wildcardGames = getWildcardGames(playoffMatchups);
  const seedOneSemifinal = getSeedOneSemifinal(playoffMatchups);
  const championship = getChampionship(playoffMatchups);
  
  // Get consolation matchups
  const consolationMatchups = getConsolationMatchups(matchups);
  const weekFifteenConsolation = getWeekFifteenConsolation(consolationMatchups);
  const weekSixteenConsolation = getWeekSixteenConsolation(consolationMatchups);

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />
        
        <div className="grid grid-cols-2 gap-8">
          {/* Week 15 Column */}
          <Week15Matchups
            wildcardGames={wildcardGames}
            seedOneSemifinal={seedOneSemifinal}
            weekFifteenConsolation={weekFifteenConsolation}
            editMode={editMode}
            onTeamSelect={onTeamSelect}
            onScoreUpdate={onScoreUpdate}
            teams={teams}
            teamSeeds={teamSeeds}
            matchupCounter={matchupCounter}
            onMatchupCounterUpdate={(counter) => setMatchupCounter(counter)}
          />
          
          {/* Week 16 Column */}
          <Week16Matchups
            championship={championship}
            consolationMatchups={weekSixteenConsolation}
            weekFifteenConsolation={weekFifteenConsolation}
            editMode={editMode}
            onTeamSelect={onTeamSelect}
            onScoreUpdate={onScoreUpdate}
            teams={teams}
            teamSeeds={teamSeeds}
            matchupCounter={matchupCounter}
            onMatchupCounterUpdate={(counter) => setMatchupCounter(counter)}
          />
        </div>
      </div>
    </div>
  );
};

export default FiveTeamPlayoffs;
