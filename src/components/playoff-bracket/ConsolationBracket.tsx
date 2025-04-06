
import React from "react";
import BracketSection from "./BracketSection";
import { MatchupScoresView, Team } from "@/types/database";

interface ConsolationBracketProps {
  weekFifteenConsolation: MatchupScoresView[];
  teamSeeds: Map<number, number>;
  matchupCounter: number;
  onMatchupCounterUpdate: (value: number) => void;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
}

const ConsolationBracket: React.FC<ConsolationBracketProps> = ({
  weekFifteenConsolation,
  teamSeeds,
  matchupCounter,
  onMatchupCounterUpdate,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
}) => {
  // Create matchup objects for BracketSection
  const consolationMatchups = weekFifteenConsolation.map(matchup => {
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
      isConsolation: true
    };
  });

  // Update the counter in the parent component
  React.useEffect(() => {
    onMatchupCounterUpdate(matchupCounter);
  }, [matchupCounter, onMatchupCounterUpdate]);

  return (
    <BracketSection
      title="Consolation Bracket"
      subtitle="Toilet Bowl: Loser is flushed to next round"
      matchups={consolationMatchups}
      editMode={editMode}
      onTeamSelect={onTeamSelect}
      onScoreUpdate={onScoreUpdate}
      teams={teams}
    />
  );
};

export default ConsolationBracket;
