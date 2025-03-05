
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Team } from "@/types/database";

interface MatchupProps {
  homeTeam?: string;
  homeTeamId?: number;
  homeScore?: number | null;
  awayTeam?: string;
  awayTeamId?: number;
  awayScore?: number | null;
  matchupId?: number;
  isConsolation?: boolean;
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
}

const Matchup: React.FC<MatchupProps> = ({
  homeTeam = "",
  homeTeamId,
  homeScore,
  awayTeam = "",
  awayTeamId,
  awayScore,
  matchupId = 0,
  isConsolation = false,
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [],
}) => {
  const [tempHomeScore, setTempHomeScore] = useState(homeScore?.toString() || "");
  const [tempAwayScore, setTempAwayScore] = useState(awayScore?.toString() || "");

  const handleHomeScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempHomeScore(e.target.value);
    const score = parseFloat(e.target.value);
    if (!isNaN(score) && onScoreUpdate) {
      onScoreUpdate(matchupId, true, score);
    }
  };

  const handleAwayScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempAwayScore(e.target.value);
    const score = parseFloat(e.target.value);
    if (!isNaN(score) && onScoreUpdate) {
      onScoreUpdate(matchupId, false, score);
    }
  };

  const handleHomeTeamSelect = (value: string) => {
    if (onTeamSelect) {
      onTeamSelect(matchupId, true, parseInt(value));
    }
  };

  const handleAwayTeamSelect = (value: string) => {
    if (onTeamSelect) {
      onTeamSelect(matchupId, false, parseInt(value));
    }
  };

  return (
    <div className={`border rounded-md p-2 mb-2 ${isConsolation ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" : "border-primary/20"}`}>
      <div className="flex justify-between items-center mb-1">
        {editMode ? (
          <div className="flex-1">
            <Select value={homeTeamId?.toString() || ""} onValueChange={handleHomeTeamSelect}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={`home-${team.id}`} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="font-medium">{homeTeam || "TBD"}</div>
        )}
        
        {editMode ? (
          <Input
            type="number"
            className="w-16 h-8 ml-2 text-sm"
            value={tempHomeScore}
            onChange={handleHomeScoreChange}
            placeholder="Score"
          />
        ) : (
          <div className="ml-2">{homeScore !== null ? homeScore.toFixed(2) : "-"}</div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        {editMode ? (
          <div className="flex-1">
            <Select value={awayTeamId?.toString() || ""} onValueChange={handleAwayTeamSelect}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={`away-${team.id}`} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="font-medium">{awayTeam || "TBD"}</div>
        )}
        
        {editMode ? (
          <Input
            type="number"
            className="w-16 h-8 ml-2 text-sm"
            value={tempAwayScore}
            onChange={handleAwayScoreChange}
            placeholder="Score"
          />
        ) : (
          <div className="ml-2">{awayScore !== null ? awayScore.toFixed(2) : "-"}</div>
        )}
      </div>
    </div>
  );
};

export default Matchup;
