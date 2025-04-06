
import React from "react";
import Matchup from "./Matchup";
import type { Team } from "@/types/database";

interface BracketSectionProps {
  title: string;
  matchups: Array<{
    matchupId: number;
    homeTeam?: string;
    homeTeamId?: number;
    homeSeed?: number;
    homeScore?: number | null;
    awayTeam?: string;
    awayTeamId?: number;
    awaySeed?: number;
    awayScore?: number | null;
    isConsolation?: boolean;
  }>;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
  subtitle?: string;
  className?: string;
}

const BracketSection: React.FC<BracketSectionProps> = ({
  title,
  subtitle,
  matchups,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
  className = ""
}) => {
  // Sort matchups by seed when possible, placing matches with higher seeds on top
  const sortedMatchups = [...matchups].sort((a, b) => {
    // Get minimum seed from each matchup (higher-seeded team)
    const aMinSeed = Math.min(
      a.homeSeed !== undefined ? a.homeSeed : 999, 
      a.awaySeed !== undefined ? a.awaySeed : 999
    );
    const bMinSeed = Math.min(
      b.homeSeed !== undefined ? b.homeSeed : 999, 
      b.awaySeed !== undefined ? b.awaySeed : 999
    );
    return aMinSeed - bMinSeed; // Lower seed number (higher seed) comes first
  });

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      {subtitle && (
        <h4 className="text-sm text-muted-foreground mb-4 text-center">{subtitle}</h4>
      )}
      <div className="space-y-12">
        {sortedMatchups.map((matchup, index) => (
          <div key={`${title.toLowerCase()}-${index}`} className="mx-auto w-[240px]">
            <Matchup
              matchupId={matchup.matchupId}
              homeTeam={matchup.homeSeed ? `(${matchup.homeSeed}) ${matchup.homeTeam}` : matchup.homeTeam}
              homeTeamId={matchup.homeTeamId}
              homeScore={matchup.homeScore}
              awayTeam={matchup.awaySeed ? `(${matchup.awaySeed}) ${matchup.awayTeam}` : matchup.awayTeam}
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
