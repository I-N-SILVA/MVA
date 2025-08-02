import { Database } from './supabase'

export type InvestmentRow = Database['public']['Tables']['investments']['Row']
export type InvestmentInsert = Database['public']['Tables']['investments']['Insert']
export type InvestmentUpdate = Database['public']['Tables']['investments']['Update']

export interface Investment {
  id: string
  investor_id: string
  athlete_id: string
  investment_type: 'buy' | 'sell'
  shares: number
  price_per_share: number
  total_amount: number
  transaction_fee: number
  net_amount: number
  reasoning: string | null
  created_at: string
}

export interface InvestmentTransaction {
  id: string
  investor_id: string
  athlete_id: string
  athlete_name: string
  athlete_sport: string
  transaction_type: 'buy' | 'sell'
  shares: number
  price_per_share: number
  total_amount: number
  transaction_fee: number
  net_amount: number
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
  reasoning?: string
}

export interface Portfolio {
  total_value: number
  total_invested: number
  total_returns: number
  returns_percentage: number
  positions: PortfolioPosition[]
  recent_transactions: InvestmentTransaction[]
}

export interface PortfolioPosition {
  athlete_id: string
  athlete_name: string
  athlete_sport: string
  shares_owned: number
  average_buy_price: number
  current_price: number
  total_invested: number
  current_value: number
  unrealized_pnl: number
  unrealized_pnl_percentage: number
  percentage_of_portfolio: number
  last_updated: string
}

export interface InvestmentSimulation {
  athlete_id: string
  shares: number
  estimated_price: number
  estimated_total: number
  estimated_fee: number
  estimated_net_amount: number
  price_impact: number
  available_shares: number
  min_order_size: number
  max_order_size: number
}

export interface MarketOrder {
  athlete_id: string
  type: 'buy' | 'sell'
  shares: number
  order_type: 'market' | 'limit'
  limit_price?: number
  reasoning?: string
}

export interface OrderBook {
  athlete_id: string
  buy_orders: {
    price: number
    shares: number
    total_shares_at_price: number
  }[]
  sell_orders: {
    price: number
    shares: number
    total_shares_at_price: number
  }[]
  last_trade_price: number
  bid_ask_spread: number
}

export interface InvestorStats {
  user_id: string
  total_portfolio_value: number
  total_invested: number
  total_returns: number
  win_rate: number
  best_performing_athlete: {
    athlete_id: string
    athlete_name: string
    returns_percentage: number
  } | null
  worst_performing_athlete: {
    athlete_id: string
    athlete_name: string
    returns_percentage: number
  } | null
  total_transactions: number
  favorite_sports: string[]
  investment_style: 'conservative' | 'moderate' | 'aggressive'
  portfolio_diversification_score: number
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url?: string
  total_returns: number
  returns_percentage: number
  portfolio_value: number
  win_rate: number
  total_investments: number
  badge?: 'top_investor' | 'rising_star' | 'diversified' | 'sports_expert'
}

export interface InvestmentAlert {
  id: string
  user_id: string
  athlete_id: string
  athlete_name: string
  alert_type: 'price_target' | 'percentage_change' | 'news' | 'performance'
  condition: {
    type: 'above' | 'below' | 'change'
    value: number
    timeframe?: '1h' | '24h' | '7d' | '30d'
  }
  is_active: boolean
  triggered_at?: string
  created_at: string
}