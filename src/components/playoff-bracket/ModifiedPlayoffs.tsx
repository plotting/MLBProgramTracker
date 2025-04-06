
import React, { useState } from "react";
import { MatchupScoresView } from "@/types/database";
import WeekLabels from "./WeekLabels";
import { getToiletBowlTeams } from "./utils/bracketUtils";
import type { Team } from "@/types/database";
import PlayoffSemifinals from "./PlayoffSemifinals";
import ConsolationBracket from "./ConsolationBracket";
import ChampionshipGame from "./ChampionshipGame";
import PlacementGames from "./PlacementGames";

interface ModifiedPlayoffsProps {
  matchups: MatchupScoresView[];
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  teamSeeds?: Map<number, number>;
  seasonNumber?: number;
}

const ModifiedPlayoffs: React.FC<ModifiedPlayoffsProps> = ({ 
  matchups,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  teamSeeds = new Map(),
  seasonNumber = 8
}) => {
  const [matchupCounter, setMatchupCounter] = useState(0);

  // Filter playoff matchups (non-consolation)
  const playoffMatchups = matchups.filter(
    (matchup) => matchup.is_playoff && !matchup.is_consolation
  );

  // Get semifinal matchups (week 15)
  const semiFinals = playoffMatchups.filter(
    (matchup) => matchup.week_number === 15
  );
  
  // Sort semifinal matchups by seed to put higher seeds on top
  const sortedSemiFinals = [...semiFinals].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  // Get championship matchup (week 16)
  const championship = playoffMatchups.find(
    (matchup) => matchup.week_number === 16
  );

  // Get consolation matchups
  const consolationMatchups = matchups.filter(
    (matchup) => matchup.is_consolation
  );

  // Get week 15 consolation matchups
  const weekFifteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === 15
  );

  // Get week 16 consolation matchups
  const weekSixteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === 16
  );

  // Get toilet bowl teams with the correct seasonNumber
  const { round1Winners, round1Losers } = getToiletBowlTeams(consolationMatchups, seasonNumber);

  // Find 3rd place game (between semifinal losers)
  const semiFinalLosers = semiFinals
    .filter(match => match.home_score !== null && match.away_score !== null)
    .map(match => match.home_score! > match.away_score! ? match.away_team_id : match.home_team_id);

  const thirdPlaceGame = playoffMatchups.find(
    (matchup) => 
      matchup.week_number === 16 && 
      matchup !== championship &&
      semiFinalLosers.includes(matchup.home_team_id || 0) && 
      semiFinalLosers.includes(matchup.away_team_id || 0)
  );

  // Find consolation matchups for specific placements
  // 5th place game (between consolation round 1 winners)
  const fifthPlaceGame = weekSixteenConsolation.find(
    matchup => 
      round1Winners.includes(matchup.home_team_id || 0) && 
      round1Winners.includes(matchup.away_team_id || 0)
  );

  // 9th place game (toilet bowl - between consolation round 1 losers in seasons 8-10)
  const ninthPlaceGame = weekSixteenConsolation.find(
    matchup => 
      round1Losers.includes(matchup.home_team_id || 0) && 
      round1Losers.includes(matchup.away_team_id || 0)
  );

  // 7th place game (between mixed teams)
  const seventhPlaceGame = weekSixteenConsolation.find(
    matchup => 
      matchup !== fifthPlaceGame && 
      matchup !== ninthPlaceGame &&
      matchup !== thirdPlaceGame &&
      matchup !== championship
  );

  // Handler to update the matchup counter
  const handleMatchupCounterUpdate = (value: number) => {
    setMatchupCounter(value);
  };

  // For seasons 8-10, we update titles to reflect the "loser advances" format
  const isLoserAdvancesFormat = seasonNumber >= 8 && seasonNumber <= 10;
  const ninthPlaceTitle = isLoserAdvancesFormat ? "9th Place Game (Toilet Bowl)" : "9th Place Game";
  const consolationTitle = isLoserAdvancesFormat ? "Consolation Bracket (Loser Advances)" : "Consolation Bracket";

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-12">
            <PlayoffSemifinals 
              semiFinals={sortedSemiFinals}
              teamSeeds={teamSeeds}
              matchupCounter={matchupCounter}
              onMatchupCounterUpdate={handleMatchupCounterUpdate}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
            />

            <ConsolationBracket
              weekFifteenConsolation={weekFifteenConsolation}
              teamSeeds={teamSeeds}
              matchupCounter={matchupCounter}
              onMatchupCounterUpdate={handleMatchupCounterUpdate}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
              title={consolationTitle}
              subtitle={isLoserAdvancesFormat ? "Toilet Bowl: Loser advances to 9th place game" : "Winners advance to 5th place game"}
            />
          </div>

          <div className="space-y-12">
            <ChampionshipGame
              championship={championship}
              teamSeeds={teamSeeds}
              matchupCounter={matchupCounter}
              onMatchupCounterUpdate={handleMatchupCounterUpdate}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
            />

            <PlacementGames
              thirdPlaceGame={thirdPlaceGame}
              fifthPlaceGame={fifthPlaceGame}
              seventhPlaceGame={seventhPlaceGame}
              ninthPlaceGame={ninthPlaceGame}
              teamSeeds={teamSeeds}
              matchupCounter={matchupCounter}
              onMatchupCounterUpdate={handleMatchupCounterUpdate}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
              ninthPlaceTitle={ninthPlaceTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifiedPlayoffs;
