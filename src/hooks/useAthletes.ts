'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AthleteCardData, AthleteSearchFilters, AthleteSortOptions, AthleteMarketData } from '@/types/athlete'

interface UseAthletesResult {
  athletes: AthleteCardData[]
  isLoading: boolean
  error: string | null
  sports: string[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  } | null
  goToPage: (page: number) => void
  refresh: () => void
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface UseAthletesOptions {
  pageSize?: number
  enabled?: boolean
}

// Mock market data generator for simulation
const generateMockMarketData = (athlete: any): AthleteMarketData => {
  const basePrice = athlete.current_share_price || 100
  const randomChange = (Math.random() - 0.5) * 20 // -10% to +10%
  const priceChange24h = randomChange
  const volume24h = Math.random() * 50000 + 10000
  
  return {
    athlete_id: athlete.id,
    current_price: basePrice,
    price_change_24h: priceChange24h,
    price_change_percentage_24h: (priceChange24h / basePrice) * 100,
    market_cap: athlete.market_cap || basePrice * (athlete.shares_outstanding || 1000000),
    volume_24h: volume24h,
    total_investors: Math.floor(Math.random() * 500) + 10,
    shares_traded_24h: Math.floor(volume24h / basePrice),
    funding_progress: (athlete.total_investments / (athlete.market_value || 1000000)) * 100,
    funding_goal: athlete.market_value || 1000000
  }
}

// Mock recent performance data
const generateMockPerformance = () => ({
  returns_1d: (Math.random() - 0.5) * 10,
  returns_7d: (Math.random() - 0.5) * 20,
  returns_30d: (Math.random() - 0.5) * 40
})

export function useAthletes(
  filters: AthleteSearchFilters = {},
  sortOptions: AthleteSortOptions = { field: 'market_cap', direction: 'desc' },
  options: UseAthletesOptions = {}
) {
  const { pageSize = 12, enabled = true } = options
  
  const [athletes, setAthletes] = useState<AthleteCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sports, setSports] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const supabase = createClient()

  // Fetch sports for filter dropdown
  const fetchSports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('sport')
        .eq('is_active', true)
      
      if (error) throw error
      
      const uniqueSports = [...new Set(data?.map(item => item.sport) || [])]
      setSports(uniqueSports.sort())
    } catch (err) {
      console.error('Error fetching sports:', err)
    }
  }, [supabase])

  // Build query based on filters and sorting
  const fetchAthletes = useCallback(async (page: number = 1) => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('athletes')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Apply filters
      if (filters.sport) {
        query = query.eq('sport', filters.sport)
      }

      if (filters.search_query) {
        query = query.or(`name.ilike.%${filters.search_query}%,sport.ilike.%${filters.search_query}%,current_team.ilike.%${filters.search_query}%`)
      }

      if (filters.price_range) {
        if (filters.price_range.min > 0) {
          query = query.gte('current_share_price', filters.price_range.min)
        }
        if (filters.price_range.max < 999999) {
          query = query.lte('current_share_price', filters.price_range.max)
        }
      }

      if (filters.market_cap_range) {
        if (filters.market_cap_range.min > 0) {
          query = query.gte('market_cap', filters.market_cap_range.min)
        }
        if (filters.market_cap_range.max < 999999999) {
          query = query.lte('market_cap', filters.market_cap_range.max)
        }
      }

      if (filters.career_trajectory) {
        query = query.eq('career_trajectory', filters.career_trajectory)
      }

      if (filters.investment_potential_min) {
        query = query.gte('investment_potential', filters.investment_potential_min)
      }

      // Apply sorting
      const ascending = sortOptions.direction === 'asc'
      query = query.order(sortOptions.field, { ascending })

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      // Transform data to include market data and performance metrics
      const athletesWithMarketData: AthleteCardData[] = (data || []).map(athlete => ({
        ...athlete,
        market_data: generateMockMarketData(athlete),
        recent_performance: generateMockPerformance(),
        investor_count: Math.floor(Math.random() * 500) + 10,
        trending_score: Math.random()
      }))

      setAthletes(athletesWithMarketData)
      setTotalCount(count || 0)
      setCurrentPage(page)

    } catch (err) {
      // Provide user-friendly error messages based on common issues
      let errorMessage = 'Unable to load athletes. Please try again.'
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('network')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.'
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
        } else if (err.message.includes('unauthorized') || err.message.includes('permission')) {
          errorMessage = 'Access denied. Please sign in and try again.'
        } else if (err.message.includes('not found')) {
          errorMessage = 'Athletes data not found. This might be a temporary issue.'
        } else if (err.message.includes('server') || err.message.includes('500')) {
          errorMessage = 'Server error occurred. Please try again in a few moments.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      console.error('Error fetching athletes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filters, sortOptions, pageSize, enabled])

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    fetchAthletes(1)
    fetchSports()
  }, [fetchAthletes, fetchSports])

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    fetchAthletes(page)
  }, [fetchAthletes])

  const refresh = useCallback(() => {
    fetchAthletes(currentPage)
  }, [fetchAthletes, currentPage])

  // Computed values
  const pagination = useMemo(() => {
    if (totalCount === 0) return null
    
    return {
      page: currentPage,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    }
  }, [currentPage, pageSize, totalCount])

  const hasNextPage = useMemo(() => {
    return pagination ? currentPage < pagination.totalPages : false
  }, [currentPage, pagination])

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1
  }, [currentPage])

  return {
    athletes,
    isLoading,
    error,
    sports,
    pagination,
    goToPage,
    refresh,
    hasNextPage,
    hasPreviousPage
  }
}

