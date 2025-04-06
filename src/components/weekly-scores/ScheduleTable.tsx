
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
    // Find teams in playoff weeks (15-16) that don't have matchups
    // We need to track which teams have matchups in week 15
    const week15Teams = new Set<number>();
    const playoffTeams = new Set<number>();
    
    // First find all teams that should be in playoffs
    matchupScores.forEach(matchup => {
      if (matchup.week_number === 16 && matchup.is_playoff && !matchup.is_consolation) {
        playoffTeams.add(matchup.home_team_id);
        playoffTeams.add(matchup.away_team_id);
      }
      
      if (matchup.week_number === 15) {
        week15Teams.add(matchup.home_team_id);
        week15Teams.add(matchup.away_team_id);
      }
    });
    
    // Teams in playoffs but not in week 15 have byes
    playoffTeams.forEach(teamId => {
      if (!week15Teams.has(teamId)) {
        playoffByeTeams.set(`15-${teamId}`, true);
      }
    });
  }

  return (
    <Card className="overflow-x-auto">
      <h2 className="text-lg font-semibold p-4 border-b">Schedule</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Home Team</TableHead>
            <TableHead>Away Team</TableHead>
            <TableHead>Score</TableHead>
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
                  <TableCell>Week {week}</TableCell>
                  <TableCell>
                    <Link
                      to={`/team/${teamId}?season=${selectedSeason}`}
                      className="text-primary hover:underline"
                    >
                      {teamName}
                    </Link>
                  </TableCell>
                  <TableCell className="italic text-muted-foreground">BYE</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Playoff</TableCell>
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
