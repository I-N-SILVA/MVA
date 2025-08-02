import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface VoteUpdate {
  submission_id: string
  total_votes: number
  votes_for: number
  votes_against: number
  approval_percentage: number
  latest_vote?: {
    id: string
    vote_type: 'for' | 'against'
    confidence_level: number
    voter_username: string
    created_at: string
  }
}

export interface RealtimeVotesState {
  voteUpdates: Record<string, VoteUpdate>
  isConnected: boolean
  error: string | null
}

export function useRealtimeVotes(submissionIds: string[] = []) {
  const [state, setState] = useState<RealtimeVotesState>({
    voteUpdates: {},
    isConnected: false,
    error: null
  })

  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Update vote counts for a submission
  const updateVoteCounts = useCallback(async (submissionId: string) => {
    try {
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('total_votes, votes_for, votes_against')
        .eq('id', submissionId)
        .single()

      if (submissionError) throw submissionError

      const approvalPercentage = submission.total_votes > 0 
        ? (submission.votes_for / submission.total_votes) * 100 
        : 0

      setState(prev => ({
        ...prev,
        voteUpdates: {
          ...prev.voteUpdates,
          [submissionId]: {
            submission_id: submissionId,
            total_votes: submission.total_votes,
            votes_for: submission.votes_for,
            votes_against: submission.votes_against,
            approval_percentage: Math.round(approvalPercentage * 10) / 10
          }
        }
      }))
    } catch (error: any) {
      console.error('Error updating vote counts:', error)
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to update vote counts'
      }))
    }
  }, [])

  // Setup realtime subscription
  useEffect(() => {
    if (submissionIds.length === 0) return

    const newChannel = supabase
      .channel('votes-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'votes',
          filter: `submission_id=in.(${submissionIds.join(',')})`
        }, 
        async (payload) => {
          console.log('Vote change detected:', payload)
          
          const submissionId = payload.new?.submission_id || payload.old?.submission_id
          if (submissionId) {
            await updateVoteCounts(submissionId)
            
            // If it's a new vote, fetch additional details
            if (payload.eventType === 'INSERT' && payload.new) {
              try {
                const { data: voterProfile } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('id', payload.new.voter_id)
                  .single()

                setState(prev => ({
                  ...prev,
                  voteUpdates: {
                    ...prev.voteUpdates,
                    [submissionId]: {
                      ...prev.voteUpdates[submissionId],
                      latest_vote: {
                        id: payload.new.id,
                        vote_type: payload.new.vote_type,
                        confidence_level: payload.new.confidence_level,
                        voter_username: voterProfile?.username || 'Anonymous',
                        created_at: payload.new.created_at
                      }
                    }
                  }
                }))
              } catch (error) {
                console.error('Error fetching voter details:', error)
              }
            }
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: `id=in.(${submissionIds.join(',')})`
        },
        (payload) => {
          console.log('Submission change detected:', payload)
          
          if (payload.new) {
            const submissionId = payload.new.id
            const approvalPercentage = payload.new.total_votes > 0 
              ? (payload.new.votes_for / payload.new.total_votes) * 100 
              : 0

            setState(prev => ({
              ...prev,
              voteUpdates: {
                ...prev.voteUpdates,
                [submissionId]: {
                  submission_id: submissionId,
                  total_votes: payload.new.total_votes,
                  votes_for: payload.new.votes_for,
                  votes_against: payload.new.votes_against,
                  approval_percentage: Math.round(approvalPercentage * 10) / 10
                }
              }
            }))
          }
        }
      )
      .subscribe(async (status) => {
        console.log('Realtime subscription status:', status)
        
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'CHANNEL_ERROR' ? 'Connection error' : null
        }))

        // Initial fetch of vote counts
        if (status === 'SUBSCRIBED') {
          for (const submissionId of submissionIds) {
            await updateVoteCounts(submissionId)
          }
        }
      })

    setChannel(newChannel)

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel)
      }
    }
  }, [submissionIds.join(','), updateVoteCounts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [channel])

  // Get vote update for specific submission
  const getVoteUpdate = useCallback((submissionId: string): VoteUpdate | null => {
    return state.voteUpdates[submissionId] || null
  }, [state.voteUpdates])

  // Check if submission has recent activity
  const hasRecentActivity = useCallback((submissionId: string, minutes: number = 5): boolean => {
    const update = state.voteUpdates[submissionId]
    if (!update?.latest_vote) return false

    const voteTime = new Date(update.latest_vote.created_at).getTime()
    const now = new Date().getTime()
    const diffMinutes = (now - voteTime) / (1000 * 60)

    return diffMinutes <= minutes
  }, [state.voteUpdates])

  return {
    ...state,
    getVoteUpdate,
    hasRecentActivity,
    updateVoteCounts
  }
}

// Hook for single submission realtime updates
export function useRealtimeSubmissionVotes(submissionId: string) {
  return useRealtimeVotes([submissionId])
}