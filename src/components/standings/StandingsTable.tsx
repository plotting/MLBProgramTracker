
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StandingsTableProps {
  seasonId: number;
}

const StandingsTable = ({ seasonId }: StandingsTableProps) => {
  // Fetch team records data
  const { data: standings, isLoading: recordsLoading } = useQuery({
    queryKey: ['standings', seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_records_view')
        .select('*')
        .eq('season_id', seasonId);
        
      if (error) throw error;
      return data;
    },
  });

  // Fetch playoff matchups to determine final standings
  const { data: playoffMatchups, isLoading: matchupsLoading } = useQuery({
    queryKey: ['playoff-matchups', seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .eq('season_id', seasonId)
        .or('is_playoff.eq.true,is_consolation.eq.true');
        
      if (error) throw error;
      return data;
    },
  });

  const isLoading = recordsLoading || matchupsLoading;

  if (isLoading) {
    return <p className="text-center py-4">Loading standings...</p>;
  }

  // Sort by regular season record
  const sortedByRegularSeason = standings ? [...standings].sort((a, b) => {
    const aTotal = a.regular_season_wins + a.regular_season_losses + a.regular_season_ties;
    const bTotal = b.regular_season_wins + b.regular_season_losses + b.regular_season_ties;
    
    const aPercentage = aTotal === 0 ? 0 : (a.regular_season_wins + 0.5 * a.regular_season_ties) / aTotal;
    const bPercentage = bTotal === 0 ? 0 : (b.regular_season_wins + 0.5 * b.regular_season_ties) / bTotal;
    
    if (aPercentage !== bPercentage) {
      return bPercentage - aPercentage;
    }
    return b.regular_season_points_for - a.regular_season_points_for;
  }) : [];

  // Determine final standings based on playoff results
  const getTeamFinalPlacements = () => {
    if (!playoffMatchups || !sortedByRegularSeason) return new Map();
    
    // Map to track team placement
    const teamPlacements = new Map();
    
    // Define Championship game (highest week number playoff game, not consolation)
    const playoffGames = playoffMatchups.filter(m => m.is_playoff && !m.is_consolation);
    const championshipWeek = Math.max(...playoffGames.map(m => m.week_number));
    const championshipGame = playoffGames.find(m => 
      m.week_number === championshipWeek && 
      !m.is_consolation
    );
    
    if (championshipGame && championshipGame.home_score !== null && championshipGame.away_score !== null) {
      // Championship winner (1st place)
      const championTeamId = championshipGame.home_score > championshipGame.away_score 
        ? championshipGame.home_team_id 
        : championshipGame.away_team_id;
      
      // Championship loser (2nd place)
      const runnerUpTeamId = championshipGame.home_score > championshipGame.away_score 
        ? championshipGame.away_team_id 
        : championshipGame.home_team_id;
      
      teamPlacements.set(championTeamId, 1); // 1st place
      teamPlacements.set(runnerUpTeamId, 2); // 2nd place
      
      // Find semifinal games
      const semiFinals = playoffGames.filter(m => 
        m.week_number === (championshipWeek - 1) && 
        !m.is_consolation
      );
      
      // Identify semifinal losers
      const semiFinalLosers = semiFinals.map(match => {
        if (match.home_score === null || match.away_score === null) return null;
        return match.home_score > match.away_score 
          ? match.away_team_id 
          : match.home_team_id;
      }).filter(Boolean);
      
      // Find 3rd place game (between semifinal losers)
      const consolationGames = playoffMatchups.filter(m => 
        m.week_number === championshipWeek && m.is_consolation
      );
      
      const thirdPlaceGame = consolationGames.find(match => 
        semiFinalLosers.includes(match.home_team_id || 0) && 
        semiFinalLosers.includes(match.away_team_id || 0)
      );
      
      if (thirdPlaceGame && thirdPlaceGame.home_score !== null && thirdPlaceGame.away_score !== null) {
        // 3rd place winner
        const thirdPlaceTeamId = thirdPlaceGame.home_score > thirdPlaceGame.away_score 
          ? thirdPlaceGame.home_team_id 
          : thirdPlaceGame.away_team_id;
        
        // 4th place
        const fourthPlaceTeamId = thirdPlaceGame.home_score > thirdPlaceGame.away_score 
          ? thirdPlaceGame.away_team_id 
          : thirdPlaceGame.home_team_id;
        
        teamPlacements.set(thirdPlaceTeamId, 3); // 3rd place
        teamPlacements.set(fourthPlaceTeamId, 4); // 4th place
      }
      
      // Identify other consolation games (5th-10th place games)
      const otherConsolationGames = consolationGames.filter(m => m !== thirdPlaceGame);
      
      // Process 5th-6th place game
      const fifthPlaceGame = otherConsolationGames[0];
      if (fifthPlaceGame && fifthPlaceGame.home_score !== null && fifthPlaceGame.away_score !== null) {
        const fifthPlaceTeamId = fifthPlaceGame.home_score > fifthPlaceGame.away_score 
          ? fifthPlaceGame.home_team_id 
          : fifthPlaceGame.away_team_id;
        
        const sixthPlaceTeamId = fifthPlaceGame.home_score > fifthPlaceGame.away_score 
          ? fifthPlaceGame.away_team_id 
          : fifthPlaceGame.home_team_id;
        
        teamPlacements.set(fifthPlaceTeamId, 5); // 5th place
        teamPlacements.set(sixthPlaceTeamId, 6); // 6th place
      }
      
      // Process 7th-8th place game
      const seventhPlaceGame = otherConsolationGames[1];
      if (seventhPlaceGame && seventhPlaceGame.home_score !== null && seventhPlaceGame.away_score !== null) {
        const seventhPlaceTeamId = seventhPlaceGame.home_score > seventhPlaceGame.away_score 
          ? seventhPlaceGame.home_team_id 
          : seventhPlaceGame.away_team_id;
        
        const eighthPlaceTeamId = seventhPlaceGame.home_score > seventhPlaceGame.away_score 
          ? seventhPlaceGame.away_team_id 
          : seventhPlaceGame.home_team_id;
        
        teamPlacements.set(seventhPlaceTeamId, 7); // 7th place
        teamPlacements.set(eighthPlaceTeamId, 8); // 8th place
      }
      
      // Process 9th-10th place game if it exists
      const ninthPlaceGame = otherConsolationGames[2];
      if (ninthPlaceGame && ninthPlaceGame.home_score !== null && ninthPlaceGame.away_score !== null) {
        const ninthPlaceTeamId = ninthPlaceGame.home_score > ninthPlaceGame.away_score 
          ? ninthPlaceGame.home_team_id 
          : ninthPlaceGame.away_team_id;
        
        const tenthPlaceTeamId = ninthPlaceGame.home_score > ninthPlaceGame.away_score 
          ? ninthPlaceGame.away_team_id 
          : ninthPlaceGame.home_team_id;
        
        teamPlacements.set(ninthPlaceTeamId, 9); // 9th place
        teamPlacements.set(tenthPlaceTeamId, 10); // 10th place
      }
    }
    
    return teamPlacements;
  };

  const teamPlacements = getTeamFinalPlacements();

  // Get emoji for final placement
  const getFinalPlacementEmoji = (teamId: number): React.ReactNode => {
    const placement = teamPlacements.get(teamId);
    
    if (!placement) return "";
    
    switch (placement) {
      case 1: return <span title="1st Place">🥇</span>;
      case 2: return <span title="2nd Place">🥈</span>;
      case 3: return <span title="3rd Place">🥉</span>;
      case 4: return <span title="4th Place">🏆</span>;
      case 5: return <span title="5th Place">🌟</span>;
      case 6: return <span title="6th Place">🛡️</span>;
      case 7: return <span title="7th Place">🚽</span>;
      case 8: return <span title="8th Place">🤡</span>;
      case 9: return <span title="9th Place">🤮</span>;
      case 10: return <span title="10th Place">💩</span>;
      default: return "";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[180px]">Team</TableHead>
            <TableHead className="text-center">Regular Season</TableHead>
            <TableHead className="text-center">Playoffs</TableHead>
            <TableHead className="text-center">PF</TableHead>
            <TableHead className="text-center">PA</TableHead>
            <TableHead className="text-center">Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedByRegularSeason.map((team, index) => (
            <TableRow key={team.team_id}>
              <TableCell className="font-medium">
                {index + 1}
              </TableCell>
              <TableCell>
                <Link 
                  to={`/team/${team.team_id}?season=${seasonId}`} 
                  className="text-primary hover:underline"
                >
                  {team.team_name}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                {team.regular_season_wins}-{team.regular_season_losses}
                {team.regular_season_ties > 0 ? `-${team.regular_season_ties}` : ''}
              </TableCell>
              <TableCell className="text-center">
                {team.playoff_wins}-{team.playoff_losses}
                {team.playoff_ties > 0 ? `-${team.playoff_ties}` : ''}
              </TableCell>
              <TableCell className="text-center">{team.regular_season_points_for.toFixed(1)}</TableCell>
              <TableCell className="text-center">{team.regular_season_points_against.toFixed(1)}</TableCell>
              <TableCell className="text-center font-medium text-xl">
                {getFinalPlacementEmoji(team.team_id)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StandingsTable;
