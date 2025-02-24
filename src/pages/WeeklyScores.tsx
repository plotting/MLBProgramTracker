
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
import { getAllSeasons } from "@/utils/seasonUtils";

const WeeklyScores = () => {
  const [selectedSeason, setSelectedSeason] = useState("13");

  const weekCount = parseInt(selectedSeason) <= 10 ? 16 : 17;
  const regularSeasonWeeks = 14;

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

  const { data: matchups } = useQuery({
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

  const { data: schedules } = useQuery({
    queryKey: ["schedules", selectedSeason],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          *,
          home_team:teams!schedules_home_team_id_fkey(id, name),
          away_team:teams!schedules_away_team_id_fkey(id, name)
        `)
        .eq("season_id", parseInt(selectedSeason))
        .order("week_number");
      if (error) throw error;
      return data;
    },
  });

  // Process matchups into team records and scores
  const teamData = teams?.reduce((acc, team) => {
    acc[team.id] = {
      records: Array.from({ length: weekCount }, (_, weekIndex) => {
        const weekNumber = weekIndex + 1;
        let wins = 0;
        let losses = 0;

        // Find all matchups for this team up to this week
        const relevantMatchups = matchups?.filter(m => 
          (m.team1_id === team.id || m.team2_id === team.id) && 
          m.week_number <= weekNumber &&
          m.week_number <= regularSeasonWeeks // Only count regular season games for record
        ) || [];

        relevantMatchups.forEach(matchup => {
          const isTeam1 = matchup.team1_id === team.id;
          const teamScore = isTeam1 ? matchup.team1_score : matchup.team2_score;
          const opponentScore = isTeam1 ? matchup.team2_score : matchup.team1_score;

          if (teamScore > opponentScore) wins++;
          else losses++;
        });

        return `${wins}-${losses}`;
      }),
      scores: Array.from({ length: weekCount }, (_, weekIndex) => {
        const weekNumber = weekIndex + 1;
        const matchup = matchups?.find(m => 
          (m.team1_id === team.id || m.team2_id === team.id) && 
          m.week_number === weekNumber
        );

        if (!matchup) return "-";
        return matchup.team1_id === team.id ? 
          matchup.team1_score.toFixed(2) : 
          matchup.team2_score.toFixed(2);
      }),
    };
    return acc;
  }, {} as Record<number, { records: string[], scores: string[] }>) || {};

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Weekly Scores</h1>
            <p className="text-muted-foreground">Track team records and scores week by week</p>
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

      <div className="space-y-8">
        <Card className="overflow-x-auto">
          <h2 className="text-lg font-semibold p-4 border-b">Weekly Scores</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-card sticky left-0 z-10">Team</TableHead>
                {Array.from({ length: weekCount }, (_, i) => (
                  <TableHead key={i} className="text-center">
                    Week {i + 1}
                    {i >= regularSeasonWeeks && <span className="text-xs ml-1">(Playoffs)</span>}
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
                  {Array.from({ length: weekCount }, (_, weekIndex) => (
                    <TableCell key={weekIndex} className="text-center">
                      {teamData[team.id]?.scores[weekIndex] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-x-auto">
          <h2 className="text-lg font-semibold p-4 border-b">Season Records (Regular Season Only)</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-card sticky left-0 z-10">Team</TableHead>
                {Array.from({ length: regularSeasonWeeks }, (_, i) => (
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
                  {Array.from({ length: regularSeasonWeeks }, (_, weekIndex) => (
                    <TableCell key={weekIndex} className="text-center">
                      {teamData[team.id]?.records[weekIndex] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-x-auto">
          <h2 className="text-lg font-semibold p-4 border-b">Schedule</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Home Team</TableHead>
                <TableHead>Away Team</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules?.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>Week {schedule.week_number}</TableCell>
                  <TableCell>
                    <Link 
                      to={`/team/${schedule.home_team?.id}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {schedule.home_team?.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link 
                      to={`/team/${schedule.away_team?.id}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {schedule.away_team?.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {schedule.scheduled_time ? 
                      new Date(schedule.scheduled_time).toLocaleDateString() : 
                      'TBD'
                    }
                  </TableCell>
                  <TableCell>
                    {schedule.week_number > regularSeasonWeeks ? 'Playoff' : 'Regular Season'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyScores;
