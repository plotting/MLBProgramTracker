
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
  
  // Find week 16 playoff (non-consolation) game between semifinal losers (3rd place game)
  // For older seasons, semifinal losers played for 3rd place in a non-consolation game
  const thirdPlaceGame = playoffMatchups.find(
    (matchup) => 
      matchup.week_number === 16 && 
      matchup !== championship &&
      semiFinalLosers.length >= 2 &&
      semiFinalLosers.includes(matchup.home_team_id || 0) && 
      semiFinalLosers.includes(matchup.away_team_id || 0)
  );

  // If no 3rd place game found in playoff games, check consolation games
  // For some seasons, the 3rd place game might be marked as a consolation game
  const thirdPlaceGameInConsolation = !thirdPlaceGame ? weekSixteenConsolation.find(
    (matchup) => 
      semiFinalLosers.length >= 2 &&
      semiFinalLosers.includes(matchup.home_team_id || 0) && 
      semiFinalLosers.includes(matchup.away_team_id || 0)
  ) : null;

  // Use either the playoff 3rd place game or the consolation one
  const finalThirdPlaceGame = thirdPlaceGame || thirdPlaceGameInConsolation;

  // Get other consolation games (5th place game, etc.)
  const otherConsolationGames = weekSixteenConsolation.filter(
    (matchup) => matchup !== finalThirdPlaceGame
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
              {finalThirdPlaceGame && (
                <div className="mx-auto w-[240px]">
                  <Matchup
                    matchupId={semiFinals.length + weekFifteenConsolation.length + 1}
                    homeTeam={finalThirdPlaceGame.home_team_name}
                    homeTeamId={finalThirdPlaceGame.home_team_id}
                    homeScore={finalThirdPlaceGame.home_score}
                    awayTeam={finalThirdPlaceGame.away_team_name}
                    awayTeamId={finalThirdPlaceGame.away_team_id}
                    awayScore={finalThirdPlaceGame.away_score}
                    isConsolation={finalThirdPlaceGame.is_consolation}
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
