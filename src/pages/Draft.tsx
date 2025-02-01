import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";

const Draft = () => {
  const [selectedSeason, setSelectedSeason] = useState("1");

  const teams = Array.from({ length: 10 }, (_, i) => `Team ${i + 1}`);

  const generateStartupDraftGrid = () => {
    const rounds = Array.from({ length: 16 }, (_, i) => i + 1);
    const grid = rounds.map(round => {
      const picks = Array.from({ length: 10 }, (_, i) => {
        const pickNumber = round % 2 === 1 ? i + 1 : 10 - i;
        const teamIndex = round % 2 === 1 ? i : 9 - i;
        return {
          pick: `${round}.${pickNumber}`,
          team: teams[teamIndex],
          player: `Player ${round}-${pickNumber}`,
        };
      });
      return { round, picks };
    });
    return grid;
  };

  const generateRegularDraftGrid = () => {
    const picks = Array.from({ length: 20 }, (_, i) => ({
      pick: Math.floor(i / 10) + 1 + "." + ((i % 10) + 1),
      team: teams[i % 10],
      player: `Player ${i + 1}`,
    }));
    return picks;
  };

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Draft History</h1>
            <p className="text-muted-foreground">View draft picks across all seasons</p>
          </div>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {getAllSeasons().map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card className="p-6">
        {selectedSeason === "1" ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{getSeasonLabel("1")} Startup Draft</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Round</TableHead>
                    {teams.map((team, i) => (
                      <TableHead key={i}>
                        <Link to={`/team/${i + 1}`} className="text-primary hover:underline">
                          {team}
                        </Link>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generateStartupDraftGrid().map((round) => (
                    <TableRow key={round.round}>
                      <TableCell className="font-medium">{round.round}</TableCell>
                      {round.picks.map((pick, i) => (
                        <TableCell key={i} className="text-sm">
                          <div className="text-xs text-muted-foreground mb-1">
                            {pick.pick}
                          </div>
                          {pick.player}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              {getSeasonLabel(selectedSeason)} Draft
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pick</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Player</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generateRegularDraftGrid().map((pick, index) => (
                  <TableRow key={index}>
                    <TableCell>{pick.pick}</TableCell>
                    <TableCell>
                      <Link 
                        to={`/team/${teams.indexOf(pick.team) + 1}`} 
                        className="text-primary hover:underline"
                      >
                        {pick.team}
                      </Link>
                    </TableCell>
                    <TableCell>{pick.player}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Draft;