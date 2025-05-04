
import React, { useEffect } from "react";
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
  title?: string;
  subtitle?: string;
  showDivider?: boolean;
  dividerText?: string;
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
  title = "Consolation Bracket",
  subtitle = "Winners advance to 5th place game",
  showDivider = false,
  dividerText = ""
}) => {
  // Create matchup objects for BracketSection
  const consolationMatchups = weekFifteenConsolation.map((matchup, index) => {
    const id = matchupCounter + index;
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

  // Update the counter in the parent component only when weekFifteenConsolation changes
  useEffect(() => {
    if (weekFifteenConsolation.length > 0) {
      onMatchupCounterUpdate(matchupCounter + weekFifteenConsolation.length);
    }
  }, [weekFifteenConsolation.length, matchupCounter, onMatchupCounterUpdate]);

  return (
    <BracketSection
      title={title}
      subtitle={subtitle}
      matchups={consolationMatchups}
      editMode={editMode}
      onTeamSelect={onTeamSelect}
      onScoreUpdate={onScoreUpdate}
      teams={teams}
      showDivider={showDivider}
      dividerText={dividerText}
    />
  );
};

export default ConsolationBracket;
