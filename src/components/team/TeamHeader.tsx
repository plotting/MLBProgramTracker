
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllSeasons } from "@/utils/seasonUtils";

interface TeamHeaderProps {
  teamName: string;
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
}

const TeamHeader = ({ teamName, selectedSeason, setSelectedSeason }: TeamHeaderProps) => {
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{teamName}</h1>
          <p className="text-muted-foreground">Team Statistics</p>
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

export default TeamHeader;
