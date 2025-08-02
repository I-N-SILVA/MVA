'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { VotingInterface } from '@/components/athlete/VotingInterface'
import { VotingHistory } from '@/components/athlete/VotingHistory'
import { DiscussionSection } from '@/components/athlete/DiscussionSection'
import { useSubmissions } from '@/hooks/useSubmissions'
import { useRealtimeSubmissionVotes } from '@/hooks/useRealtimeVotes'
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Trophy,
  TrendingUp,
  Users,
  Clock,
  Star,
  Award,
  Play,
  ExternalLink,
  Share2,
  Flag,
  MoreHorizontal,
  Activity,
  AlertCircle,
  CheckCircle2,
  User,
  Globe,
  Instagram,
  Twitter
} from 'lucide-react'

export default function SubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.id as string
  
  const { fetchSubmissionById } = useSubmissions()
  const { getVoteUpdate, isConnected } = useRealtimeSubmissionVotes(submissionId)
  
  const [submission, setSubmission] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'voting' | 'discussion'>('overview')
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  // Load submission data
  useEffect(() => {
    const loadSubmission = async () => {
      if (!submissionId) return
      
      setIsLoading(true)
      try {
        const data = await fetchSubmissionById(submissionId)
        if (data) {
          setSubmission(data)
        } else {
          setError('Submission not found')
        }
      } catch (err) {
        setError('Failed to load submission')
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmission()
  }, [submissionId, fetchSubmissionById])

  // Update time remaining
  useEffect(() => {
    if (!submission) return

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
        setTimeRemaining(`${days}d ${hours}h ${minutes}m remaining`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      } else {
        setTimeRemaining(`${minutes}m remaining`)
      }
      
      setIsExpired(false)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000)

    return () => clearInterval(interval)
  }, [submission])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'twitter': case 'x': return <Twitter className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The submission you\'re looking for doesn\'t exist.'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  // Get realtime vote data
  const voteUpdate = getVoteUpdate(submissionId)
  const votesFor = voteUpdate?.votes_for ?? submission.votes_for
  const votesAgainst = voteUpdate?.votes_against ?? submission.votes_against
  const totalVotes = voteUpdate?.total_votes ?? submission.total_votes
  const approvalPercentage = voteUpdate?.approval_percentage ?? 
    (totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(submission.submission_status)}>
                  {submission.submission_status.replace('_', ' ')}
                </Badge>
                
                {isConnected && (
                  <Badge variant="outline" className="text-green-600">
                    <Activity className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Athlete Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {submission.athlete_name}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <span className="text-lg font-medium">{submission.sport}</span>
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
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {submission.nationality && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{submission.nationality}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(submission.market_value_estimate)}
                  </div>
                  <div className="text-sm text-gray-500">Estimated Value</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{totalVotes}</div>
                  <div className="text-xs text-gray-500">Total Votes</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">{approvalPercentage.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Approval Rate</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600">
                    {submission.profiles?.reputation_score || 0}
                  </div>
                  <div className="text-xs text-gray-500">Submitter Rep</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-lg font-semibold ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                    {isExpired ? 'Closed' : timeRemaining.split(' ')[0]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isExpired ? 'Voting Period' : 'Time Left'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'overview', label: 'Overview', icon: User },
                    { key: 'voting', label: 'Voting', icon: Users },
                    { key: 'discussion', label: 'Discussion', icon: Activity }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Athletic Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Athletic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {submission.current_team && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Current Team</span>
                            <p className="text-gray-900">{submission.current_team}</p>
                          </div>
                        )}
                        
                        {submission.height && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Height</span>
                            <p className="text-gray-900">{submission.height}</p>
                          </div>
                        )}
                        
                        {submission.weight && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Weight</span>
                            <p className="text-gray-900">{submission.weight}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Achievements */}
                    {submission.achievements && submission.achievements.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Achievements
                        </h3>
                        <div className="space-y-2">
                          {submission.achievements.map((achievement: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span className="text-gray-900">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Statistics */}
                    {submission.stats && Object.keys(submission.stats).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(submission.stats).map(([key, value]) => (
                            <div key={key} className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900">{value as string}</div>
                              <div className="text-sm text-gray-500 capitalize">{key.replace('_', ' ')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Previous Teams */}
                    {submission.previous_teams && submission.previous_teams.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Teams</h3>
                        <div className="flex flex-wrap gap-2">
                          {submission.previous_teams.map((team: string, index: number) => (
                            <Badge key={index} variant="outline">{team}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scouting Notes */}
                    {submission.scouting_notes && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scouting Notes</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{submission.scouting_notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Social Media */}
                    {submission.social_media && Object.keys(submission.social_media).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                        <div className="flex gap-3">
                          {Object.entries(submission.social_media).map(([platform, url]) => {
                            if (!url) return null
                            return (
                              <a
                                key={platform}
                                href={url as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                {getSocialIcon(platform)}
                                <span className="capitalize">{platform}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Media */}
                    {submission.media_urls && submission.media_urls.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {submission.media_urls.map((url: string, index: number) => (
                            <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <Play className="h-8 w-8 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'voting' && (
                  <VotingHistory submissionId={submissionId} />
                )}

                {activeTab === 'discussion' && (
                  <DiscussionSection submissionId={submissionId} />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Interface */}
            <VotingInterface
              submissionId={submissionId}
              totalVotes={totalVotes}
              votesFor={votesFor}
              votesAgainst={votesAgainst}
              isVotingClosed={isExpired || submission.submission_status !== 'pending'}
            />

            {/* Submission Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Submitted by</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {submission.profiles?.username || 'Anonymous'}
                    </span>
                    {submission.profiles?.reputation_score && (
                      <Badge variant="outline" className="text-xs">
                        {submission.profiles.reputation_score} rep
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Voting Deadline</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className={`h-4 w-4 ${isExpired ? 'text-red-500' : 'text-orange-500'}`} />
                    <span className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(submission.voting_deadline).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                    {timeRemaining}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Current Status</span>
                  <div className="mt-1">
                    <Badge className={getStatusColor(submission.submission_status)}>
                      {submission.submission_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link href="/athletes/pending" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Voting
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Submission
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}