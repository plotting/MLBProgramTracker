
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllSeasons } from "@/utils/seasonUtils";

type SeasonSelectorProps = {
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
};

const SeasonSelector = ({ selectedSeason, onSeasonChange }: SeasonSelectorProps) => {
  return (
    <Select value={selectedSeason} onValueChange={onSeasonChange}>
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
  );
};

export default SeasonSelector;
