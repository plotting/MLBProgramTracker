
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
import { getSeasonLabel } from "@/utils/seasonUtils";

interface StreakRecord {
  team: string;
  season: number | string;
  startWeek: number;
  endWeek: number;
  length: number;
  details: string;
}

interface StreaksByTeam {
  [team: string]: StreakRecord[];
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

    // Initialize structure to track all streaks for each team
    const streaks = {
      winningStreaks: {} as StreaksByTeam,
      losingStreaks: {} as StreaksByTeam,
      hundredPlusStreaks: {} as StreaksByTeam,
      underHundredStreaks: {} as StreaksByTeam,
      aboveFiveHundredStreaks: {} as StreaksByTeam,
      belowFiveHundredStreaks: {} as StreaksByTeam,
    };

    // For each team, initialize an empty array to hold all their streaks
    allTeams.forEach(team => {
      if (!team) return;
      streaks.winningStreaks[team] = [];
      streaks.losingStreaks[team] = [];
      streaks.hundredPlusStreaks[team] = [];
      streaks.underHundredStreaks[team] = [];
      streaks.aboveFiveHundredStreaks[team] = [];
      streaks.belowFiveHundredStreaks[team] = [];
    });

    // Helper to process streaks for each team
    const processTeamStreaks = (teamName: string) => {
      // Get all matches for this team sorted by season and week
      const teamMatches = matchups
        .filter(m => m.home_team_name === teamName || m.away_team_name === teamName)
        .sort((a, b) => {
          if (a.season_id !== b.season_id) return a.season_id - b.season_id;
          return a.week_number! - b.week_number!;
        });

      // For debugging purposes, log streaks for Erik
      const isDebugTeam = teamName === "Erik";
      
      // Initialize streak tracking variables
      let currentWinStreak = 0;
      let currentLoseStreak = 0;
      let current100PlusStreak = 0;
      let currentUnder100Streak = 0;
      
      // Initialize streak start tracking variables
      let winStreakStartSeason: number | null = null;
      let winStreakStartWeek: number | null = null;
      let loseStreakStartSeason: number | null = null;
      let loseStreakStartWeek: number | null = null;
      let hundredPlusStreakStartSeason: number | null = null;
      let hundredPlusStreakStartWeek: number | null = null;
      let underHundredStreakStartSeason: number | null = null;
      let underHundredStreakStartWeek: number | null = null;

      for (let i = 0; i < teamMatches.length; i++) {
        const match = teamMatches[i];
        const isHome = match.home_team_name === teamName;
        const teamScore = isHome ? match.home_score : match.away_score;
        const opponentScore = isHome ? match.away_score : match.home_score;

        if (!teamScore || !opponentScore) continue;

        // Win/Loss tracking
        if (teamScore > opponentScore) {
          // Win
          if (currentWinStreak === 0) {
            // Start of a new winning streak
            winStreakStartSeason = match.season_id;
            winStreakStartWeek = match.week_number;
          }
          currentWinStreak++;
          
          // End of a losing streak
          if (currentLoseStreak >= 3) {
            streaks.losingStreaks[teamName].push({
              team: teamName,
              season: loseStreakStartSeason === match.season_id 
                ? loseStreakStartSeason 
                : `${loseStreakStartSeason}-${match.season_id}`,
              startWeek: loseStreakStartWeek!,
              endWeek: teamMatches[i-1].week_number!,
              length: currentLoseStreak,
              details: `${currentLoseStreak} games`
            });
          }
          currentLoseStreak = 0;
          loseStreakStartSeason = null;
          loseStreakStartWeek = null;
        } else {
          // Loss or Tie (treated as loss for streak purposes)
          if (currentLoseStreak === 0) {
            // Start of a new losing streak
            loseStreakStartSeason = match.season_id;
            loseStreakStartWeek = match.week_number;
          }
          currentLoseStreak++;
          
          // End of a winning streak
          if (currentWinStreak >= 3) {
            if (isDebugTeam) {
              console.log(`${teamName} win streak from S${winStreakStartSeason} W${winStreakStartWeek} to S${match.season_id} W${teamMatches[i-1].week_number}, ${currentWinStreak} games`);
            }
            
            streaks.winningStreaks[teamName].push({
              team: teamName,
              season: winStreakStartSeason === match.season_id 
                ? winStreakStartSeason 
                : `${winStreakStartSeason}-${match.season_id}`,
              startWeek: winStreakStartWeek!,
              endWeek: teamMatches[i-1].week_number!,
              length: currentWinStreak,
              details: `${currentWinStreak} games`
            });
          }
          currentWinStreak = 0;
          winStreakStartSeason = null;
          winStreakStartWeek = null;
        }

        // Scoring streaks
        if (teamScore >= 100) {
          if (current100PlusStreak === 0) {
            // Start of a new 100+ streak
            hundredPlusStreakStartSeason = match.season_id;
            hundredPlusStreakStartWeek = match.week_number;
          }
          current100PlusStreak++;
          
          // End of an under 100 streak
          if (currentUnder100Streak >= 3) {
            streaks.underHundredStreaks[teamName].push({
              team: teamName,
              season: underHundredStreakStartSeason === match.season_id 
                ? underHundredStreakStartSeason 
                : `${underHundredStreakStartSeason}-${match.season_id}`,
              startWeek: underHundredStreakStartWeek!,
              endWeek: teamMatches[i-1].week_number!,
              length: currentUnder100Streak,
              details: `${currentUnder100Streak} games < 100 pts`
            });
          }
          currentUnder100Streak = 0;
          underHundredStreakStartSeason = null;
          underHundredStreakStartWeek = null;
        } else {
          if (currentUnder100Streak === 0) {
            // Start of a new under 100 streak
            underHundredStreakStartSeason = match.season_id;
            underHundredStreakStartWeek = match.week_number;
          }
          currentUnder100Streak++;
          
          // End of a 100+ streak
          if (current100PlusStreak >= 3) {
            streaks.hundredPlusStreaks[teamName].push({
              team: teamName,
              season: hundredPlusStreakStartSeason === match.season_id 
                ? hundredPlusStreakStartSeason 
                : `${hundredPlusStreakStartSeason}-${match.season_id}`,
              startWeek: hundredPlusStreakStartWeek!,
              endWeek: teamMatches[i-1].week_number!,
              length: current100PlusStreak,
              details: `${current100PlusStreak} games ≥ 100 pts`
            });
          }
          current100PlusStreak = 0;
          hundredPlusStreakStartSeason = null;
          hundredPlusStreakStartWeek = null;
        }

        // Check if we're at the end of all matches
        const isLastMatch = i === teamMatches.length - 1;
        
        // If we're at the last match and still have an active streak, record it
        if (isLastMatch) {
          // Record final win streak if applicable
          if (currentWinStreak >= 3) {
            if (isDebugTeam) {
              console.log(`${teamName} final win streak from S${winStreakStartSeason} W${winStreakStartWeek} to S${match.season_id} W${match.week_number}, ${currentWinStreak} games`);
            }
            
            streaks.winningStreaks[teamName].push({
              team: teamName,
              season: winStreakStartSeason === match.season_id 
                ? winStreakStartSeason 
                : `${winStreakStartSeason}-${match.season_id}`,
              startWeek: winStreakStartWeek!,
              endWeek: match.week_number!,
              length: currentWinStreak,
              details: `${currentWinStreak} games`
            });
          }
          
          // Record final lose streak if applicable
          if (currentLoseStreak >= 3) {
            streaks.losingStreaks[teamName].push({
              team: teamName,
              season: loseStreakStartSeason === match.season_id 
                ? loseStreakStartSeason 
                : `${loseStreakStartSeason}-${match.season_id}`,
              startWeek: loseStreakStartWeek!,
              endWeek: match.week_number!,
              length: currentLoseStreak,
              details: `${currentLoseStreak} games`
            });
          }
          
          // Record final 100+ streak if applicable
          if (current100PlusStreak >= 3) {
            streaks.hundredPlusStreaks[teamName].push({
              team: teamName,
              season: hundredPlusStreakStartSeason === match.season_id 
                ? hundredPlusStreakStartSeason 
                : `${hundredPlusStreakStartSeason}-${match.season_id}`,
              startWeek: hundredPlusStreakStartWeek!,
              endWeek: match.week_number!,
              length: current100PlusStreak,
              details: `${current100PlusStreak} games ≥ 100 pts`
            });
          }
          
          // Record final under 100 streak if applicable
          if (currentUnder100Streak >= 3) {
            streaks.underHundredStreaks[teamName].push({
              team: teamName,
              season: underHundredStreakStartSeason === match.season_id 
                ? underHundredStreakStartSeason 
                : `${underHundredStreakStartSeason}-${match.season_id}`,
              startWeek: underHundredStreakStartWeek!,
              endWeek: match.week_number!,
              length: currentUnder100Streak,
              details: `${currentUnder100Streak} games < 100 pts`
            });
          }
        }
      }
    };

