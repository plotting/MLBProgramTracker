
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MatchupScoresView } from "@/types/database";
import { Card } from "@/components/ui/card";

type ScheduleTableProps = {
  matchupScores?: MatchupScoresView[];
  selectedSeason: string;
};

const ScheduleTable = ({ matchupScores, selectedSeason }: ScheduleTableProps) => {
  // Get season as number for comparison
  const seasonNum = parseInt(selectedSeason, 10);
  
  // Create a map to track which teams have byes in playoff weeks (Season 8+)
  const playoffByeTeams = new Map<string, boolean>();
  
  if (seasonNum >= 8 && matchupScores) {
    // Determine playoff start week based on season
    const playoffStartWeek = seasonNum >= 11 ? 16 : 15;
    
    // Find teams in playoff weeks that don't have matchups
    // We need to track which teams have matchups in first playoff week
    const playoffWeekTeams = new Set<number>();
    const playoffTeams = new Set<number>();
    
    // First find all teams that should be in playoffs
    matchupScores.forEach(matchup => {
      if ((matchup.week_number === playoffStartWeek + 1) && matchup.is_playoff && !matchup.is_consolation) {
        playoffTeams.add(matchup.home_team_id);
        playoffTeams.add(matchup.away_team_id);
      }
      
      if (matchup.week_number === playoffStartWeek) {
        playoffWeekTeams.add(matchup.home_team_id);
        playoffWeekTeams.add(matchup.away_team_id);
      }
    });
    
    // Teams in playoffs but not in first playoff week have byes
    playoffTeams.forEach(teamId => {
      if (!playoffWeekTeams.has(teamId)) {
        playoffByeTeams.set(`${playoffStartWeek}-${teamId}`, true);
      }
    });
  }

  return (
    <Card className="overflow-x-auto">
      <h2 className="text-lg font-semibold p-4 border-b text-center">Schedule</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Week</TableHead>
            <TableHead className="text-center">Home Team</TableHead>
            <TableHead className="text-center">Away Team</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matchupScores?.map((matchup) => (
            <TableRow key={`${matchup.week_number}-${matchup.home_team_id}-${matchup.away_team_id}`}>
              <TableCell className="text-center">Week {matchup.week_number}</TableCell>
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
              <TableCell className="text-center">
                {matchup.home_score !== null && matchup.away_score !== null ? (
                  `${matchup.home_score.toFixed(2)} - ${matchup.away_score.toFixed(2)}`
                ) : (
                  'TBD'
                )}
              </TableCell>
              <TableCell className="text-center">
                {matchup.is_consolation 
                  ? 'Consolation' 
                  : matchup.is_playoff 
                    ? 'Playoff' 
                    : 'Regular Season'}
              </TableCell>
            </TableRow>
          ))}
          
          {/* Add bye week rows for teams that get first-round byes in playoffs (Season 8+) */}
          {seasonNum >= 8 && playoffByeTeams.size > 0 && matchupScores && 
            Array.from(playoffByeTeams.keys()).map(key => {
              const [week, teamId] = key.split('-');
              // Find the team name
              const team = matchupScores.find(m => 
                m.home_team_id === parseInt(teamId) || m.away_team_id === parseInt(teamId)
              );
              
              const teamName = team?.home_team_id === parseInt(teamId) 
                ? team.home_team_name 
                : team?.away_team_name;
                
              if (!teamName) return null;
              
              return (
                <TableRow key={`bye-${week}-${teamId}`}>
                  <TableCell className="text-center">Week {week}</TableCell>
                  <TableCell>
                    <Link
                      to={`/team/${teamId}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {teamName}
                    </Link>
                  </TableCell>
                  <TableCell className="italic text-muted-foreground text-center">BYE</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center">Playoff</TableCell>
                </TableRow>
              );
            })
          }
        </TableBody>
      </Table>
    </Card>
  );
};

export default ScheduleTable;
