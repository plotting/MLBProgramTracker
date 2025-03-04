
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MatchupScoresView } from "@/types/database";

interface StreakRecord {
  team: string;
  season: number;
  startWeek: number;
  endWeek: number;
  length: number;
  details: string;
}

interface StreaksSectionProps {
  matchups: MatchupScoresView[];
}

export const StreaksSection = ({ matchups }: StreaksSectionProps) => {
  const calculateStreaks = () => {
    if (!matchups) return {
      winningStreaks: [],
      losingStreaks: [],
      hundredPlusStreaks: [],
      underHundredStreaks: [],
      aboveFiveHundredStreaks: [],
      belowFiveHundredStreaks: [],
    };

    const streaks = {
      winningStreaks: [] as StreakRecord[],
      losingStreaks: [] as StreakRecord[],
      hundredPlusStreaks: [] as StreakRecord[],
      underHundredStreaks: [] as StreakRecord[],
      aboveFiveHundredStreaks: [] as StreakRecord[],
      belowFiveHundredStreaks: [] as StreakRecord[],
    };

    // Helper to process streaks for each team
    const processTeamStreaks = (teamMatches: MatchupScoresView[], teamName: string) => {
      let currentWinStreak = 0;
      let currentLoseStreak = 0;
      let current100PlusStreak = 0;
      let currentUnder100Streak = 0;
      let currentRecord = { wins: 0, losses: 0 };
      let lastSeasonId: number | null = null;
      let streakStartWeek: number | null = null;

      teamMatches.forEach((match, index) => {
        const isHome = match.home_team_name === teamName;
        const teamScore = isHome ? match.home_score : match.away_score;
        const opponentScore = isHome ? match.away_score : match.home_score;

        if (!teamScore || !opponentScore) return;

        // Process win/loss streaks
        if (teamScore > opponentScore) {
          if (currentWinStreak === 0) streakStartWeek = match.week_number;
          currentWinStreak++;
          currentLoseStreak = 0;
        } else {
          if (currentLoseStreak === 0) streakStartWeek = match.week_number;
          currentLoseStreak++;
          currentWinStreak = 0;
        }

        // Process scoring streaks
        if (teamScore >= 100) {
          current100PlusStreak++;
          currentUnder100Streak = 0;
        } else {
          currentUnder100Streak++;
          current100PlusStreak = 0;
        }

        // Update record and process .500 streaks
        if (match.season_id !== lastSeasonId) {
          currentRecord = { wins: 0, losses: 0 };
        }
        if (teamScore > opponentScore) currentRecord.wins++;
        else currentRecord.losses++;

        const isLastMatch = index === teamMatches.length - 1;
        const nextMatch = teamMatches[index + 1];
        const isSeasonChange = nextMatch && nextMatch.season_id !== match.season_id;

        // Record streaks when they end or at season boundaries
        if (isLastMatch || isSeasonChange) {
          if (currentWinStreak >= 3) {
            streaks.winningStreaks.push({
              team: teamName,
              season: match.season_id,
              startWeek: streakStartWeek!,
              endWeek: match.week_number!,
              length: currentWinStreak,
              details: `${currentWinStreak} games`
            });
          }
          if (currentLoseStreak >= 3) {
            streaks.losingStreaks.push({
              team: teamName,
              season: match.season_id,
              startWeek: streakStartWeek!,
              endWeek: match.week_number!,
              length: currentLoseStreak,
              details: `${currentLoseStreak} games`
            });
          }
          if (current100PlusStreak >= 3) {
            streaks.hundredPlusStreaks.push({
              team: teamName,
              season: match.season_id,
              startWeek: streakStartWeek!,
              endWeek: match.week_number!,
              length: current100PlusStreak,
              details: `${current100PlusStreak} games ≥ 100 pts`
            });
          }
          if (currentUnder100Streak >= 3) {
            streaks.underHundredStreaks.push({
              team: teamName,
              season: match.season_id,
              startWeek: streakStartWeek!,
              endWeek: match.week_number!,
              length: currentUnder100Streak,
              details: `${currentUnder100Streak} games < 100 pts`
            });
          }
        }

        lastSeasonId = match.season_id;
      });
    };

    // Process streaks for each team
    const teams = new Set(matchups.map(m => m.home_team_name));
    teams.forEach(team => {
      if (!team) return;
      const teamMatches = matchups
        .filter(m => m.home_team_name === team || m.away_team_name === team)
        .sort((a, b) => {
          if (a.season_id !== b.season_id) return a.season_id - b.season_id;
          return a.week_number! - b.week_number!;
        });
      processTeamStreaks(teamMatches, team);
    });

    // Sort all streaks by length (descending)
    Object.keys(streaks).forEach(key => {
      streaks[key as keyof typeof streaks].sort((a, b) => b.length - a.length);
    });

    return streaks;
  };

  const streaks = calculateStreaks();

  const renderStreakTable = (title: string, records: StreakRecord[]) => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Season</TableHead>
            <TableHead>Weeks</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.slice(0, 10).map((record, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{record.team}</TableCell>
              <TableCell>{record.season}</TableCell>
              <TableCell>{record.startWeek}-{record.endWeek}</TableCell>
              <TableCell>{record.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {renderStreakTable("Longest Winning Streaks", streaks.winningStreaks)}
      {renderStreakTable("Longest Losing Streaks", streaks.losingStreaks)}
      {renderStreakTable("Most Consecutive 100+ Point Games", streaks.hundredPlusStreaks)}
      {renderStreakTable("Most Consecutive Sub-100 Point Games", streaks.underHundredStreaks)}
    </div>
  );
};
