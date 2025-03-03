
import { Card } from "@/components/ui/card";
import { useState } from "react";
import PlayoffBracket from "@/components/PlayoffBracket";
import StandingsTable from "@/components/standings/StandingsTable";
import SeasonHeader from "@/components/seasons/SeasonHeader";
import DraftPicksTable from "@/components/seasons/DraftPicksTable";

const Seasons = () => {
  const [selectedSeason, setSelectedSeason] = useState("1");
  const seasonNumber = parseInt(selectedSeason);

  return (
    <div className="min-h-screen space-y-8">
      <SeasonHeader 
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
      />

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">League Standings</h2>
          <StandingsTable seasonId={parseInt(selectedSeason)} />
        </div>
      </Card>

      {/* Show draft picks table for season 2 and beyond */}
      {seasonNumber >= 2 && (
        <DraftPicksTable seasonId={seasonNumber} />
      )}

      <PlayoffBracket season={selectedSeason} />
    </div>
  );
};

export default Seasons;
