
import React from "react";
import { Card } from "../ui/card";
import Matchup from "./Matchup";
import WeekLabels from "./WeekLabels";

const FiveTeamPlayoffs = () => {
  return (
    <div className="space-y-16">
      {/* Championship Bracket */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold mb-8">Playoff Bracket</h3>
        
        <div className="space-y-8">
          <div className="flex justify-between items-center mb-4">
            <WeekLabels weeks={["Round 1 (Week 15)", "Round 2 (Week 16)", "Round 3 (Week 17)"]} />
          </div>
          
          <div className="flex gap-24">
            {/* Round 1 */}
            <div className="flex flex-col gap-16">
              <div className="relative">
                <Matchup 
                  team1="#1 Seed" 
                  team2="BYE" 
                  label="(1)" 
                  className="opacity-75" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-primary translate-x-full"></div>
              </div>

              <div className="relative">
                <Matchup 
                  team1="#4 Seed" 
                  team2="#5 Seed" 
                  label="(4)/(5)" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-primary translate-x-full"></div>
              </div>

              <div className="relative">
                <Matchup 
                  team1="#2 Seed" 
                  team2="BYE" 
                  label="(2)" 
                  className="opacity-75" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-primary translate-x-full"></div>
              </div>

              <div className="relative">
                <Matchup 
                  team1="#3 Seed" 
                  team2="BYE" 
                  label="(3)" 
                  className="opacity-75" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-primary translate-x-full"></div>
              </div>
            </div>

            {/* Round 2 */}
            <div className="flex flex-col gap-32 mt-16">
              <div className="relative">
                <div className="absolute top-1/4 -left-24 w-24 h-[25%] border-r-2 border-t-2 border-b-2 border-primary"></div>
                <Matchup 
                  team1="(1)" 
                  team2="Winner (4)/(5)" 
                  label="Semifinal" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-primary translate-x-full"></div>
              </div>

              <div className="relative">
                <div className="absolute top-1/4 -left-24 w-24 h-[25%] border-r-2 border-t-2 border-b-2 border-primary"></div>
                <Matchup 
                  team1="(2)" 
                  team2="(3)" 
                  label="Semifinal" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-primary translate-x-full"></div>
              </div>
            </div>

            {/* Round 3 */}
            <div className="flex flex-col gap-16">
              <div className="relative">
                <div className="absolute top-1/4 -left-24 w-24 h-[50%] border-r-2 border-t-2 border-b-2 border-primary"></div>
                <Matchup 
                  team1="TBD" 
                  team2="TBD" 
                  label="🏆 Championship" 
                />
              </div>

              <div className="relative mt-32">
                <div className="absolute top-1/4 -left-24 w-24 h-[50%] border-r-2 border-t-2 border-b-2 border-primary"></div>
                <Matchup 
                  team1="TBD" 
                  team2="TBD" 
                  label="🥉 3rd Place" 
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Consolation Bracket */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold mb-8">Consolation Bracket</h3>
        
        <div className="space-y-8">
          <div className="flex justify-between items-center mb-4">
            <WeekLabels weeks={["Round 1 (Week 15)", "Round 2 (Week 16)", "Round 3 (Week 17)"]} />
          </div>
          
          <div className="flex gap-24">
            {/* Round 1 */}
            <div className="flex flex-col gap-16">
              <div className="relative">
                <Matchup 
                  team1="#6 Seed" 
                  team2="BYE" 
                  label="(6)" 
                  className="opacity-75" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-secondary translate-x-full"></div>
              </div>

              <div className="relative">
                <Matchup 
                  team1="#9 Seed" 
                  team2="#10 Seed" 
                  label="Last Place Game" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-secondary translate-x-full"></div>
              </div>

              <div className="relative">
                <Matchup 
                  team1="#7 Seed" 
                  team2="BYE" 
                  label="(7)" 
                  className="opacity-75" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-secondary translate-x-full"></div>
              </div>

              <div className="relative">
                <Matchup 
                  team1="#8 Seed" 
                  team2="BYE" 
                  label="(8)" 
                  className="opacity-75" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-secondary translate-x-full"></div>
              </div>
            </div>

            {/* Round 2 */}
            <div className="flex flex-col gap-32 mt-16">
              <div className="relative">
                <div className="absolute top-1/4 -left-24 w-24 h-[25%] border-r-2 border-t-2 border-b-2 border-secondary"></div>
                <Matchup 
                  team1="(6)" 
                  team2="Winner (9)/(10)" 
                  label="6th Place Game" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-secondary translate-x-full"></div>
              </div>

              <div className="relative">
                <div className="absolute top-1/4 -left-24 w-24 h-[25%] border-r-2 border-t-2 border-b-2 border-secondary"></div>
                <Matchup 
                  team1="(7)" 
                  team2="(8)" 
                  label="7th Place Game" 
                />
                <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-secondary translate-x-full"></div>
              </div>
            </div>

            {/* Round 3 */}
            <div className="flex flex-col gap-16">
              <div className="relative">
                <div className="absolute top-1/4 -left-24 w-24 h-[50%] border-r-2 border-t-2 border-b-2 border-secondary"></div>
                <Matchup 
                  team1="TBD" 
                  team2="TBD" 
                  label="6th Place" 
                />
              </div>

              <div className="relative mt-32">
                <div className="absolute top-1/4 -left-24 w-24 h-[50%] border-r-2 border-t-2 border-b-2 border-secondary"></div>
                <Matchup 
                  team1="TBD" 
                  team2="TBD" 
                  label="8th Place" 
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FiveTeamPlayoffs;
