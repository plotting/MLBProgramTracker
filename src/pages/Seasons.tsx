import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ChartBar, Trophy, Users } from "lucide-react";

// Mock data - replace with real data later
const standings = [
  { team: "Team 1", wins: 8, losses: 3, pointsFor: 1724.8, pointsAgainst: 1652.3, avgPoints: 156.8 },
  { team: "Team 2", wins: 7, losses: 4, pointsFor: 1698.2, pointsAgainst: 1588.9, avgPoints: 154.4 },
  // Add more teams...
];

const weeklyMatchups = {
  1: [
    { team1: "Team 1", score1: 142.6, team2: "Team 2", score2: 138.2 },
    { team1: "Team 3", score1: 156.8, team2: "Team 4", score2: 145.3 },
    // Add more matchups...
  ],
  // Add more weeks...
};

const Seasons = () => {
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [selectedSeason, setSelectedSeason] = useState("2023");

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Season {selectedSeason}</h1>
        <p className="text-muted-foreground">League Standings and Weekly Matchups</p>
      </header>

      <div className="flex gap-4 mb-8">
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023 Season</SelectItem>
            <SelectItem value="2022">2022 Season</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">League Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="pb-2">Team</th>
                <th className="pb-2">Record</th>
                <th className="pb-2">PF</th>
                <th className="pb-2">PA</th>
                <th className="pb-2">Avg</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-2">{team.team}</td>
                  <td className="py-2">{team.wins}-{team.losses}</td>
                  <td className="py-2">{team.pointsFor.toFixed(1)}</td>
                  <td className="py-2">{team.pointsAgainst.toFixed(1)}</td>
                  <td className="py-2">{team.avgPoints.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Weekly Matchups</h2>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Week" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 17 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Week {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {weeklyMatchups[1].map((matchup, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <p className="text-lg font-semibold">{matchup.team1}</p>
                  <p className="text-3xl font-bold text-primary">{matchup.score1}</p>
                </div>
                <div className="text-xl font-bold text-muted-foreground px-4">VS</div>
                <div className="text-center flex-1">
                  <p className="text-lg font-semibold">{matchup.team2}</p>
                  <p className="text-3xl font-bold text-secondary">{matchup.score2}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Seasons;