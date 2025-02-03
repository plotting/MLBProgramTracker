import React from "react";
import { Card } from "../ui/card";
import Matchup from "./Matchup";
import WeekLabels from "./WeekLabels";

const ModifiedPlayoffs = () => {
  return (
    <Card className="p-8">
      <h3 className="text-2xl font-bold mb-8">Playoff Bracket</h3>
      
      {/* Championship Bracket */}
      <div className="space-y-8 mb-16">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold text-primary">Championship Bracket</h4>
          <WeekLabels weeks={["Week 15", "Week 16"]} />
        </div>
        
        <div className="flex gap-24">
          <div className="flex flex-col gap-24">
            <div className="relative">
              <Matchup team1="#1 Seed" team2="#4 Seed" label="Semifinals" />
              <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-primary translate-x-full"></div>
            </div>
            <div className="relative">
              <Matchup team1="#2 Seed" team2="#3 Seed" label="Semifinals" />
              <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-primary translate-x-full"></div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-1/4 -left-24 w-24 h-[50%] border-r-2 border-t-2 border-b-2 border-primary"></div>
            <Matchup team1="Winner 1v4" team2="Winner 2v3" label="Championship" className="mt-[25%]" />
          </div>
        </div>
      </div>

      {/* Modified Consolation Bracket */}
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold text-secondary">Consolation Bracket</h4>
          <WeekLabels weeks={["Week 15", "Week 16"]} />
        </div>
        
        <div className="flex gap-24">
          <div className="flex flex-col gap-8">
            <div className="relative">
              <Matchup team1="#5 Seed" team2="#8 Seed" label="Round 1" />
              <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-secondary translate-x-full"></div>
            </div>
            <div className="relative">
              <Matchup team1="#6 Seed" team2="#7 Seed" label="Round 1" />
              <div className="absolute top-1/2 right-0 w-24 h-[2px] bg-secondary translate-x-full"></div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-[15%] -left-24 w-24 h-[25%] border-r-2 border-t-2 border-b-2 border-secondary"></div>
            <div className="space-y-8">
              <Matchup team1="Winner 5v8" team2="Winner 6v7" label="5th Place Game" className="mt-[10%]" />
              <Matchup team1="Loser 5v8" team2="#9 Seed" label="7th Place Semifinal" />
              <Matchup team1="Loser 6v7" team2="#10 Seed" label="7th Place Semifinal" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-[40%] -left-24 w-24 h-[25%] border-r-2 border-t-2 border-b-2 border-secondary"></div>
            <div className="space-y-8 mt-[60%]">
              <Matchup team1="Winner L5v8/9" team2="Winner L6v7/10" label="7th Place Game" />
              <Matchup team1="Loser L5v8/9" team2="Loser L6v7/10" label="9th Place Game" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ModifiedPlayoffs;