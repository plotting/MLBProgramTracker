
import React, { useEffect } from "react";
import BracketSection from "./BracketSection";
import { MatchupScoresView, Team } from "@/types/database";
import Matchup from "./Matchup";

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
  thirdPlaceTitle?: string;
  fifthPlaceTitle?: string;
  seventhPlaceTitle?: string;
  showOnlyFifthPlace?: boolean;
  showDivider?: boolean;
  dividerText?: string;
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
  ninthPlaceTitle = "9th Place Game",
  thirdPlaceTitle = "3rd Place Game",
  fifthPlaceTitle = "5th Place Game",
  seventhPlaceTitle = "7th Place Game",
  showOnlyFifthPlace = false,
  showDivider = false,
  dividerText = ""
}) => {
  // Count how many games we'll show
  let gamesToShow = 0;
  if (thirdPlaceGame) gamesToShow++;
  if (fifthPlaceGame) gamesToShow++;
  if (seventhPlaceGame) gamesToShow++;
  if (ninthPlaceGame) gamesToShow++;
  
  // Create the placement game matchups
  const createPlacementMatchup = (matchup: MatchupScoresView | undefined, index: number, isConsolation: boolean = false) => {
    if (!matchup) return null;
    return {
      matchupId: matchupCounter + index,
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

  // Update the counter in the parent component using a stable dependency array
  useEffect(() => {
    if (gamesToShow > 0) {
      onMatchupCounterUpdate(matchupCounter + gamesToShow);
    }
  }, [
    !!thirdPlaceGame, 
    !!fifthPlaceGame, 
    !!seventhPlaceGame, 
    !!ninthPlaceGame,
    matchupCounter, 
    onMatchupCounterUpdate
  ]);
  
  if (showOnlyFifthPlace) {
    return (
      fifthPlaceGame && (
        <BracketSection
          title={fifthPlaceTitle}
          matchups={[createPlacementMatchup(fifthPlaceGame, 0, true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          titleClassName="font-medium"
          showDivider={showDivider}
          dividerText={dividerText}
        />
      )
    );
  }
  
  return (
    <>
      {thirdPlaceGame && (
        <BracketSection
          title={thirdPlaceTitle}
          matchups={[createPlacementMatchup(thirdPlaceGame, 0) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
          titleClassName="font-medium"
          showDivider={showDivider}
          dividerText={dividerText}
        />
      )}
      
      {fifthPlaceGame && (
        <BracketSection
          title={fifthPlaceTitle}
          matchups={[createPlacementMatchup(fifthPlaceGame, thirdPlaceGame ? 1 : 0, true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
          titleClassName="font-medium"
          showDivider={showDivider}
          dividerText={dividerText}
        />
      )}
      
      {seventhPlaceGame && (
        <BracketSection
          title={seventhPlaceTitle}
          matchups={[createPlacementMatchup(seventhPlaceGame, thirdPlaceGame && fifthPlaceGame ? 2 : (thirdPlaceGame || fifthPlaceGame ? 1 : 0), true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
          titleClassName="font-medium"
          showDivider={showDivider}
          dividerText={dividerText}
        />
      )}
      
      {ninthPlaceGame && (
        <BracketSection
          title={ninthPlaceTitle}
          matchups={[createPlacementMatchup(ninthPlaceGame, (thirdPlaceGame ? 1 : 0) + (fifthPlaceGame ? 1 : 0) + (seventhPlaceGame ? 1 : 0), true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          titleClassName="font-medium"
          showDivider={showDivider}
          dividerText={dividerText}
        />
      )}
    </>
  );
};

export default PlacementGames;
