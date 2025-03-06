
import React from "react";
import { MatchupScoresView } from "@/types/database";
import Matchup from "./Matchup";
import WeekLabels from "./WeekLabels";
import type { Team } from "@/types/database";

interface FiveTeamPlayoffsProps {
  matchups: MatchupScoresView[];
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
}

const FiveTeamPlayoffs: React.FC<FiveTeamPlayoffsProps> = ({ 
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

  // Get wildcard matchups (week 15) - now it's just one game for 5-team format
  const wildcardGames = playoffMatchups.filter(
    (matchup) => matchup.week_number === 15 && matchup.home_team_id !== 1
  );

  // Get semifinal matchup with the 1 seed (week 15)
  const seedOneSemifinal = playoffMatchups.find(
    (matchup) => matchup.week_number === 15 && matchup.home_team_id === 1
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

  // Get week 16 consolation matchups (3rd place and other games)
  const weekSixteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === 16
  );

  let matchupCounter = 0;

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />
        
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Week 15</h3>
              <div className="space-y-8">
                {wildcardGames.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`wildcard-${index}`} className="mx-auto w-[220px]">
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

                {seedOneSemifinal && (
                  <div className="mx-auto w-[220px]">
                    <Matchup
                      matchupId={matchupCounter++}
                      homeTeam={seedOneSemifinal.home_team_name}
                      homeTeamId={seedOneSemifinal.home_team_id}
                      homeScore={seedOneSemifinal.home_score}
                      awayTeam={seedOneSemifinal.away_team_name}
                      awayTeamId={seedOneSemifinal.away_team_id}
                      awayScore={seedOneSemifinal.away_score}
                      editMode={editMode}
                      onTeamSelect={onTeamSelect}
                      onScoreUpdate={onScoreUpdate}
                      teams={teams}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Consolation Round</h3>
              <div className="space-y-8">
                {weekFifteenConsolation.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`consolation-semifinal-${index}`} className="mx-auto w-[220px]">
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

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Championship</h3>
              {championship && (
                <div className="mx-auto w-[220px]">
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
              <h3 className="text-lg font-semibold mb-4 text-center">Final Placement Games</h3>
              <div className="space-y-8">
                {weekSixteenConsolation.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`final-consolation-${index}`} className="mx-auto w-[220px]">
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
        </div>
      </div>
    </div>
  );
};

export default FiveTeamPlayoffs;
