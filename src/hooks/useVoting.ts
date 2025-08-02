import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { VoteData } from '@/lib/validations/athlete'
import { useAuth } from './useAuth'

export interface Vote {
  id: string
  submission_id: string
  voter_id: string
  vote_type: 'for' | 'against'
  confidence_level: number
  reasoning?: string
  expertise_areas?: string[]
  created_at: string
}

export interface VotingState {
  userVote: Vote | null
  isVoting: boolean
  error: string | null
}

export function useVoting(submissionId: string) {
  const { user } = useAuth()
  const [state, setState] = useState<VotingState>({
    userVote: null,
    isVoting: false,
    error: null
  })

  // Fetch user's existing vote for this submission
  const fetchUserVote = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('submission_id', submissionId)
        .eq('voter_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setState(prev => ({
        ...prev,
        userVote: data || null,
        error: null
      }))
    } catch (error) {
      console.error('Error fetching user vote:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch vote status'
      }))
    }
  }, [submissionId, user])

  // Submit or update a vote
  const submitVote = useCallback(async (voteData: Omit<VoteData, 'submissionId'>) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'You must be logged in to vote' }))
      return false
    }

    setState(prev => ({ ...prev, isVoting: true, error: null }))

    try {
      const votePayload = {
        submission_id: submissionId,
        voter_id: user.id,
        vote_type: voteData.voteType,
        confidence_level: voteData.confidenceLevel,
        reasoning: voteData.reasoning || null,
        expertise_areas: voteData.expertiseAreas || null
      }

      // Check if user already voted
      if (state.userVote) {
        // Update existing vote
        const { data, error } = await supabase
          .from('votes')
          .update(votePayload)
          .eq('id', state.userVote.id)
          .select()
          .single()

        if (error) throw error

        setState(prev => ({
          ...prev,
          userVote: data,
          isVoting: false
        }))
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from('votes')
          .insert(votePayload)
          .select()
          .single()

        if (error) throw error

        setState(prev => ({
          ...prev,
          userVote: data,
          isVoting: false
        }))
      }

      return true
    } catch (error: any) {
      console.error('Error submitting vote:', error)
      setState(prev => ({
        ...prev,
        isVoting: false,
        error: error.message || 'Failed to submit vote'
      }))
      return false
    }
  }, [submissionId, user, state.userVote])

  // Remove a vote
  const removeVote = useCallback(async () => {
    if (!user || !state.userVote) return false

    setState(prev => ({ ...prev, isVoting: true, error: null }))

    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', state.userVote.id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        userVote: null,
        isVoting: false
      }))

      return true
    } catch (error: any) {
      console.error('Error removing vote:', error)
      setState(prev => ({
        ...prev,
        isVoting: false,
        error: error.message || 'Failed to remove vote'
      }))
      return false
    }
  }, [user, state.userVote])

  // Get all votes for a submission (for displaying voting history)
  const fetchSubmissionVotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          profiles:voter_id(username, avatar_url, reputation_score)
        `)
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching submission votes:', error)
      return []
    }
  }, [submissionId])

  // Calculate voting statistics
  const getVotingStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type, confidence_level')
        .eq('submission_id', submissionId)

      if (error) throw error

      const votes = data || []
      const totalVotes = votes.length
      const votesFor = votes.filter(v => v.vote_type === 'for').length
      const votesAgainst = votes.filter(v => v.vote_type === 'against').length
      const averageConfidence = votes.reduce((sum, v) => sum + v.confidence_level, 0) / totalVotes || 0

      return {
        totalVotes,
        votesFor,
        votesAgainst,
        approvalPercentage: totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0,
        averageConfidence: Math.round(averageConfidence * 10) / 10
      }
    } catch (error) {
      console.error('Error calculating voting stats:', error)
      return {
        totalVotes: 0,
        votesFor: 0,
        votesAgainst: 0,
        approvalPercentage: 0,
        averageConfidence: 0
      }
    }
  }, [submissionId])

  return {
    ...state,
    submitVote,
    removeVote,
    fetchUserVote,
    fetchSubmissionVotes,
    getVotingStats,
    canVote: !!user && !state.isVoting
  }
}