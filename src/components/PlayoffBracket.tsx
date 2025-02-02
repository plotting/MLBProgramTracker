import React from "react";
import { Card } from "./ui/card";

interface MatchupProps {
  team1: string;
  team2: string;
  score1?: string;
  score2?: string;
  className?: string;
}

const Matchup = ({ team1, team2, score1, score2, className = "" }: MatchupProps) => (
  <div className={`flex flex-col gap-1 w-[200px] ${className}`}>
    <div className="flex justify-between items-center bg-card p-3 rounded-t-lg border-b border-border">
      <span className="font-medium">{team1}</span>
      {score1 && <span className="text-primary">{score1}</span>}
    </div>
    <div className="flex justify-between items-center bg-card p-3 rounded-b-lg">
      <span className="font-medium">{team2}</span>
      {score2 && <span className="text-primary">{score2}</span>}
    </div>
  </div>
);

const PlayoffBracket = ({ season }: { season: string }) => {
  // Only show for seasons 1-7
  if (Number(season) > 7) return null;

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold mb-6">Playoff Bracket</h3>
      
      {/* Championship Bracket */}
      <div className="space-y-8 mb-16">
        <h4 className="text-xl font-semibold text-primary">Championship Bracket</h4>
        
        <div className="flex gap-16">
          {/* Round 1 */}
          <div className="flex flex-col gap-16">
            <div className="relative">
              <Matchup 
                team1="#1 Seed" 
                team2="#4 Seed"
              />
              <div className="absolute top-1/2 right-0 w-16 h-[2px] bg-primary translate-x-full"></div>
            </div>
            <div className="relative">
              <Matchup 
                team1="#2 Seed" 
                team2="#3 Seed"
              />
              <div className="absolute top-1/2 right-0 w-16 h-[2px] bg-primary translate-x-full"></div>
            </div>
          </div>

          {/* Championship Game */}
          <div className="relative">
            <div className="absolute top-1/4 -left-16 w-16 h-[50%] border-r-2 border-t-2 border-b-2 border-primary"></div>
            <Matchup 
              team1="Winner 1v4" 
              team2="Winner 2v3"
              className="mt-[25%]"
            />
          </div>
        </div>
      </div>

      {/* Consolation Bracket */}
      <div className="space-y-8">
        <h4 className="text-xl font-semibold text-secondary">Consolation Bracket</h4>
        
        <div className="flex gap-16">
          {/* Round 1 */}
          <div className="flex flex-col gap-8">
            <div className="relative">
              <Matchup 
                team1="#5 Seed" 
                team2="#6 Seed"
              />
              <div className="absolute top-1/2 right-0 w-16 h-[2px] bg-secondary translate-x-full"></div>
            </div>
            <div className="relative">
              <Matchup 
                team1="#7 Seed" 
                team2="#8 Seed"
              />
              <div className="absolute top-1/2 right-0 w-16 h-[2px] bg-secondary translate-x-full"></div>
            </div>
            <div className="relative">
              <Matchup 
                team1="#9 Seed" 
                team2="#10 Seed"
              />
              <div className="absolute top-1/2 right-0 w-16 h-[2px] bg-secondary translate-x-full"></div>
            </div>
          </div>

          {/* Final Placement Games */}
          <div className="relative">
            <div className="absolute top-[15%] -left-16 w-16 h-[25%] border-r-2 border-t-2 border-b-2 border-secondary"></div>
            <div className="space-y-8">
              <Matchup 
                team1="Winner 5v6" 
                team2="Winner 7v8"
                className="mt-[10%]"
              />
              <Matchup 
                team1="Winner 9v10" 
                team2="Loser 5v6"
              />
              <Matchup 
                team1="Loser 9v10" 
                team2="Loser 7v8"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayoffBracket;