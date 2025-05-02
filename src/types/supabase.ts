
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: number
          name: string
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      seasons: {
        Row: {
          id: number
          year: number
          season_number: number
          playoff_format: string
          created_at: string
        }
        Insert: {
          id?: number
          year: number
          season_number: number
          playoff_format: string
          created_at?: string
        }
        Update: {
          id?: number
          year?: number
          season_number?: number
          playoff_format?: string
          created_at?: string
        }
      }
      scores: {
        Row: {
          id: number
          season_id: number | null
          week_number: number
          team_id: number | null
          score: number
          created_at: string
        }
        Insert: {
          id?: number
          season_id?: number | null
          week_number: number
          team_id?: number | null
          score: number
          created_at?: string
        }
        Update: {
          id?: number
          season_id?: number | null
          week_number?: number
          team_id?: number | null
          score?: number
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: number
          season_id: number | null
          week_number: number
          home_team_id: number | null
          away_team_id: number | null
          scheduled_time: string | null
          created_at: string | null
          is_playoff: boolean | null
          is_consolation: boolean | null
        }
        Insert: {
          id?: number
          season_id?: number | null
          week_number: number
          home_team_id?: number | null
          away_team_id?: number | null
          scheduled_time?: string | null
          created_at?: string | null
          is_playoff?: boolean | null
          is_consolation?: boolean | null
        }
        Update: {
          id?: number
          season_id?: number | null
          week_number?: number
          home_team_id?: number | null
          away_team_id?: number | null
          scheduled_time?: string | null
          created_at?: string | null
          is_playoff?: boolean | null
          is_consolation?: boolean | null
        }
      }
      trades: {
        Row: {
          id: number
          season_id: number | null
          team1_id: number | null
          team2_id: number | null
          trade_date: string
          created_at: string
        }
        Insert: {
          id?: number
          season_id?: number | null
          team1_id?: number | null
          team2_id?: number | null
          trade_date?: string
          created_at?: string
        }
        Update: {
          id?: number
          season_id?: number | null
          team1_id?: number | null
          team2_id?: number | null
          trade_date?: string
          created_at?: string
        }
      }
      trade_items: {
        Row: {
          id: number
          trade_id: number | null
          from_team_id: number | null
          to_team_id: number | null
          created_at: string
          item_description: string
          item_type: string
        }
        Insert: {
          id?: number
          trade_id?: number | null
          from_team_id?: number | null
          to_team_id?: number | null
          created_at?: string
          item_description: string
          item_type: string
        }
        Update: {
          id?: number
          trade_id?: number | null
          from_team_id?: number | null
          to_team_id?: number | null
          created_at?: string
          item_description?: string
          item_type?: string
        }
      }
      draft_picks: {
        Row: {
          id: number
          season_id: number | null
          round: number
          pick_number: number
          team_id: number | null
          created_at: string
          player_name: string
        }
        Insert: {
          id?: number
          season_id?: number | null
          round: number
          pick_number: number
          team_id?: number | null
          created_at?: string
          player_name: string
        }
        Update: {
          id?: number
          season_id?: number | null
          round?: number
          pick_number?: number
          team_id?: number | null
          created_at?: string
          player_name?: string
        }
      }
    }
    Views: {
      team_records_view: {
        Row: {
          season_id: number | null
          team_id: number | null
          team_name: string | null
          regular_season_wins: number | null
          regular_season_losses: number | null
          regular_season_ties: number | null
          playoff_wins: number | null
          playoff_losses: number | null
          playoff_ties: number | null
          regular_season_points_for: number | null
          regular_season_points_against: number | null
          playoff_points_for: number | null
          playoff_points_against: number | null
        }
      }
      matchup_scores_view: {
        Row: {
          season_id: number | null
          week_number: number | null
          home_team_id: number | null
          away_team_id: number | null
          home_team_name: string | null
          away_team_name: string | null
          home_score: number | null
          away_score: number | null
          scheduled_time: string | null
          is_playoff: boolean | null
          is_playoff_bracket: boolean | null
          is_consolation: boolean | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
