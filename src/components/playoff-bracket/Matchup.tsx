import React from "react";

interface MatchupProps {
  team1: string;
  team2: string;
  score1?: string;
  score2?: string;
  label: string;
  className?: string;
}

const Matchup = ({ team1, team2, score1, score2, label, className = "" }: MatchupProps) => (
  <div className={`flex flex-col gap-2 w-[240px] ${className}`}>
    <div className="text-sm font-semibold text-primary mb-1">{label}</div>
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex justify-between items-center bg-card p-3 border-b border-border">
        <span className="font-medium">{team1}</span>
        {score1 && <span className="text-primary font-semibold">{score1}</span>}
      </div>
      <div className="flex justify-between items-center bg-card p-3">
        <span className="font-medium">{team2}</span>
        {score2 && <span className="text-primary font-semibold">{score2}</span>}
      </div>
    </div>
  </div>
);

export default Matchup;