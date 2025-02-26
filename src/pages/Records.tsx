
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MatchupScoresView, Score } from "@/types/database";

const Records = () => {
  const { data: matchups, isLoading: matchupsLoading } = useQuery({
    queryKey: ['matchups-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .order('season_id')
        .order('week_number');
      if (error) throw error;
      return data as MatchupScoresView[];
    },
  });

  const { data: scores } = useQuery({
    queryKey: ['scores-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false });
      if (error) throw error;
      return data as Score[];
    },
  });

  // Calculate hypothetical records against all teams
  const calculateHypotheticalRecords = () => {
    if (!matchups) return { best: null, worst: null };

    const seasonWeekRecords = new Map<string, { wins: number, total: number }>();

    matchups.forEach(matchup => {
      if (!matchup.home_score || !matchup.away_score) return;
      
      const weekScores = matchups.filter(m => 
        m.season_id === matchup.season_id && 
        m.week_number === matchup.week_number &&
        m.home_score !== null &&
        m.away_score !== null
      );

      // Calculate for home team
      const homeKey = `${matchup.season_id}-${matchup.home_team_name}`;
      const homeWins = weekScores.filter(m => 
        matchup.home_score > (m.home_score || 0) && 
        matchup.home_score > (m.away_score || 0)
      ).length;

      if (!seasonWeekRecords.has(homeKey)) {
        seasonWeekRecords.set(homeKey, { wins: 0, total: 0 });
      }
      const homeRecord = seasonWeekRecords.get(homeKey)!;
      homeRecord.wins += homeWins;
      homeRecord.total += (weekScores.length * 2) - 2; // Subtract 2 to exclude self-comparison

      // Calculate for away team
      const awayKey = `${matchup.season_id}-${matchup.away_team_name}`;
      const awayWins = weekScores.filter(m => 
        matchup.away_score > (m.home_score || 0) && 
        matchup.away_score > (m.away_score || 0)
      ).length;

      if (!seasonWeekRecords.has(awayKey)) {
        seasonWeekRecords.set(awayKey, { wins: 0, total: 0 });
      }
      const awayRecord = seasonWeekRecords.get(awayKey)!;
      awayRecord.wins += awayWins;
      awayRecord.total += (weekScores.length * 2) - 2;
    });

    // Convert to array and sort
    const records = Array.from(seasonWeekRecords.entries())
      .map(([key, record]) => ({
        season: key.split('-')[0],
        team: key.split('-')[1],
        percentage: (record.wins / record.total) * 100,
        record: `${record.wins}-${record.total - record.wins}`
      }));

    const best = records.sort((a, b) => b.percentage - a.percentage)[0];
    const worst = records.sort((a, b) => a.percentage - b.percentage)[0];

    return { best, worst };
  };

  // Calculate largest margin of victory and highest combined score
  const calculateScoreRecords = () => {
    if (!matchups) return { largestMargin: null, highestCombined: null };

    const margins = matchups
      .filter(m => m.home_score !== null && m.away_score !== null)
      .map(m => ({
        margin: Math.abs(m.home_score - m.away_score),
        winner: m.home_score > m.away_score ? m.home_team_name : m.away_team_name,
        loser: m.home_score > m.away_score ? m.away_team_name : m.home_team_name,
        season: m.season_id,
        week: m.week_number,
        score: `${Math.max(m.home_score, m.away_score).toFixed(1)}-${Math.min(m.home_score, m.away_score).toFixed(1)}`
      }))
      .sort((a, b) => b.margin - a.margin);

    const combined = matchups
      .filter(m => m.home_score !== null && m.away_score !== null)
      .map(m => ({
        total: m.home_score + m.away_score,
        teams: `${m.home_team_name} vs ${m.away_team_name}`,
        season: m.season_id,
        week: m.week_number,
        score: `${m.home_score.toFixed(1)}-${m.away_score.toFixed(1)}`
      }))
      .sort((a, b) => b.total - a.total);

    return {
      largestMargin: margins[0],
      highestCombined: combined[0]
    };
  };

  const hypotheticalRecords = calculateHypotheticalRecords();
  const scoreRecords = calculateScoreRecords();

  if (matchupsLoading) {
    return <div>Loading records...</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">League Records</h1>
        <p className="text-muted-foreground">Historical achievements and statistics</p>
      </header>

      <Tabs defaultValue="scoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scoring">Scoring Records</TabsTrigger>
          <TabsTrigger value="career">Career Records</TabsTrigger>
          <TabsTrigger value="misc">Miscellaneous</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Highest Weekly Scores</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead>Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores?.slice(0, 5).map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                      <TableCell>{record.team_id}</TableCell>
                      <TableCell>{record.season_id}</TableCell>
                      <TableCell>{record.week_number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Largest Margin of Victory</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Winner</TableHead>
                    <TableHead>Loser</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Season/Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoreRecords.largestMargin && (
                    <TableRow>
                      <TableCell className="font-medium">{scoreRecords.largestMargin.winner}</TableCell>
                      <TableCell>{scoreRecords.largestMargin.loser}</TableCell>
                      <TableCell>{scoreRecords.largestMargin.score}</TableCell>
                      <TableCell>{`S${scoreRecords.largestMargin.season}/W${scoreRecords.largestMargin.week}`}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <h2 className="text-xl font-semibold mb-4 mt-6">Highest Combined Score</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teams</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Season/Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoreRecords.highestCombined && (
                    <TableRow>
                      <TableCell className="font-medium">{scoreRecords.highestCombined.teams}</TableCell>
                      <TableCell>{scoreRecords.highestCombined.score}</TableCell>
                      <TableCell>{scoreRecords.highestCombined.total.toFixed(1)}</TableCell>
                      <TableCell>{`S${scoreRecords.highestCombined.season}/W${scoreRecords.highestCombined.week}`}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="career">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Career Points</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Points</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Seasons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Add career points calculation here */}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="misc">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Best Season vs All</h2>
              {hypotheticalRecords.best && (
                <div className="space-y-2">
                  <p><span className="font-semibold">Team:</span> {hypotheticalRecords.best.team}</p>
                  <p><span className="font-semibold">Season:</span> {hypotheticalRecords.best.season}</p>
                  <p><span className="font-semibold">Record vs All:</span> {hypotheticalRecords.best.record}</p>
                  <p><span className="font-semibold">Win %:</span> {hypotheticalRecords.best.percentage.toFixed(1)}%</p>
                </div>
              )}

              <h2 className="text-xl font-semibold mb-4 mt-6">Worst Season vs All</h2>
              {hypotheticalRecords.worst && (
                <div className="space-y-2">
                  <p><span className="font-semibold">Team:</span> {hypotheticalRecords.worst.team}</p>
                  <p><span className="font-semibold">Season:</span> {hypotheticalRecords.worst.season}</p>
                  <p><span className="font-semibold">Record vs All:</span> {hypotheticalRecords.worst.record}</p>
                  <p><span className="font-semibold">Win %:</span> {hypotheticalRecords.worst.percentage.toFixed(1)}%</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Records;
