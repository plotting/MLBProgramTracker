
import React from "react";
import { MatchupScoresView, Team } from "@/types/database";
import Matchup from "./Matchup";

interface FinalPlacementGamesProps {
  thirdPlaceGame?: MatchupScoresView;
  seventhPlaceGame?: MatchupScoresView;
  ninthPlaceGame?: MatchupScoresView;
  teamSeeds: Map<number, number>;
  matchupCounter: number;
  onMatchupCounterUpdate: (value: number) => void;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  ninthPlaceTitle: string;
}

const FinalPlacementGames: React.FC<FinalPlacementGamesProps> = ({
  thirdPlaceGame,
  seventhPlaceGame,
  ninthPlaceGame,
  teamSeeds,
  matchupCounter,
  onMatchupCounterUpdate,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  ninthPlaceTitle
}) => {
  // Create a local variable to track matchup IDs
  let localMatchupCounter = matchupCounter;

  // Format team name with seed
  const formatTeamWithSeed = (teamId: number | null, teamName: string | null) => {
    if (!teamId || !teamName) return "";
    const seed = teamSeeds.get(teamId);
    return seed ? `(${seed}) ${teamName}` : teamName;
  };

  // Update parent counter when finished rendering
  React.useEffect(() => {
    onMatchupCounterUpdate(localMatchupCounter);
  }, [localMatchupCounter, onMatchupCounterUpdate]);

  return (
    <div className="space-y-12">
      <h3 className="text-lg font-semibold mb-6 text-center">Final Placement Games</h3>
      {thirdPlaceGame && (
        <div className="mx-auto w-[240px]">
          <div className="text-sm text-center font-medium mb-2">
            3rd Place Game
          </div>
          <Matchup
            matchupId={localMatchupCounter++}
            homeTeam={formatTeamWithSeed(thirdPlaceGame.home_team_id, thirdPlaceGame.home_team_name)}
            homeTeamId={thirdPlaceGame.home_team_id}
            homeScore={thirdPlaceGame.home_score}
            awayTeam={formatTeamWithSeed(thirdPlaceGame.away_team_id, thirdPlaceGame.away_team_name)}
            awayTeamId={thirdPlaceGame.away_team_id}
            awayScore={thirdPlaceGame.away_score}
            editMode={editMode}
            onTeamSelect={onTeamSelect}
            onScoreUpdate={onScoreUpdate}
            teams={teams}
          />
        </div>
      )}
      
      {seventhPlaceGame && (
        <div className="mx-auto w-[240px]">
          <div className="text-sm text-center font-medium mb-2">
            7th Place Game
          </div>
          <Matchup
            matchupId={localMatchupCounter++}
            homeTeam={formatTeamWithSeed(seventhPlaceGame.home_team_id, seventhPlaceGame.home_team_name)}
            homeTeamId={seventhPlaceGame.home_team_id}
            homeScore={seventhPlaceGame.home_score}
            awayTeam={formatTeamWithSeed(seventhPlaceGame.away_team_id, seventhPlaceGame.away_team_name)}
            awayTeamId={seventhPlaceGame.away_team_id}
            awayScore={seventhPlaceGame.away_score}
            isConsolation
            editMode={editMode}
            onTeamSelect={onTeamSelect}
            onScoreUpdate={onScoreUpdate}
            teams={teams}
          />
        </div>
      )}
      
      {ninthPlaceGame && (
        <div className="mx-auto w-[240px]">
          <div className="text-sm text-center font-medium mb-2">
            {ninthPlaceTitle}
          </div>
          <Matchup
            matchupId={localMatchupCounter++}
            homeTeam={formatTeamWithSeed(ninthPlaceGame.home_team_id, ninthPlaceGame.home_team_name)}
            homeTeamId={ninthPlaceGame.home_team_id}
            homeScore={ninthPlaceGame.home_score}
            awayTeam={formatTeamWithSeed(ninthPlaceGame.away_team_id, ninthPlaceGame.away_team_name)}
            awayTeamId={ninthPlaceGame.away_team_id}
            awayScore={ninthPlaceGame.away_score}
            isConsolation
            editMode={editMode}
            onTeamSelect={onTeamSelect}
            onScoreUpdate={onScoreUpdate}
            teams={teams}
          />
        </div>
      )}
    </div>
  );
};

export default FinalPlacementGames;
