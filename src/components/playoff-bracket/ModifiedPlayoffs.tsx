
import React, { useState } from "react";
import { MatchupScoresView } from "@/types/database";
import WeekLabels from "./WeekLabels";
import { getToiletBowlTeams } from "./utils/consolationUtils";
import type { Team } from "@/types/database";
import PlayoffSemifinals from "./PlayoffSemifinals";
import ConsolationBracket from "./ConsolationBracket";
import ChampionshipGame from "./ChampionshipGame";
import PlacementGames from "./PlacementGames";
import FinalPlacementGames from "./FinalPlacementGames";
import ToiletBowlRound from "./ToiletBowlRound";
import { getPlayoffWeeks } from "./utils/playoffWeeks";
import { 
  filterPlayoffMatchups, 
  getSemiFinals, 
  sortSemiFinalsBySeeds, 
  getChampionship, 
  getConsolationMatchups 
} from "./utils/matchupFilters";
import { Separator } from "../ui/separator";

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

  // Get playoff week numbers based on season
  const { playoffStartWeek, champWeek, finalWeek, displayWeeks } = getPlayoffWeeks(seasonNumber);

  // Filter and sort matchups
  const playoffMatchups = filterPlayoffMatchups(matchups);
  const semiFinals = getSemiFinals(playoffMatchups, playoffStartWeek);
  const sortedSemiFinals = sortSemiFinalsBySeeds(semiFinals, teamSeeds);
  const championship = getChampionship(playoffMatchups, champWeek);

  // Get consolation matchups for each round
  const weekOneConsolation = getConsolationMatchups(matchups, playoffStartWeek);
  const weekTwoConsolation = getConsolationMatchups(matchups, champWeek);
  const weekThreeConsolation = getConsolationMatchups(matchups, finalWeek);

  // Get toilet bowl teams with the correct seasonNumber
  const { round1Winners, round1Losers, round2Winners, round2Losers } = getToiletBowlTeams(matchups.filter(m => m.is_consolation), seasonNumber);

  // Find 3rd place game (between semifinal losers)
  const semiFinalLosers = semiFinals
    .filter(match => match.home_score !== null && match.away_score !== null)
    .map(match => match.home_score! > match.away_score! ? match.away_team_id : match.home_team_id);

  const thirdPlaceGame = playoffMatchups.find(
    (matchup) => 
      matchup.week_number === champWeek && 
      matchup !== championship &&
      semiFinalLosers.includes(matchup.home_team_id || 0) && 
      semiFinalLosers.includes(matchup.away_team_id || 0)
  );

  // Find consolation matchups for specific placements based on season format
  let fifthPlaceGame;
  let seventhPlaceGame;
  let ninthPlaceGame;
  
  // Different logic for seasons 8-10 with loser advances format
  const isLoserAdvancesFormat = seasonNumber >= 8 && seasonNumber <= 10;
  
  if (isLoserAdvancesFormat) {
    // 5th place game is in week 16 between week 15 consolation winners
    fifthPlaceGame = weekTwoConsolation.find(
      matchup => 
        round1Winners.includes(matchup.home_team_id || 0) && 
        round1Winners.includes(matchup.away_team_id || 0)
    );
    
    // Week 17 games
    if (weekThreeConsolation.length > 0) {
      // 7th place game is in week 17 between week 16 toilet bracket winners
      seventhPlaceGame = weekThreeConsolation.find(
        matchup => 
          round2Winners.includes(matchup.home_team_id || 0) && 
          round2Winners.includes(matchup.away_team_id || 0)
      );
      
      // 9th place game (toilet bowl) is in week 17 between week 16 toilet bracket losers
      ninthPlaceGame = weekThreeConsolation.find(
        matchup => 
          round2Losers.includes(matchup.home_team_id || 0) && 
          round2Losers.includes(matchup.away_team_id || 0)
      );
    }
  } else {
    // Standard logic for other seasons
    // 5th place game (between consolation round 1 winners)
    fifthPlaceGame = weekTwoConsolation.find(
      matchup => 
        round1Winners.includes(matchup.home_team_id || 0) && 
        round1Winners.includes(matchup.away_team_id || 0)
    );

    // 9th place game (between consolation round 1 losers)
    ninthPlaceGame = weekTwoConsolation.find(
      matchup => 
        round1Losers.includes(matchup.home_team_id || 0) && 
        round1Losers.includes(matchup.away_team_id || 0)
    );

    // 7th place game (between mixed teams)
    seventhPlaceGame = weekTwoConsolation.find(
      matchup => 
        matchup !== fifthPlaceGame && 
        matchup !== ninthPlaceGame &&
        matchup !== thirdPlaceGame &&
        matchup !== championship
    );
  }

  // Handler to update the matchup counter
  const handleMatchupCounterUpdate = (value: number) => {
    setMatchupCounter(value);
  };

  // For seasons 8-10, we update titles to reflect the "loser advances" format
  const ninthPlaceTitle = isLoserAdvancesFormat ? "9th Place Game (Toilet Bowl)" : "9th Place Game";
  const consolationTitle = isLoserAdvancesFormat ? "Consolation Bracket (Loser Advances)" : "Consolation Bracket";

  // Filter out toilet bowl round 2 games (for seasons 8-10)
  const toiletBowlRound2 = weekTwoConsolation.filter(m => 
    isLoserAdvancesFormat &&
    m !== fifthPlaceGame && 
    m !== thirdPlaceGame
  );

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={displayWeeks} />
        
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - First Round */}
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Playoff Bracket</h3>
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
            </div>

            <div className="pt-4">
              <div className="text-center mb-4">
                <Separator className="mb-4" />
                <h3 className="text-base font-semibold">{consolationTitle}</h3>
              </div>
              <ConsolationBracket
                weekFifteenConsolation={weekOneConsolation}
                teamSeeds={teamSeeds}
                matchupCounter={matchupCounter}
                onMatchupCounterUpdate={handleMatchupCounterUpdate}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
                title=""
                subtitle={isLoserAdvancesFormat ? "Toilet Bowl: Loser advances" : "Winners advance to 5th place game"}
              />
            </div>
          </div>

          {/* Middle Column - Second Round */}
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

            {isLoserAdvancesFormat && (
              <div className="space-y-12">
                {(thirdPlaceGame || fifthPlaceGame) && (
                  <div className="space-y-12">
                    {thirdPlaceGame && (
                      <PlacementGames
                        thirdPlaceGame={thirdPlaceGame}
                        teamSeeds={teamSeeds}
                        matchupCounter={matchupCounter}
                        onMatchupCounterUpdate={handleMatchupCounterUpdate}
                        editMode={editMode}
                        onTeamSelect={onTeamSelect}
                        onScoreUpdate={onScoreUpdate}
                        teams={teams}
                        thirdPlaceTitle="3rd Place Game"
                        showOnlyFifthPlace={false}
                      />
                    )}
                    
                    {fifthPlaceGame && (
                      <PlacementGames
                        fifthPlaceGame={fifthPlaceGame}
                        teamSeeds={teamSeeds}
                        matchupCounter={matchupCounter}
                        onMatchupCounterUpdate={handleMatchupCounterUpdate}
                        editMode={editMode}
                        onTeamSelect={onTeamSelect}
                        onScoreUpdate={onScoreUpdate}
                        teams={teams}
                        fifthPlaceTitle="5th Place Game"
                        showOnlyFifthPlace={true}
                      />
                    )}
                  </div>
                )}
                
                <ToiletBowlRound
                  toiletRoundMatchups={toiletBowlRound2}
                  teamSeeds={teamSeeds}
                  matchupCounter={matchupCounter}
                  onMatchupCounterUpdate={handleMatchupCounterUpdate}
                  editMode={editMode}
                  onTeamSelect={onTeamSelect}
                  onScoreUpdate={onScoreUpdate}
                  teams={teams}
                  title="Toilet Bowl Round 2"
                />
              </div>
            )}
            
            {!isLoserAdvancesFormat && (
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
            )}
          </div>
          
          {/* Right Column - Final Round (only for seasons 8-10) */}
          {isLoserAdvancesFormat && (
            <FinalPlacementGames
              thirdPlaceGame={thirdPlaceGame}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ModifiedPlayoffs;
