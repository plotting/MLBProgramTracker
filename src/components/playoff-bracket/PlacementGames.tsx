
import React from "react";
import BracketSection from "./BracketSection";
import { MatchupScoresView, Team } from "@/types/database";

interface PlacementGamesProps {
  thirdPlaceGame?: MatchupScoresView;
  fifthPlaceGame?: MatchupScoresView;
  seventhPlaceGame?: MatchupScoresView;
  ninthPlaceGame?: MatchupScoresView;
  teamSeeds: Map<number, number>;
  matchupCounter: number;
  onMatchupCounterUpdate: (value: number) => void;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  ninthPlaceTitle?: string;
}

const PlacementGames: React.FC<PlacementGamesProps> = ({
  thirdPlaceGame,
  fifthPlaceGame,
  seventhPlaceGame,
  ninthPlaceGame,
  teamSeeds,
  matchupCounter,
  onMatchupCounterUpdate,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  ninthPlaceTitle = "9th Place Game"
}) => {
  let updatedCounter = matchupCounter;
  
  // Create the placement game matchups
  const createPlacementMatchup = (matchup: MatchupScoresView | undefined, isConsolation: boolean = false) => {
    if (!matchup) return null;
    return {
      matchupId: updatedCounter++,
      homeTeam: matchup.home_team_name,
      homeTeamId: matchup.home_team_id,
      homeSeed: matchup.home_team_id ? teamSeeds.get(matchup.home_team_id) : undefined,
      homeScore: matchup.home_score,
      awayTeam: matchup.away_team_name,
      awayTeamId: matchup.away_team_id,
      awaySeed: matchup.away_team_id ? teamSeeds.get(matchup.away_team_id) : undefined,
      awayScore: matchup.away_score,
      isConsolation
    };
  };

  // Update the counter in the parent component
  React.useEffect(() => {
    onMatchupCounterUpdate(updatedCounter);
  }, [updatedCounter, onMatchupCounterUpdate]);
  
  return (
    <>
      {thirdPlaceGame && (
        <BracketSection
          title="3rd Place Game"
          matchups={[createPlacementMatchup(thirdPlaceGame) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
        />
      )}
      
      {fifthPlaceGame && (
        <BracketSection
          title="5th Place Game"
          matchups={[createPlacementMatchup(fifthPlaceGame, true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
        />
      )}
      
      {seventhPlaceGame && (
        <BracketSection
          title="7th Place Game"
          matchups={[createPlacementMatchup(seventhPlaceGame, true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
        />
      )}
      
      {ninthPlaceGame && (
        <BracketSection
          title={ninthPlaceTitle}
          matchups={[createPlacementMatchup(ninthPlaceGame, true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
        />
      )}
    </>
  );
};

export default PlacementGames;
