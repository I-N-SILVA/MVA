import { Database } from './supabase'

export type AthleteRow = Database['public']['Tables']['athletes']['Row']
export type AthleteInsert = Database['public']['Tables']['athletes']['Insert']
export type AthleteUpdate = Database['public']['Tables']['athletes']['Update']

export interface Athlete {
  id: string
  submission_id: string | null
  name: string
  sport: string
  position: string | null
  age: number | null
  height: string | null
  weight: string | null
  nationality: string | null
  current_team: string | null
  previous_teams: string[] | null
  achievements: string[] | null
  stats: Record<string, any>
  media_urls: string[] | null
  video_highlights: string[] | null
  social_media: Record<string, any>
  market_value: number | null
  performance_metrics: Record<string, any>
  career_trajectory: 'rising' | 'peak' | 'declining' | 'unknown'
  investment_potential: number
  total_investments: number
  current_share_price: number
  shares_outstanding: number
  market_cap: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AthleteMarketData {
  athlete_id: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  volume_24h: number
  total_investors: number
  shares_traded_24h: number
  funding_progress: number
  funding_goal: number
}

export interface PriceHistoryPoint {
  timestamp: string
  price: number
  volume: number
  market_cap: number
}

export interface AthleteCardData extends Athlete {
  market_data: AthleteMarketData
  recent_performance: {
    returns_1d: number
    returns_7d: number
    returns_30d: number
  }
  investor_count: number
  trending_score: number
}

export interface AthleteSearchFilters {
  sport?: string
  price_range?: {
    min: number
    max: number
  }
  market_cap_range?: {
    min: number
    max: number
  }
  funding_status?: 'funded' | 'funding' | 'new'
  career_trajectory?: 'rising' | 'peak' | 'declining'
  investment_potential_min?: number
  search_query?: string
}

export interface AthleteSortOptions {
  field: 'name' | 'current_share_price' | 'market_cap' | 'funding_progress' | 'total_investments' | 'created_at'
  direction: 'asc' | 'desc'
}

export interface AthletePerformanceMetrics {
  athlete_id: string
  sport_specific_stats: Record<string, number>
  career_milestones: {
    date: string
    achievement: string
    impact_score: number
  }[]
  recent_news: {
    date: string
    headline: string
    source: string
    sentiment: 'positive' | 'neutral' | 'negative'
  }[]
  social_engagement: {
    followers: number
    engagement_rate: number
    growth_rate: number
  }
}

export type FundingStatus = 'new' | 'funding' | 'funded' | 'oversubscribed'

export interface AthleteWithMarketData extends Athlete {
  market_data: AthleteMarketData
  performance_metrics_extended?: AthletePerformanceMetrics
  funding_status: FundingStatus
  price_history: PriceHistoryPoint[]
}