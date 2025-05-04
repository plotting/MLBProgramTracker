
import React, { useEffect } from "react";
import BracketSection from "./BracketSection";
import { MatchupScoresView, Team } from "@/types/database";

interface ChampionshipGameProps {
  championship: MatchupScoresView;
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
  // Create championship matchup object for BracketSection
  const championshipMatchup = {
    matchupId: matchupCounter,
    homeTeam: championship.home_team_name,
    homeTeamId: championship.home_team_id,
    homeSeed: championship.home_team_id ? teamSeeds.get(championship.home_team_id) : undefined,
    homeScore: championship.home_score,
    awayTeam: championship.away_team_name,
    awayTeamId: championship.away_team_id,
    awaySeed: championship.away_team_id ? teamSeeds.get(championship.away_team_id) : undefined,
    awayScore: championship.away_score,
    isConsolation: false
  };

  // Update the counter in the parent component only once
  // Fixed by using a proper dependency array to ensure it runs only once
  useEffect(() => {
    const newCounter = matchupCounter + 1;
    onMatchupCounterUpdate(newCounter);
  }, [matchupCounter, onMatchupCounterUpdate]);

  return (
    <BracketSection
      title="Championship"
      matchups={[championshipMatchup]}
      editMode={editMode}
      onTeamSelect={onTeamSelect}
      onScoreUpdate={onScoreUpdate}
      teams={teams}
    />
  );
};

export default ChampionshipGame;
