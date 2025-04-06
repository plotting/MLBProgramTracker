
import React from "react";
import BracketSection from "./BracketSection";
import { MatchupScoresView, Team } from "@/types/database";

interface ChampionshipGameProps {
  championship: MatchupScoresView | undefined;
  teamSeeds: Map<number, number>;
  matchupCounter: number;
  onMatchupCounterUpdate: (value: number) => void;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
}

const ChampionshipGame: React.FC<ChampionshipGameProps> = ({
  championship,
  teamSeeds,
  matchupCounter,
  onMatchupCounterUpdate,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
}) => {
  const championshipMatchups = championship ? [{
    matchupId: matchupCounter++,
    homeTeam: championship.home_team_name,
    homeTeamId: championship.home_team_id,
    homeSeed: championship.home_team_id ? teamSeeds.get(championship.home_team_id) : undefined,
    homeScore: championship.home_score,
    awayTeam: championship.away_team_name,
    awayTeamId: championship.away_team_id,
    awaySeed: championship.away_team_id ? teamSeeds.get(championship.away_team_id) : undefined,
    awayScore: championship.away_score,
    isConsolation: false
  }] : [];

  // Update the counter in the parent component
  React.useEffect(() => {
    onMatchupCounterUpdate(matchupCounter);
  }, [matchupCounter, onMatchupCounterUpdate]);

  if (!championship) {
    return null;
  }

  return (
    <BracketSection
      title="Championship"
      matchups={championshipMatchups}
      editMode={editMode}
      onTeamSelect={onTeamSelect}
      onScoreUpdate={onScoreUpdate}
      teams={teams}
    />
  );
};

export default ChampionshipGame;
