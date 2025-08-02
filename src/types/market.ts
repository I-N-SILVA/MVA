export interface MarketStats {
  total_market_cap: number
  total_athletes: number
  total_investors: number
  total_volume_24h: number
  average_price_change_24h: number
  top_gainers: {
    athlete_id: string
    athlete_name: string
    sport: string
    price_change_percentage: number
    current_price: number
  }[]
  top_losers: {
    athlete_id: string
    athlete_name: string
    sport: string
    price_change_percentage: number
    current_price: number
  }[]
  most_active: {
    athlete_id: string
    athlete_name: string
    sport: string
    volume_24h: number
    current_price: number
  }[]
  trending_sports: {
    sport: string
    athlete_count: number
    total_market_cap: number
    average_price_change: number
  }[]
}

export interface SportMarketData {
  sport: string
  total_athletes: number
  total_market_cap: number
  average_price: number
  price_change_24h: number
  volume_24h: number
  top_athletes: {
    athlete_id: string
    athlete_name: string
    current_price: number
    market_cap: number
  }[]
}

export interface TrendingAthlete {
  athlete_id: string
  athlete_name: string
  sport: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  volume_24h: number
  market_cap: number
  trending_score: number
  trending_reasons: string[]
}

export interface MarketNews {
  id: string
  headline: string
  summary: string
  athlete_ids: string[]
  sport: string
  sentiment: 'positive' | 'neutral' | 'negative'
  source: string
  published_at: string
  impact_score: number
}

export interface PriceAlert {
  id: string
  user_id: string
  athlete_id: string
  alert_type: 'price_above' | 'price_below' | 'percentage_change'
  target_value: number
  current_value: number
  is_triggered: boolean
  created_at: string
  triggered_at?: string
}

export interface MarketHours {
  is_open: boolean
  next_open: string
  next_close: string
  timezone: string
  trading_days: string[]
}

export interface VolatilityData {
  athlete_id: string
  volatility_1d: number
  volatility_7d: number
  volatility_30d: number
  beta: number
  risk_score: number
}

export interface LiquidityData {
  athlete_id: string
  bid_ask_spread: number
  average_daily_volume: number
  market_depth: number
  liquidity_score: number
}

export interface MarketSentiment {
  overall_sentiment: 'bullish' | 'bearish' | 'neutral'
  sentiment_score: number
  bullish_percentage: number
  bearish_percentage: number
  neutral_percentage: number
  sentiment_by_sport: {
    sport: string
    sentiment: 'bullish' | 'bearish' | 'neutral'
    score: number
  }[]
  recent_sentiment_changes: {
    athlete_id: string
    athlete_name: string
    old_sentiment: number
    new_sentiment: number
    change_reason: string
    timestamp: string
  }[]
}

export interface MarketFilters {
  sports?: string[]
  price_range?: {
    min: number
    max: number
  }
  market_cap_range?: {
    min: number
    max: number
  }
  volume_range?: {
    min: number
    max: number
  }
  price_change_range?: {
    min: number
    max: number
  }
  funding_status?: string[]
  sort_by?: 'name' | 'price' | 'market_cap' | 'volume' | 'price_change'
  sort_order?: 'asc' | 'desc'
  search?: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  athlete_id: string
  athlete_name: string
  athlete_sport: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  added_at: string
  notes?: string
}