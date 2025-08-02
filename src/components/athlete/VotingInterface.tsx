'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useVoting } from '@/hooks/useVoting'
import { useAuth } from '@/hooks/useAuth'
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  MessageSquare, 
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  Edit3
} from 'lucide-react'

interface VotingInterfaceProps {
  submissionId: string
  totalVotes: number
  votesFor: number
  votesAgainst: number
  isVotingClosed?: boolean
  className?: string
}

const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Very Low', description: 'Not confident at all', color: 'text-red-600' },
  { value: 2, label: 'Low', description: 'Somewhat uncertain', color: 'text-orange-600' },
  { value: 3, label: 'Medium', description: 'Moderately confident', color: 'text-yellow-600' },
  { value: 4, label: 'High', description: 'Very confident', color: 'text-blue-600' },
  { value: 5, label: 'Very High', description: 'Extremely confident', color: 'text-green-600' }
]

const EXPERTISE_AREAS = [
  'Technical Skills',
  'Physical Attributes', 
  'Mental Game',
  'Competition Experience',
  'Market Potential',
  'Character/Leadership',
  'Injury History',
  'Age/Development'
]

export function VotingInterface({ 
  submissionId, 
  totalVotes, 
  votesFor, 
  votesAgainst,
  isVotingClosed = false,
  className = ''
}: VotingInterfaceProps) {
  const { user } = useAuth()
  const { 
    userVote, 
    isVoting, 
    error, 
    submitVote, 
    removeVote, 
    fetchUserVote, 
    canVote 
  } = useVoting(submissionId)

  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | null>(null)
  const [confidenceLevel, setConfidenceLevel] = useState(3)
  const [reasoning, setReasoning] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const approvalPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0

  // Load user's existing vote
  useEffect(() => {
    if (user) {
      fetchUserVote()
    }
  }, [user, fetchUserVote])

  // Pre-populate form with existing vote
  useEffect(() => {
    if (userVote) {
      setSelectedVote(userVote.vote_type)
      setConfidenceLevel(userVote.confidence_level)
      setReasoning(userVote.reasoning || '')
      setSelectedExpertise(userVote.expertise_areas || [])
    }
  }, [userVote])

  const handleVoteTypeChange = (voteType: 'for' | 'against') => {
    if (selectedVote === voteType) {
      setSelectedVote(null)
    } else {
      setSelectedVote(voteType)
      if (!isExpanded) setIsExpanded(true)
    }
  }

  const handleExpertiseToggle = (area: string) => {
    setSelectedExpertise(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  const handleSubmitVote = async () => {
    if (!selectedVote) return

    const success = await submitVote({
      voteType: selectedVote,
      confidenceLevel,
      reasoning: reasoning.trim() || undefined,
      expertiseAreas: selectedExpertise.length > 0 ? selectedExpertise : undefined
    })

    if (success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      if (!userVote) {
        // If this was a new vote, collapse the interface
        setIsExpanded(false)
      }
    }
  }

  const handleRemoveVote = async () => {
    const success = await removeVote()
    if (success) {
      setSelectedVote(null)
      setConfidenceLevel(3)
      setReasoning('')
      setSelectedExpertise([])
      setIsExpanded(false)
    }
  }

  const getApprovalColor = () => {
    if (approvalPercentage >= 70) return 'text-green-600'
    if (approvalPercentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = () => {
    if (approvalPercentage >= 70) return 'bg-green-500'
    if (approvalPercentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Voting Stats Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Community Vote</h3>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{totalVotes} votes</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Approval Rate</span>
            <span className={`text-lg font-bold ${getApprovalColor()}`}>
              {approvalPercentage.toFixed(1)}%
            </span>
          </div>
          
          <Progress value={approvalPercentage} className="h-3" />
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Support</span>
              </div>
              <span className="font-semibold text-green-600">{votesFor}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-600">Oppose</span>
              </div>
              <span className="font-semibold text-red-600">{votesAgainst}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Interface */}
      <div className="p-6">
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Vote submitted successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {!user && (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Sign in to participate in community voting</p>
            <Button variant="outline">Sign In</Button>
          </div>
        )}

        {user && isVotingClosed && (
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Voting period has ended</p>
          </div>
        )}

        {user && !isVotingClosed && (
          <>
            {/* Current Vote Status */}
            {userVote && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {userVote.vote_type === 'for' ? (
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      You voted <span className="capitalize">{userVote.vote_type}</span> with {userVote.confidence_level}/5 confidence
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            )}

            {/* Vote Buttons */}
            {!userVote && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  variant={selectedVote === 'for' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleVoteTypeChange('for')}
                  className={`h-12 ${selectedVote === 'for' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                  disabled={isVoting}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Support
                </Button>
                
                <Button
                  variant={selectedVote === 'against' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleVoteTypeChange('against')}
                  className={`h-12 ${selectedVote === 'against' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
                  disabled={isVoting}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Oppose
                </Button>
              </div>
            )}

            {/* Expanded Form */}
            {isExpanded && (selectedVote || userVote) && (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                {/* Confidence Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Level
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {CONFIDENCE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setConfidenceLevel(level.value)}
                        className={`p-2 text-center rounded-lg border transition-colors ${
                          confidenceLevel === level.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          {Array.from({ length: level.value }, (_, i) => (
                            <Star key={i} className={`h-3 w-3 ${level.color} fill-current`} />
                          ))}
                        </div>
                        <div className="text-xs font-medium">{level.label}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {CONFIDENCE_LEVELS.find(l => l.value === confidenceLevel)?.description}
                  </p>
                </div>

                {/* Expertise Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Expertise (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE_AREAS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleExpertiseToggle(area)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedExpertise.includes(area)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reasoning (Optional)
                  </label>
                  <Textarea
                    placeholder="Share your thoughts on why you're voting this way..."
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    className="min-h-[80px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {reasoning.length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleSubmitVote}
                    disabled={!selectedVote || isVoting}
                    className="flex-1"
                  >
                    {isVoting ? 'Submitting...' : userVote ? 'Update Vote' : 'Submit Vote'}
                  </Button>
                  
                  {userVote && (
                    <Button
                      variant="outline"
                      onClick={handleRemoveVote}
                      disabled={isVoting}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove Vote
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={() => setIsExpanded(false)}
                    disabled={isVoting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}