
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

interface StreaksByTeam {
  [team: string]: StreakRecord;
}

interface StreaksSectionProps {
  matchups: MatchupScoresView[];
}

export const StreaksSection = ({ matchups }: StreaksSectionProps) => {
  const calculateStreaks = () => {
    if (!matchups) return {
      winningStreaks: {},
      losingStreaks: {},
      hundredPlusStreaks: {},
      underHundredStreaks: {},
      aboveFiveHundredStreaks: {},
      belowFiveHundredStreaks: {},
    };

    // Get all unique team names
    const allTeams = new Set(matchups.flatMap(m => [m.home_team_name, m.away_team_name]).filter(Boolean));

    // Initialize structure to track best streak for each team
    const streaks = {
      winningStreaks: {} as StreaksByTeam,
      losingStreaks: {} as StreaksByTeam,
      hundredPlusStreaks: {} as StreaksByTeam,
      underHundredStreaks: {} as StreaksByTeam,
      aboveFiveHundredStreaks: {} as StreaksByTeam,
      belowFiveHundredStreaks: {} as StreaksByTeam,
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
          if (current100PlusStreak === 0) streakStartWeek = match.week_number;
          current100PlusStreak++;
          currentUnder100Streak = 0;
        } else {
          if (currentUnder100Streak === 0) streakStartWeek = match.week_number;
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
          // Only update if current streak is longer than existing streak for this team
          if (currentWinStreak >= 3) {
            const existingStreak = streaks.winningStreaks[teamName];
            if (!existingStreak || currentWinStreak > existingStreak.length) {
              streaks.winningStreaks[teamName] = {
                team: teamName,
                season: match.season_id,
                startWeek: streakStartWeek!,
                endWeek: match.week_number!,
                length: currentWinStreak,
                details: `${currentWinStreak} games`
              };
            }
          }
          
          if (currentLoseStreak >= 3) {
            const existingStreak = streaks.losingStreaks[teamName];
            if (!existingStreak || currentLoseStreak > existingStreak.length) {
              streaks.losingStreaks[teamName] = {
                team: teamName,
                season: match.season_id,
                startWeek: streakStartWeek!,
                endWeek: match.week_number!,
                length: currentLoseStreak,
                details: `${currentLoseStreak} games`
              };
            }
          }
          
          if (current100PlusStreak >= 3) {
            const existingStreak = streaks.hundredPlusStreaks[teamName];
            if (!existingStreak || current100PlusStreak > existingStreak.length) {
              streaks.hundredPlusStreaks[teamName] = {
                team: teamName,
                season: match.season_id,
                startWeek: streakStartWeek!,
                endWeek: match.week_number!,
                length: current100PlusStreak,
                details: `${current100PlusStreak} games ≥ 100 pts`
              };
            }
          }
          
          if (currentUnder100Streak >= 3) {
            const existingStreak = streaks.underHundredStreaks[teamName];
            if (!existingStreak || currentUnder100Streak > existingStreak.length) {
              streaks.underHundredStreaks[teamName] = {
                team: teamName,
                season: match.season_id,
                startWeek: streakStartWeek!,
                endWeek: match.week_number!,
                length: currentUnder100Streak,
                details: `${currentUnder100Streak} games < 100 pts`
              };
            }
          }
        }

        lastSeasonId = match.season_id;
      });
    };

    // Process streaks for each team
    allTeams.forEach(team => {
      if (!team) return;
      const teamMatches = matchups
        .filter(m => m.home_team_name === team || m.away_team_name === team)
        .sort((a, b) => {
          if (a.season_id !== b.season_id) return a.season_id - b.season_id;
          return a.week_number! - b.week_number!;
        });
      processTeamStreaks(teamMatches, team);
    });

    return streaks;
  };

  const streaks = calculateStreaks();

  // Convert the streak objects to arrays for sorting and display
  const getStreakArrays = () => {
    const result = {
      winningStreaks: [] as StreakRecord[],
      losingStreaks: [] as StreakRecord[],
      hundredPlusStreaks: [] as StreakRecord[],
      underHundredStreaks: [] as StreakRecord[]
    };
    
    // Extract values from objects into arrays
    Object.values(streaks.winningStreaks).forEach(streak => {
      result.winningStreaks.push(streak);
    });
    
    Object.values(streaks.losingStreaks).forEach(streak => {
      result.losingStreaks.push(streak);
    });
    
    Object.values(streaks.hundredPlusStreaks).forEach(streak => {
      result.hundredPlusStreaks.push(streak);
    });
    
    Object.values(streaks.underHundredStreaks).forEach(streak => {
      result.underHundredStreaks.push(streak);
    });
    
    // Sort all streak arrays by length (descending)
    result.winningStreaks.sort((a, b) => b.length - a.length);
    result.losingStreaks.sort((a, b) => b.length - a.length);
    result.hundredPlusStreaks.sort((a, b) => b.length - a.length);
    result.underHundredStreaks.sort((a, b) => b.length - a.length);
    
    return result;
  };

  const streakArrays = getStreakArrays();

  // Extract top 10 unique team streaks
  const getTop10UniqueTeams = (streakArray: StreakRecord[]) => {
    const uniqueTeams = new Set<string>();
    const result: StreakRecord[] = [];
    
    for (const streak of streakArray) {
      if (!uniqueTeams.has(streak.team) && result.length < 10) {
        uniqueTeams.add(streak.team);
        result.push(streak);
      }
    }
    
    return result;
  };

  // Get all teams with lesser streaks
  const getAllOtherTeams = (streakArray: StreakRecord[], top10Teams: Set<string>) => {
    // Get all unique team names from matchups
    const allTeams = new Set<string>();
    matchups.forEach(m => {
      if (m.home_team_name) allTeams.add(m.home_team_name);
      if (m.away_team_name) allTeams.add(m.away_team_name);
    });
    
    const otherTeams: StreakRecord[] = [];
    
    // For each team not in top 10, find their best streak
    allTeams.forEach(team => {
      if (!top10Teams.has(team)) {
        const teamStreak = streakArray.find(s => s.team === team);
        if (teamStreak) {
          otherTeams.push(teamStreak);
        } else {
          // Add placeholder for teams with no qualifying streaks
          otherTeams.push({
            team,
            season: 0,
            startWeek: 0,
            endWeek: 0,
            length: 0,
            details: "No qualifying streak"
          });
        }
      }
    });
    
    return otherTeams.sort((a, b) => b.length - a.length);
  };

  const renderStreakTable = (title: string, allRecords: StreakRecord[]) => {
    const top10Records = getTop10UniqueTeams(allRecords);
    const top10Teams = new Set(top10Records.map(r => r.team));
    const otherRecords = getAllOtherTeams(allRecords, top10Teams);
    
    return (
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
            {top10Records.map((record, index) => (
              <TableRow key={`top-${index}`}>
                <TableCell className="font-medium">{record.team}</TableCell>
                <TableCell>{record.season || "-"}</TableCell>
                <TableCell>{record.length > 0 ? `${record.startWeek}-${record.endWeek}` : "-"}</TableCell>
                <TableCell>{record.details}</TableCell>
              </TableRow>
            ))}
            
            {otherRecords.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={4} className="text-center font-medium py-2 bg-muted/30">
                    Other Teams
                  </TableCell>
                </TableRow>
                {otherRecords.map((record, index) => (
                  <TableRow key={`other-${index}`}>
                    <TableCell className="font-medium">{record.team}</TableCell>
                    <TableCell>{record.season || "-"}</TableCell>
                    <TableCell>{record.length > 0 ? `${record.startWeek}-${record.endWeek}` : "-"}</TableCell>
                    <TableCell>{record.details}</TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {renderStreakTable("Longest Winning Streaks", streakArrays.winningStreaks)}
      {renderStreakTable("Longest Losing Streaks", streakArrays.losingStreaks)}
      {renderStreakTable("Most Consecutive 100+ Point Games", streakArrays.hundredPlusStreaks)}
      {renderStreakTable("Most Consecutive Sub-100 Point Games", streakArrays.underHundredStreaks)}
    </div>
  );
};
