'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface LeaderboardEntry {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  reputation_score: number
  user_type: 'scout' | 'fan' | 'athlete'
  total_votes_cast: number
  successful_votes: number
  voting_accuracy: number
  rank: number
  trend: 'up' | 'down' | 'stable'
  badge: {
    level: string
    color: string
    bgColor: string
  }
  stats: {
    submissions: number
    approved_submissions: number
    success_rate: number
    recent_activity: number
  }
}

export interface LeaderboardFilters {
  timeframe: 'all_time' | 'monthly' | 'weekly'
  category: 'reputation' | 'accuracy' | 'activity' | 'submissions'
  sport?: string
  userType: 'all' | 'scout' | 'fan' | 'athlete'
}

export interface LeaderboardStats {
  totalUsers: number
  averageReputation: number
  topPerformer: LeaderboardEntry | null
  yourRank: number | null
  yourPercentile: number | null
}

const getReputationBadge = (score: number) => {
  if (score < 50) return { level: 'Rookie', color: 'text-gray-600', bgColor: 'bg-gray-100' }
  if (score < 150) return { level: 'Scout', color: 'text-blue-600', bgColor: 'bg-blue-100' }
  if (score < 300) return { level: 'Expert', color: 'text-green-600', bgColor: 'bg-green-100' }
  if (score < 500) return { level: 'Elite', color: 'text-purple-600', bgColor: 'bg-purple-100' }
  return { level: 'Legend', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
}

export function useLeaderboard(filters: LeaderboardFilters = {
  timeframe: 'all_time',
  category: 'reputation',
  userType: 'all'
}) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build the query based on filters
      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          reputation_score,
          user_type,
          total_votes_cast,
          successful_votes,
          created_at
        `)

      // Apply user type filter
      if (filters.userType !== 'all') {
        query = query.eq('user_type', filters.userType)
      }

      // For now, we'll order by the selected category
      // In a real implementation, you'd have more sophisticated filtering
      switch (filters.category) {
        case 'reputation':
          query = query.order('reputation_score', { ascending: false })
          break
        case 'accuracy':
          // We'll calculate this client-side since it requires computation
          query = query.order('successful_votes', { ascending: false })
          break
        case 'activity':
          query = query.order('total_votes_cast', { ascending: false })
          break
        case 'submissions':
          // This would require a join or separate query
          query = query.order('reputation_score', { ascending: false })
          break
      }

      query = query.limit(100) // Limit to top 100

      const { data: profiles, error: profilesError } = await query

      if (profilesError) throw profilesError

      if (!profiles) {
        setLeaderboard([])
        return
      }

      // For each profile, we need to get additional stats
      const leaderboardPromises = profiles.map(async (profile, index) => {
        // Get submission stats
        const { data: submissions } = await supabase
          .from('submissions')
          .select('id, status, created_at')
          .eq('submitted_by', profile.id)

        const submissionCount = submissions?.length || 0
        const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0
        const submissionSuccessRate = submissionCount > 0 ? approvedSubmissions / submissionCount : 0

        // Calculate recent activity (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentSubmissions = submissions?.filter(s => 
          new Date(s.created_at) >= thirtyDaysAgo
        ).length || 0

        // Get recent votes (simplified - in real app you'd query votes table)
        const recentActivity = recentSubmissions + Math.floor(profile.total_votes_cast * 0.1) // Simplified

        // Calculate voting accuracy
        const votingAccuracy = profile.total_votes_cast > 0 
          ? profile.successful_votes / profile.total_votes_cast 
          : 0

        // Determine trend (simplified - would need historical data)
        const trend: 'up' | 'down' | 'stable' = profile.reputation_score > 100 ? 'up' : 
                     profile.reputation_score < 50 ? 'down' : 'stable'

        const entry: LeaderboardEntry = {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          reputation_score: profile.reputation_score,
          user_type: profile.user_type as 'scout' | 'fan' | 'athlete',
          total_votes_cast: profile.total_votes_cast,
          successful_votes: profile.successful_votes,
          voting_accuracy: votingAccuracy,
          rank: index + 1,
          trend,
          badge: getReputationBadge(profile.reputation_score),
          stats: {
            submissions: submissionCount,
            approved_submissions: approvedSubmissions,
            success_rate: submissionSuccessRate,
            recent_activity: recentActivity
          }
        }

        return entry
      })

      const leaderboardEntries = await Promise.all(leaderboardPromises)

      // Re-sort based on the selected category after getting full data
      let sortedEntries = [...leaderboardEntries]
      switch (filters.category) {
        case 'reputation':
          sortedEntries.sort((a, b) => b.reputation_score - a.reputation_score)
          break
        case 'accuracy':
          sortedEntries.sort((a, b) => b.voting_accuracy - a.voting_accuracy)
          break
        case 'activity':
          sortedEntries.sort((a, b) => b.stats.recent_activity - a.stats.recent_activity)
          break
        case 'submissions':
          sortedEntries.sort((a, b) => b.stats.approved_submissions - a.stats.approved_submissions)
          break
      }

      // Update ranks after sorting
      sortedEntries = sortedEntries.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

      setLeaderboard(sortedEntries)

      // Calculate stats
      const totalUsers = sortedEntries.length
      const averageReputation = totalUsers > 0 
        ? sortedEntries.reduce((sum, entry) => sum + entry.reputation_score, 0) / totalUsers
        : 0
      const topPerformer = sortedEntries[0] || null

      // Get current user's rank (would need user context for this)
      // For now, we'll set it to null
      const yourRank = null
      const yourPercentile = null

      setStats({
        totalUsers,
        averageReputation,
        topPerformer,
        yourRank,
        yourPercentile
      })

    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRank = async (userId: string) => {
    if (!stats) return

    try {
      const userEntry = leaderboard.find(entry => entry.id === userId)
      if (userEntry) {
        const userRank = userEntry.rank
        const userPercentile = stats.totalUsers > 0 
          ? ((stats.totalUsers - userRank + 1) / stats.totalUsers) * 100
          : 0

        setStats(prev => prev ? {
          ...prev,
          yourRank: userRank,
          yourPercentile: userPercentile
        } : null)
      }
    } catch (err) {
      console.error('Error fetching user rank:', err)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [filters.timeframe, filters.category, filters.userType, filters.sport])

  // Set up real-time subscriptions for reputation changes
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'reputation_score=neq.null'
        },
        () => {
          // Refresh leaderboard when any user's reputation changes
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const refreshLeaderboard = () => {
    fetchLeaderboard()
  }

  const getTopPerformers = (limit: number = 3) => {
    return leaderboard.slice(0, limit)
  }

  const getRankRange = (startRank: number, endRank: number) => {
    return leaderboard.filter(entry => 
      entry.rank >= startRank && entry.rank <= endRank
    )
  }

  const searchUsers = (searchTerm: string) => {
    if (!searchTerm.trim()) return leaderboard

    const term = searchTerm.toLowerCase()
    return leaderboard.filter(entry =>
      entry.username?.toLowerCase().includes(term) ||
      entry.full_name?.toLowerCase().includes(term)
    )
  }

  return {
    leaderboard,
    stats,
    loading,
    error,
    refreshLeaderboard,
    fetchUserRank,
    getTopPerformers,
    getRankRange,
    searchUsers
  }
}