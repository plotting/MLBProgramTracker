import React from "react";
import { Card } from "./ui/card";

interface MatchupProps {
  team1: string;
  team2: string;
  score1?: string;
  score2?: string;
}

const Matchup = ({ team1, team2, score1, score2 }: MatchupProps) => (
  <div className="flex flex-col gap-1">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Championship Bracket */}
        <div className="space-y-8">
          <h4 className="text-xl font-semibold text-primary">Championship Bracket</h4>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Round 1 */}
            <div className="space-y-4">
              <h5 className="text-lg font-medium">Round 1</h5>
              <div className="space-y-6">
                <Matchup team1="#1 Seed" team2="#4 Seed" />
                <Matchup team1="#2 Seed" team2="#3 Seed" />
              </div>
            </div>
            
            {/* Championship */}
            <div className="space-y-4">
              <h5 className="text-lg font-medium">Championship</h5>
              <div className="space-y-6">
                <div className="border-l-2 border-primary pl-4">
                  <Matchup 
                    team1="Winner 1v4" 
                    team2="Winner 2v3"
                  />
                </div>
                <div className="border-l-2 border-secondary pl-4">
                  <Matchup 
                    team1="Loser 1v4" 
                    team2="Loser 2v3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consolation Bracket */}
        <div className="space-y-8">
          <h4 className="text-xl font-semibold text-secondary">Consolation Bracket</h4>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Round 1 */}
            <div className="space-y-4">
              <h5 className="text-lg font-medium">Round 1</h5>
              <div className="space-y-6">
                <Matchup team1="#5 Seed" team2="#6 Seed" />
                <Matchup team1="#7 Seed" team2="#8 Seed" />
                <Matchup team1="#9 Seed" team2="#10 Seed" />
              </div>
            </div>
            
            {/* Final Placements */}
            <div className="space-y-4">
              <h5 className="text-lg font-medium">Final Placements</h5>
              <div className="space-y-6">
                <div className="border-l-2 border-primary pl-4">
                  <Matchup 
                    team1="Winner 5v6" 
                    team2="Winner 7v8"
                  />
                </div>
                <div className="border-l-2 border-secondary pl-4">
                  <Matchup 
                    team1="Winner 9v10" 
                    team2="Loser 5v6"
                  />
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <Matchup 
                    team1="Loser 9v10" 
                    team2="Loser 7v8"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayoffBracket;