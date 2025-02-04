import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";
import PlayoffBracket from "@/components/PlayoffBracket";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

const Seasons = () => {
  const [selectedSeason, setSelectedSeason] = useState("13"); // Default to latest season

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Team[];
    },
  });

  const { data: standings } = useQuery({
    queryKey: ['standings', selectedSeason],
    queryFn: async () => {
      const { data: matchups, error } = await supabase
        .from('weekly_matchups')
        .select(`
          *,
          team1:teams!weekly_matchups_team1_id_fkey(*),
          team2:teams!weekly_matchups_team2_id_fkey(*)
        `)
        .eq('season_id', selectedSeason)
        .eq('is_playoff', false);

      if (error) throw error;

      // Calculate standings from matchups
      const standingsMap = new Map();
      
      matchups?.forEach((matchup) => {
        // Process team1
        if (!standingsMap.has(matchup.team1_id)) {
          standingsMap.set(matchup.team1_id, {
            id: matchup.team1_id,
            team: matchup.team1.name,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
          });
        }
        
        // Process team2
        if (!standingsMap.has(matchup.team2_id)) {
          standingsMap.set(matchup.team2_id, {
            id: matchup.team2_id,
            team: matchup.team2.name,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
          });
        }

        const team1Stats = standingsMap.get(matchup.team1_id);
        const team2Stats = standingsMap.get(matchup.team2_id);

        // Update wins/losses
        if (matchup.team1_score > matchup.team2_score) {
          team1Stats.wins++;
          team2Stats.losses++;
        } else {
          team1Stats.losses++;
          team2Stats.wins++;
        }

        // Update points
        team1Stats.pointsFor += Number(matchup.team1_score);
        team1Stats.pointsAgainst += Number(matchup.team2_score);
        team2Stats.pointsFor += Number(matchup.team2_score);
        team2Stats.pointsAgainst += Number(matchup.team1_score);
      });

      // Convert to array and calculate averages
      return Array.from(standingsMap.values())
        .map(team => ({
          ...team,
          record: `${team.wins}-${team.losses}`,
          avgPoints: team.pointsFor / (team.wins + team.losses),
        }))
        .sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen space-y-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {getSeasonLabel(selectedSeason)}
            </h1>
            <p className="text-muted-foreground">League Standings and Weekly Matchups</p>
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

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">League Standings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Points For</TableHead>
                <TableHead>Points Against</TableHead>
                <TableHead>Avg Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings?.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    <Link 
                      to={`/team/${team.id}?season=${selectedSeason}`} 
                      className="text-primary hover:underline"
                    >
                      {team.team}
                    </Link>
                  </TableCell>
                  <TableCell>{team.record}</TableCell>
                  <TableCell>{team.pointsFor.toFixed(1)}</TableCell>
                  <TableCell>{team.pointsAgainst.toFixed(1)}</TableCell>
                  <TableCell>{team.avgPoints.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <PlayoffBracket season={selectedSeason} />

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Weekly Matchups</h2>
        <WeeklyMatchup />
      </div>
    </div>
  );
};

export default Seasons;