
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
}

const ModifiedPlayoffs: React.FC<ModifiedPlayoffsProps> = ({ 
  matchups,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = []
}) => {
  // Filter playoff matchups (non-consolation)
  const playoffMatchups = matchups.filter(
    (matchup) => matchup.is_playoff && !matchup.is_consolation
  );

  // Get semifinal matchups (week 15)
  const semiFinals = playoffMatchups.filter(
    (matchup) => matchup.week_number === 15
  );

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

  // Find the 3rd place game
  // For Modified Playoffs, 3rd place game is between semifinal losers
  const getSemiFinalLosers = () => {
    if (!semiFinals.length) return [];
    
    return semiFinals.map(match => {
      if (match.home_score === null || match.away_score === null) return null;
      return match.home_score > match.away_score 
        ? match.away_team_id 
        : match.home_team_id;
    }).filter(Boolean);
  };

  const semiFinalLosers = getSemiFinalLosers();
  
  // Find the 3rd place game - matchup between semifinal losers in week 16
  const thirdPlaceGame = weekSixteenConsolation.find(
    (matchup) => 
      semiFinalLosers.length === 2 &&
      semiFinalLosers.includes(matchup.home_team_id || 0) && 
      semiFinalLosers.includes(matchup.away_team_id || 0)
  );

  // Get other consolation games (not the 3rd place game)
  const otherConsolationGames = weekSixteenConsolation.filter(
    (matchup) => matchup !== thirdPlaceGame
  );

  // Sort other consolation games by team ID or some other relevant criteria
  // This will help ensure consistent display of 5th, 7th, 9th place games
  const sortedConsolationGames = [...otherConsolationGames].sort((a, b) => {
    const aSum = (a.home_team_id || 0) + (a.away_team_id || 0);
    const bSum = (b.home_team_id || 0) + (b.away_team_id || 0);
    return aSum - bSum;
  });

  // Allocate matchup IDs
  let matchupCounter = 0;

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Semifinals</h3>
              <div className="space-y-12">
                {semiFinals.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`semifinal-${index}`} className="mx-auto w-[240px]">
                      <Matchup
                        matchupId={id}
                        homeTeam={matchup.home_team_name}
                        homeTeamId={matchup.home_team_id}
                        homeScore={matchup.home_score}
                        awayTeam={matchup.away_team_name}
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
                        homeTeam={matchup.home_team_name}
                        homeTeamId={matchup.home_team_id}
                        homeScore={matchup.home_score}
                        awayTeam={matchup.away_team_name}
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
                    homeTeam={championship.home_team_name}
                    homeTeamId={championship.home_team_id}
                    homeScore={championship.home_score}
                    awayTeam={championship.away_team_name}
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
                    homeTeam={thirdPlaceGame.home_team_name}
                    homeTeamId={thirdPlaceGame.home_team_id}
                    homeScore={thirdPlaceGame.home_score}
                    awayTeam={thirdPlaceGame.away_team_name}
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
                        homeTeam={sortedConsolationGames[0].home_team_name}
                        homeTeamId={sortedConsolationGames[0].home_team_id}
                        homeScore={sortedConsolationGames[0].home_score}
                        awayTeam={sortedConsolationGames[0].away_team_name}
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
                        homeTeam={sortedConsolationGames[1].home_team_name}
                        homeTeamId={sortedConsolationGames[1].home_team_id}
                        homeScore={sortedConsolationGames[1].home_score}
                        awayTeam={sortedConsolationGames[1].away_team_name}
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
                        homeTeam={sortedConsolationGames[2].home_team_name}
                        homeTeamId={sortedConsolationGames[2].home_team_id}
                        homeScore={sortedConsolationGames[2].home_score}
                        awayTeam={sortedConsolationGames[2].away_team_name}
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
