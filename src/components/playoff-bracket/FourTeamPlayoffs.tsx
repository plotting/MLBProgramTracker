
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

  // Get week 16 consolation matchups (3rd place and 5th place games)
  const weekSixteenConsolation = consolationMatchups.filter(
    (matchup) => matchup.week_number === 16
  );

  return (
    <div className="overflow-auto">
      <div className="flex min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />

        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2 text-center">Semifinals</h3>
            {semiFinals.map((matchup, index) => (
              <Matchup
                key={`semifinal-${index}`}
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
            ))}

            <h3 className="text-lg font-semibold mt-8 mb-2 text-center">
              Consolation
            </h3>
            {weekFifteenConsolation.map((matchup, index) => (
              <Matchup
                key={`consolation-semifinal-${index}`}
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
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2 text-center">Championship</h3>
            {championship && (
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
            )}

            <h3 className="text-lg font-semibold mt-8 mb-2 text-center">
              3rd Place Game
            </h3>
            {weekSixteenConsolation.length > 0 && (
              <Matchup
                matchupId={semiFinals.length + weekFifteenConsolation.length + 1}
                homeTeam={weekSixteenConsolation[0]?.home_team_name}
                homeTeamId={weekSixteenConsolation[0]?.home_team_id}
                homeScore={weekSixteenConsolation[0]?.home_score}
                awayTeam={weekSixteenConsolation[0]?.away_team_name}
                awayTeamId={weekSixteenConsolation[0]?.away_team_id}
                awayScore={weekSixteenConsolation[0]?.away_score}
                isConsolation
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
              />
            )}

            {weekSixteenConsolation.length > 1 && (
              <>
                <h3 className="text-lg font-semibold mt-8 mb-2 text-center">
                  5th Place Game
                </h3>
                <Matchup
                  matchupId={semiFinals.length + weekFifteenConsolation.length + 2}
                  homeTeam={weekSixteenConsolation[1]?.home_team_name}
                  homeTeamId={weekSixteenConsolation[1]?.home_team_id}
                  homeScore={weekSixteenConsolation[1]?.home_score}
                  awayTeam={weekSixteenConsolation[1]?.away_team_name}
                  awayTeamId={weekSixteenConsolation[1]?.away_team_id}
                  awayScore={weekSixteenConsolation[1]?.away_score}
                  isConsolation
                  editMode={editMode}
                  onTeamSelect={onTeamSelect}
                  onScoreUpdate={onScoreUpdate}
                  teams={teams}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourTeamPlayoffs;
