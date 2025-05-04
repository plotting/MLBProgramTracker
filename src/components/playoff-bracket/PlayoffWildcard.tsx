
import React from "react";
import { MatchupScoresView, Team } from "@/types/database";
import BracketSection from "./BracketSection";

interface PlayoffWildcardProps {
  wildcardGames: MatchupScoresView[];
  teamSeeds: Map<number, number>;
  matchupCounter: number;
  onMatchupCounterUpdate: (value: number) => void;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
}

const PlayoffWildcard: React.FC<PlayoffWildcardProps> = ({
  wildcardGames,
  teamSeeds,
  matchupCounter,
  onMatchupCounterUpdate,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
}) => {
  // Create matchup objects for BracketSection
  const wildcardMatchups = wildcardGames.map(matchup => {
    const id = matchupCounter++;
    return {
      matchupId: id,
      homeTeam: matchup.home_team_name,
      homeTeamId: matchup.home_team_id,
      homeSeed: matchup.home_team_id ? teamSeeds.get(matchup.home_team_id) : undefined,
      homeScore: matchup.home_score,
      awayTeam: matchup.away_team_name,
      awayTeamId: matchup.away_team_id,
      awaySeed: matchup.away_team_id ? teamSeeds.get(matchup.away_team_id) : undefined,
      awayScore: matchup.away_score,
      isConsolation: false
    };
  });

  // Update the counter in the parent component
  React.useEffect(() => {
    onMatchupCounterUpdate(matchupCounter);
  }, [matchupCounter, onMatchupCounterUpdate]);

  return (
    <BracketSection
      title="Wildcard"
      matchups={wildcardMatchups}
      editMode={editMode}
      onTeamSelect={onTeamSelect}
      onScoreUpdate={onScoreUpdate}
      teams={teams}
      titleClassName="font-medium mb-4"
    />
  );
};

export default PlayoffWildcard;
