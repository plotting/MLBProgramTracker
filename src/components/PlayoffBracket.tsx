import React from "react";
import { Card } from "./ui/card";

interface MatchupProps {
  team1: string;
  team2: string;
  round: number;
  matchupType: string;
}

const PlayoffBracket = ({ season }: { season: string }) => {
  // Only show for seasons 1-7
  if (Number(season) > 7) return null;

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold mb-6">Playoff Bracket</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Championship Bracket */}
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-primary">Championship Bracket</h4>
          
          {/* Round 1 */}
          <div className="space-y-4">
            <h5 className="text-lg font-medium">Round 1</h5>
            <div className="space-y-2">
              <div className="bg-card p-3 rounded-lg">
                #1 vs #4
              </div>
              <div className="bg-card p-3 rounded-lg">
                #2 vs #3
              </div>
            </div>
          </div>
          
          {/* Round 2 */}
          <div className="space-y-4">
            <h5 className="text-lg font-medium">Championship</h5>
            <div className="bg-card p-3 rounded-lg">
              Winners play for 1st/2nd
            </div>
            <div className="bg-card p-3 rounded-lg">
              Losers play for 3rd/4th
            </div>
          </div>
        </div>

        {/* Consolation Bracket */}
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-secondary">Consolation Bracket</h4>
          
          {/* Round 1 */}
          <div className="space-y-4">
            <h5 className="text-lg font-medium">Round 1</h5>
            <div className="space-y-2">
              <div className="bg-card p-3 rounded-lg">
                #5 vs #6
              </div>
              <div className="bg-card p-3 rounded-lg">
                #7 vs #8
              </div>
              <div className="bg-card p-3 rounded-lg">
                #9 vs #10
              </div>
            </div>
          </div>
          
          {/* Round 2 */}
          <div className="space-y-4">
            <h5 className="text-lg font-medium">Final Placements</h5>
            <div className="space-y-2">
              <div className="bg-card p-3 rounded-lg">
                Winners of 5v6 play for 5th/6th
              </div>
              <div className="bg-card p-3 rounded-lg">
                Winner of 9v10 vs Loser of 5v6 for 7th/8th
              </div>
              <div className="bg-card p-3 rounded-lg">
                Loser of 9v10 vs Loser of 7v8 for 9th/10th
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayoffBracket;