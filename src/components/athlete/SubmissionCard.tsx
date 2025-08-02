'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SubmissionWithProfile } from '@/hooks/useSubmissions'
import { useRealtimeSubmissionVotes } from '@/hooks/useRealtimeVotes'
import { useVoting } from '@/hooks/useVoting'
import { useAuth } from '@/hooks/useAuth'
import { 
  Clock, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Activity,
  ExternalLink
} from 'lucide-react'

interface SubmissionCardProps {
  submission: SubmissionWithProfile
  showQuickVoting?: boolean
  className?: string
}

export function SubmissionCard({ 
  submission, 
  showQuickVoting = true,
  className = ''
}: SubmissionCardProps) {
  const { user } = useAuth()
  const { getVoteUpdate, hasRecentActivity } = useRealtimeSubmissionVotes(submission.id)
  const { userVote, submitVote, isVoting } = useVoting(submission.id)
  
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  // Get realtime vote data or fall back to submission data
  const voteUpdate = getVoteUpdate(submission.id)
  const votesFor = voteUpdate?.votes_for ?? submission.votes_for
  const votesAgainst = voteUpdate?.votes_against ?? submission.votes_against
  const totalVotes = voteUpdate?.total_votes ?? submission.total_votes
  const approvalPercentage = voteUpdate?.approval_percentage ?? 
    (totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0)

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const deadline = new Date(submission.voting_deadline)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Voting closed')
        setIsExpired(true)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      } else {
        setTimeRemaining(`${minutes}m remaining`)
      }
      
      setIsExpired(false)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [submission.voting_deadline])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getApprovalColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleQuickVote = async (voteType: 'for' | 'against') => {
    if (!user || isVoting) return
    
    await submitVote({
      voteType,
      confidenceLevel: 3, // Default confidence for quick votes
      reasoning: `Quick ${voteType} vote`
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {submission.athlete_name}
              </h3>
              {hasRecentActivity(submission.id) && (
                <Activity className="h-4 w-4 text-green-500 animate-pulse" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{submission.sport}</span>
              {submission.position && (
                <>
                  <span>•</span>
                  <span>{submission.position}</span>
                </>
              )}
              {submission.age && (
                <>
                  <span>•</span>
                  <span>{submission.age} years old</span>
                </>
              )}
            </div>
            
            {submission.nationality && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{submission.nationality}</span>
              </div>
            )}
          </div>
          
          <Badge className={getStatusColor(submission.submission_status)}>
            {submission.submission_status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Voting Stats */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Community Support
          </span>
          <span className={`text-sm font-semibold ${getApprovalColor(approvalPercentage)}`}>
            {approvalPercentage.toFixed(1)}%
          </span>
        </div>
        
        <Progress 
          value={approvalPercentage} 
          className="h-2 mb-3"
        />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-green-600">
              <ThumbsUp className="h-3 w-3" />
              <span className="text-sm font-semibold">{votesFor}</span>
            </div>
            <span className="text-xs text-gray-500">For</span>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 text-red-600">
              <ThumbsDown className="h-3 w-3" />
              <span className="text-sm font-semibold">{votesAgainst}</span>
            </div>
            <span className="text-xs text-gray-500">Against</span>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 text-gray-700">
              <Users className="h-3 w-3" />
              <span className="text-sm font-semibold">{totalVotes}</span>
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Estimated Value
            </span>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatCurrency(submission.market_value_estimate)}
            </p>
          </div>
          
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Submitted by
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-gray-900">
                {submission.profiles?.username || 'Anonymous'}
              </span>
              {submission.profiles?.reputation_score && (
                <Badge variant="outline" className="text-xs">
                  {submission.profiles.reputation_score} rep
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Time Remaining */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isExpired ? 'text-red-500' : 'text-orange-500'}`} />
            <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
              {timeRemaining}
            </span>
          </div>
          
          {voteUpdate?.latest_vote && (
            <div className="text-xs text-gray-500">
              Latest: {voteUpdate.latest_vote.vote_type} by {voteUpdate.latest_vote.voter_username}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Link href={`/athletes/submissions/${submission.id}`}>
            <Button variant="outline" size="sm" className="flex-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </Link>
          
          {showQuickVoting && user && !isExpired && submission.submission_status === 'pending' && (
            <>
              <Button
                size="sm"
                variant={userVote?.vote_type === 'for' ? 'default' : 'outline'}
                onClick={() => handleQuickVote('for')}
                disabled={isVoting}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Support
              </Button>
              
              <Button
                size="sm"
                variant={userVote?.vote_type === 'against' ? 'default' : 'outline'}
                onClick={() => handleQuickVote('against')}
                disabled={isVoting}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                Oppose
              </Button>
            </>
          )}
        </div>
        
        {userVote && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            You voted <span className="font-medium">{userVote.vote_type}</span> with confidence {userVote.confidence_level}/5
          </div>
        )}
      </div>
    </div>
  )
}