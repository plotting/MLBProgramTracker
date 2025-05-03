
import React from "react";
import { MatchupScoresView } from "@/types/database";
import Matchup from "./Matchup";
import WeekLabels from "./WeekLabels";
import type { Team } from "@/types/database";
import { getPlayoffWeeks } from "./utils/playoffWeeks";
import BracketSection from "./BracketSection";

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
  // Get playoff week numbers based on season
  const { playoffStartWeek, champWeek, displayWeeks, isLoserAdvancesFormat } = getPlayoffWeeks(seasonNumber);
  
  // Filter playoff matchups (non-consolation)
  const playoffMatchups = matchups.filter(
    (matchup) => matchup.is_playoff && !matchup.is_consolation
  );

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
  const consolationMatchups = matchups.filter(
    (matchup) => matchup.is_consolation
  );

  // Get week 15 consolation matchups (first round)
  const weekFifteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === playoffStartWeek
  );
  
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
  
  // For 5th place game - this is the game between the two teams that won in week 15 consolation
  const weekFifteenWinners = weekFifteenConsolation
    .filter(match => match.home_score !== null && match.away_score !== null)
    .map(match => match.home_score! > match.away_score! ? match.home_team_id : match.away_team_id);
  
  const fifthPlaceGame = weekSixteenConsolation.find(
    matchup => 
      weekFifteenWinners.includes(matchup.home_team_id || 0) && 
      weekFifteenWinners.includes(matchup.away_team_id || 0)
  );

  // Get other consolation games from week 16
  const otherWeekSixteenConsolation = weekSixteenConsolation.filter(
    matchup => matchup !== fifthPlaceGame
  );
  
  // Sort other week 16 consolation matchups by seed
  const sortedOtherWeekSixteenConsolation = [...otherWeekSixteenConsolation].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  let matchupCounter = 0;

  // Function to format team name with seed
  const getTeamWithSeed = (teamName?: string, teamId?: number) => {
    if (!teamName || !teamId) return teamName || "";
    const seed = teamSeeds.get(teamId);
    return seed ? `(${seed}) ${teamName}` : teamName;
  };

  // For seasons 8-12, use the "loser advances" title format
  const ninthPlaceTitle = isLoserAdvancesFormat ? "9th Place Game (Toilet Bowl)" : "9th Place Game";
  const consolationTitle = isLoserAdvancesFormat ? "Consolation Bracket (Loser Advances)" : "Consolation Bracket";
  const toiletBowlRoundTitle = isLoserAdvancesFormat ? "Toilet Bowl Round 1: Loser advances" : "Consolation Round 1";

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[1000px]">
        <WeekLabels weeks={displayWeeks} />
        
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Week 15 */}
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Playoff Bracket</h3>
              <div className="mb-6">
                <h4 className="text-center font-medium mb-4">Wildcard</h4>
                <div className="space-y-12">
                  {sortedWildcardGames.map((matchup, index) => {
                    const id = matchupCounter++;
                    return (
                      <div key={`wildcard-${index}`} className="mx-auto w-[240px]">
                        <Matchup
                          matchupId={id}
                          homeTeam={getTeamWithSeed(matchup.home_team_name, matchup.home_team_id)}
                          homeTeamId={matchup.home_team_id}
                          homeScore={matchup.home_score}
                          awayTeam={getTeamWithSeed(matchup.away_team_name, matchup.away_team_id)}
                          awayTeamId={matchup.away_team_id}
                          awayScore={matchup.away_score}
                          editMode={editMode}
                          onTeamSelect={onTeamSelect}
                          onScoreUpdate={onScoreUpdate}
                          teams={teams}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Week 16 */}
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Semifinals</h3>
              <div className="space-y-12">
                {sortedSemiFinals.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`semifinal-${index}`} className="mx-auto w-[240px]">
                      <Matchup
                        matchupId={id}
                        homeTeam={getTeamWithSeed(matchup.home_team_name, matchup.home_team_id)}
                        homeTeamId={matchup.home_team_id}
                        homeScore={matchup.home_score}
                        awayTeam={getTeamWithSeed(matchup.away_team_name, matchup.away_team_id)}
                        awayTeamId={matchup.away_team_id}
                        awayScore={matchup.away_score}
                        editMode={editMode}
                        onTeamSelect={onTeamSelect}
                        onScoreUpdate={onScoreUpdate}
                        teams={teams}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Week 17 */}
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Championship</h3>
              {championship && (
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={matchupCounter++}
                    homeTeam={getTeamWithSeed(championship.home_team_name, championship.home_team_id)}
                    homeTeamId={championship.home_team_id}
                    homeScore={championship.home_score}
                    awayTeam={getTeamWithSeed(championship.away_team_name, championship.away_team_id)}
                    awayTeamId={championship.away_team_id}
                    awayScore={championship.away_score}
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              )}
            </div>
            
            {/* Third Place Game */}
            {thirdPlaceGame && (
              <div>
                <h4 className="text-center font-medium mb-4">3rd Place Game</h4>
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={matchupCounter++}
                    homeTeam={getTeamWithSeed(thirdPlaceGame.home_team_name, thirdPlaceGame.home_team_id)}
                    homeTeamId={thirdPlaceGame.home_team_id}
                    homeScore={thirdPlaceGame.home_score}
                    awayTeam={getTeamWithSeed(thirdPlaceGame.away_team_name, thirdPlaceGame.away_team_id)}
                    awayTeamId={thirdPlaceGame.away_team_id}
                    awayScore={thirdPlaceGame.away_score}
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              </div>
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
        <div className="grid grid-cols-3 gap-8">
          {/* Week 15 */}
          <div>
            <h4 className="text-center text-sm font-medium mb-4">Week {playoffStartWeek}</h4>
            <div>
              <h4 className="text-center text-sm text-muted-foreground mb-4">{toiletBowlRoundTitle}</h4>
              <div className="space-y-12">
                {sortedWeekFifteenConsolation.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`consolation-round1-${index}`} className="mx-auto w-[240px]">
                      <Matchup
                        matchupId={id}
                        homeTeam={getTeamWithSeed(matchup.home_team_name, matchup.home_team_id)}
                        homeTeamId={matchup.home_team_id}
                        homeScore={matchup.home_score}
                        awayTeam={getTeamWithSeed(matchup.away_team_name, matchup.away_team_id)}
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
                })}
              </div>
            </div>
          </div>

          {/* Week 16 */}
          <div>
            <h4 className="text-center text-sm font-medium mb-4">Week {playoffStartWeek + 1}</h4>
            
            {/* 5th Place Game */}
            {fifthPlaceGame && (
              <div className="mb-12">
                <h4 className="text-center text-sm font-medium mb-4">5th Place Game</h4>
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={matchupCounter++}
                    homeTeam={getTeamWithSeed(fifthPlaceGame.home_team_name, fifthPlaceGame.home_team_id)}
                    homeTeamId={fifthPlaceGame.home_team_id}
                    homeScore={fifthPlaceGame.home_score}
                    awayTeam={getTeamWithSeed(fifthPlaceGame.away_team_name, fifthPlaceGame.away_team_id)}
                    awayTeamId={fifthPlaceGame.away_team_id}
                    awayScore={fifthPlaceGame.away_score}
                    isConsolation
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              </div>
            )}
            
            {/* Consolation Round 2 */}
            <div>
              <h4 className="text-center text-sm font-medium mb-4">Consolation Round 2</h4>
              <div className="space-y-12">
                {sortedOtherWeekSixteenConsolation.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`consolation-round2-${index}`} className="mx-auto w-[240px]">
                      <Matchup
                        matchupId={id}
                        homeTeam={getTeamWithSeed(matchup.home_team_name, matchup.home_team_id)}
                        homeTeamId={matchup.home_team_id}
                        homeScore={matchup.home_score}
                        awayTeam={getTeamWithSeed(matchup.away_team_name, matchup.away_team_id)}
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
                })}
              </div>
            </div>
          </div>
          
          {/* Week 17 placeholder column */}
          <div>
            <h4 className="text-center text-sm font-medium mb-4">Week {champWeek}</h4>
            
            {/* Placeholder for 7th and 9th place games to match season 10 format */}
            <div className="space-y-12">
              <div>
                <h4 className="text-center text-sm font-medium mb-4">7th Place Game</h4>
                <div className="mx-auto w-[240px] opacity-50">
                  {/* This is an empty matchup placeholder to maintain visual consistency with season 10 */}
                  <div className="border border-dashed border-border rounded-lg p-4 h-[100px] flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">No week {champWeek} games in season {seasonNumber}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-center text-sm font-medium mb-4">{ninthPlaceTitle}</h4>
                <div className="mx-auto w-[240px] opacity-50">
                  {/* This is an empty matchup placeholder to maintain visual consistency with season 10 */}
                  <div className="border border-dashed border-border rounded-lg p-4 h-[100px] flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">No week {champWeek} games in season {seasonNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SixTeamPlayoffs;
