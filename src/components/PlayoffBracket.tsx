
import React, { useState } from "react";
import FourTeamPlayoffs from "./playoff-bracket/FourTeamPlayoffs";
import ModifiedPlayoffs from "./playoff-bracket/ModifiedPlayoffs";
import SixTeamPlayoffs from "./playoff-bracket/SixTeamPlayoffs";
import FiveTeamPlayoffs from "./playoff-bracket/FiveTeamPlayoffs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { CheckCircle, Edit, Save } from "lucide-react";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

const PlayoffBracket = ({ season }: { season: string }) => {
  const { toast } = useToast();
  const seasonNum = Number(season);
  const [editMode, setEditMode] = useState(false);
  const [showActual, setShowActual] = useState(true);
  
  // Fetch playoff and consolation matchups data based on season
  const { data: matchups, isLoading } = useQuery({
    queryKey: ['playoff-matchups', seasonNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchup_scores_view')
        .select('*')
        .eq('season_id', seasonNum)
        .or('is_playoff.eq.true,is_consolation.eq.true')
        .order('week_number');
        
      if (error) throw error;
      return data;
    },
  });

  // Fetch teams data
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Set this to a copy of matchups that can be modified
  const [userBracket, setUserBracket] = useState<any[]>([]);

  // Initialize user bracket when matchups are loaded
  React.useEffect(() => {
    if (matchups) {
      setUserBracket([...matchups]);
    }
  }, [matchups]);

  const handleTeamSelection = (matchupIndex: number, isHome: boolean, teamId: number) => {
    if (!editMode) return;
    
    setUserBracket(prev => {
      const updated = [...prev];
      if (isHome) {
        updated[matchupIndex] = {...updated[matchupIndex], home_team_id: teamId};
      } else {
        updated[matchupIndex] = {...updated[matchupIndex], away_team_id: teamId};
      }
      return updated;
    });
  };

  const handleScoreUpdate = (matchupIndex: number, isHome: boolean, score: number) => {
    if (!editMode) return;
    
    setUserBracket(prev => {
      const updated = [...prev];
      if (isHome) {
        updated[matchupIndex] = {...updated[matchupIndex], home_score: score};
      } else {
        updated[matchupIndex] = {...updated[matchupIndex], away_score: score};
      }
      return updated;
    });
  };

  const handleSaveBracket = () => {
    // In a real app, this would save to the database
    // For now, we'll just toggle edit mode off
    setEditMode(false);
    toast({
      title: "Bracket Saved",
      description: "Your playoff bracket predictions have been saved.",
      variant: "default",
    });
  };

  if (isLoading) {
    return <p className="text-center py-4">Loading playoff data...</p>;
  }

  const displayData = showActual ? matchups : userBracket;

  // Display appropriate bracket based on season
  const renderBracket = () => {
    // Seasons 1-7: 4-team playoffs
    if (seasonNum <= 7) {
      return <FourTeamPlayoffs 
        matchups={displayData || []} 
        editMode={editMode}
        onTeamSelect={handleTeamSelection}
        onScoreUpdate={handleScoreUpdate}
        teams={teams || []}
      />;
    }

    // Seasons 8-10: Modified consolation bracket
    if (seasonNum <= 10) {
      return <ModifiedPlayoffs 
        matchups={displayData || []} 
        editMode={editMode}
        onTeamSelect={handleTeamSelection}
        onScoreUpdate={handleScoreUpdate}
        teams={teams || []}
      />;
    }

    // Seasons 11-12: 6-team playoffs
    if (seasonNum <= 12) {
      return <SixTeamPlayoffs 
        matchups={displayData || []} 
        editMode={editMode}
        onTeamSelect={handleTeamSelection}
        onScoreUpdate={handleScoreUpdate}
        teams={teams || []}
      />;
    }

    // Season 13+: 5-team playoffs
    return <FiveTeamPlayoffs 
      matchups={displayData || []} 
      editMode={editMode}
      onTeamSelect={handleTeamSelection}
      onScoreUpdate={handleScoreUpdate}
      teams={teams || []}
    />;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Playoff Bracket</h2>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-actual"
              checked={showActual}
              onCheckedChange={setShowActual}
              disabled={!editMode}
            />
            <Label htmlFor="show-actual">Show Actual Results</Label>
          </div>
          
          {editMode ? (
            <>
              <Button onClick={handleSaveBracket} variant="default" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Bracket
              </Button>
              <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Fill Bracket
            </Button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="mb-4 p-4 bg-muted rounded-md">
          <h3 className="font-medium flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Bracket Edit Mode
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click on team slots to select teams and enter scores for each matchup.
            Toggle "Show Actual Results" off to enter your predictions.
          </p>
        </div>
      )}

      {renderBracket()}
    </Card>
  );
};

export default PlayoffBracket;
