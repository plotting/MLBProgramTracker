
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

  // Calculate indices for matchups beforehand to avoid recalculation during render
  const indices = React.useMemo(() => {
    const result = { third: 0, fifth: 0, seventh: 0, ninth: 0 };
    let counter = 0;
    
    if (thirdPlaceGame) {
      result.third = counter++;
    }
    if (fifthPlaceGame) {
      result.fifth = counter++;
    }
    if (seventhPlaceGame) {
      result.seventh = counter++;
    }
    if (ninthPlaceGame) {
      result.ninth = counter++;
    }
    
    return result;
  }, [!!thirdPlaceGame, !!fifthPlaceGame, !!seventhPlaceGame, !!ninthPlaceGame]);

  // Update the counter in the parent component without causing re-renders
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
          matchups={[createPlacementMatchup(fifthPlaceGame, indices.fifth, true) as any]}
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
          matchups={[createPlacementMatchup(thirdPlaceGame, indices.third) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
          titleClassName="font-medium"
          showDivider={showDivider && indices.third === 0}
          dividerText={showDivider && indices.third === 0 ? dividerText : ""}
        />
      )}
      
      {fifthPlaceGame && (
        <BracketSection
          title={fifthPlaceTitle}
          matchups={[createPlacementMatchup(fifthPlaceGame, indices.fifth, true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
          titleClassName="font-medium"
          showDivider={showDivider && !thirdPlaceGame && indices.fifth === 0}
          dividerText={showDivider && !thirdPlaceGame && indices.fifth === 0 ? dividerText : ""}
        />
      )}
      
      {seventhPlaceGame && (
        <BracketSection
          title={seventhPlaceTitle}
          matchups={[createPlacementMatchup(seventhPlaceGame, indices.seventh, true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          className="mb-12"
          titleClassName="font-medium"
          showDivider={showDivider && !thirdPlaceGame && !fifthPlaceGame && indices.seventh === 0}
          dividerText={showDivider && !thirdPlaceGame && !fifthPlaceGame && indices.seventh === 0 ? dividerText : ""}
        />
      )}
      
      {ninthPlaceGame && (
        <BracketSection
          title={ninthPlaceTitle}
          matchups={[createPlacementMatchup(ninthPlaceGame, indices.ninth, true) as any]}
          editMode={editMode}
          onTeamSelect={onTeamSelect}
          onScoreUpdate={onScoreUpdate}
          teams={teams}
          titleClassName="font-medium"
          showDivider={showDivider && !thirdPlaceGame && !fifthPlaceGame && !seventhPlaceGame && indices.ninth === 0}
          dividerText={showDivider && !thirdPlaceGame && !fifthPlaceGame && !seventhPlaceGame && indices.ninth === 0 ? dividerText : ""}
        />
      )}
    </>
  );
};

export default PlacementGames;
