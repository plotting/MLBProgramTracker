import React from "react";
import { MatchupScoresView } from "@/types/database";
import WeekLabels from "./WeekLabels";
import BracketSection from "./BracketSection";
import { 
  filterMatchupsByWeek, 
  getSemiFinalLosers, 
  findThirdPlaceGame 
} from "./utils/bracketUtils";
import type { Team } from "@/types/database";

interface FourTeamPlayoffsProps {
  matchups: MatchupScoresView[];
  editMode?: boolean;
  onTeamSelect?: (matchupId: number, isHome: boolean, teamId: number) => void;
  onScoreUpdate?: (matchupId: number, isHome: boolean, score: number) => void;
  teams?: Team[];
}

const FourTeamPlayoffs: React.FC<FourTeamPlayoffsProps> = ({ 
  matchups, 
  editMode = false,
  onTeamSelect,
  onScoreUpdate,
  teams = [] 
}) => {
  // Filter playoff matchups (non-consolation)
  const playoffMatchups = matchups.filter(
    (matchup) => matchup.is_playoff && !matchup.is_consolation
  );

  // Get semifinal matchups (week 15)
  const semiFinals = filterMatchupsByWeek(matchups, 15, true);

  // Get championship matchup (week 16)
  const championship = playoffMatchups.find(
    (matchup) => matchup.week_number === 16 && 
    !matchup.is_consolation
  );

  // Get week 15 consolation matchups
  const weekFifteenConsolation = filterMatchupsByWeek(matchups, 15, false, true);

  // Get week 16 consolation matchups
  const weekSixteenConsolation = filterMatchupsByWeek(matchups, 16, false, true);
  
  // Find semifinal losers
  const semiFinalLosers = getSemiFinalLosers(semiFinals);
  
  // Find the third place game
  const thirdPlaceGame = findThirdPlaceGame(matchups, semiFinalLosers);

  // Get other consolation games (5th place game, etc.)
  const otherConsolationGames = weekSixteenConsolation.filter(
    (matchup) => matchup !== thirdPlaceGame
  );

  // Prepare data for bracket sections
  const semiFinalsData = semiFinals.map((matchup, index) => ({
    matchupId: index,
    homeTeam: matchup.home_team_name,
    homeTeamId: matchup.home_team_id,
    homeScore: matchup.home_score,
    awayTeam: matchup.away_team_name,
    awayTeamId: matchup.away_team_id,
    awayScore: matchup.away_score,
    isConsolation: false,
  }));

  const consolationSemiFinalsData = weekFifteenConsolation.map((matchup, index) => ({
    matchupId: semiFinals.length + index,
    homeTeam: matchup.home_team_name,
    homeTeamId: matchup.home_team_id,
    homeScore: matchup.home_score,
    awayTeam: matchup.away_team_name,
    awayTeamId: matchup.away_team_id,
    awayScore: matchup.away_score,
    isConsolation: true,
  }));

  const championshipData = championship ? [{
    matchupId: semiFinals.length + weekFifteenConsolation.length,
    homeTeam: championship.home_team_name,
    homeTeamId: championship.home_team_id,
    homeScore: championship.home_score,
    awayTeam: championship.away_team_name,
    awayTeamId: championship.away_team_id,
    awayScore: championship.away_score,
    isConsolation: false,
  }] : [];

  const thirdPlaceData = thirdPlaceGame ? [{
    matchupId: semiFinals.length + weekFifteenConsolation.length + 1,
    homeTeam: thirdPlaceGame.home_team_name,
    homeTeamId: thirdPlaceGame.home_team_id,
    homeScore: thirdPlaceGame.home_score,
    awayTeam: thirdPlaceGame.away_team_name,
    awayTeamId: thirdPlaceGame.away_team_id,
    awayScore: thirdPlaceGame.away_score,
    isConsolation: thirdPlaceGame.is_consolation,
  }] : [];

  // Prepare placement game data
  const placementGames = [
    otherConsolationGames[0] ? {
      title: "5th Place Game",
      data: [{
        matchupId: semiFinals.length + weekFifteenConsolation.length + 2,
        homeTeam: otherConsolationGames[0].home_team_name,
        homeTeamId: otherConsolationGames[0].home_team_id,
        homeScore: otherConsolationGames[0].home_score,
        awayTeam: otherConsolationGames[0].away_team_name,
        awayTeamId: otherConsolationGames[0].away_team_id,
        awayScore: otherConsolationGames[0].away_score,
        isConsolation: true,
      }],
    } : null,
    otherConsolationGames[1] ? {
      title: "7th Place Game",
      data: [{
        matchupId: semiFinals.length + weekFifteenConsolation.length + 3,
        homeTeam: otherConsolationGames[1].home_team_name,
        homeTeamId: otherConsolationGames[1].home_team_id,
        homeScore: otherConsolationGames[1].home_score,
        awayTeam: otherConsolationGames[1].away_team_name,
        awayTeamId: otherConsolationGames[1].away_team_id,
        awayScore: otherConsolationGames[1].away_score,
        isConsolation: true,
      }],
    } : null,
    otherConsolationGames[2] ? {
      title: "9th Place Game",
      data: [{
        matchupId: semiFinals.length + weekFifteenConsolation.length + 4,
        homeTeam: otherConsolationGames[2].home_team_name,
        homeTeamId: otherConsolationGames[2].home_team_id,
        homeScore: otherConsolationGames[2].home_score,
        awayTeam: otherConsolationGames[2].away_team_name,
        awayTeamId: otherConsolationGames[2].away_team_id,
        awayScore: otherConsolationGames[2].away_score,
        isConsolation: true,
      }],
    } : null,
  ].filter(Boolean);

  return (
    <div className="overflow-auto">
      <div className="flex flex-col min-w-[800px]">
        <WeekLabels weeks={[15, 16]} />
        
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-12">
            {/* Semifinals */}
            <BracketSection
              title="Semifinals"
              matchups={semiFinalsData}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
            />

            {/* Consolation Semifinals */}
            {consolationSemiFinalsData.length > 0 && (
              <BracketSection
                title="Consolation"
                matchups={consolationSemiFinalsData}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-12">
            {/* Championship */}
            <BracketSection
              title="Championship"
              matchups={championshipData}
              editMode={editMode}
              onTeamSelect={onTeamSelect}
              onScoreUpdate={onScoreUpdate}
              teams={teams}
            />

            {/* 3rd Place Game */}
            {thirdPlaceData.length > 0 && (
              <BracketSection
                title="3rd Place Game"
                matchups={thirdPlaceData}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
              />
            )}

            {/* Other placement games */}
            {placementGames.map((game, index) => (
              <BracketSection
                key={`placement-${index}`}
                title={game.title}
                matchups={game.data}
                editMode={editMode}
                onTeamSelect={onTeamSelect}
                onScoreUpdate={onScoreUpdate}
                teams={teams}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourTeamPlayoffs;
