
import React, { useState } from "react";
import { MatchupScoresView } from "@/types/database";
import WeekLabels from "./WeekLabels";
import { getToiletBowlTeams, identifyPlacementGame } from "./utils/consolationUtils";
import type { Team } from "@/types/database";
import PlayoffSemifinals from "./PlayoffSemifinals";
import ConsolationBracket from "./ConsolationBracket";
import ChampionshipGame from "./ChampionshipGame";
import PlacementGames from "./PlacementGames";
import Matchup from "./Matchup";

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

  // Determine playoff weeks based on season
  const playoffStartWeek = seasonNumber >= 11 ? 16 : 15;
  const champWeek = seasonNumber >= 11 ? 17 : 16;
  const finalWeek = champWeek + 1;

  // Filter playoff matchups (non-consolation)
  const playoffMatchups = matchups.filter(
    (matchup) => matchup.is_playoff && !matchup.is_consolation
  );

  // Get semifinal matchups (week 15 or 16 depending on season)
  const semiFinals = playoffMatchups.filter(
    (matchup) => matchup.week_number === playoffStartWeek
  );
  
  // Sort semifinal matchups by seed to put higher seeds on top
  const sortedSemiFinals = [...semiFinals].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  // Get championship matchup (week 16 or 17 depending on season)
  const championship = playoffMatchups.find(
    (matchup) => matchup.week_number === champWeek
  );

  // Get consolation matchups
  const consolationMatchups = matchups.filter(
    (matchup) => matchup.is_consolation
  );

  // Get week 15/16 consolation matchups (first round)
  const weekOneConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === playoffStartWeek
  );

  // Get week 16/17 consolation matchups (second round)
  const weekTwoConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === champWeek
  );
  
  // Get week 17/18 consolation matchups (final placement games) for seasons 8-10
  const weekThreeConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === finalWeek
  );

  // Get toilet bowl teams with the correct seasonNumber
  const { round1Winners, round1Losers, round2Winners, round2Losers } = getToiletBowlTeams(consolationMatchups, seasonNumber);

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
  if (seasonNumber >= 8 && seasonNumber <= 10) {
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
  const isLoserAdvancesFormat = seasonNumber >= 8 && seasonNumber <= 10;
  const ninthPlaceTitle = isLoserAdvancesFormat ? "9th Place Game (Toilet Bowl)" : "9th Place Game";
  const consolationTitle = isLoserAdvancesFormat ? "Consolation Bracket (Loser Advances)" : "Consolation Bracket";

  // For seasons 8-10 we need to display 3 weeks not 2
  const displayWeeks = isLoserAdvancesFormat ? [playoffStartWeek, champWeek, finalWeek] : [playoffStartWeek, champWeek];

  // Create a local variable to track matchup IDs
  let localMatchupCounter = matchupCounter;

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={displayWeeks} />
        
        <div className="grid grid-cols-3 gap-8">
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
              weekFifteenConsolation={weekOneConsolation}
              teamSeeds={teamSeeds}
              matchupCounter={matchupCounter}
              onMatchupCounterUpdate={handleMatchupCounterUpdate}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
              title={consolationTitle}
              subtitle={isLoserAdvancesFormat ? "Toilet Bowl: Loser advances" : "Winners advance to 5th place game"}
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

            {isLoserAdvancesFormat && (
              <div className="space-y-12">
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
                    thirdPlaceTitle="3rd Place Game"
                    fifthPlaceTitle="5th Place Game"
                    showOnlyFifthPlace={true}
                  />
                )}
                
                {weekTwoConsolation
                  .filter(m => m !== fifthPlaceGame && m !== thirdPlaceGame)
                  .map((matchup, index) => {
                    // These are the toilet bowl track games
                    const id = localMatchupCounter++;
                    
                    return (
                      <div 
                        key={`toilet-round2-${index}`} 
                        className="mx-auto w-[240px]"
                      >
                        <div className="text-sm text-center text-muted-foreground mb-2">
                          Toilet Bowl Round 2
                        </div>
                        <Matchup
                          matchupId={id}
                          homeTeam={
                            matchup.home_team_id ? 
                              teamSeeds.get(matchup.home_team_id) ? 
                                `(${teamSeeds.get(matchup.home_team_id)}) ${matchup.home_team_name}` : 
                                matchup.home_team_name : 
                              ""
                          }
                          homeTeamId={matchup.home_team_id}
                          homeScore={matchup.home_score}
                          awayTeam={
                            matchup.away_team_id ? 
                              teamSeeds.get(matchup.away_team_id) ? 
                                `(${teamSeeds.get(matchup.away_team_id)}) ${matchup.away_team_name}` : 
                                matchup.away_team_name : 
                              ""
                          }
                          awayTeamId={matchup.away_team_id}
                          awayScore={matchup.away_score}
                          isConsolation
                          editMode={editMode}
                          onTeamSelect={onTeamSelect}
                          onScoreUpdate={onScoreUpdate}
                          teams={teams}
                        />
                      </div>
                    );
                  })
                }
              </div>
            )}
            
            {!isLoserAdvancesFormat && thirdPlaceGame && (
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
          
          {isLoserAdvancesFormat && (
            <div className="space-y-12">
              <h3 className="text-lg font-semibold mb-6 text-center">Final Placement Games</h3>
              {weekThreeConsolation.length > 0 && (
                <div className="space-y-12">
                  {thirdPlaceGame && (
                    <div className="mx-auto w-[240px]">
                      <div className="text-sm text-center text-muted-foreground mb-2">
                        3rd Place Game
                      </div>
                      <Matchup
                        matchupId={localMatchupCounter++}
                        homeTeam={
                          thirdPlaceGame.home_team_id ? 
                            teamSeeds.get(thirdPlaceGame.home_team_id) ? 
                              `(${teamSeeds.get(thirdPlaceGame.home_team_id)}) ${thirdPlaceGame.home_team_name}` : 
                              thirdPlaceGame.home_team_name : 
                            ""
                        }
                        homeTeamId={thirdPlaceGame.home_team_id}
                        homeScore={thirdPlaceGame.home_score}
                        awayTeam={
                          thirdPlaceGame.away_team_id ? 
                            teamSeeds.get(thirdPlaceGame.away_team_id) ? 
                              `(${teamSeeds.get(thirdPlaceGame.away_team_id)}) ${thirdPlaceGame.away_team_name}` : 
                              thirdPlaceGame.away_team_name : 
                            ""
                        }
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
                      <div className="text-sm text-center text-muted-foreground mb-2">
                        7th Place Game
                      </div>
                      <Matchup
                        matchupId={localMatchupCounter++}
                        homeTeam={
                          seventhPlaceGame.home_team_id ? 
                            teamSeeds.get(seventhPlaceGame.home_team_id) ? 
                              `(${teamSeeds.get(seventhPlaceGame.home_team_id)}) ${seventhPlaceGame.home_team_name}` : 
                              seventhPlaceGame.home_team_name : 
                            ""
                        }
                        homeTeamId={seventhPlaceGame.home_team_id}
                        homeScore={seventhPlaceGame.home_score}
                        awayTeam={
                          seventhPlaceGame.away_team_id ? 
                            teamSeeds.get(seventhPlaceGame.away_team_id) ? 
                              `(${teamSeeds.get(seventhPlaceGame.away_team_id)}) ${seventhPlaceGame.away_team_name}` : 
                              seventhPlaceGame.away_team_name : 
                            ""
                        }
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
                      <div className="text-sm text-center text-muted-foreground mb-2">
                        {ninthPlaceTitle}
                      </div>
                      <Matchup
                        matchupId={localMatchupCounter++}
                        homeTeam={
                          ninthPlaceGame.home_team_id ? 
                            teamSeeds.get(ninthPlaceGame.home_team_id) ? 
                              `(${teamSeeds.get(ninthPlaceGame.home_team_id)}) ${ninthPlaceGame.home_team_name}` : 
                              ninthPlaceGame.home_team_name : 
                            ""
                        }
                        homeTeamId={ninthPlaceGame.home_team_id}
                        homeScore={ninthPlaceGame.home_score}
                        awayTeam={
                          ninthPlaceGame.away_team_id ? 
                            teamSeeds.get(ninthPlaceGame.away_team_id) ? 
                              `(${teamSeeds.get(ninthPlaceGame.away_team_id)}) ${ninthPlaceGame.away_team_name}` : 
                              ninthPlaceGame.away_team_name : 
                            ""
                        }
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ModifiedPlayoffs;
