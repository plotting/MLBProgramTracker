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

export interface WeeklyMatchup {
  id: number;
  season_id: number;
  week_number: number;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  is_playoff: boolean;
  created_at: string;
}