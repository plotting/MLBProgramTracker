
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MatchupScoresView, Team } from "@/types/database";

const HeadToHead = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>();

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('id');
      if (error) throw error;
      return data as Team[];
    },
  });

  const { data: matchups, isLoading: matchupsLoading } = useQuery({
    queryKey: ['matchups', selectedTeam],
    enabled: !!selectedTeam,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .or(`home_team_id.eq.${selectedTeam},away_team_id.eq.${selectedTeam}`)
        .order('season_id')
        .order('week_number');
      
      if (error) throw error;
      return data as MatchupScoresView[];
    },
  });

  const calculateStats = (matchupData: MatchupScoresView[], isPlayoff: boolean) => {
    if (!selectedTeam || !teams) return [];

    const selectedTeamId = parseInt(selectedTeam);
    const stats = new Map<number, {
      teamId: number,
      team: string,
      wins: number,
      losses: number,
      ties: number,
      pointsFor: number,
      pointsAgainst: number,
      gamesPlayed: number
    }>();

    // Initialize stats for all teams except selected team
    teams.forEach(team => {
      if (team.id !== selectedTeamId) {
        stats.set(team.id, {
          teamId: team.id,
          team: team.name,
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          gamesPlayed: 0
        });
      }
    });

    // Calculate stats from matchups
    matchupData.forEach(matchup => {
      // Skip if not matching playoff filter
      if (matchup.is_playoff !== isPlayoff) return;
      
      // Skip if scores aren't available
      if (matchup.home_score === null || matchup.away_score === null) return;

      let opponentId: number;
      let selectedTeamScore: number;
      let opponentScore: number;

      if (matchup.home_team_id === selectedTeamId) {
        opponentId = matchup.away_team_id;
        selectedTeamScore = matchup.home_score;
        opponentScore = matchup.away_score;
      } else {
        opponentId = matchup.home_team_id;
        selectedTeamScore = matchup.away_score;
        opponentScore = matchup.home_score;
      }

      const currentStats = stats.get(opponentId);
      if (!currentStats) return;

      if (selectedTeamScore > opponentScore) {
        currentStats.wins += 1;
      } else if (selectedTeamScore < opponentScore) {
        currentStats.losses += 1;
      } else {
        currentStats.ties += 1;
      }

      currentStats.pointsFor += selectedTeamScore;
      currentStats.pointsAgainst += opponentScore;
      currentStats.gamesPlayed += 1;
    });

    return Array.from(stats.values()).filter(stat => stat.gamesPlayed > 0);
  };

  const regularSeasonStats = matchups ? calculateStats(matchups, false) : [];
  const playoffStats = matchups ? calculateStats(matchups, true) : [];
  
  // Combine regular season and playoff stats
  const combinedStats = regularSeasonStats.map(regularStat => {
    const playoffStat = playoffStats.find(p => p.teamId === regularStat.teamId);
    if (!playoffStat) return regularStat;

    return {
      ...regularStat,
      wins: regularStat.wins + playoffStat.wins,
      losses: regularStat.losses + playoffStat.losses,
      ties: regularStat.ties + playoffStat.ties,
      pointsFor: regularStat.pointsFor + playoffStat.pointsFor,
      pointsAgainst: regularStat.pointsAgainst + playoffStat.pointsAgainst,
      gamesPlayed: regularStat.gamesPlayed + playoffStat.gamesPlayed
    };
  });

  // Fixed win percentage calculation to properly account for ties
  const calculateWinPercentage = (record: { wins: number, losses: number, ties: number }) => {
    const totalGames = record.wins + record.losses + record.ties;
    if (totalGames === 0) return 0;
    // Correct formula: (wins + ties*0.5) / totalGames
    return ((record.wins + record.ties * 0.5) / totalGames) * 100;
  };

  if (teamsLoading || (selectedTeam && matchupsLoading)) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-muted-foreground">Loading head to head records...</div>
    </div>;
  }

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Head to Head Records</h1>
            <p className="text-muted-foreground">View historical matchup records between teams</p>
          </div>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {selectedTeam ? (
        <Tabs defaultValue="regular" className="space-y-4">
          <TabsList>
            <TabsTrigger value="regular">Regular Season</TabsTrigger>
            <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
            <TabsTrigger value="combined">Combined</TabsTrigger>
          </TabsList>

          <TabsContent value="regular">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Regular Season Records</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Win %</TableHead>
                    <TableHead>Points For</TableHead>
                    <TableHead>Points Against</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regularSeasonStats.map((record) => (
                    <TableRow key={record.teamId}>
                      <TableCell>
                        <Link to={`/team/${record.teamId}`} className="text-primary hover:underline">
                          {record.team}
                        </Link>
                      </TableCell>
                      <TableCell>{`${record.wins}-${record.losses}-${record.ties}`}</TableCell>
                      <TableCell>
                        {calculateWinPercentage(record).toFixed(1)}%
                      </TableCell>
                      <TableCell>{(record.pointsFor / record.gamesPlayed).toFixed(1)}</TableCell>
                      <TableCell>{(record.pointsAgainst / record.gamesPlayed).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="playoffs">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Playoff Records</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Win %</TableHead>
                    <TableHead>Points For</TableHead>
                    <TableHead>Points Against</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playoffStats.map((record) => (
                    <TableRow key={record.teamId}>
                      <TableCell>
                        <Link to={`/team/${record.teamId}`} className="text-primary hover:underline">
                          {record.team}
                        </Link>
                      </TableCell>
                      <TableCell>{`${record.wins}-${record.losses}-${record.ties}`}</TableCell>
                      <TableCell>
                        {calculateWinPercentage(record).toFixed(1)}%
                      </TableCell>
                      <TableCell>{(record.pointsFor / record.gamesPlayed).toFixed(1)}</TableCell>
                      <TableCell>{(record.pointsAgainst / record.gamesPlayed).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="combined">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Combined Records</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Win %</TableHead>
                    <TableHead>Points For</TableHead>
                    <TableHead>Points Against</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedStats.map((record) => (
                    <TableRow key={record.teamId}>
                      <TableCell>
                        <Link to={`/team/${record.teamId}`} className="text-primary hover:underline">
                          {record.team}
                        </Link>
                      </TableCell>
                      <TableCell>{`${record.wins}-${record.losses}-${record.ties}`}</TableCell>
                      <TableCell>
                        {calculateWinPercentage(record).toFixed(1)}%
                      </TableCell>
                      <TableCell>{(record.pointsFor / record.gamesPlayed).toFixed(1)}</TableCell>
                      <TableCell>{(record.pointsAgainst / record.gamesPlayed).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            Select a team to view their head-to-head records
          </div>
        </Card>
      )}
    </div>
  );
};

export default HeadToHead;
