
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
        .or('is_playoff.eq.true,is_consolation.eq.true,week_number.gte.15');
        
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
    
    // Get championship game (week 16)
    const championshipGame = playoffMatchups.find(m => 
      m.week_number === 16 && 
      m.is_playoff && 
      !m.is_consolation &&
      // For seasons with unusual configuration, find the championship game explicitly
      // by looking at who played (usually the top 2 teams from semifinals)
      ((playoffMatchups.filter(m => m.week_number === 15 && m.is_playoff && !m.is_consolation).length >= 2) ||
       (m === playoffMatchups.find(game => 
         game.week_number === 16 && 
         game.is_playoff && 
         !game.is_consolation
       )))
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
      
      // Get semifinal games (week 15)
      const semiFinals = playoffMatchups.filter(m => 
        m.week_number === 15 && 
        m.is_playoff && 
        !m.is_consolation
      );
      
      // Identify semifinal losers
      const semiFinalLosers = semiFinals.map(match => {
        if (match.home_score === null || match.away_score === null) return null;
        return match.home_score > match.away_score 
          ? match.away_team_id 
          : match.home_team_id;
      }).filter(Boolean);
      
      // Find 3rd place game more comprehensively
      const findThirdPlaceGame = () => {
        // First check playoff (non-championship) games
        const nonChampionship = playoffMatchups.filter(m => 
          m.week_number === 16 && 
          m.is_playoff && 
          !m.is_consolation && 
          m !== championshipGame
        );
        
        for (const matchup of nonChampionship) {
          if (semiFinalLosers.includes(matchup.home_team_id || 0) && 
              semiFinalLosers.includes(matchup.away_team_id || 0)) {
            return matchup;
          }
        }
        
        // Then check consolation games
        const consolationGames = playoffMatchups.filter(m => 
          m.week_number === 16 && 
          (m.is_consolation || !m.is_playoff)
        );
        
        for (const matchup of consolationGames) {
          if (semiFinalLosers.includes(matchup.home_team_id || 0) && 
              semiFinalLosers.includes(matchup.away_team_id || 0)) {
            return matchup;
          }
        }
        
        // Finally, check all week 16 games
        const allWeek16 = playoffMatchups.filter(m => m.week_number === 16);
        for (const matchup of allWeek16) {
          if (semiFinalLosers.includes(matchup.home_team_id || 0) && 
              semiFinalLosers.includes(matchup.away_team_id || 0)) {
            return matchup;
          }
        }
        
        return null;
      };
      
      // Set 3rd and 4th place if 3rd place game exists
      const thirdPlaceGame = findThirdPlaceGame();
      
      if (thirdPlaceGame && thirdPlaceGame.home_score !== null && thirdPlaceGame.away_score !== null) {
        const thirdPlaceTeamId = thirdPlaceGame.home_score > thirdPlaceGame.away_score 
          ? thirdPlaceGame.home_team_id 
          : thirdPlaceGame.away_team_id;
        
        const fourthPlaceTeamId = thirdPlaceGame.home_score > thirdPlaceGame.away_score 
          ? thirdPlaceGame.away_team_id 
          : thirdPlaceGame.home_team_id;
        
        teamPlacements.set(thirdPlaceTeamId, 3); // 3rd place
        teamPlacements.set(fourthPlaceTeamId, 4); // 4th place
      }
      
      // Process consolation games for 5th-10th places
      const consolidationGames = playoffMatchups.filter(m => 
        m.week_number === 16 && 
        (m.is_consolation || (!m.is_playoff && m !== thirdPlaceGame)) &&
        m !== thirdPlaceGame
      );
      
      // Sort consolation games to make assignment consistent
      const sortedConsolationGames = [...consolidationGames].sort((a, b) => {
        const aSum = (a.home_team_id || 0) + (a.away_team_id || 0);
        const bSum = (b.home_team_id || 0) + (b.away_team_id || 0);
        return aSum - bSum;
      });
      
      // Assign 5th-10th places
      sortedConsolationGames.forEach((game, index) => {
        if (game.home_score === null || game.away_score === null) return;
        
        // Calculate placements based on index (0=5th place, 1=7th place, 2=9th place)
        const winnerPlace = 5 + (index * 2);
        const loserPlace = 6 + (index * 2);
        
        const winnerTeamId = game.home_score > game.away_score 
          ? game.home_team_id 
          : game.away_team_id;
        
        const loserTeamId = game.home_score > game.away_score 
          ? game.away_team_id 
          : game.home_team_id;
        
        teamPlacements.set(winnerTeamId, winnerPlace);
        teamPlacements.set(loserTeamId, loserPlace);
      });
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
