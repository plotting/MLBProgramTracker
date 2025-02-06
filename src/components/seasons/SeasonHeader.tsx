
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllSeasons, getSeasonLabel } from "@/utils/seasonUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Team } from "@/types/database";

type SeasonHeaderProps = {
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
};

const SeasonHeader = ({ selectedSeason, setSelectedSeason }: SeasonHeaderProps) => {
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('id');
      
      if (error) throw error;
      console.log('Teams:', data);
      return data as Team[];
    },
  });

  return (
    <header className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {getSeasonLabel(selectedSeason)}
          </h1>
          <p className="text-muted-foreground">League Standings and Weekly Matchups</p>
          {teams && teams.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {teams.map((team) => (
                <span key={team.id} className="text-sm text-white bg-secondary px-2 py-1 rounded">
                  {team.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">Loading teams...</p>
          )}
        </div>
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent>
            {getAllSeasons().reverse().map((season) => (
              <SelectItem key={season.value} value={season.value}>
                {season.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
};

export default SeasonHeader;
