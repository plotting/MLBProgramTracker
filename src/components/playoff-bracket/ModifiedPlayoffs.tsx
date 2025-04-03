
import React from "react";
import { MatchupScoresView } from "@/types/database";
import Matchup from "./Matchup";
import WeekLabels from "./WeekLabels";
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

  // Get week 16 consolation matchups (including 3rd place game)
  const weekSixteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === 16
  );

  // Calculate important playoff-related information
  const getPlayoffResults = () => {
    const results = {
      championshipWinner: null,
      championshipLoser: null,
      semiFinalLosers: [] as number[],
      thirdPlaceWinner: null,
      thirdPlaceLoser: null,
    };

    // Championship winner/loser
    if (championship && championship.home_score !== null && championship.away_score !== null) {
      if (championship.home_score > championship.away_score) {
        results.championshipWinner = championship.home_team_id;
        results.championshipLoser = championship.away_team_id;
      } else {
        results.championshipWinner = championship.away_team_id;
        results.championshipLoser = championship.home_team_id;
      }
    }

    // Semifinal losers
    semiFinals.forEach(match => {
      if (match.home_score !== null && match.away_score !== null) {
        const loser = match.home_score > match.away_score 
          ? match.away_team_id 
          : match.home_team_id;
        
        results.semiFinalLosers.push(loser);
      }
    });

    // Find the 3rd place game - need to look at non-consolation games because semiFinals losers 
    // play in the 3rd place game which is not marked as consolation
    const thirdPlaceGame = playoffMatchups.find(
      (matchup) => 
        matchup.week_number === 16 && 
        matchup !== championship &&
        results.semiFinalLosers.includes(matchup.home_team_id || 0) && 
        results.semiFinalLosers.includes(matchup.away_team_id || 0)
    );

    if (thirdPlaceGame && thirdPlaceGame.home_score !== null && thirdPlaceGame.away_score !== null) {
      if (thirdPlaceGame.home_score > thirdPlaceGame.away_score) {
        results.thirdPlaceWinner = thirdPlaceGame.home_team_id;
        results.thirdPlaceLoser = thirdPlaceGame.away_team_id;
      } else {
        results.thirdPlaceWinner = thirdPlaceGame.away_team_id;
        results.thirdPlaceLoser = thirdPlaceGame.home_team_id;
      }
    }

    return { results, thirdPlaceGame };
  };

  const { results, thirdPlaceGame } = getPlayoffResults();

  // Get other consolation games (not the 3rd place game)
  const otherConsolationGames = weekSixteenConsolation.filter(
    (matchup) => matchup !== thirdPlaceGame
  );

  // Sort other consolation games by team ID or some other relevant criteria
  // This will help ensure consistent display of 5th, 7th, 9th place games
  const sortedConsolationGames = [...otherConsolationGames].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  // Allocate matchup IDs
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
              <h3 className="text-lg font-semibold mb-6 text-center">Consolation Semifinals</h3>
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

            {sortedConsolationGames.length > 0 && (
              <>
                {sortedConsolationGames[0] && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 text-center">5th Place Game</h3>
                    <div className="mx-auto w-[240px]">
                      <Matchup
                        matchupId={matchupCounter++}
                        homeTeam={getTeamWithSeed(sortedConsolationGames[0].home_team_name, sortedConsolationGames[0].home_team_id)}
                        homeTeamId={sortedConsolationGames[0].home_team_id}
                        homeScore={sortedConsolationGames[0].home_score}
                        awayTeam={getTeamWithSeed(sortedConsolationGames[0].away_team_name, sortedConsolationGames[0].away_team_id)}
                        awayTeamId={sortedConsolationGames[0].away_team_id}
                        awayScore={sortedConsolationGames[0].away_score}
                        isConsolation
                        editMode={editMode}
                        onTeamSelect={onTeamSelect}
                        onScoreUpdate={onScoreUpdate}
                        teams={teams}
                      />
                    </div>
                  </div>
                )}

                {sortedConsolationGames[1] && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 text-center">7th Place Game</h3>
                    <div className="mx-auto w-[240px]">
                      <Matchup
                        matchupId={matchupCounter++}
                        homeTeam={getTeamWithSeed(sortedConsolationGames[1].home_team_name, sortedConsolationGames[1].home_team_id)}
                        homeTeamId={sortedConsolationGames[1].home_team_id}
                        homeScore={sortedConsolationGames[1].home_score}
                        awayTeam={getTeamWithSeed(sortedConsolationGames[1].away_team_name, sortedConsolationGames[1].away_team_id)}
                        awayTeamId={sortedConsolationGames[1].away_team_id}
                        awayScore={sortedConsolationGames[1].away_score}
                        isConsolation
                        editMode={editMode}
                        onTeamSelect={onTeamSelect}
                        onScoreUpdate={onScoreUpdate}
                        teams={teams}
                      />
                    </div>
                  </div>
                )}

                {sortedConsolationGames[2] && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 text-center">9th Place Game</h3>
                    <div className="mx-auto w-[240px]">
                      <Matchup
                        matchupId={matchupCounter++}
                        homeTeam={getTeamWithSeed(sortedConsolationGames[2].home_team_name, sortedConsolationGames[2].home_team_id)}
                        homeTeamId={sortedConsolationGames[2].home_team_id}
                        homeScore={sortedConsolationGames[2].home_score}
                        awayTeam={getTeamWithSeed(sortedConsolationGames[2].away_team_name, sortedConsolationGames[2].away_team_id)}
                        awayTeamId={sortedConsolationGames[2].away_team_id}
                        awayScore={sortedConsolationGames[2].away_score}
                        isConsolation
                        editMode={editMode}
                        onTeamSelect={onTeamSelect}
                        onScoreUpdate={onScoreUpdate}
                        teams={teams}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifiedPlayoffs;
