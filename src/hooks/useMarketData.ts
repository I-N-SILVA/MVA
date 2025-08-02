'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MarketStats, TrendingAthlete, SportMarketData } from '@/types/market'

interface UseMarketDataResult {
  marketStats: MarketStats | null
  trendingAthletes: TrendingAthlete[]
  sportData: SportMarketData[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

// Mock data generators for simulation
const generateMockMarketStats = (athletes: any[]): MarketStats => {
  const totalAthletes = athletes.length
  const totalMarketCap = athletes.reduce((sum, a) => sum + (a.market_cap || 0), 0)
  const totalVolume24h = totalAthletes * (Math.random() * 50000 + 10000)
  const avgPriceChange = (Math.random() - 0.5) * 10

  // Generate top gainers/losers
  const athletesWithChange = athletes.map(a => ({
    ...a,
    price_change_percentage: (Math.random() - 0.5) * 20
  }))

  const topGainers = athletesWithChange
    .filter(a => a.price_change_percentage > 0)
    .sort((a, b) => b.price_change_percentage - a.price_change_percentage)
    .slice(0, 5)
    .map(a => ({
      athlete_id: a.id,
      athlete_name: a.name,
      sport: a.sport,
      price_change_percentage: a.price_change_percentage,
      current_price: a.current_share_price || 100
    }))

  const topLosers = athletesWithChange
    .filter(a => a.price_change_percentage < 0)
    .sort((a, b) => a.price_change_percentage - b.price_change_percentage)
    .slice(0, 5)
    .map(a => ({
      athlete_id: a.id,
      athlete_name: a.name,
      sport: a.sport,
      price_change_percentage: a.price_change_percentage,
      current_price: a.current_share_price || 100
    }))

  const mostActive = athletes
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map(a => ({
      athlete_id: a.id,
      athlete_name: a.name,
      sport: a.sport,
      volume_24h: Math.random() * 100000 + 20000,
      current_price: a.current_share_price || 100
    }))

  // Group by sport for trending sports
  const sportGroups = athletes.reduce((acc, athlete) => {
    if (!acc[athlete.sport]) {
      acc[athlete.sport] = []
    }
    acc[athlete.sport].push(athlete)
    return acc
  }, {} as Record<string, any[]>)

  const trendingSports = Object.entries(sportGroups).map(([sport, sportAthletes]) => ({
    sport,
    athlete_count: sportAthletes.length,
    total_market_cap: sportAthletes.reduce((sum, a) => sum + (a.market_cap || 0), 0),
    average_price_change: (Math.random() - 0.5) * 15
  }))

  return {
    total_market_cap: totalMarketCap,
    total_athletes: totalAthletes,
    total_investors: Math.floor(totalAthletes * 50 + Math.random() * 1000),
    total_volume_24h: totalVolume24h,
    average_price_change_24h: avgPriceChange,
    top_gainers: topGainers,
    top_losers: topLosers,
    most_active: mostActive,
    trending_sports: trendingSports.sort((a, b) => b.average_price_change - a.average_price_change)
  }
}

const generateTrendingAthletes = (athletes: any[]): TrendingAthlete[] => {
  return athletes
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map((athlete, index) => {
      const priceChange24h = (Math.random() - 0.3) * 20 // Bias towards positive for trending
      const volume24h = Math.random() * 100000 + 50000
      const basePrice = athlete.current_share_price || 100

      return {
        athlete_id: athlete.id,
        athlete_name: athlete.name,
        sport: athlete.sport,
        current_price: basePrice,
        price_change_24h: priceChange24h,
        price_change_percentage_24h: (priceChange24h / basePrice) * 100,
        volume_24h: volume24h,
        market_cap: athlete.market_cap || basePrice * 1000000,
        trending_score: (10 - index) / 10, // Decreasing score based on position
        trending_reasons: [
          'High trading volume',
          'Recent performance update',
          'Social media buzz',
          'News coverage',
          'Investor interest'
        ].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1)
      }
    })
}

const generateSportMarketData = (athletes: any[]): SportMarketData[] => {
  const sportGroups = athletes.reduce((acc, athlete) => {
    if (!acc[athlete.sport]) {
      acc[athlete.sport] = []
    }
    acc[athlete.sport].push(athlete)
    return acc
  }, {} as Record<string, any[]>)

  return Object.entries(sportGroups).map(([sport, sportAthletes]) => {
    const totalMarketCap = sportAthletes.reduce((sum, a) => sum + (a.market_cap || 0), 0)
    const avgPrice = sportAthletes.reduce((sum, a) => sum + (a.current_share_price || 100), 0) / sportAthletes.length

    return {
      sport,
      total_athletes: sportAthletes.length,
      total_market_cap: totalMarketCap,
      average_price: avgPrice,
      price_change_24h: (Math.random() - 0.5) * 10,
      volume_24h: sportAthletes.length * (Math.random() * 30000 + 10000),
      top_athletes: sportAthletes
        .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
        .slice(0, 3)
        .map(a => ({
          athlete_id: a.id,
          athlete_name: a.name,
          current_price: a.current_share_price || 100,
          market_cap: a.market_cap || 0
        }))
    }
  })
}

export function useMarketData(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options
  
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null)
  const [trendingAthletes, setTrendingAthletes] = useState<TrendingAthlete[]>([])
  const [sportData, setSportData] = useState<SportMarketData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchMarketData = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all active athletes to calculate market stats
      const { data: athletes, error: athletesError } = await supabase
        .from('athletes')
        .select('*')
        .eq('is_active', true)

      if (athletesError) throw athletesError

      if (athletes && athletes.length > 0) {
        // Generate mock market data based on real athlete data
        const stats = generateMockMarketStats(athletes)
        const trending = generateTrendingAthletes(athletes)
        const sports = generateSportMarketData(athletes)

        setMarketStats(stats)
        setTrendingAthletes(trending)
        setSportData(sports)
      } else {
        // No athletes found, set empty states
        setMarketStats({
          total_market_cap: 0,
          total_athletes: 0,
          total_investors: 0,
          total_volume_24h: 0,
          average_price_change_24h: 0,
          top_gainers: [],
          top_losers: [],
          most_active: [],
          trending_sports: []
        })
        setTrendingAthletes([])
        setSportData([])
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data'
      setError(errorMessage)
      console.error('Error fetching market data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, enabled])

  // Initial fetch
  useEffect(() => {
    fetchMarketData()
  }, [fetchMarketData])

  // Auto-refresh market data every 5 minutes
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      fetchMarketData()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchMarketData, enabled])

  const refresh = useCallback(() => {
    fetchMarketData()
  }, [fetchMarketData])

  return {
    marketStats,
    trendingAthletes,
    sportData,
    isLoading,
    error,
    refresh
  }
}

// Hook for getting trending athletes specifically
export function useTrendingAthletes(limit: number = 10) {
  const { trendingAthletes, isLoading, error, refresh } = useMarketData()

  const limitedTrending = useMemo(() => {
    return trendingAthletes.slice(0, limit)
  }, [trendingAthletes, limit])

  return {
    trendingAthletes: limitedTrending,
    isLoading,
    error,
    refresh
  }
}

// Hook for getting market data for a specific sport
export function useSportMarketData(sport: string) {
  const { sportData, isLoading, error, refresh } = useMarketData()

  const sportMarketData = useMemo(() => {
    return sportData.find(data => data.sport === sport) || null
  }, [sportData, sport])

  return {
    sportMarketData,
    isLoading,
    error,
    refresh
  }
}