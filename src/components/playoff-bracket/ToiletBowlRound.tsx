
import React from "react";
import { MatchupScoresView, Team } from "@/types/database";
import Matchup from "./Matchup";

interface ToiletBowlRoundProps {
  toiletRoundMatchups: MatchupScoresView[];
  teamSeeds: Map<number, number>;
  matchupCounter: number;
  onMatchupCounterUpdate: (value: number) => void;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  title: string;
}

const ToiletBowlRound: React.FC<ToiletBowlRoundProps> = ({
  toiletRoundMatchups,
  teamSeeds,
  matchupCounter,
  onMatchupCounterUpdate,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  title
}) => {
  // Create a local variable to track matchup IDs
  let localMatchupCounter = matchupCounter;

  // Update parent counter when finished rendering
  React.useEffect(() => {
    onMatchupCounterUpdate(localMatchupCounter);
  }, [localMatchupCounter, onMatchupCounterUpdate]);

  if (!toiletRoundMatchups || toiletRoundMatchups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {toiletRoundMatchups.map((matchup, index) => (
        <div key={`toilet-round-${index}`} className="mx-auto w-[240px]">
          <div className="text-sm text-center text-muted-foreground mb-2">
            {title}
          </div>
          <Matchup
            matchupId={localMatchupCounter++}
            homeTeam={
              matchup.home_team_id ? 
                teamSeeds.get(matchup.home_team_id) ? 
                  `(${teamSeeds.get(matchup.home_team_id)}) ${matchup.home_team_name}` : 
                  matchup.home_team_name : 
                ""
            }
            homeTeamId={matchup.home_team_id}
            homeScore={matchup.home_score}
            awayTeam={
              matchup.away_team_id ? 
                teamSeeds.get(matchup.away_team_id) ? 
                  `(${teamSeeds.get(matchup.away_team_id)}) ${matchup.away_team_name}` : 
                  matchup.away_team_name : 
                ""
            }
            awayTeamId={matchup.away_team_id}
            awayScore={matchup.away_score}
            isConsolation
            editMode={editMode}
            onTeamSelect={onTeamSelect}
            onScoreUpdate={onScoreUpdate}
            teams={teams}
          />
        </div>
      ))}
    </div>
  );
};

export default ToiletBowlRound;
