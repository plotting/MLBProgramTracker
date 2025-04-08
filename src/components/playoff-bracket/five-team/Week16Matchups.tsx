
import React from "react";
import { MatchupScoresView } from "@/types/database";
import BracketSection from "../BracketSection";
import type { Team } from "@/types/database";

interface Week16MatchupsProps {
  championship?: MatchupScoresView;
  consolationMatchups: MatchupScoresView[];
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  teamSeeds: Map<number, number>;
  matchupCounter: number;
  onMatchupCounterUpdate: (newCounter: number) => void;
}

const Week16Matchups: React.FC<Week16MatchupsProps> = ({
  championship,
  consolationMatchups,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  teamSeeds,
  matchupCounter,
  onMatchupCounterUpdate
}) => {
  // Counter to track matchup IDs
  let localCounter = matchupCounter;
  
  // Format team names with seeds
  const getTeamWithSeed = (teamName?: string, teamId?: number) => {
    if (!teamName || !teamId) return teamName || "";
    const seed = teamSeeds.get(teamId);
    return seed ? `(${seed}) ${teamName}` : teamName;
  };

  // Create matchup for championship game
  const championshipMatchup = championship ? [{
    matchupId: localCounter++,
    homeTeam: getTeamWithSeed(championship.home_team_name, championship.home_team_id),
    homeTeamId: championship.home_team_id,
    homeSeed: teamSeeds.get(championship.home_team_id),
    homeScore: championship.home_score,
    awayTeam: getTeamWithSeed(championship.away_team_name, championship.away_team_id),
    awayTeamId: championship.away_team_id,
    awaySeed: teamSeeds.get(championship.away_team_id),
    awayScore: championship.away_score
  }] : [];

  // Sort consolation matchups by seed to put higher seeds on top
  const sortedConsolationGames = [...consolationMatchups].sort((a, b) => {
    const aHigherSeed = Math.min(teamSeeds.get(a.home_team_id || 0) || 999, teamSeeds.get(a.away_team_id || 0) || 999);
    const bHigherSeed = Math.min(teamSeeds.get(b.home_team_id || 0) || 999, teamSeeds.get(b.away_team_id || 0) || 999);
    return aHigherSeed - bHigherSeed;
  });

  // Create matchup objects for consolation games
  const finalPlacementMatchups = sortedConsolationGames.map(matchup => {
    const id = localCounter++;
    return {
      matchupId: id,
      homeTeam: getTeamWithSeed(matchup.home_team_name, matchup.home_team_id),
      homeTeamId: matchup.home_team_id,
      homeSeed: teamSeeds.get(matchup.home_team_id),
      homeScore: matchup.home_score,
      awayTeam: getTeamWithSeed(matchup.away_team_name, matchup.away_team_id),
      awayTeamId: matchup.away_team_id,
      awaySeed: teamSeeds.get(matchup.away_team_id),
      awayScore: matchup.away_score,
      isConsolation: true
    };
  });

  // Update parent's counter
  React.useEffect(() => {
    onMatchupCounterUpdate(localCounter);
  }, [localCounter, onMatchupCounterUpdate]);

  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-6 text-center">Championship</h3>
        <BracketSection
          title="Championship Game"
          matchups={championshipMatchup}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-6 text-center">Final Placement Games</h3>
        <BracketSection
          title="Placement Matchups"
          matchups={finalPlacementMatchups}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
        />
      </div>
    </div>
  );
};

export default Week16Matchups;
