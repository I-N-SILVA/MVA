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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          role: 'scout' | 'fan' | 'athlete'
          reputation_score: number
          avatar_url: string | null
          bio: string | null
          location: string | null
          social_links: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          role?: 'scout' | 'fan' | 'athlete'
          reputation_score?: number
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          role?: 'scout' | 'fan' | 'athlete'
          reputation_score?: number
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          submitter_id: string
          athlete_name: string
          sport: string
          position: string | null
          age: number
          location: string
          achievements: string[]
          stats: Json
          competition_level: 'amateur' | 'semi_pro' | 'professional'
          background_story: string
          why_invest: string
          future_goals: string
          contact_email: string | null
          social_links: Json | null
          profile_image_url: string | null
          video_urls: string[]
          document_urls: string[]
          status: 'pending' | 'under_review' | 'approved' | 'rejected'
          votes_for: number
          votes_against: number
          total_votes: number
          voting_deadline: string
          submission_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submitter_id: string
          athlete_name: string
          sport: string
          position?: string | null
          age: number
          location: string
          achievements?: string[]
          stats?: Json
          competition_level?: 'amateur' | 'semi_pro' | 'professional'
          background_story: string
          why_invest: string
          future_goals: string
          contact_email?: string | null
          social_links?: Json | null
          profile_image_url?: string | null
          video_urls?: string[]
          document_urls?: string[]
          status?: 'pending' | 'under_review' | 'approved' | 'rejected'
          votes_for?: number
          votes_against?: number
          total_votes?: number
          voting_deadline?: string
          submission_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          submitter_id?: string
          athlete_name?: string
          sport?: string
          position?: string | null
          age?: number
          location?: string
          achievements?: string[]
          stats?: Json
          competition_level?: 'amateur' | 'semi_pro' | 'professional'
          background_story?: string
          why_invest?: string
          future_goals?: string
          contact_email?: string | null
          social_links?: Json | null
          profile_image_url?: string | null
          video_urls?: string[]
          document_urls?: string[]
          status?: 'pending' | 'under_review' | 'approved' | 'rejected'
          votes_for?: number
          votes_against?: number
          total_votes?: number
          voting_deadline?: string
          submission_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          submission_id: string
          user_id: string
          vote_type: 'for' | 'against'
          confidence_level: number
          reasoning: string | null
          expertise_areas: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          user_id: string
          vote_type: 'for' | 'against'
          confidence_level?: number
          reasoning?: string | null
          expertise_areas?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          user_id?: string
          vote_type?: 'for' | 'against'
          confidence_level?: number
          reasoning?: string | null
          expertise_areas?: string[] | null
          created_at?: string
        }
      }
      athletes: {
        Row: {
          id: string
          submission_id: string
          athlete_name: string
          sport: string
          position: string | null
          current_share_price: number
          total_shares: number
          market_cap: number
          funding_goal: number
          current_funding: number
          performance_metrics: Json | null
          career_highlights: string[] | null
          previous_teams: string[] | null
          status: 'active' | 'retired' | 'injured' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          athlete_name: string
          sport: string
          position?: string | null
          current_share_price?: number
          total_shares?: number
          market_cap?: number
          funding_goal: number
          current_funding?: number
          performance_metrics?: Json | null
          career_highlights?: string[] | null
          previous_teams?: string[] | null
          status?: 'active' | 'retired' | 'injured' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          athlete_name?: string
          sport?: string
          position?: string | null
          current_share_price?: number
          total_shares?: number
          market_cap?: number
          funding_goal?: number
          current_funding?: number
          performance_metrics?: Json | null
          career_highlights?: string[] | null
          previous_teams?: string[] | null
          status?: 'active' | 'retired' | 'injured' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          athlete_id: string
          transaction_type: 'buy' | 'sell'
          shares: number
          price_per_share: number
          total_amount: number
          transaction_fee: number
          net_amount: number
          reasoning: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          athlete_id: string
          transaction_type: 'buy' | 'sell'
          shares: number
          price_per_share: number
          total_amount?: number
          transaction_fee?: number
          net_amount?: number
          reasoning?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          athlete_id?: string
          transaction_type?: 'buy' | 'sell'
          shares?: number
          price_per_share?: number
          total_amount?: number
          transaction_fee?: number
          net_amount?: number
          reasoning?: string | null
          created_at?: string
        }
      }
      sports_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          common_positions: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          common_positions?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          common_positions?: string[] | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_portfolio_value: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      get_trending_athletes: {
        Args: {
          limit_count?: number
        }
        Returns: {
          athlete_id: string
          athlete_name: string
          sport: string
          total_investment: number
          investor_count: number
          current_share_price: number
        }[]
      }
      get_submission_voting_progress: {
        Args: {
          submission_id: string
        }
        Returns: {
          total_votes: number
          votes_for: number
          votes_against: number
          approval_percentage: number
          time_remaining_hours: number
          status: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}