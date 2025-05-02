
import React from "react";
import { MatchupScoresView } from "@/types/database";
import Matchup from "./Matchup";
import WeekLabels from "./WeekLabels";
import type { Team } from "@/types/database";
import { getPlayoffWeeks } from "./utils/playoffWeeks";

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
  const { playoffStartWeek, champWeek, displayWeeks } = getPlayoffWeeks(seasonNumber);
  
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

  // Get consolation matchups
  const consolationMatchups = matchups.filter(
    (matchup) => matchup.is_consolation
  );

  // Get week 15 consolation matchups
  const weekFifteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === playoffStartWeek + 1
  );
  
  // Sort week 15 consolation matchups by seed
  const sortedWeekFifteenConsolation = [...weekFifteenConsolation].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  // Get week 16 consolation matchups (3rd place and other games)
  const weekSixteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === champWeek
  );
  
  // Sort week 16 consolation matchups by seed
  const sortedWeekSixteenConsolation = [...weekSixteenConsolation].sort((a, b) => {
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

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[1000px]">
        <WeekLabels weeks={displayWeeks} />
        
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Wildcard</h3>
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

            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Consolation Round 1</h3>
              <div className="space-y-12">
                {consolationMatchups
                  .filter((matchup) => matchup.week_number === playoffStartWeek)
                  .sort((a, b) => {
                    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
                    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
                    return aHigherSeed - bHigherSeed;
                  })
                  .map((matchup, index) => {
                    const id = matchupCounter++;
                    return (
                      <div key={`consolation-wildcard-${index}`} className="mx-auto w-[240px]">
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
              <h3 className="text-lg font-semibold mb-6 text-center">Consolation Round 2</h3>
              <div className="space-y-12">
                {sortedWeekFifteenConsolation.map((matchup, index) => {
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
                {sortedWeekSixteenConsolation.map((matchup, index) => {
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

export default SixTeamPlayoffs;
