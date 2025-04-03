
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
  teamSeeds?: Map<number, number>;
}

const FiveTeamPlayoffs: React.FC<FiveTeamPlayoffsProps> = ({ 
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

  // Function to format team name with seed
  const getTeamWithSeed = (teamName?: string, teamId?: number) => {
    if (!teamName || !teamId) return teamName || "";
    const seed = teamSeeds.get(teamId);
    return seed ? `(${seed}) ${teamName}` : teamName;
  };

  // Sort consolation matchups by seed to put higher seeds on top
  const sortedConsolationGames = [...weekSixteenConsolation].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Week 15</h3>
              <div className="space-y-12">
                {wildcardGames.map((matchup, index) => {
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

                {seedOneSemifinal && (
                  <div className="mx-auto w-[240px]">
                    <Matchup
                      matchupId={matchupCounter++}
                      homeTeam={getTeamWithSeed(seedOneSemifinal.home_team_name, seedOneSemifinal.home_team_id)}
                      homeTeamId={seedOneSemifinal.home_team_id}
                      homeScore={seedOneSemifinal.home_score}
                      awayTeam={getTeamWithSeed(seedOneSemifinal.away_team_name, seedOneSemifinal.away_team_id)}
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
              <h3 className="text-lg font-semibold mb-6 text-center">Consolation Round</h3>
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
              <h3 className="text-lg font-semibold mb-6 text-center">Final Placement Games</h3>
              <div className="space-y-12">
                {sortedConsolationGames.map((matchup, index) => {
                  const id = matchupCounter++;
                  return (
                    <div key={`final-consolation-${index}`} className="mx-auto w-[240px]">
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
        </div>
      </div>
    </div>
  );
};

export default FiveTeamPlayoffs;
