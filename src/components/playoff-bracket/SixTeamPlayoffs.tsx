
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
import BracketSection from "./BracketSection";
import { getPlayoffMatchups, identifyPlacementGames, getConsolationMatchups, getWeekFifteenConsolation } from "./five-team/fiveTeamUtils";

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
  const [otherConsolationMatchupIds, setOtherConsolationMatchupIds] = useState<number[]>([]);
  
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
  
  // Find specific matchups for placement games using utility function
  const { fifthPlaceGame, seventhPlaceGame, ninthPlaceGame } = identifyPlacementGames(
    weekSixteenConsolation,
    []  // Not needed for this identification method
  );
  
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

  // Generate IDs for other consolation matchups - THIS REPLACES THE INLINE SETTER CALLS
  useEffect(() => {
    if (otherWeekSixteenConsolation.length > 0) {
      // Generate an array of IDs for other consolation matchups
      const nextAvailableId = matchupCounter;
      const newIds = Array.from({ length: otherWeekSixteenConsolation.length }, 
        (_, index) => nextAvailableId + index);
      
      setOtherConsolationMatchupIds(newIds);
      setMatchupCounter(nextAvailableId + otherWeekSixteenConsolation.length);
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
                ninthPlaceTitle={ninthPlaceTitle}
                fifthPlaceTitle="5th Place Game"
                seventhPlaceTitle="7th Place Game"
              />
            )}
          </div>
        </div>
        
        {/* Consolation Bracket Divider */}
        <div className="w-full my-8">
          <div className="flex items-center justify-center">
            <div className="h-px bg-border flex-grow"></div>
            <span className="px-4 text-sm text-muted-foreground font-medium">{consolationTitle}</span>
            <div className="h-px bg-border flex-grow"></div>
          </div>
        </div>
        
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
            
            {/* Placement Games */}
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
            
            {/* Any other consolation games that weren't specifically identified */}
            {otherWeekSixteenConsolation.length > 0 && (
              <div className="mt-12">
                <h4 className="text-center text-sm font-medium mb-4">Other Consolation Games</h4>
                {otherWeekSixteenConsolation.map((matchup, index) => (
                  <div key={`other-consolation-${index}`} className="mb-12">
                    <div className="mx-auto w-[240px]">
                      <BracketSection
                        title="Consolation Matchup"
                        matchups={[{
                          matchupId: otherConsolationMatchupIds[index] || matchupCounter + index,
                          homeTeam: matchup.home_team_name,
                          homeTeamId: matchup.home_team_id,
                          homeSeed: matchup.home_team_id ? teamSeeds.get(matchup.home_team_id) : undefined,
                          homeScore: matchup.home_score,
                          awayTeam: matchup.away_team_name,
                          awayTeamId: matchup.away_team_id,
                          awaySeed: matchup.away_team_id ? teamSeeds.get(matchup.away_team_id) : undefined,
                          awayScore: matchup.away_score,
                          isConsolation: true
                        }]}
                        editMode={editMode}
                        onTeamSelect={onTeamSelect}
                        onScoreUpdate={onScoreUpdate}
                        teams={teams}
                        titleClassName="font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SixTeamPlayoffs;
