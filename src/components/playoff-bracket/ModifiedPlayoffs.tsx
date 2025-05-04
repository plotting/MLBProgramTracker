
import React, { useState } from "react";
import { MatchupScoresView } from "@/types/database";
import WeekLabels from "./WeekLabels";
import { getToiletBowlTeams } from "./utils/consolationUtils";
import type { Team } from "@/types/database";
import PlayoffSemifinals from "./PlayoffSemifinals";
import ConsolationBracket from "./ConsolationBracket";
import ChampionshipGame from "./ChampionshipGame";
import PlacementGames from "./PlacementGames";
import ToiletBowlRound from "./ToiletBowlRound";
import BracketSection from "./BracketSection";
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
  console.log(`Season ${seasonNumber} playoffs: Weeks ${displayWeeks.join(', ')}`);

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

  // Third place game should be in week 16 (champWeek)
  const thirdPlaceGame = playoffMatchups.find(
    (matchup) => 
      matchup.week_number === champWeek && 
      matchup !== championship &&
      semiFinalLosers.includes(matchup.home_team_id || 0) && 
      semiFinalLosers.includes(matchup.away_team_id || 0)
  );

  // Find consolation matchups for specific placements
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

  // For seasons 8-10, we update titles to reflect the "loser advances" format
  const ninthPlaceTitle = isLoserAdvancesFormat ? "9th Place Game (Toilet Bowl)" : "9th Place Game";
  const consolationTitle = isLoserAdvancesFormat ? "Consolation Bracket (Loser Advances)" : "Consolation Bracket";

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={displayWeeks} />
        
        {/* Main playoff bracket */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - First Round */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Playoff Bracket</h3>
              <PlayoffSemifinals 
                semiFinals={sortedSemiFinals}
                teamSeeds={teamSeeds}
                matchupCounter={matchupCounter}
                onMatchupCounterUpdate={setMatchupCounter}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
              />
            </div>
          </div>

          {/* Middle Column - Championship and 3rd Place Game */}
          <div>
            <ChampionshipGame
              championship={championship}
              teamSeeds={teamSeeds}
              matchupCounter={matchupCounter}
              onMatchupCounterUpdate={setMatchupCounter}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
            />

            {/* Always show 3rd place game in week 16 (champWeek) */}
            {thirdPlaceGame && (
              <PlacementGames
                thirdPlaceGame={thirdPlaceGame}
                teamSeeds={teamSeeds}
                matchupCounter={matchupCounter}
                onMatchupCounterUpdate={setMatchupCounter}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
                thirdPlaceTitle="3rd Place Game"
                showOnlyFifthPlace={false}
              />
            )}
          </div>
          
          {/* Right Column - Final Round (only for seasons 8-10) */}
          <div>
            {/* This column intentionally left empty as we removed the "Toilet Bowl Round 2" */}
          </div>
        </div>
        
        {/* Full width divider for consolation bracket */}
        <div className="w-full my-8">
          <div className="flex items-center justify-center">
            <div className="h-px bg-border flex-grow"></div>
            <span className="px-4 text-sm text-muted-foreground font-medium">{consolationTitle}</span>
            <div className="h-px bg-border flex-grow"></div>
          </div>
        </div>
        
        {/* Consolation bracket in a different grid layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Week 15/16 Consolation Games (First Round) */}
          <div>
            <h4 className="text-center text-sm font-medium mb-4">Week {playoffStartWeek}</h4>
            <BracketSection
              title=""
              subtitle={isLoserAdvancesFormat ? "Toilet Bowl Round 1: Loser advances" : "Winners advance to 5th place game"}
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
            />
          </div>
          
          {/* Week 16/17 Consolation Games */}
          <div>
            <h4 className="text-center text-sm font-medium mb-4">Week {champWeek}</h4>
            {isLoserAdvancesFormat && fifthPlaceGame && (
              <BracketSection
                title="5th Place Game"
                matchups={[{
                  matchupId: matchupCounter + weekOneConsolation.length,
                  homeTeam: fifthPlaceGame.home_team_name,
                  homeTeamId: fifthPlaceGame.home_team_id,
                  homeSeed: fifthPlaceGame.home_team_id ? teamSeeds.get(fifthPlaceGame.home_team_id) : undefined,
                  homeScore: fifthPlaceGame.home_score,
                  awayTeam: fifthPlaceGame.away_team_name,
                  awayTeamId: fifthPlaceGame.away_team_id,
                  awaySeed: fifthPlaceGame.away_team_id ? teamSeeds.get(fifthPlaceGame.away_team_id) : undefined,
                  awayScore: fifthPlaceGame.away_score,
                  isConsolation: true
                }]}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
              />
            )}
            
            {/* For standard format, show all consolation games */}
            {!isLoserAdvancesFormat && (
              <PlacementGames
                fifthPlaceGame={fifthPlaceGame}
                seventhPlaceGame={seventhPlaceGame}
                ninthPlaceGame={ninthPlaceGame}
                teamSeeds={teamSeeds}
                matchupCounter={matchupCounter + weekOneConsolation.length}
                onMatchupCounterUpdate={setMatchupCounter}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
                ninthPlaceTitle={ninthPlaceTitle}
              />
            )}
          </div>
          
          {/* Week 17 Final Consolation Games (only for seasons 8-10) */}
          {isLoserAdvancesFormat && weekThreeConsolation.length > 0 && (
            <div>
              <h4 className="text-center text-sm font-medium mb-4">Week {finalWeek}</h4>
              
              {/* Use ToiletBowlRound component instead of direct rendering */}
              <ToiletBowlRound
                toiletRoundMatchups={weekThreeConsolation.filter(
                  m => m === seventhPlaceGame || m === ninthPlaceGame
                )}
                teamSeeds={teamSeeds}
                matchupCounter={matchupCounter + weekOneConsolation.length + (fifthPlaceGame ? 1 : 0)}
                onMatchupCounterUpdate={setMatchupCounter}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
                title="Final Placement Games"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModifiedPlayoffs;
