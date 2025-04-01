
import React from "react";
import { MatchupScoresView } from "@/types/database";
import Matchup from "./Matchup";
import WeekLabels from "./WeekLabels";
import type { Team } from "@/types/database";

interface FourTeamPlayoffsProps {
  matchups: MatchupScoresView[];
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
}

const FourTeamPlayoffs: React.FC<FourTeamPlayoffsProps> = ({ 
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
    (matchup) => matchup.week_number === 16 && 
    !matchup.is_consolation
  );

  // Get consolation matchups
  const consolationMatchups = matchups.filter(
    (matchup) => matchup.is_consolation || (!matchup.is_playoff && matchup.week_number >= 15)
  );

  // Get week 15 consolation matchups
  const weekFifteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === 15
  );

  // Get week 16 consolation matchups
  const weekSixteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === 16
  );

  // Find the 3rd place game - matchup between semifinal losers in week 16
  const getSemiFinalLosers = () => {
    const losers = [];
    for (const match of semiFinals) {
      if (match.home_score === null || match.away_score === null) continue;
      
      const loser = match.home_score > match.away_score 
        ? match.away_team_id 
        : match.home_team_id;
      
      losers.push(loser);
    }
    return losers;
  };

  const semiFinalLosers = getSemiFinalLosers();
  
  // Find the third place game using a more comprehensive approach
  // Check all week 16 matchups to find a game between semifinal losers
  const findThirdPlaceGame = () => {
    // First check playoff (non-championship) games
    const nonChampionship = playoffMatchups.filter(m => 
      m.week_number === 16 && 
      m !== championship
    );
    
    for (const matchup of nonChampionship) {
      if (semiFinalLosers.includes(matchup.home_team_id || 0) && 
          semiFinalLosers.includes(matchup.away_team_id || 0)) {
        return matchup;
      }
    }
    
    // Then check consolation games
    for (const matchup of weekSixteenConsolation) {
      if (semiFinalLosers.includes(matchup.home_team_id || 0) && 
          semiFinalLosers.includes(matchup.away_team_id || 0)) {
        return matchup;
      }
    }
    
    // Then check regular matchups as some seasons might not flag them correctly
    const allWeek16 = matchups.filter(m => m.week_number === 16);
    for (const matchup of allWeek16) {
      if (semiFinalLosers.includes(matchup.home_team_id || 0) && 
          semiFinalLosers.includes(matchup.away_team_id || 0)) {
        return matchup;
      }
    }
    
    return null;
  };

  const thirdPlaceGame = findThirdPlaceGame();

  // Get other consolation games (5th place game, etc.)
  const otherConsolationGames = weekSixteenConsolation.filter(
    (matchup) => matchup !== thirdPlaceGame
  );

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Semifinals</h3>
              <div className="space-y-12">
                {semiFinals.map((matchup, index) => (
                  <div key={`semifinal-${index}`} className="mx-auto w-[240px]">
                    <Matchup
                      matchupId={index}
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
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Consolation</h3>
              <div className="space-y-12">
                {weekFifteenConsolation.map((matchup, index) => (
                  <div key={`consolation-semifinal-${index}`} className="mx-auto w-[240px]">
                    <Matchup
                      matchupId={semiFinals.length + index}
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
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Championship</h3>
              {championship && (
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={semiFinals.length + weekFifteenConsolation.length}
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
                    matchupId={semiFinals.length + weekFifteenConsolation.length + 1}
                    homeTeam={thirdPlaceGame.home_team_name}
                    homeTeamId={thirdPlaceGame.home_team_id}
                    homeScore={thirdPlaceGame.home_score}
                    awayTeam={thirdPlaceGame.away_team_name}
                    awayTeamId={thirdPlaceGame.away_team_id}
                    awayScore={thirdPlaceGame.away_score}
                    isConsolation={thirdPlaceGame.is_consolation}
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              )}
            </div>

            {otherConsolationGames.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-center">5th Place Game</h3>
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={semiFinals.length + weekFifteenConsolation.length + 2}
                    homeTeam={otherConsolationGames[0]?.home_team_name}
                    homeTeamId={otherConsolationGames[0]?.home_team_id}
                    homeScore={otherConsolationGames[0]?.home_score}
                    awayTeam={otherConsolationGames[0]?.away_team_name}
                    awayTeamId={otherConsolationGames[0]?.away_team_id}
                    awayScore={otherConsolationGames[0]?.away_score}
                    isConsolation
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              </div>
            )}

            {otherConsolationGames.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-center">7th Place Game</h3>
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={semiFinals.length + weekFifteenConsolation.length + 3}
                    homeTeam={otherConsolationGames[1]?.home_team_name}
                    homeTeamId={otherConsolationGames[1]?.home_team_id}
                    homeScore={otherConsolationGames[1]?.home_score}
                    awayTeam={otherConsolationGames[1]?.away_team_name}
                    awayTeamId={otherConsolationGames[1]?.away_team_id}
                    awayScore={otherConsolationGames[1]?.away_score}
                    isConsolation
                    editMode={editMode}
                    onTeamSelect={onTeamSelect}
                    onScoreUpdate={onScoreUpdate}
                    teams={teams}
                  />
                </div>
              </div>
            )}

            {otherConsolationGames.length > 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-center">9th Place Game</h3>
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={semiFinals.length + weekFifteenConsolation.length + 4}
                    homeTeam={otherConsolationGames[2]?.home_team_name}
                    homeTeamId={otherConsolationGames[2]?.home_team_id}
                    homeScore={otherConsolationGames[2]?.home_score}
                    awayTeam={otherConsolationGames[2]?.away_team_name}
                    awayTeamId={otherConsolationGames[2]?.away_team_id}
                    awayScore={otherConsolationGames[2]?.away_score}
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

export default FourTeamPlayoffs;
