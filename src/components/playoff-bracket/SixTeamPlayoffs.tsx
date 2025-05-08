
import React, { useState, useEffect } from "react";
import { MatchupScoresView } from "@/types/database";
import WeekLabels from "./WeekLabels";
import type { Team } from "@/types/database";
import { getPlayoffWeeks } from "./utils/playoffWeeks";
import PlayoffWildcard from "./PlayoffWildcard";
import PlayoffSemifinals from "./PlayoffSemifinals";
import PlacementGames from "./PlacementGames";
import ConsolationBracket from "./ConsolationBracket";
import ChampionshipGame from "./ChampionshipGame";
import { getPlayoffMatchups, getConsolationMatchups, getWeekFifteenConsolation } from "./five-team/fiveTeamUtils";

interface SixTeamPlayoffsProps {
  matchups: MatchupScoresView[];
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  teamSeeds?: Map<number, number>;
  seasonNumber?: number;
}

const SixTeamPlayoffs: React.FC<SixTeamPlayoffsProps> = ({ 
  matchups,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  teamSeeds = new Map(),
  seasonNumber = 11
}) => {
  const [matchupCounter, setMatchupCounter] = useState(0);
  
  // Get playoff week numbers based on season
  const { playoffStartWeek, champWeek, displayWeeks, isLoserAdvancesFormat } = getPlayoffWeeks(seasonNumber);
  
  // Filter playoff matchups (non-consolation)
  const playoffMatchups = getPlayoffMatchups(matchups);

  // Get wildcard matchups (first playoff week)
  const wildcardGames = playoffMatchups.filter(
    (matchup) => matchup.week_number === playoffStartWeek
  );
  
  // Sort wildcard games by seed to put higher seeds on top
  const sortedWildcardGames = [...wildcardGames].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  // Get semifinal matchups (second playoff week)
  const semiFinals = playoffMatchups.filter(
    (matchup) => matchup.week_number === playoffStartWeek + 1
  );
  
  // Sort semifinal matchups by seed to put higher seeds on top
  const sortedSemiFinals = [...semiFinals].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  // Get championship matchup (final playoff week)
  const championship = playoffMatchups.find(
    (matchup) => matchup.week_number === champWeek
  );

  // Get third place game (between semifinal losers)
  const semiFinalLosers = sortedSemiFinals
    .filter(match => match.home_score !== null && match.away_score !== null)
    .map(match => match.home_score! > match.away_score! ? match.away_team_id : match.home_team_id);

  const thirdPlaceGame = playoffMatchups.find(
    (matchup) => 
      matchup.week_number === champWeek && 
      matchup !== championship &&
      semiFinalLosers.includes(matchup.home_team_id || 0) && 
      semiFinalLosers.includes(matchup.away_team_id || 0)
  );

  // Get consolation matchups
  const consolationMatchups = getConsolationMatchups(matchups);

  // Get week 15 consolation matchups (first round)
  const weekFifteenConsolation = getWeekFifteenConsolation(consolationMatchups);
  
  // Sort week 15 consolation matchups by seed
  const sortedWeekFifteenConsolation = [...weekFifteenConsolation].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  // Get week 16 consolation matchups (second round)
  const weekSixteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === playoffStartWeek + 1
  );
  
  // Find specific placement games for week 16 consolation matchups
  const fifthPlaceGame = weekSixteenConsolation.find(matchup => {
    // Look for Brian vs Marshall specifically for seasons 11-12
    if (seasonNumber === 11) {
      return (matchup.home_team_name?.includes("Brian") && matchup.away_team_name?.includes("Marshall")) ||
             (matchup.away_team_name?.includes("Brian") && matchup.home_team_name?.includes("Marshall"));
    } else if (seasonNumber === 12) {
      // For season 12, identify by team names if possible
      return (matchup.home_team_name?.includes("Brian") && matchup.away_team_name?.includes("Marshall")) ||
             (matchup.away_team_name?.includes("Brian") && matchup.home_team_name?.includes("Marshall")) ||
             // Or fallback to the first consolation game
             weekSixteenConsolation.indexOf(matchup) === 0;
    }
    
    // For other seasons, fallback to first consolation game
    return weekSixteenConsolation.length > 0;
  });
  
  // For 7th place game, use a specific matchup for seasons 11-12
  const seventhPlaceGame = weekSixteenConsolation.find(matchup => {
    if (seasonNumber === 11) {
      // Season 11 specific match
      return (matchup.home_team_name?.includes("Nate") || matchup.away_team_name?.includes("Nate"));
    } else if (seasonNumber === 12) {
      // Season 12 specific match between Aron (seed 6) & CJ (seed 7)
      const isAronVsCJ = (matchup.home_team_name?.includes("Aron") || matchup.away_team_name?.includes("Aron")) &&
                         (matchup.home_team_name?.includes("CJ") || matchup.away_team_name?.includes("CJ"));
                         
      // Make sure this isn't the same as fifth place game
      return isAronVsCJ && matchup !== fifthPlaceGame;
    }
    
    // For other seasons, find a likely 7th place game
    return weekSixteenConsolation.length > 1 && matchup !== fifthPlaceGame;
  });
  
  // For 9th place game (toilet bowl), use the remaining game for seasons 11-12
  const ninthPlaceGame = weekSixteenConsolation.find(matchup => {
    if (seasonNumber === 11) {
      // Season 11 specific match
      return (matchup.home_team_name?.includes("Melissa") || matchup.away_team_name?.includes("Melissa"));
    } else if (seasonNumber === 12) {
      // Season 12 specific match with Thom (seed 8)
      const hasThom = matchup.home_team_name?.includes("Thom") || matchup.away_team_name?.includes("Thom");
      
      // Make sure this isn't the same as fifth place or seventh place game
      return hasThom && matchup !== fifthPlaceGame && matchup !== seventhPlaceGame;
    }
    
    // For other seasons, find a likely toilet bowl game
    return matchup !== fifthPlaceGame && matchup !== seventhPlaceGame;
  });
  
  // Remove the identified games from the general consolation list
  const otherWeekSixteenConsolation = weekSixteenConsolation.filter(
    matchup => 
      matchup !== fifthPlaceGame && 
      matchup !== seventhPlaceGame && 
      matchup !== ninthPlaceGame
  );

  // For seasons 8-12, use the "loser advances" title format
  const ninthPlaceTitle = isLoserAdvancesFormat ? "9th Place Game (Toilet Bowl)" : "9th Place Game";
  const consolationTitle = isLoserAdvancesFormat ? "Consolation Bracket (Loser Advances)" : "Consolation Bracket";
  const toiletBowlRoundTitle = isLoserAdvancesFormat ? "Toilet Bowl Round 1: Loser advances" : "Consolation Round 1";

  // Generate IDs for all matchups using useMemo to avoid state updates during render
  const otherConsolationMatchupIds = React.useMemo(() => {
    if (otherWeekSixteenConsolation.length === 0) return [];
    
    const nextAvailableId = matchupCounter;
    return Array.from(
      { length: otherWeekSixteenConsolation.length }, 
      (_, index) => nextAvailableId + index
    );
  }, [otherWeekSixteenConsolation.length, matchupCounter]);
  
  // Update matchup counter after generating IDs
  useEffect(() => {
    if (otherWeekSixteenConsolation.length > 0) {
      const newCounter = matchupCounter + otherWeekSixteenConsolation.length;
      setMatchupCounter(newCounter);
    }
  }, [otherWeekSixteenConsolation.length, matchupCounter]);

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[1000px]">
        <WeekLabels weeks={displayWeeks} />
        
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Week 15 */}
          <div className="space-y-12">
            <PlayoffWildcard
              wildcardGames={sortedWildcardGames}
              teamSeeds={teamSeeds}
              matchupCounter={matchupCounter}
              onMatchupCounterUpdate={setMatchupCounter}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
            />
          </div>

          {/* Middle Column - Week 16 */}
          <div className="space-y-12">
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
            
            {/* Add 5th place game in middle column for seasons 11-12 */}
            {(seasonNumber === 11 || seasonNumber === 12) && fifthPlaceGame && (
              <div className="mt-12">
                <PlacementGames
                  fifthPlaceGame={fifthPlaceGame}
                  teamSeeds={teamSeeds}
                  matchupCounter={matchupCounter}
                  onMatchupCounterUpdate={setMatchupCounter}
                  editMode={editMode}
                  onTeamSelect={onTeamSelect}
                  onScoreUpdate={onScoreUpdate}
                  teams={teams}
                  showOnlyFifthPlace={true}
                  fifthPlaceTitle="5th Place Game"
                  showDivider={true}
                  dividerText="Consolation Bracket"
                />
              </div>
            )}
          </div>

          {/* Right Column - Week 17 */}
          <div className="space-y-12">
            {championship && (
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
            )}

            {/* Third Place Game */}
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
              />
            )}
          </div>
        </div>
        
        {/* Consolation Bracket Divider - Only if we don't have it already */}
        {!(seasonNumber === 11 || seasonNumber === 12) && (
          <div className="w-full my-8">
            <div className="flex items-center justify-center">
              <div className="h-px bg-border flex-grow"></div>
              <span className="px-4 text-sm text-muted-foreground font-medium">{consolationTitle}</span>
              <div className="h-px bg-border flex-grow"></div>
            </div>
          </div>
        )}
        
        {/* Consolation Bracket */}
        <div className="grid grid-cols-2 gap-8">
          {/* Week 15 */}
          <div>
            <h4 className="text-center text-sm font-medium mb-4">Week {playoffStartWeek}</h4>
            <ConsolationBracket
              weekFifteenConsolation={sortedWeekFifteenConsolation}
              teamSeeds={teamSeeds}
              matchupCounter={matchupCounter}
              onMatchupCounterUpdate={setMatchupCounter}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
              title=""
              subtitle={toiletBowlRoundTitle}
            />
          </div>

          {/* Week 16 */}
          <div>
            <h4 className="text-center text-sm font-medium mb-4">Week {playoffStartWeek + 1}</h4>
            
            {/* Placement Games - Only show 7th and 9th for seasons 11-12 since 5th is already shown */}
            {(seasonNumber === 11 || seasonNumber === 12) ? (
              <>
                {/* 7th Place Game */}
                {seventhPlaceGame && (
                  <PlacementGames 
                    seventhPlaceGame={seventhPlaceGame}
                    teamSeeds={teamSeeds}
                    matchupCounter={matchupCounter}
                    onMatchupCounterUpdate={setMatchupCounter}
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                    seventhPlaceTitle="7th Place Game"
                  />
                )}
                
                {/* 9th Place Game */}
                {ninthPlaceGame && (
                  <div className="mt-6">
                    <PlacementGames 
                      ninthPlaceGame={ninthPlaceGame}
                      teamSeeds={teamSeeds}
                      matchupCounter={matchupCounter}
                      onMatchupCounterUpdate={setMatchupCounter}
                      editMode={editMode}
                      onTeamSelect={onTeamSelect}
                      onScoreUpdate={onScoreUpdate}
                      teams={teams}
                      ninthPlaceTitle="9th Place Game (Toilet Bowl)"
                    />
                  </div>
                )}
              </>
            ) : (
              /* Show all placement games for other seasons */
              <PlacementGames
                fifthPlaceGame={fifthPlaceGame}
                seventhPlaceGame={seventhPlaceGame}
                ninthPlaceGame={ninthPlaceGame}
                teamSeeds={teamSeeds}
                matchupCounter={matchupCounter}
                onMatchupCounterUpdate={setMatchupCounter}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
                ninthPlaceTitle={ninthPlaceTitle}
                fifthPlaceTitle="5th Place Game"
                seventhPlaceTitle="7th Place Game"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SixTeamPlayoffs;
