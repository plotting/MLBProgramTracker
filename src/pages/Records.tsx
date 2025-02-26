import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MatchupScoresView } from "@/types/database";
import { ScoringRecordsSection } from "@/components/records/ScoringRecordsSection";
import { MiscRecordsSection } from "@/components/records/MiscRecordsSection";

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

  const calculateScoringRecords = () => {
    if (!matchups) return {
      regularSeasonHigh: [],
      regularSeasonLow: [],
      playoffHigh: [],
      playoffLow: [],
      largestMargins: [],
      highestCombined: []
    };

    const regularGames = matchups.filter(m => !m.is_playoff && m.home_score !== null && m.away_score !== null);
    const playoffGames = matchups.filter(m => m.is_playoff && m.home_score !== null && m.away_score !== null);

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

  const calculateHypotheticalRecords = () => {
    if (!matchups) return { best: [], worst: [] };

    const seasonTeamRecords = new Map<string, {
      team: string,
      season: string,
      wins: number,
      ties: number,
      games: number
    }>();

    const seasonWeeks = new Map<string, MatchupScoresView[]>();
    matchups.forEach(matchup => {
      if (!matchup.home_score || !matchup.away_score || matchup.is_playoff) return;
      
      const key = `${matchup.season_id}-${matchup.week_number}`;
      if (!seasonWeeks.has(key)) {
        seasonWeeks.set(key, []);
      }
      seasonWeeks.get(key)!.push(matchup);
    });

    seasonWeeks.forEach((weekMatchups, weekKey) => {
      const [season] = weekKey.split('-');
      
      const weekScores = weekMatchups.flatMap(m => [
        { team: m.home_team_name!, score: m.home_score! },
        { team: m.away_team_name!, score: m.away_score! }
      ]);

      weekScores.forEach(teamScore => {
        const wins = weekScores.filter(s => 
          s.team !== teamScore.team && teamScore.score > s.score
        ).length;
        const ties = weekScores.filter(s => 
          s.team !== teamScore.team && teamScore.score === s.score
        ).length;

        const key = `${season}-${teamScore.team}`;
        if (!seasonTeamRecords.has(key)) {
          seasonTeamRecords.set(key, {
            team: teamScore.team,
            season,
            wins: 0,
            ties: 0,
            games: 0
          });
        }

        const record = seasonTeamRecords.get(key)!;
        record.wins += wins;
        record.ties += ties;
        record.games += weekScores.length - 1;
      });
    });

    const records = Array.from(seasonTeamRecords.values())
      .map(record => ({
        team: record.team,
        season: record.season,
        record: `${record.wins}-${record.games - record.wins - record.ties}-${record.ties}`,
        percentage: ((record.wins + record.ties * 0.5) / record.games) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      best: records.slice(0, 10),
      worst: records.slice(-10).reverse()
    };
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
          <ScoringRecordsSection {...scoringRecords} />
        </TabsContent>

        <TabsContent value="career">
          {/* Career records section to be implemented */}
        </TabsContent>

        <TabsContent value="misc">
          <MiscRecordsSection 
            bestRecords={hypotheticalRecords.best}
            worstRecords={hypotheticalRecords.worst}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Records;
