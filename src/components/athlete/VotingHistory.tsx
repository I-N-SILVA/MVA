'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useVoting } from '@/hooks/useVoting'
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Users,
  Clock,
  Eye,
  EyeOff,
  Award,
  Activity
} from 'lucide-react'

interface VotingHistoryProps {
  submissionId: string
  className?: string
}

interface VoteWithProfile {
  id: string
  vote_type: 'for' | 'against'
  confidence_level: number
  reasoning?: string
  expertise_areas?: string[]
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
    reputation_score: number
  } | null
}

export function VotingHistory({ submissionId, className = '' }: VotingHistoryProps) {
  const { fetchSubmissionVotes, getVotingStats } = useVoting(submissionId)
  const [votes, setVotes] = useState<VoteWithProfile[]>([])
  const [stats, setStats] = useState({
    totalVotes: 0,
    votesFor: 0,
    votesAgainst: 0,
    approvalPercentage: 0,
    averageConfidence: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAllVotes, setShowAllVotes] = useState(false)
  const [filter, setFilter] = useState<'all' | 'for' | 'against'>('all')

  // Load voting data
  useEffect(() => {
    const loadVotingData = async () => {
      setIsLoading(true)
      try {
        const [votesData, statsData] = await Promise.all([
          fetchSubmissionVotes(),
          getVotingStats()
        ])
        setVotes(votesData as VoteWithProfile[])
        setStats(statsData)
      } catch (error) {
        console.error('Error loading voting data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVotingData()
  }, [submissionId, fetchSubmissionVotes, getVotingStats])

  const filteredVotes = votes.filter(vote => {
    if (filter === 'all') return true
    return vote.vote_type === filter
  })

  const displayedVotes = showAllVotes ? filteredVotes : filteredVotes.slice(0, 5)

  const getVoteTypeColor = (voteType: 'for' | 'against') => {
    return voteType === 'for' ? 'text-green-600' : 'text-red-600'
  }

  const getReputationBadgeColor = (reputation: number) => {
    if (reputation >= 100) return 'bg-purple-100 text-purple-800'
    if (reputation >= 50) return 'bg-blue-100 text-blue-800'
    if (reputation >= 20) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const getConfidenceDisplay = (level: number) => {
    const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
    return labels[level - 1] || 'Unknown'
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Voting History</h3>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {stats.totalVotes} votes
          </Badge>
        </div>

        {/* Statistics Summary */}
        {stats.totalVotes > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.votesFor}</div>
              <div className="text-xs text-gray-500">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.votesAgainst}</div>
              <div className="text-xs text-gray-500">Oppose</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.approvalPercentage.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Approval</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.averageConfidence}/5</div>
              <div className="text-xs text-gray-500">Avg Confidence</div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        {stats.totalVotes > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({stats.totalVotes})
            </Button>
            <Button
              variant={filter === 'for' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('for')}
              className="text-green-600 border-green-200"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Support ({stats.votesFor})
            </Button>
            <Button
              variant={filter === 'against' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('against')}
              className="text-red-600 border-red-200"
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              Oppose ({stats.votesAgainst})
            </Button>
          </div>
        )}
      </div>

      {/* Votes List */}
      <div className="p-6">
        {stats.totalVotes === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">No votes yet</h4>
            <p className="text-gray-500">Be the first to vote on this submission</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedVotes.map((vote) => (
              <div key={vote.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Vote Type Icon */}
                    <div className={`p-2 rounded-full ${vote.vote_type === 'for' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {vote.vote_type === 'for' ? (
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    {/* Vote Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {vote.profiles?.username || 'Anonymous'}
                        </span>
                        
                        {vote.profiles?.reputation_score && (
                          <Badge className={getReputationBadgeColor(vote.profiles.reputation_score)}>
                            <Award className="h-3 w-3 mr-1" />
                            {vote.profiles.reputation_score}
                          </Badge>
                        )}
                        
                        <span className={`font-medium ${getVoteTypeColor(vote.vote_type)}`}>
                          voted {vote.vote_type}
                        </span>
                      </div>

                      {/* Confidence Level */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {Array.from({ length: vote.confidence_level }, (_, i) => (
                            <Star key={i} className="h-3 w-3 text-orange-400 fill-current" />
                          ))}
                          {Array.from({ length: 5 - vote.confidence_level }, (_, i) => (
                            <Star key={i} className="h-3 w-3 text-gray-300" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {getConfidenceDisplay(vote.confidence_level)} confidence
                        </span>
                      </div>

                      {/* Expertise Areas */}
                      {vote.expertise_areas && vote.expertise_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {vote.expertise_areas.map((area) => (
                            <Badge key={area} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Reasoning */}
                      {vote.reasoning && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-2">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{vote.reasoning}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 ml-4">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(vote.created_at)}
                  </div>
                </div>
              </div>
            ))}

            {/* Show More/Less Button */}
            {filteredVotes.length > 5 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllVotes(!showAllVotes)}
                  className="flex items-center gap-2"
                >
                  {showAllVotes ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show All {filteredVotes.length} Votes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}