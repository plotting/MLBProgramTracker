
import React from "react";
import Matchup from "./Matchup";
import type { Team } from "@/types/database";

interface BracketSectionProps {
  title: string;
  matchups: Array<{
    matchupId: number;
    homeTeam?: string;
    homeTeamId?: number;
    homeScore?: number | null;
    awayTeam?: string;
    awayTeamId?: number;
    awayScore?: number | null;
    isConsolation?: boolean;
  }>;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
}

const BracketSection: React.FC<BracketSectionProps> = ({
  title,
  matchups,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = []
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-6 text-center">{title}</h3>
      <div className="space-y-12">
        {matchups.map((matchup, index) => (
          <div key={`${title.toLowerCase()}-${index}`} className="mx-auto w-[240px]">
            <Matchup
              matchupId={matchup.matchupId}
              homeTeam={matchup.homeTeam}
              homeTeamId={matchup.homeTeamId}
              homeScore={matchup.homeScore}
              awayTeam={matchup.awayTeam}
              awayTeamId={matchup.awayTeamId}
              awayScore={matchup.awayScore}
              isConsolation={matchup.isConsolation}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BracketSection;
