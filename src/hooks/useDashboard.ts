'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface DashboardData {
  recentActivity: any[]
  pendingSubmissions: number
  approvedAthletes: number
  totalInvestments: number
  portfolioValue: number
}

export function useDashboard(userId?: string) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get recent activity
        const { data: recentActivity } = await supabase
          .from('submissions')
          .select(`
            id,
            athlete_name,
            sport,
            status,
            created_at,
            votes_for,
            votes_against,
            submitter_id,
            profiles!submissions_submitter_id_fkey (
              username,
              full_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10)

        // Get pending submissions count
        const { count: pendingCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        // Get approved athletes count
        const { count: approvedCount } = await supabase
          .from('athletes')
          .select('*', { count: 'exact', head: true })

        // Get user's total investments
        const { data: investments } = await supabase
          .from('investments')
          .select('net_amount')
          .eq('user_id', userId)

        const totalInvestments = investments?.reduce((sum, inv) => sum + inv.net_amount, 0) || 0

        // Get portfolio value using the database function
        const { data: portfolioData } = await supabase
          .rpc('get_user_portfolio_value', { user_id: userId })

        setDashboardData({
          recentActivity: recentActivity || [],
          pendingSubmissions: pendingCount || 0,
          approvedAthletes: approvedCount || 0,
          totalInvestments,
          portfolioValue: portfolioData || 0
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'submissions' },
        () => fetchDashboardData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => fetchDashboardData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'investments', filter: `user_id=eq.${userId}` },
        () => fetchDashboardData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { dashboardData, loading, error }
}