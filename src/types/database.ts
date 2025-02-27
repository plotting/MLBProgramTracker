
export interface Team {
  id: number;
  name: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: number;
  year: number;
  season_number: number;
  playoff_format: string;
  created_at: string;
}

export interface Score {
  id: number;
  season_id: number;
  week_number: number;
  team_id: number;
  score: number;
  created_at: string;
}

export interface MatchupScoresView {
  season_id: number;
  week_number: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  scheduled_time: string | null;
  is_playoff: boolean;
  is_playoff_bracket: boolean;
  is_consolation: boolean;
}

export interface TeamRecordsView {
  season_id: number;
  team_id: number;
  team_name: string;
  regular_season_wins: number;
  regular_season_losses: number;
  regular_season_ties: number;
  playoff_wins: number;
  playoff_losses: number;
  playoff_ties: number;
  regular_season_points_for: number;
  regular_season_points_against: number;
  playoff_points_for: number;
  playoff_points_against: number;
}
