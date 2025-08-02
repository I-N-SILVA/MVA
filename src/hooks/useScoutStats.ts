'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { calculateReputationScore } from '@/lib/utils'

interface ScoutStats {
  totalSubmissions: number
  successfulSubmissions: number
  totalVotes: number
  approvalRate: number
  investmentAccuracy: number
  communityEngagement: number
  discoveryBonus: number
  totalEarnings: number
  recentActivity: any[]
  achievements: Achievement[]
  monthlyStats: MonthlyStats[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedAt: string
}

interface MonthlyStats {
  month: string
  submissions: number
  approvals: number
  votes: number
  earnings: number
}

export function useScoutStats(userId?: string) {
  const [stats, setStats] = useState<ScoutStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchScoutStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get submission stats
        const { data: submissions } = await supabase
          .from('submissions')
          .select('*')
          .eq('submitter_id', userId)

        const totalSubmissions = submissions?.length || 0
        const successfulSubmissions = submissions?.filter(s => s.status === 'approved').length || 0
        const approvalRate = totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0

        // Get voting stats
        const { data: votes } = await supabase
          .from('votes')
          .select(`
            *,
            submissions!votes_submission_id_fkey (
              status
            )
          `)
          .eq('user_id', userId)

        const totalVotes = votes?.length || 0
        
        // Calculate voting accuracy (votes that aligned with final decision)
        const accurateVotes = votes?.filter(vote => {
          const submission = vote.submissions
          if (submission?.status === 'approved' && vote.vote_type === 'for') return true
          if (submission?.status === 'rejected' && vote.vote_type === 'against') return true
          return false
        }).length || 0

        const votingAccuracy = totalVotes > 0 ? (accurateVotes / totalVotes) * 100 : 0

        // Get investment stats
        const { data: investments } = await supabase
          .from('investments')
          .select(`
            *,
            athletes!investments_athlete_id_fkey (
              current_share_price,
              athlete_name
            )
          `)
          .eq('user_id', userId)

        // Calculate investment performance (simplified)
        let totalInvested = 0
        let currentValue = 0
        
        investments?.forEach(investment => {
          if (investment.transaction_type === 'buy') {
            totalInvested += investment.net_amount
            if (investment.athletes) {
              currentValue += investment.shares * investment.athletes.current_share_price
            }
          }
        })

        const investmentAccuracy = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0

        // Calculate community engagement score
        const communityEngagement = Math.min(100, (totalVotes / Math.max(1, totalSubmissions)) * 10)

        // Calculate discovery bonus (first to submit successful athletes)
        const discoveryBonus = Math.min(100, successfulSubmissions * 5)

        // Generate achievements
        const achievements: Achievement[] = []
        
        if (totalSubmissions >= 1) {
          achievements.push({
            id: 'first-submission',
            title: 'First Scout',
            description: 'Made your first athlete submission',
            icon: '🎯',
            earnedAt: submissions?.[0]?.created_at || new Date().toISOString()
          })
        }

        if (successfulSubmissions >= 1) {
          achievements.push({
            id: 'first-approval',
            title: 'Talent Spotter',
            description: 'First athlete approved by community',
            icon: '⭐',
            earnedAt: submissions?.find(s => s.status === 'approved')?.created_at || new Date().toISOString()
          })
        }

        if (approvalRate >= 70 && totalSubmissions >= 5) {
          achievements.push({
            id: 'high-accuracy',
            title: 'Sharp Eye',
            description: '70%+ approval rate with 5+ submissions',
            icon: '🎪',
            earnedAt: new Date().toISOString()
          })
        }

        if (totalVotes >= 50) {
          achievements.push({
            id: 'community-voter',
            title: 'Community Champion',
            description: 'Cast 50+ votes on submissions',
            icon: '🗳️',
            earnedAt: new Date().toISOString()
          })
        }

        // Generate monthly stats (last 6 months)
        const monthlyStats: MonthlyStats[] = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const month = date.toLocaleString('default', { month: 'short', year: 'numeric' })
          
          const monthSubmissions = submissions?.filter(s => {
            const submissionDate = new Date(s.created_at)
            return submissionDate.getMonth() === date.getMonth() && 
                   submissionDate.getFullYear() === date.getFullYear()
          }).length || 0

          const monthApprovals = submissions?.filter(s => {
            const submissionDate = new Date(s.created_at)
            return submissionDate.getMonth() === date.getMonth() && 
                   submissionDate.getFullYear() === date.getFullYear() &&
                   s.status === 'approved'
          }).length || 0

          const monthVotes = votes?.filter(v => {
            const voteDate = new Date(v.created_at)
            return voteDate.getMonth() === date.getMonth() && 
                   voteDate.getFullYear() === date.getFullYear()
          }).length || 0

          monthlyStats.push({
            month,
            submissions: monthSubmissions,
            approvals: monthApprovals,
            votes: monthVotes,
            earnings: monthApprovals * 10 // Simplified earnings calculation
          })
        }

        setStats({
          totalSubmissions,
          successfulSubmissions,
          totalVotes,
          approvalRate,
          investmentAccuracy,
          communityEngagement,
          discoveryBonus,
          totalEarnings: successfulSubmissions * 10, // Simplified
          recentActivity: submissions?.slice(0, 5) || [],
          achievements,
          monthlyStats
        })

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchScoutStats()
  }, [userId])

  return { stats, loading, error }
}