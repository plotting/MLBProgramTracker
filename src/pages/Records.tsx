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
import type { MatchupScoresView } from "@/types/database";

const Records = () => {
  // Fetch teams for mapping IDs to names
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

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

  // Calculate all scoring records
  const calculateScoringRecords = () => {
    if (!matchups) return {
      regularSeasonHigh: [],
      regularSeasonLow: [],
      playoffHigh: [],
      playoffLow: [],
      largestMargins: [],
      highestCombined: []
    };

    // Split games by type
    const regularGames = matchups.filter(m => !m.is_playoff && m.home_score !== null && m.away_score !== null);
    const playoffGames = matchups.filter(m => m.is_playoff && m.home_score !== null && m.away_score !== null);

    // Function to get all scores from games
    const getAllScores = (games: typeof matchups) => {
      const scores: Array<{
        score: number,
        team: string,
        season: number,
        week: number,
        opponent: string,
        gameScore: string
      }> = [];

      games.forEach(game => {
        scores.push({
          score: game.home_score!,
          team: game.home_team_name!,
          opponent: game.away_team_name!,
          season: game.season_id,
          week: game.week_number!,
          gameScore: `${game.home_score!.toFixed(1)}-${game.away_score!.toFixed(1)}`
        });
        scores.push({
          score: game.away_score!,
          team: game.away_team_name!,
          opponent: game.home_team_name!,
          season: game.season_id,
          week: game.week_number!,
          gameScore: `${game.away_score!.toFixed(1)}-${game.home_score!.toFixed(1)}`
        });
      });

      return scores;
    };

    // Calculate margins and combined scores
    const margins = matchups
      .filter(m => m.home_score !== null && m.away_score !== null)
      .map(m => ({
        margin: Math.abs(m.home_score - m.away_score),
        winner: m.home_score > m.away_score ? m.home_team_name : m.away_team_name,
        loser: m.home_score > m.away_score ? m.away_team_name : m.home_team_name,
        season: m.season_id,
        week: m.week_number,
        score: `${Math.max(m.home_score, m.away_score).toFixed(1)}-${Math.min(m.home_score, m.away_score).toFixed(1)}`,
        isPlayoff: m.is_playoff
      }))
      .sort((a, b) => b.margin - a.margin);

    const combined = matchups
      .filter(m => m.home_score !== null && m.away_score !== null)
      .map(m => ({
        total: m.home_score + m.away_score,
        teams: `${m.home_team_name} vs ${m.away_team_name}`,
        season: m.season_id,
        week: m.week_number,
        score: `${m.home_score.toFixed(1)}-${m.away_score.toFixed(1)}`,
        isPlayoff: m.is_playoff
      }))
      .sort((a, b) => b.total - a.total);

    // Get top/bottom scores
    const regularScores = getAllScores(regularGames);
    const playoffScores = getAllScores(playoffGames);

    return {
      regularSeasonHigh: regularScores.sort((a, b) => b.score - a.score).slice(0, 10),
      regularSeasonLow: regularScores.sort((a, b) => a.score - b.score).slice(0, 10),
      playoffHigh: playoffScores.sort((a, b) => b.score - a.score).slice(0, 10),
      playoffLow: playoffScores.sort((a, b) => a.score - b.score).slice(0, 10),
      largestMargins: margins.slice(0, 10),
      highestCombined: combined.slice(0, 10)
    };
  };

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

  const scoringRecords = calculateScoringRecords();
  const hypotheticalRecords = calculateHypotheticalRecords();

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
              <h2 className="text-xl font-semibold mb-4">Highest Regular Season Scores</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Season/Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoringRecords.regularSeasonHigh.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                      <TableCell>{record.team}</TableCell>
                      <TableCell>{record.opponent}</TableCell>
                      <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <h2 className="text-xl font-semibold mb-4 mt-6">Lowest Regular Season Scores</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Season/Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoringRecords.regularSeasonLow.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                      <TableCell>{record.team}</TableCell>
                      <TableCell>{record.opponent}</TableCell>
                      <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Highest Playoff Scores</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Season/Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoringRecords.playoffHigh.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                      <TableCell>{record.team}</TableCell>
                      <TableCell>{record.opponent}</TableCell>
                      <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <h2 className="text-xl font-semibold mb-4 mt-6">Lowest Playoff Scores</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Season/Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoringRecords.playoffLow.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.score.toFixed(1)}</TableCell>
                      <TableCell>{record.team}</TableCell>
                      <TableCell>{record.opponent}</TableCell>
                      <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Largest Margins of Victory</h2>
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
                  {scoringRecords.largestMargins.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.winner}</TableCell>
                      <TableCell>{record.loser}</TableCell>
                      <TableCell>{record.score}</TableCell>
                      <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Highest Combined Scores</h2>
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
                  {scoringRecords.highestCombined.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.teams}</TableCell>
                      <TableCell>{record.score}</TableCell>
                      <TableCell>{record.total.toFixed(1)}</TableCell>
                      <TableCell>{`S${record.season}/W${record.week}`}</TableCell>
                    </TableRow>
                  ))}
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
