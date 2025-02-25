
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
import type { MatchupScoresView, TeamRecordsView } from "@/types/database";

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

  const { data: matchupScores } = useQuery({
    queryKey: ["matchup-scores", selectedSeason],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matchup_scores_view")
        .select("*")
        .eq("season_id", parseInt(selectedSeason))
        .order("week_number");
      if (error) throw error;
      return data as MatchupScoresView[];
    },
  });

  const { data: teamRecords } = useQuery({
    queryKey: ["team-records", selectedSeason],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_records_view")
        .select("*")
        .eq("season_id", parseInt(selectedSeason));
      if (error) throw error;
      return data as TeamRecordsView[];
    },
  });

  // Process matchup scores into team data structure
  const teamData = teams?.reduce((acc, team) => {
    acc[team.id] = {
      records: Array.from({ length: weekCount }, (_, weekIndex) => {
        const weekNumber = weekIndex + 1;
        const teamRecord = teamRecords?.find(r => r.team_id === team.id);
        
        if (!teamRecord) return "-";

        // Only show regular season record until week 14
        if (weekNumber <= regularSeasonWeeks) {
          const relevantMatchups = matchupScores?.filter(m => 
            (m.home_team_id === team.id || m.away_team_id === team.id) && 
            m.week_number <= weekNumber &&
            !m.is_playoff
          ) || [];

          const wins = relevantMatchups.filter(m => 
            (m.home_team_id === team.id && m.home_score > m.away_score) ||
            (m.away_team_id === team.id && m.away_score > m.home_score)
          ).length;

          const losses = relevantMatchups.filter(m => 
            (m.home_team_id === team.id && m.home_score < m.away_score) ||
            (m.away_team_id === team.id && m.away_score < m.home_score)
          ).length;

          return `${wins}-${losses}`;
        }

        // After week 14, include playoff record if it exists
        const totalWins = teamRecord.regular_season_wins + teamRecord.playoff_wins;
        const totalLosses = teamRecord.regular_season_losses + teamRecord.playoff_losses;
        return `${totalWins}-${totalLosses}`;
      }),
      scores: Array.from({ length: weekCount }, (_, weekIndex) => {
        const weekNumber = weekIndex + 1;
        const matchup = matchupScores?.find(m => 
          (m.home_team_id === team.id || m.away_team_id === team.id) && 
          m.week_number === weekNumber
        );

        if (!matchup) return "-";
        return matchup.home_team_id === team.id ? 
          matchup.home_score?.toFixed(2) || "-" : 
          matchup.away_score?.toFixed(2) || "-";
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
          <h2 className="text-lg font-semibold p-4 border-b">Season Records</h2>
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
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchupScores?.map((matchup) => (
                <TableRow key={`${matchup.week_number}-${matchup.home_team_id}-${matchup.away_team_id}`}>
                  <TableCell>Week {matchup.week_number}</TableCell>
                  <TableCell>
                    <Link 
                      to={`/team/${matchup.home_team_id}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {matchup.home_team_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link 
                      to={`/team/${matchup.away_team_id}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {matchup.away_team_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {matchup.home_score !== null && matchup.away_score !== null ? (
                      `${matchup.home_score.toFixed(2)} - ${matchup.away_score.toFixed(2)}`
                    ) : (
                      'TBD'
                    )}
                  </TableCell>
                  <TableCell>
                    {matchup.scheduled_time ? 
                      new Date(matchup.scheduled_time).toLocaleDateString() : 
                      'TBD'
                    }
                  </TableCell>
                  <TableCell>
                    {matchup.is_playoff ? 'Playoff' : 'Regular Season'}
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
