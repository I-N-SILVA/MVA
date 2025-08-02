import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SubmissionRow } from '@/types/submission'

export interface SubmissionWithProfile extends SubmissionRow {
  profiles: {
    username: string
    avatar_url: string | null
    reputation_score: number
  } | null
}

export interface SubmissionFilters {
  sport?: string
  status?: string
  sortBy?: 'newest' | 'most_voted' | 'deadline_approaching' | 'approval_percentage'
  search?: string
}

export interface PaginationInfo {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface SubmissionsState {
  submissions: SubmissionWithProfile[]
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo
}

const DEFAULT_PAGE_SIZE = 12

export function useSubmissions(initialFilters: SubmissionFilters = {}) {
  const [state, setState] = useState<SubmissionsState>({
    submissions: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: 0,
      totalPages: 0
    }
  })

  const [filters, setFilters] = useState<SubmissionFilters>(initialFilters)

  // Fetch submissions with filters and pagination
  const fetchSubmissions = useCallback(async (
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          profiles:submitted_by(username, avatar_url, reputation_score)
        `, { count: 'exact' })

      // Apply filters
      if (filters.sport) {
        query = query.eq('sport', filters.sport)
      }

      if (filters.status) {
        query = query.eq('submission_status', filters.status)
      }

      if (filters.search) {
        query = query.or(`athlete_name.ilike.%${filters.search}%,sport.ilike.%${filters.search}%`)
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'most_voted':
          query = query.order('total_votes', { ascending: false })
          break
        case 'deadline_approaching':
          query = query
            .eq('submission_status', 'pending')
            .order('voting_deadline', { ascending: true })
          break
        case 'approval_percentage':
          query = query.order('votes_for', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / pageSize)

      setState(prev => ({
        ...prev,
        submissions: data || [],
        isLoading: false,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages
        }
      }))
    } catch (error: any) {
      console.error('Error fetching submissions:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch submissions'
      }))
    }
  }, [filters])

  // Fetch a single submission by ID
  const fetchSubmissionById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles:submitted_by(username, avatar_url, reputation_score, full_name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching submission:', error)
      return null
    }
  }, [])

  // Get unique sports for filter dropdown
  const fetchSports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('sport')
        .not('sport', 'is', null)

      if (error) throw error

      const uniqueSports = [...new Set((data || []).map(item => item.sport))]
        .filter(Boolean)
        .sort()

      return uniqueSports
    } catch (error) {
      console.error('Error fetching sports:', error)
      return []
    }
  }, [])

  // Get submission voting progress
  const getSubmissionProgress = useCallback(async (submissionId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_submission_voting_progress', { submission_uuid: submissionId })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching submission progress:', error)
      return null
    }
  }, [])

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: Partial<SubmissionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.pagination.totalPages) {
      fetchSubmissions(page, state.pagination.pageSize)
    }
  }, [fetchSubmissions, state.pagination.totalPages, state.pagination.pageSize])

  // Change page size
  const changePageSize = useCallback((pageSize: number) => {
    fetchSubmissions(1, pageSize)
  }, [fetchSubmissions])

  // Refresh submissions
  const refresh = useCallback(() => {
    fetchSubmissions(state.pagination.page, state.pagination.pageSize)
  }, [fetchSubmissions, state.pagination.page, state.pagination.pageSize])

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchSubmissions(1, DEFAULT_PAGE_SIZE)
  }, [fetchSubmissions])

  return {
    ...state,
    filters,
    fetchSubmissions,
    fetchSubmissionById,
    fetchSports,
    getSubmissionProgress,
    updateFilters,
    goToPage,
    changePageSize,
    refresh,
    hasNextPage: state.pagination.page < state.pagination.totalPages,
    hasPreviousPage: state.pagination.page > 1
  }
}