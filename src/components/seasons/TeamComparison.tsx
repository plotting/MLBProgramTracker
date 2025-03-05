
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Team, MatchupScoresView } from "@/types/database";

interface TeamComparisonProps {
  seasonId: number;
  teams?: Team[];
}

const TeamComparison = ({ seasonId, teams = [] }: TeamComparisonProps) => {
  const [team1Id, setTeam1Id] = useState<string>("");
  const [team2Id, setTeam2Id] = useState<string>("");
  
  // Reset selections when season changes
  useEffect(() => {
    setTeam1Id("");
    setTeam2Id("");
  }, [seasonId]);

  const { data: matchupScores } = useQuery({
    queryKey: ["matchup-scores", seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matchup_scores_view")
        .select("*")
        .eq("season_id", seasonId)
        .order("week_number");
      if (error) throw error;
      return data as MatchupScoresView[];
    },
    enabled: seasonId > 0,
  });

  const regularSeasonMatchups = matchupScores?.filter(m => !m.is_playoff) || [];
  
  // Get all scores for both teams
  const team1Scores = regularSeasonMatchups.filter(m => 
    m.home_team_id === Number(team1Id) || m.away_team_id === Number(team1Id)
  );
  
  const team2Scores = regularSeasonMatchups.filter(m => 
    m.home_team_id === Number(team2Id) || m.away_team_id === Number(team2Id)
  );

  // Calculate head-to-head record if they played each week
  const calculateHeadToHead = () => {
    if (!team1Id || !team2Id || team1Id === team2Id) return null;
    
    const weeklyResults = regularSeasonMatchups
      .filter(m => m.home_score !== null && m.away_score !== null)
      .map((_, idx) => {
        const week = idx + 1;
        const team1Match = team1Scores.find(m => m.week_number === week);
        const team2Match = team2Scores.find(m => m.week_number === week);
        
        if (!team1Match || !team2Match) return null;
        
        const team1Score = team1Match.home_team_id === Number(team1Id) 
          ? team1Match.home_score 
          : team1Match.away_score;
          
        const team2Score = team2Match.home_team_id === Number(team2Id) 
          ? team2Match.home_score 
          : team2Match.away_score;
          
        if (team1Score === null || team2Score === null) return null;
        
        return {
          week,
          team1Score,
          team2Score,
          winner: team1Score > team2Score ? 1 : team1Score < team2Score ? 2 : 0
        };
      })
      .filter(Boolean);
    
    const team1Wins = weeklyResults.filter(r => r?.winner === 1).length;
    const team2Wins = weeklyResults.filter(r => r?.winner === 2).length;
    const ties = weeklyResults.filter(r => r?.winner === 0).length;
    
    return {
      team1Wins,
      team2Wins,
      ties,
      weeklyResults
    };
  };
  
  const headToHeadResults = calculateHeadToHead();
  const team1Name = teams.find(t => t.id === Number(team1Id))?.name;
  const team2Name = teams.find(t => t.id === Number(team2Id))?.name;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Team Comparison</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Team 1</label>
          <Select value={team1Id} onValueChange={setTeam1Id}>
            <SelectTrigger>
              <SelectValue placeholder="Select Team 1" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={`team1-${team.id}`} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Team 2</label>
          <Select value={team2Id} onValueChange={setTeam2Id}>
            <SelectTrigger>
              <SelectValue placeholder="Select Team 2" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={`team2-${team.id}`} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {headToHeadResults && team1Name && team2Name && (
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-lg">If {team1Name} played {team2Name} each week:</h3>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-lg font-bold">
              {team1Name}: {headToHeadResults.team1Wins} wins
            </p>
            <p className="text-lg font-bold">
              {team2Name}: {headToHeadResults.team2Wins} wins
            </p>
            {headToHeadResults.ties > 0 && (
              <p className="text-lg font-bold">
                Ties: {headToHeadResults.ties}
              </p>
            )}
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Weekly Breakdown:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-semibold">Week</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold">{team1Name}</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold">{team2Name}</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {headToHeadResults.weeklyResults.map((result) => (
                    <tr key={`week-${result?.week}`}>
                      <td className="px-3 py-2 text-sm">{result?.week}</td>
                      <td className="px-3 py-2 text-sm">{result?.team1Score?.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm">{result?.team2Score?.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm">
                        {result?.winner === 0 
                          ? "Tie" 
                          : result?.winner === 1 
                            ? team1Name 
                            : team2Name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TeamComparison;