    // Process streaks for each team
    allTeams.forEach(team => {
      if (!team) return;
      processTeamStreaks(team);
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
    Object.entries(streaks.winningStreaks).forEach(([team, teamStreaks]) => {
      if (teamStreaks.length > 0) {
        // Sort team's streaks by length (descending) and add the best one
        teamStreaks.sort((a, b) => b.length - a.length);
        result.winningStreaks.push(teamStreaks[0]);
      }
    });
    
    Object.entries(streaks.losingStreaks).forEach(([team, teamStreaks]) => {
      if (teamStreaks.length > 0) {
        teamStreaks.sort((a, b) => b.length - a.length);
        result.losingStreaks.push(teamStreaks[0]);
      }
    });
    
    Object.entries(streaks.hundredPlusStreaks).forEach(([team, teamStreaks]) => {
      if (teamStreaks.length > 0) {
        teamStreaks.sort((a, b) => b.length - a.length);
        result.hundredPlusStreaks.push(teamStreaks[0]);
      }
    });
    
    Object.entries(streaks.underHundredStreaks).forEach(([team, teamStreaks]) => {
      if (teamStreaks.length > 0) {
        teamStreaks.sort((a, b) => b.length - a.length);
        result.underHundredStreaks.push(teamStreaks[0]);
      }
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

  // Helper to format season display
  const formatSeason = (season: number | string): string => {
    if (typeof season === 'number') {
      return `S${season}`;
    } else if (typeof season === 'string' && season.includes('-')) {
      const [start, end] = season.split('-');
      return `S${start}-S${end}`;
    }
    return `S${season}`;
  };

  // Helper to format week range display - properly accounting for streak length
  const formatWeekRange = (start: number, end: number, length: number): string => {
    // For debugging
    if (length > end - start + 1 && end >= start) {
      console.log(`Week range inconsistency: W${start}-W${end} for streak of length ${length}`);
    }
    
    return `W${start}-W${end}`;
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
                <TableCell>{record.length > 0 ? formatSeason(record.season) : "-"}</TableCell>
                <TableCell>
                  {record.length > 0 ? formatWeekRange(record.startWeek, record.endWeek, record.length) : "-"}
                </TableCell>
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
                    <TableCell>{record.length > 0 ? formatSeason(record.season) : "-"}</TableCell>
                    <TableCell>
                      {record.length > 0 ? formatWeekRange(record.startWeek, record.endWeek, record.length) : "-"}
                    </TableCell>
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
