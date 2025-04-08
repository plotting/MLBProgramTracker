
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
import BracketSection from "./BracketSection";
import Matchup from "./Matchup";
import { getPlayoffWeeks } from "./utils/playoffWeeks";
import { 
  filterPlayoffMatchups, 
  getSemiFinals, 
  sortSemiFinalsBySeeds, 
  getChampionship, 
  getConsolationMatchups 
} from "./utils/matchupFilters";

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
          <div className="space-y-6">
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

            <div>
              <BracketSection
                showDivider={true}
                dividerText={consolationTitle}
                title=""
                subtitle={isLoserAdvancesFormat ? "Toilet Bowl: Loser advances to next round" : "Winners advance to 5th place game"}
                matchups={weekOneConsolation.map((matchup, idx) => ({
                  matchupId: matchupCounter + idx,
                  homeTeam: matchup.home_team_name,
                  homeTeamId: matchup.home_team_id,
                  homeSeed: matchup.home_team_id ? teamSeeds.get(matchup.home_team_id) : undefined,
                  homeScore: matchup.home_score,
                  awayTeam: matchup.away_team_name,
                  awayTeamId: matchup.away_team_id,
                  awaySeed: matchup.away_team_id ? teamSeeds.get(matchup.away_team_id) : undefined,
                  awayScore: matchup.away_score,
                  isConsolation: true
                }))}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
                className="mt-2"
              />
            </div>
          </div>

          {/* Middle Column - Second Round */}
          <div className="space-y-6">
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
              <div className="space-y-6">
                {(thirdPlaceGame || fifthPlaceGame) && (
                  <div className="space-y-6">
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
                
                {toiletBowlRound2.length > 0 && (
                  <div className="mt-4">
                    <BracketSection
                      showDivider={true}
                      dividerText="Toilet Bowl Round 2"
                      title=""
                      subtitle="Loser advances to Toilet Bowl"
                      matchups={toiletBowlRound2.map((matchup, idx) => ({
                        matchupId: matchupCounter + weekOneConsolation.length + idx,
                        homeTeam: matchup.home_team_name,
                        homeTeamId: matchup.home_team_id,
                        homeSeed: matchup.home_team_id ? teamSeeds.get(matchup.home_team_id) : undefined,
                        homeScore: matchup.home_score,
                        awayTeam: matchup.away_team_name,
                        awayTeamId: matchup.away_team_id,
                        awaySeed: matchup.away_team_id ? teamSeeds.get(matchup.away_team_id) : undefined,
                        awayScore: matchup.away_score,
                        isConsolation: true
                      }))}
                      editMode={editMode}
                      onTeamSelect={onTeamSelect}
                      onScoreUpdate={onScoreUpdate}
                      teams={teams}
                    />
                  </div>
                )}
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
          {isLoserAdvancesFormat && weekThreeConsolation.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-6 text-center">Final Placement Games</h3>
              {thirdPlaceGame && (
                <div className="mx-auto w-[240px]">
                  <div className="text-sm text-center font-medium mb-2">
                    3rd Place Game
                  </div>
                  <Matchup
                    matchupId={matchupCounter + weekOneConsolation.length + toiletBowlRound2.length}
                    homeTeam={thirdPlaceGame.home_team_id ? 
                      `${teamSeeds.get(thirdPlaceGame.home_team_id) ? `(${teamSeeds.get(thirdPlaceGame.home_team_id)}) ` : ''}${thirdPlaceGame.home_team_name}` : 
                      ''}
                    homeTeamId={thirdPlaceGame.home_team_id}
                    homeScore={thirdPlaceGame.home_score}
                    awayTeam={thirdPlaceGame.away_team_id ? 
                      `${teamSeeds.get(thirdPlaceGame.away_team_id) ? `(${teamSeeds.get(thirdPlaceGame.away_team_id)}) ` : ''}${thirdPlaceGame.away_team_name}` : 
                      ''}
                    awayTeamId={thirdPlaceGame.away_team_id}
                    awayScore={thirdPlaceGame.away_score}
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              )}
              
              {seventhPlaceGame && (
                <div className="mx-auto w-[240px]">
                  <div className="text-sm text-center font-medium mb-2">
                    7th Place Game
                  </div>
                  <Matchup
                    matchupId={matchupCounter + weekOneConsolation.length + toiletBowlRound2.length + 1}
                    homeTeam={seventhPlaceGame.home_team_id ? 
                      `${teamSeeds.get(seventhPlaceGame.home_team_id) ? `(${teamSeeds.get(seventhPlaceGame.home_team_id)}) ` : ''}${seventhPlaceGame.home_team_name}` : 
                      ''}
                    homeTeamId={seventhPlaceGame.home_team_id}
                    homeScore={seventhPlaceGame.home_score}
                    awayTeam={seventhPlaceGame.away_team_id ? 
                      `${teamSeeds.get(seventhPlaceGame.away_team_id) ? `(${teamSeeds.get(seventhPlaceGame.away_team_id)}) ` : ''}${seventhPlaceGame.away_team_name}` : 
                      ''}
                    awayTeamId={seventhPlaceGame.away_team_id}
                    awayScore={seventhPlaceGame.away_score}
                    isConsolation
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              )}
              
              {ninthPlaceGame && (
                <div className="mx-auto w-[240px]">
                  <div className="text-sm text-center font-medium mb-2">
                    {ninthPlaceTitle}
                  </div>
                  <Matchup
                    matchupId={matchupCounter + weekOneConsolation.length + toiletBowlRound2.length + 2}
                    homeTeam={ninthPlaceGame.home_team_id ? 
                      `${teamSeeds.get(ninthPlaceGame.home_team_id) ? `(${teamSeeds.get(ninthPlaceGame.home_team_id)}) ` : ''}${ninthPlaceGame.home_team_name}` : 
                      ''}
                    homeTeamId={ninthPlaceGame.home_team_id}
                    homeScore={ninthPlaceGame.home_score}
                    awayTeam={ninthPlaceGame.away_team_id ? 
                      `${teamSeeds.get(ninthPlaceGame.away_team_id) ? `(${teamSeeds.get(ninthPlaceGame.away_team_id)}) ` : ''}${ninthPlaceGame.away_team_name}` : 
                      ''}
                    awayTeamId={ninthPlaceGame.away_team_id}
                    awayScore={ninthPlaceGame.away_score}
                    isConsolation
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModifiedPlayoffs;