// Hook for getting a single athlete by ID
export function useAthlete(athleteId: string) {
  const [athlete, setAthlete] = useState<AthleteCardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!athleteId) return

    const fetchAthlete = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('athletes')
          .select('*')
          .eq('id', athleteId)
          .eq('is_active', true)
          .single()

        if (error) throw error

        if (data) {
          const athleteWithMarketData: AthleteCardData = {
            ...data,
            market_data: generateMockMarketData(data),
            recent_performance: generateMockPerformance(),
            investor_count: Math.floor(Math.random() * 500) + 10,
            trending_score: Math.random()
          }
          setAthlete(athleteWithMarketData)
        }

      } catch (err) {
        // Provide user-friendly error messages for single athlete fetch
        let errorMessage = 'Unable to load athlete details. Please try again.'
        
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch') || err.message.includes('network')) {
            errorMessage = 'Network connection error. Please check your internet connection and try again.'
          } else if (err.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.'
          } else if (err.message.includes('No rows returned')) {
            errorMessage = 'Athlete not found. This athlete may have been removed or is no longer available.'
          } else if (err.message.includes('unauthorized') || err.message.includes('permission')) {
            errorMessage = 'Access denied. Please sign in and try again.'
          } else if (err.message.includes('server') || err.message.includes('500')) {
            errorMessage = 'Server error occurred. Please try again in a few moments.'
          } else {
            errorMessage = err.message
          }
        }
        
        setError(errorMessage)
        console.error('Error fetching athlete:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAthlete()
  }, [athleteId, supabase])

  const refresh = useCallback(() => {
    if (!athleteId) return
    
    const fetchAthlete = async () => {
      try {
        const { data, error } = await supabase
          .from('athletes')
          .select('*')
          .eq('id', athleteId)
          .eq('is_active', true)
          .single()

        if (error) throw error

        if (data) {
          const athleteWithMarketData: AthleteCardData = {
            ...data,
            market_data: generateMockMarketData(data),
            recent_performance: generateMockPerformance(),
            investor_count: Math.floor(Math.random() * 500) + 10,
            trending_score: Math.random()
          }
          setAthlete(athleteWithMarketData)
        }
      } catch (err) {
        console.error('Error refreshing athlete:', err)
      }
    }

    fetchAthlete()
  }, [athleteId, supabase])

  return {
    athlete,
    isLoading,
    error,
    refresh
  }
}