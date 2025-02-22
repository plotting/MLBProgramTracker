
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
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {getSeasonLabel(selectedSeason)}
          </h1>
          <p className="text-muted-foreground">League Standings and Weekly Matchups</p>
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
