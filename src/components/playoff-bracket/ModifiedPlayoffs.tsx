
import React from "react";
import { MatchupScoresView } from "@/types/database";
import Matchup from "./Matchup";
import WeekLabels from "./WeekLabels";
import { getToiletBowlTeams } from "./utils/bracketUtils";
import type { Team } from "@/types/database";

interface ModifiedPlayoffsProps {
  matchups: MatchupScoresView[];
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  teamSeeds?: Map<number, number>;
}

const ModifiedPlayoffs: React.FC<ModifiedPlayoffsProps> = ({ 
  matchups,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  teamSeeds = new Map()
}) => {
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

  // Get toilet bowl teams
  const { round1Winners, round1Losers } = getToiletBowlTeams(consolationMatchups);

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

  // 7th place game (toilet bowl - between a consolation round 1 winner and loser)
  const seventhPlaceGame = weekSixteenConsolation.find(
    matchup => 
      !fifthPlaceGame || 
      (matchup !== fifthPlaceGame && matchup !== thirdPlaceGame && matchup !== championship)
  );

  // 9th place game (between consolation round 1 losers)
  const ninthPlaceGame = weekSixteenConsolation.find(
    matchup => 
      matchup !== fifthPlaceGame && 
      matchup !== seventhPlaceGame &&
      round1Losers.includes(matchup.home_team_id || 0) && 
      round1Losers.includes(matchup.away_team_id || 0)
  );

  // For tracking matchup IDs
  let matchupCounter = 0;

  // Function to format team name with seed
  const getTeamWithSeed = (teamName?: string, teamId?: number) => {
    if (!teamName || !teamId) return teamName || "";
    const seed = teamSeeds.get(teamId);
    return seed ? `(${seed}) ${teamName}` : teamName;
  };

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />
        
        <div className="grid grid-cols-2 gap-8">
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

            <div>
              <h3 className="text-lg font-semibold mb-2 text-center">Consolation Bracket</h3>
              <h4 className="text-sm text-muted-foreground mb-4 text-center">Toilet Bowl: Loser is flushed to next round</h4>
              <div className="space-y-12">
                {weekFifteenConsolation.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`consolation-semifinal-${index}`} className="mx-auto w-[240px]">
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

            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">3rd Place Game</h3>
              {thirdPlaceGame && (
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
              )}
            </div>

            {fifthPlaceGame && (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-center">5th Place Game</h3>
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

            {seventhPlaceGame && (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-center">7th Place Game (Toilet Bowl)</h3>
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={matchupCounter++}
                    homeTeam={getTeamWithSeed(seventhPlaceGame.home_team_name, seventhPlaceGame.home_team_id)}
                    homeTeamId={seventhPlaceGame.home_team_id}
                    homeScore={seventhPlaceGame.home_score}
                    awayTeam={getTeamWithSeed(seventhPlaceGame.away_team_name, seventhPlaceGame.away_team_id)}
                    awayTeamId={seventhPlaceGame.away_team_id}
                    awayScore={seventhPlaceGame.away_score}
                    isConsolation
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              </div>
            )}

            {ninthPlaceGame && (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-center">9th Place Game</h3>
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={matchupCounter++}
                    homeTeam={getTeamWithSeed(ninthPlaceGame.home_team_name, ninthPlaceGame.home_team_id)}
                    homeTeamId={ninthPlaceGame.home_team_id}
                    homeScore={ninthPlaceGame.home_score}
                    awayTeam={getTeamWithSeed(ninthPlaceGame.away_team_name, ninthPlaceGame.away_team_id)}
                    awayTeamId={ninthPlaceGame.away_team_id}
                    awayScore={ninthPlaceGame.away_score}
                    isConsolation
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
      </div>
    </div>
  );
};

export default ModifiedPlayoffs;
