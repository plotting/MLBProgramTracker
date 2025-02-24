
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";

const WeeklyScores = () => {
  const [selectedSeason, setSelectedSeason] = useState("13");

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("id");
      if (error) throw error;
      return data;
    },
  });

  const { data: matchups, isLoading } = useQuery({
    queryKey: ["weekly-matchups", selectedSeason],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_matchups")
        .select("*")
        .eq("season_id", parseInt(selectedSeason))
        .order("week_number");
      if (error) throw error;
      return data;
    },
  });

  // Process matchups into team records
  const teamRecords = teams?.reduce((acc, team) => {
    acc[team.id] = Array.from({ length: 17 }, (_, weekIndex) => {
      const weekNumber = weekIndex + 1;
      let wins = 0;
      let losses = 0;

      // Find all matchups for this team up to this week
      const relevantMatchups = matchups?.filter(m => 
        (m.team1_id === team.id || m.team2_id === team.id) && 
        m.week_number <= weekNumber
      ) || [];

      relevantMatchups.forEach(matchup => {
        const isTeam1 = matchup.team1_id === team.id;
        const teamScore = isTeam1 ? matchup.team1_score : matchup.team2_score;
        const opponentScore = isTeam1 ? matchup.team2_score : matchup.team1_score;

        if (teamScore > opponentScore) wins++;
        else losses++;
      });

      return `${wins}-${losses}`;
    });
    return acc;
  }, {} as Record<number, string[]>) || {};

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Weekly Scores</h1>
            <p className="text-muted-foreground">Track team records week by week</p>
          </div>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {getAllSeasons().reverse().map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-card sticky left-0 z-10">Team</TableHead>
              {Array.from({ length: 17 }, (_, i) => (
                <TableHead key={i} className="text-center">
                  Week {i + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams?.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium sticky left-0 bg-background z-10">
                  <Link 
                    to={`/team/${team.id}?season=${selectedSeason}`} 
                    className="text-primary hover:underline"
                  >
                    {team.name}
                  </Link>
                </TableCell>
                {Array.from({ length: 17 }, (_, weekIndex) => (
                  <TableCell key={weekIndex} className="text-center">
                    {teamRecords[team.id]?.[weekIndex] || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WeeklyScores;
