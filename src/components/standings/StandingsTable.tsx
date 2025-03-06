
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

  // First sort by regular season record
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
  const getTeamFinalPlacement = () => {
    if (!playoffMatchups || !sortedByRegularSeason) return [];
    
    // Map to track team placement
    const teamPlacements = new Map();
    
    // Initialize all teams with their regular season positions (as a fallback)
    sortedByRegularSeason.forEach((team, index) => {
      teamPlacements.set(team.team_id, { position: index + 1, confirmed: false });
    });
    
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
      
      teamPlacements.set(championTeamId, { position: 1, confirmed: true });
      teamPlacements.set(runnerUpTeamId, { position: 2, confirmed: true });
      
      // Find semifinal losers
      const semiFinals = playoffGames.filter(m => 
        m.week_number === championshipWeek - 1 && 
        !m.is_consolation
      );
      
      // Find the third place game by identifying the matchup between semifinal losers
      const semiFinalLosers = semiFinals.map(match => {
        const loserTeamId = match.home_score > match.away_score 
          ? match.away_team_id 
          : match.home_team_id;
        return loserTeamId;
      });

      // Now find the consolation game that has these semifinal losers
      const thirdPlaceGame = playoffMatchups.find(m => 
        m.week_number === championshipWeek && 
        (semiFinalLosers.includes(m.home_team_id) && semiFinalLosers.includes(m.away_team_id))
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
        
        teamPlacements.set(thirdPlaceTeamId, { position: 3, confirmed: true });
        teamPlacements.set(fourthPlaceTeamId, { position: 4, confirmed: true });
      }
      
      // Process other consolation games for 5th-10th place
      // Group consolation games by their "tier" based on regular season standings
      const consolationGames = playoffMatchups.filter(m => 
        m.is_consolation && 
        m.week_number === championshipWeek &&
        m !== thirdPlaceGame && 
        m.home_score !== null && 
        m.away_score !== null
      );
      
      // Map teams to their initial regular season rankings
      const regularSeasonRanking = new Map();
      sortedByRegularSeason.forEach((team, idx) => {
        regularSeasonRanking.set(team.team_id, idx + 1);
      });
      
      // Sort consolation games by the average regular season ranking of participating teams
      const sortedConsolationGames = [...consolationGames].sort((a, b) => {
        const aAvgRank = (regularSeasonRanking.get(a.home_team_id) + regularSeasonRanking.get(a.away_team_id)) / 2;
        const bAvgRank = (regularSeasonRanking.get(b.home_team_id) + regularSeasonRanking.get(b.away_team_id)) / 2;
        return aAvgRank - bAvgRank; // Lower ranks (better teams) first
      });
      
      // Assign placements for consolation games
      let placementCounter = 5; // Start from 5th place
      sortedConsolationGames.forEach(game => {
        // Winner gets better placement
        const winnerTeamId = game.home_score > game.away_score 
          ? game.home_team_id 
          : game.away_team_id;
        
        // Loser gets next placement
        const loserTeamId = game.home_score > game.away_score 
          ? game.away_team_id 
          : game.home_team_id;
        
        teamPlacements.set(winnerTeamId, { position: placementCounter++, confirmed: true });
        teamPlacements.set(loserTeamId, { position: placementCounter++, confirmed: true });
      });
    }
    
    // Sort teams based on final placement
    return [...sortedByRegularSeason].sort((a, b) => {
      const aPlacement = teamPlacements.get(a.team_id)?.position || Number.MAX_SAFE_INTEGER;
      const bPlacement = teamPlacements.get(b.team_id)?.position || Number.MAX_SAFE_INTEGER;
      return aPlacement - bPlacement;
    });
  };

  const finalStandings = getTeamFinalPlacement();

  const getFinalPlacement = (position: number): React.ReactNode => {
    switch (position) {
      case 0: return <span title="1st Place">🥇</span>;
      case 1: return <span title="2nd Place">🥈</span>;
      case 2: return <span title="3rd Place">🥉</span>;
      case 3: return <span title="4th Place">🏆</span>;
      case 4: return <span title="5th Place">🌟</span>;
      case 5: return <span title="6th Place">🛡️</span>;
      case 6: return <span title="7th Place">🚽</span>;
      case 7: return <span title="8th Place">🤡</span>;
      case 8: return <span title="9th Place">🤮</span>;
      case 9: return <span title="10th Place">💩</span>;
      default: return `${position + 1}`;
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
          {finalStandings.map((team, index) => (
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
              <TableCell className="text-center font-medium text-xl">{getFinalPlacement(index)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StandingsTable;
